const { Snake } = require('./entities');
const { CONFIG } = require('./config');

class BotManager {
  constructor(foodManager) {
    this.bots = new Map();
    this.foodManager = foodManager;
    this.initBots();
  }

  initBots() {
    for (let i = 0; i < CONFIG.BOT_COUNT; i++) {
      this.spawnBot();
    }
  }

  spawnBot() {
    const bot = new Snake(null, true);
    bot.targetFood = null;
    bot.wanderAngle = Math.random() * Math.PI * 2;
    this.bots.set(bot.id, bot);
    return bot;
  }

  removeBot(botId) {
    return this.bots.delete(botId);
  }

  updateBot(bot) {
    if (bot.dead) return;
    
    let targetAngle = bot.angle;
    let shouldBoost = false;
    
    // 1. Cherche la nourriture la plus proche
    const nearbyFood = this.findNearbyFood(bot, 800);
    
    if (nearbyFood.length > 0) {
      // Prend la nourriture la plus proche (choix aléatoire en cas d'égalité)
      bot.targetFood = nearbyFood[0];
    } else {
      bot.targetFood = null;
    }
    
    // 2. Détermine la direction cible
    if (bot.targetFood) {
      // Va vers la nourriture
      targetAngle = Math.atan2(bot.targetFood.y - bot.y, bot.targetFood.x - bot.x);
      shouldBoost = bot.targetFood.dist < 80;
    } else {
      // Pas de nourriture : avance en ligne droite avec légères variations
      bot.wanderAngle += (Math.random() - 0.5) * 0.1;
      targetAngle = bot.wanderAngle;
    }
    
    // 3. Évite les bords (priorité maximale)
    const margin = 150;
    const centerX = CONFIG.WORLD_SIZE / 2;
    const centerY = CONFIG.WORLD_SIZE / 2;
    
    if (bot.x < margin) {
      targetAngle = 0; // Droite
      shouldBoost = false;
    } else if (bot.x > CONFIG.WORLD_SIZE - margin) {
      targetAngle = Math.PI; // Gauche
      shouldBoost = false;
    } else if (bot.y < margin) {
      targetAngle = Math.PI / 2; // Bas
      shouldBoost = false;
    } else if (bot.y > CONFIG.WORLD_SIZE - margin) {
      targetAngle = -Math.PI / 2; // Haut
      shouldBoost = false;
    }
    
    // 4. Applique la rotation (simplifiée, pas d'interpolation complexe)
    bot.angle = targetAngle;
    bot.setBoosting(shouldBoost);
    
    // 5. Déplace
    this.moveBot(bot);

    // 6. Mange
    const eaten = this.foodManager.checkCollision(bot);
    if (eaten.length > 0) {
      this.consumeFoodAsBot(eaten, bot);
    }
  }

  moveBot(bot) {
    // Déplacement direct
    bot.x += Math.cos(bot.angle) * bot.speed;
    bot.y += Math.sin(bot.angle) * bot.speed;
    
    // Garde dans les limites (hard clamp)
    const margin = bot.radius + 5;
    bot.x = Math.max(margin, Math.min(CONFIG.WORLD_SIZE - margin, bot.x));
    bot.y = Math.max(margin, Math.min(CONFIG.WORLD_SIZE - margin, bot.y));
    
    // Met à jour les segments (suivi simple)
    let prevX = bot.x;
    let prevY = bot.y;
    
    for (let i = 0; i < bot.segments.length; i++) {
      const seg = bot.segments[i];
      const dx = prevX - seg.x;
      const dy = prevY - seg.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > CONFIG.SEGMENT_SPACING) {
        const ratio = (dist - CONFIG.SEGMENT_SPACING) / dist;
        seg.x += dx * ratio;
        seg.y += dy * ratio;
      }
      
      prevX = seg.x;
      prevY = seg.y;
    }
  }

  findNearbyFood(bot, radius = 800) {
    let closest = null;
    let closestDist = radius;
    let ties = [];
    const allFood = this.foodManager.getAll();
    
    for (const food of allFood) {
      const dx = food.x - bot.x;
      const dy = food.y - bot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < radius) {
        if (dist < closestDist - 0.1) {
          // Nouvelle nourriture plus proche
          closestDist = dist;
          closest = { x: food.x, y: food.y, dist };
          ties = [closest];
        } else if (Math.abs(dist - closestDist) <= 0.1) {
          // Distance égale (à 0.1 près), ajoute aux ex-aequo
          ties.push({ x: food.x, y: food.y, dist });
        }
      }
    }
    
    // Si égalité, choisit aléatoirement
    if (ties.length > 1) {
      return [ties[Math.floor(Math.random() * ties.length)]];
    }
    
    return closest ? [closest] : [];
  }

  consumeFoodAsBot(foodIds, bot) {
    let ateSomething = false;
    for (const id of foodIds) {
      // Utilise removeFood au lieu d'accéder directement à la Map
      if (this.foodManager.removeFood(id)) {
        bot.score += CONFIG.FOOD_SCORE_VALUE;
        ateSomething = true;
        
        bot.foodCounter = (bot.foodCounter || 0) + 1;
        
        if (bot.foodCounter >= 3 && bot.segments.length < CONFIG.MAX_SEGMENTS) {
          bot.grow();
          bot.foodCounter = 0;
        }
      }
    }
    // Réinitialise la cible si on a mangé
    if (ateSomething) {
      bot.targetFood = null;
    }
  }

  updateAll() {
    this.cleanupDeadBots();
    for (const bot of this.bots.values()) {
      if (!bot.dead) this.updateBot(bot);
    }
  }

  handleBotDeath(bot) {
    this.bots.delete(bot.id);
    setTimeout(() => this.spawnBot(), CONFIG.BOT_RESPAWN_DELAY_MS);
  }

  cleanupDeadBots() {
    for (const [botId, bot] of this.bots) {
      if (bot.dead) this.bots.delete(botId);
    }
  }

  getAll() {
    this.cleanupDeadBots();
    return Array.from(this.bots.values());
  }

  toJSON() {
    const aliveBots = [];
    for (const bot of this.bots.values()) {
      if (!bot.dead) aliveBots.push(bot);
    }
    // Retourne tous les bots vivants (5 max)
    return aliveBots
      .sort((a, b) => b.segments.length - a.segments.length)
      .map(bot => bot.toJSON());
  }
}

module.exports = BotManager;
