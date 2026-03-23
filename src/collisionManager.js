const { CONFIG } = require('./config');

class CollisionManager {
  constructor(playerManager, botManager) {
    this.playerManager = playerManager;
    this.botManager = botManager;
  }

  getAllSnakes() {
    return [
      ...this.playerManager.getAllSnakes(),
      ...this.botManager.getAll()
    ];
  }

  checkAllCollisions(onPlayerDeath) {
    const allSnakes = this.getAllSnakes();
    const deaths = [];

    for (const snake of allSnakes) {
      if (snake.isInvincible || snake.dead) continue;

      const killer = this.checkSnakeCollisions(snake, allSnakes);
      if (killer) {
        deaths.push({ snake, killer });
      }
    }

    for (const { snake, killer } of deaths) {
      this.handleDeath(snake, killer, onPlayerDeath);
    }

    return deaths.length;
  }

  checkSnakeCollisions(snake, allSnakes) {
    for (const other of allSnakes) {
      if (snake.id === other.id || other.dead) continue;

      const killer = this.checkHeadToBodyCollision(snake, other);
      if (killer) return killer;
    }
    return null;
  }

  checkHeadToBodyCollision(attacker, target) {
    // Don't collide with self
    if (attacker.id === target.id) return null;
    
    // Skip first few segments of target to avoid false collisions
    const startIndex = CONFIG.COLLISION_HEAD_TO_BODY_OFFSET;
    
    // Use a slightly smaller collision radius for more fair gameplay
    const collisionRadius = (attacker.radius + target.radius) * CONFIG.COLLISION_RADIUS_FACTOR * 0.85;
    const collisionRadiusSq = collisionRadius * collisionRadius;
    
    for (let i = startIndex; i < target.segments.length; i++) {
      const seg = target.segments[i];
      const dx = attacker.x - seg.x;
      const dy = attacker.y - seg.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < collisionRadiusSq) {
        return target;
      }
    }
    return null;
  }

  handleDeath(victim, killer, onPlayerDeath) {
    victim.dead = true;
    
    if (victim.isBot) {
      this.botManager.handleBotDeath(victim);
    } else {
      const playerEntry = Array.from(this.playerManager.players.entries())
        .find(([_, p]) => p.snake.id === victim.id);
      
      if (playerEntry) {
        const [_, player] = playerEntry;
        const deathData = this.playerManager.killPlayer(player.socketId, killer.name);
        if (deathData && onPlayerDeath) {
          onPlayerDeath(player.socketId, deathData);
        }
      }
    }
  }
}

module.exports = CollisionManager;
