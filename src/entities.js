const { v4: uuidv4 } = require('uuid');
const { CONFIG, COLORS } = require('./config');

class Entity {
  constructor(x, y, radius, color) {
    this.id = uuidv4();
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  clampToWorld() {
    this.x = Math.max(this.radius, Math.min(CONFIG.WORLD_SIZE - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(CONFIG.WORLD_SIZE - this.radius, this.y));
  }
}

class Food extends Entity {
  constructor(x, y) {
    const radius = CONFIG.FOOD_RADIUS_MIN + Math.random() * (CONFIG.FOOD_RADIUS_MAX - CONFIG.FOOD_RADIUS_MIN);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    super(x, y, radius, color);
  }

  static random() {
    return new Food(
      Math.random() * CONFIG.WORLD_SIZE,
      Math.random() * CONFIG.WORLD_SIZE
    );
  }
}

class Snake extends Entity {
  constructor(name, isBot = false) {
    const pos = Snake.randomPosition();
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    super(pos.x, pos.y, CONFIG.START_RADIUS, color);
    
    this.name = name || (isBot ? Snake.getRandomPlanetName() : `Dragon${Math.floor(Math.random() * 1000)}`);
    this.angle = Math.random() * Math.PI * 2;
    this.targetAngle = this.angle;
    this.segments = [];
    this.boosting = false;
    this.score = 0;
    this.isBot = isBot;
    this.spawnTime = Date.now();
    this.dead = false;
    
    // Init segments stacked
    for (let i = 0; i < CONFIG.START_SEGMENTS; i++) {
      this.segments.push({ x: this.x, y: this.y });
    }
  }

  static randomPosition() {
    return {
      x: 200 + Math.random() * (CONFIG.WORLD_SIZE - 400),
      y: 200 + Math.random() * (CONFIG.WORLD_SIZE - 400)
    };
  }

  static getRandomPlanetName() {
    const planets = [
      'Mercure', 'Venus', 'Terre', 'Mars', 'Jupiter',
      'Saturne', 'Uranus', 'Neptune', 'Pluton', 'Ceres',
      'Eris', 'Haumea', 'Makemake', 'Sedna', 'Orcus'
    ];
    const planet = planets[Math.floor(Math.random() * planets.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    return `${planet} ${number}`;
  }

  get isInvincible() {
    return Date.now() - this.spawnTime < CONFIG.SPAWN_INVINCIBILITY_MS;
  }

  get speed() {
    const sizeFactor = this.segments.length / 100;
    const baseSpeed = this.boosting ? CONFIG.SPEED_BOOST : CONFIG.SPEED_BASE;
    return Math.max(CONFIG.SPEED_MIN, baseSpeed - sizeFactor);
  }

  setTargetAngle(angle) {
    this.targetAngle = angle;
  }

  updateAngle() {
    let diff = this.targetAngle - this.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.angle += diff * CONFIG.TURN_SPEED;
  }

  move() {
    this.updateAngle();
    
    // Move head
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.clampToWorld();
    
    // Move segments - each follows the previous one with smoother interpolation
    let prevX = this.x;
    let prevY = this.y;
    
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      const dx = prevX - seg.x;
      const dy = prevY - seg.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0.1) {
        const targetDist = CONFIG.SEGMENT_SPACING;
        const moveRatio = Math.min(1, (dist - targetDist) / dist * 0.8);
        
        seg.x += dx * moveRatio;
        seg.y += dy * moveRatio;
      }
      
      prevX = seg.x;
      prevY = seg.y;
    }
  }

  setBoosting(boost) {
    this.boosting = boost;
  }

  grow() {
    this.score += CONFIG.FOOD_SCORE_VALUE;
    
    if (this.segments.length < CONFIG.MAX_SEGMENTS) {
      const last = this.segments[this.segments.length - 1];
      this.segments.push({ x: last.x, y: last.y });
    }
    
    // Slight radius growth
    this.radius = Math.min(20, CONFIG.START_RADIUS + this.segments.length * 0.03);
  }

  takeBoostCost() {
    if (this.segments.length > CONFIG.START_SEGMENTS && Math.random() < 0.1) {
      this.segments.pop();
      return true;
    }
    if (this.segments.length <= CONFIG.START_SEGMENTS) {
      this.boosting = false;
      return false;
    }
    return true;
  }

  getTailPosition() {
    if (this.segments.length === 0) return null;
    const last = this.segments[this.segments.length - 1];
    return { x: last.x, y: last.y };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      radius: this.radius,
      angle: this.angle,
      segments: this.segments.slice(0, CONFIG.MAX_BODY_SEGMENTS_RENDER),
      color: this.color,
      boosting: this.boosting,
      score: this.score,
      length: this.segments.length
    };
  }
}

class Portal extends Entity {
  constructor(x, y, color, type) {
    super(x, y, CONFIG.PORTAL_RADIUS, color);
    this.type = type; // 'red' or 'blue'
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  static createPairs(count = 2) {
    const portals = [];
    const margin = 400;
    const minDistance = CONFIG.PORTAL_MIN_DISTANCE || 800;
    
    function getDistance(x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    function findValidPosition(existingPortals, type) {
      let attempts = 0;
      let x, y;
      
      do {
        x = margin + Math.random() * (CONFIG.WORLD_SIZE - margin * 2);
        y = margin + Math.random() * (CONFIG.WORLD_SIZE - margin * 2);
        attempts++;
        
        // Vérifie la distance avec les portails de même couleur
        let valid = true;
        for (const p of existingPortals) {
          if (p.type === type) {
            const dist = getDistance(x, y, p.x, p.y);
            if (dist < minDistance) {
              valid = false;
              break;
            }
          }
        }
        
        if (valid) return { x, y };
      } while (attempts < 50);
      
      // Fallback si on ne trouve pas de position valide
      return { x, y };
    }
    
    for (let i = 0; i < count; i++) {
      // Portail rouge avec position valide
      const redPos = findValidPosition(portals, 'red');
      portals.push(new Portal(redPos.x, redPos.y, '#ef4444', 'red'));
      
      // Portail bleu avec position valide
      const bluePos = findValidPosition(portals, 'blue');
      portals.push(new Portal(bluePos.x, bluePos.y, '#3b82f6', 'blue'));
    }
    
    return portals;
  }

  updatePulse() {
    this.pulsePhase += 0.1;
  }

  getPulseRadius() {
    return this.radius + Math.sin(this.pulsePhase) * 5;
  }

  toJSON() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      radius: this.getPulseRadius(),
      color: this.color,
      type: this.type
    };
  }
}

module.exports = { Entity, Food, Snake, Portal };
