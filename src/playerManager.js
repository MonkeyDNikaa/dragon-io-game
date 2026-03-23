const { Snake } = require('./entities');
const { CONFIG } = require('./config');

class PlayerManager {
  constructor(foodManager) {
    this.players = new Map();
    this.socketToPlayer = new Map();
    this.foodManager = foodManager;
  }

  addPlayer(socketId, name) {
    const snake = new Snake(name, false);
    this.players.set(snake.id, {
      snake,
      socketId,
      connected: true
    });
    this.socketToPlayer.set(socketId, snake.id);
    return snake;
  }

  removePlayer(socketId) {
    const playerId = this.socketToPlayer.get(socketId);
    if (playerId) {
      const player = this.players.get(playerId);
      if (player && !player.snake.dead) {
        this.foodManager.spawnFromSnakeDeath(player.snake);
      }
      this.players.delete(playerId);
      this.socketToPlayer.delete(socketId);
    }
  }

  getPlayerBySocket(socketId) {
    const playerId = this.socketToPlayer.get(socketId);
    return playerId ? this.players.get(playerId) : null;
  }

  getSnakeBySocket(socketId) {
    const player = this.getPlayerBySocket(socketId);
    return player ? player.snake : null;
  }

  updatePlayer(socketId, data) {
    const snake = this.getSnakeBySocket(socketId);
    if (!snake || snake.dead) return null;

    snake.setTargetAngle(data.angle);
    snake.setBoosting(data.boost);

    if (data.boost) {
      snake.takeBoostCost();
      if (Math.random() < CONFIG.BOOST_PARTICLE_CHANCE) {
        this.spawnBoostParticle(snake);
      }
    }

    snake.move();

    const eaten = this.foodManager.checkCollision(snake);
    this.foodManager.consumeFood(eaten, snake);

    return snake;
  }

  spawnBoostParticle(snake) {
    const tail = snake.getTailPosition();
    if (tail) {
      this.foodManager.spawnFood(tail.x, tail.y);
    }
  }

  killPlayer(socketId, killerName) {
    const player = this.getPlayerBySocket(socketId);
    if (!player) return null;

    player.snake.dead = true;
    this.foodManager.spawnFromSnakeDeath(player.snake);
    
    const deathData = {
      killer: killerName,
      score: player.snake.score
    };

    this.players.delete(player.snake.id);
    this.socketToPlayer.delete(socketId);

    return deathData;
  }

  getAllSnakes() {
    // Ne retourne que les serpents vivants
    return Array.from(this.players.values())
      .filter(p => p.snake && !p.snake.dead)
      .map(p => p.snake);
  }

  cleanupDeadPlayers() {
    // Supprime les joueurs morts de la mémoire
    for (const [playerId, player] of this.players) {
      if (player.snake && player.snake.dead) {
        this.socketToPlayer.delete(player.socketId);
        this.players.delete(playerId);
      }
    }
  }

  toJSON() {
    // Nettoie d'abord les morts
    this.cleanupDeadPlayers();
    
    // Retourne tous les joueurs vivants pour le leaderboard
    return this.getAllSnakes()
      .sort((a, b) => b.segments.length - a.segments.length)
      .map(snake => snake.toJSON());
  }
}

module.exports = PlayerManager;
