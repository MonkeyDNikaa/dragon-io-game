const { Portal } = require('./entities');
const { CONFIG } = require('./config');

class PortalManager {
  constructor() {
    this.portals = [];
    this.teleportCooldowns = new Map(); // snakeId -> timestamp
    this.initPortals();
  }

  initPortals() {
    // Crée 5 paires de portails
    this.portals = Portal.createPairs(5);
  }

  getDestinationPortal(sourcePortal) {
    // Rouge -> Bleu, Bleu -> Rouge
    const targetType = sourcePortal.type === 'red' ? 'blue' : 'red';
    
    // Trouve un portail de la couleur opposée aléatoirement
    const candidates = this.portals.filter(p => p.type === targetType);
    if (candidates.length === 0) return null;
    
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  checkCollision(snake) {
    const now = Date.now();
    const lastTeleport = this.teleportCooldowns.get(snake.id) || 0;
    
    // Vérifie le cooldown
    if (now - lastTeleport < CONFIG.PORTAL_COOLDOWN_MS) {
      return null;
    }

    for (const portal of this.portals) {
      const dx = snake.x - portal.x;
      const dy = snake.y - portal.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Collision si la tête est dans le rayon du portail
      if (dist < portal.radius + snake.radius * 0.5) {
        return portal;
      }
    }
    
    return null;
  }

  teleport(snake, sourcePortal) {
    const destPortal = this.getDestinationPortal(sourcePortal);
    if (!destPortal) return false;

    // Téléporte la tête
    snake.x = destPortal.x;
    snake.y = destPortal.y;
    
    // Téléporte tous les segments
    for (const seg of snake.segments) {
      seg.x = destPortal.x;
      seg.y = destPortal.y;
    }
    
    // Met à jour le cooldown
    this.teleportCooldowns.set(snake.id, Date.now());
    
    return true;
  }

  update() {
    // Met à jour l'animation des portails
    for (const portal of this.portals) {
      portal.updatePulse();
    }
    
    // Nettoie les cooldowns expirés
    const now = Date.now();
    for (const [snakeId, timestamp] of this.teleportCooldowns) {
      if (now - timestamp > CONFIG.PORTAL_COOLDOWN_MS * 2) {
        this.teleportCooldowns.delete(snakeId);
      }
    }
  }

  toJSON() {
    return this.portals.map(p => p.toJSON());
  }
}

module.exports = PortalManager;