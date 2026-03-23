const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const { CONFIG } = require('./src/config');
const FoodManager = require('./src/foodManager');
const BotManager = require('./src/botManager');
const PlayerManager = require('./src/playerManager');
const CollisionManager = require('./src/collisionManager');
const PortalManager = require('./src/portalManager');

class GameServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, { 
      cors: { origin: "*" },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.foodManager = new FoodManager();
    this.botManager = new BotManager(this.foodManager);
    this.playerManager = new PlayerManager(this.foodManager);
    this.collisionManager = new CollisionManager(this.playerManager, this.botManager);
    this.portalManager = new PortalManager();

    this.setupMiddleware();
    this.setupSocketHandlers();
    this.startGameLoop();
  }

  setupMiddleware() {
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`[CONNECT] Player connected: ${socket.id}`);

      socket.on('spawn', (data) => this.handleSpawn(socket, data));
      socket.on('move', (data) => this.handleMove(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  handleSpawn(socket, data) {
    const name = data?.name?.trim() || `Dragon${Math.floor(Math.random() * 1000)}`;
    const snake = this.playerManager.addPlayer(socket.id, name);
    
    socket.emit('init', { 
      config: CONFIG, 
      id: snake.id,
      worldSize: CONFIG.WORLD_SIZE
    });
    
    console.log(`[SPAWN] ${name} (${socket.id})`);
  }

  handleMove(socket, data) {
    if (!data || typeof data.angle !== 'number' || isNaN(data.angle)) return;
    
    // Normalize angle
    let angle = data.angle;
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    
    this.playerManager.updatePlayer(socket.id, {
      angle: angle,
      boost: !!data.boost
    });
  }

  handleDisconnect(socket) {
    console.log(`[DISCONNECT] ${socket.id}`);
    this.playerManager.removePlayer(socket.id);
  }

  handlePlayerDeath(socketId, deathData) {
    this.io.to(socketId).emit('died', deathData);
    console.log(`[DEATH] ${deathData.killer} killed player (score: ${deathData.score})`);
  }

  startGameLoop() {
    setInterval(() => this.tick(), CONFIG.TICK_RATE);
  }

  tick() {
    this.botManager.updateAll();
    this.foodManager.maintainCount();
    this.portalManager.update();
    this.checkPortalCollisions();
    this.collisionManager.checkAllCollisions(
      (socketId, deathData) => this.handlePlayerDeath(socketId, deathData)
    );
    this.broadcastState();
  }

  checkPortalCollisions() {
    // Check players
    for (const player of this.playerManager.players.values()) {
      if (player.snake.dead) continue;
      const portal = this.portalManager.checkCollision(player.snake);
      if (portal) {
        this.portalManager.teleport(player.snake, portal);
      }
    }
    
    // Check bots
    for (const bot of this.botManager.bots.values()) {
      if (bot.dead) continue;
      const portal = this.portalManager.checkCollision(bot);
      if (portal) {
        this.portalManager.teleport(bot, portal);
      }
    }
  }

  broadcastState() {
    // Envoi optimisé : seulement les changements
    const state = {
      snakes: this.playerManager.toJSON(),
      bots: this.botManager.toJSON(),
      food: this.foodManager.toJSON(),
      portals: this.portalManager.toJSON(),
      t: Date.now() // timestamp pour débogage
    };

    this.io.emit('state', state);
  }

  start(port = process.env.PORT || 3002) {
    this.server.listen(port, '0.0.0.0', () => {
      console.log(`🐲 Dragon.io server running on port ${port}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
}

const gameServer = new GameServer();
gameServer.start();
