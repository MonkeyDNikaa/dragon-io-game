# 🚀 Alternatives Gratuites SANS Carte Bancaire

## Option 1 : Railway (Gratuit - Sans carte)

### Fichier `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Bouton Railway
```markdown
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/URL_DU_TEMPLATE)
```

**Inscription :** https://railway.app (email ou GitHub, pas de carte pour le tier gratuit)

---

## Option 2 : Cyclic.sh (Gratuit - Sans carte)

### Fichier `cyclic.json`
```json
{
  "name": "mon-projet",
  "version": "1.0.0",
  "main": "server.js"
}
```

### Déploiement
1. Va sur https://cyclic.sh
2. Connecte avec GitHub
3. Sélectionne le repo
4. Déploiement automatique

**Avantages :** 
- ✅ Sans carte
- ✅ 3 apps gratuites
- ✅ Auto-deploy depuis GitHub

---

## Option 3 : Glitch (Gratuit - Sans carte)

### Import depuis GitHub
1. Va sur https://glitch.com
2. Crée un compte
3. "New Project" → "Import from GitHub"
4. Colle l'URL du repo

**Avantages :**
- ✅ Sans carte
- ✅ Édition en ligne
- ✅ Instantané

**Limites :**
- App se "sleep" après 5 min d'inactivité
- Se réveille à la 1ère requête (délai de 2-3s)

---

## Option 4 : Replit (Gratuit)

1. https://replit.com
2. "Create" → "Import from GitHub"
3. Colle l'URL du repo
4. Clique "Run"

**Avantages :**
- ✅ Sans carte
- ✅ IDE en ligne
- ✅ Always-on disponible (avec cycles)

---

## Option 5 : Vercel (Frontend) + Render (API)

Pour les projets fullstack :
- **Vercel** : Frontend (React, Vue, etc.) - Gratuit
- **Render Web Service** : Backend - Nécessite carte

---

## 🎯 Recommandation pour Dragon.io

| Service | Carte ? | Ping | Facilité |
|---------|---------|------|----------|
| **Cyclic** | ❌ Non | ~50ms | ⭐⭐⭐ |
| **Railway** | ❌ Non* | ~30ms | ⭐⭐⭐ |
| **Glitch** | ❌ Non | ~100ms | ⭐⭐⭐⭐ |
| **Replit** | ❌ Non | ~80ms | ⭐⭐⭐ |

*Railway demande parfois une carte pour vérification, mais a un tier gratuit

---

## 🔧 Configuration Cyclic (Recommandé)

### 1. Créer `package.json` minimal
```json
{
  "name": "dragon-io",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "uuid": "^9.0.0"
  }
}
```

### 2. Adapter `server.js` pour Cyclic
```javascript
const PORT = process.env.PORT || 3000;
// Cyclic fournit process.env.PORT automatiquement
```

### 3. Déployer
1. https://cyclic.sh
2. Sign in with GitHub
3. "Deploy" → Sélectionne le repo
4. Fait !

---

*Template créé pour Dragon.io - Alternatives sans carte bancaire*