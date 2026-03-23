# 🚀 Déploiement Rapide GitHub + Render

## Template réutilisable pour tous les projets Node.js

### 1. Structure des fichiers à créer

#### `render.yaml` (à la racine du projet)
```yaml
services:
  - type: web
    name: NOM_DU_PROJET
    runtime: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /
    autoDeploy: true
```

#### `README.md` - Bouton de déploiement
```markdown
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/USERNAME/REPO_NAME)
```

### 2. Commandes GitHub CLI

```bash
# Créer repo et push
cd /chemin/du/projet
rm -rf .git
git init
git add .
git commit -m "Initial commit"
gh repo create NOM_REPO --public --source=. --remote=origin --push
```

### 3. Étapes de déploiement

1. **Créer le repo GitHub** (commande ci-dessus)
2. **Vérifier le bouton** dans le README
3. **Cliquer sur le bouton** "Deploy to Render"
4. **Attendre le déploiement** (~2 minutes)
5. **Récupérer l'URL** fournie par Render

### 4. Commandes utiles Render

```bash
# Voir les logs
render logs --service NOM_DU_SERVICE

# Redéployer
render deploy --service NOM_DU_SERVICE
```

### 5. Configuration package.json minimale

```json
{
  "name": "nom-du-projet",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## ✅ Checklist avant déploiement

- [ ] Fichier `render.yaml` créé
- [ ] Bouton dans `README.md` avec bonne URL
- [ ] `package.json` avec script `start`
- [ ] `PORT` utilise `process.env.PORT`
- [ ] `node_modules` dans `.gitignore`
- [ ] Repo créé sur GitHub
- [ ] Testé en local (`npm start`)

---

*Template créé pour Dragon.io - Réutilisable pour tous les projets Node.js*