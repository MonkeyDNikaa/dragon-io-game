# 🐲 Dragon.io

A Slither.io-style multiplayer snake game built with Node.js, Express, and Socket.IO.

## 🚀 Déploiement Gratuit (Sans Carte)

### Option 1 : Cyclic.sh (Recommandé)
[![Deploy to Cyclic](https://img.shields.io/badge/Deploy-Cyclic-3B82F6?style=for-the-badge)](https://cyclic.sh)

1. Va sur https://cyclic.sh
2. Connecte avec GitHub
3. Clique "Deploy" et sélectionne ce repo
4. Fait ! 🎉

### Option 2 : Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/MonkeyDNikaa/dragon-io-game)

### Option 3 : Glitch
[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee545c74f1b%2Fremix-button.svg)](https://glitch.com/edit/#!/import/github/MonkeyDNikaa/dragon-io-game)

## 🎮 Features

- Real-time multiplayer gameplay
- 5 AI bots with smart food-seeking behavior
- 6000x6000 game world
- 800 food items
- Portal teleportation system
- Mobile & desktop support
- Guest login (no account required)

## 🚀 Quick Deploy

Click the button above to deploy instantly on Render (free tier).

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Open http://localhost:3002
```

## 📁 Project Structure

```
dragon.io/
├── server.js              # Main server file
├── package.json           # Dependencies
├── render.yaml           # Render deployment config
├── public/               # Static files
│   ├── index.html
│   ├── login.html
│   └── game.html
└── src/                  # Server modules
    ├── config.js
    ├── entities.js
    ├── botManager.js
    ├── playerManager.js
    ├── foodManager.js
    ├── collisionManager.js
    └── portalManager.js
```

## 🔧 Configuration

Edit `src/config.js` to customize:
- World size
- Food count
- Bot count
- Game speed

## 🌐 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3002 | Server port |
| `NODE_ENV` | development | Environment mode |

## 📄 License

MIT

---

*Built with ❤️ using Node.js & Socket.IO*