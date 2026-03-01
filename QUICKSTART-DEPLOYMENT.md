# 🚀 Guide de Déploiement Rapide

## Option 1: Déploiement Docker (Le plus simple)

### 1. Préparer le serveur
```bash
# Installer Docker et Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. Cloner et déployer
```bash
# Cloner le repo
git clone https://github.com/votre-username/quran-recitation-app.git
cd quran-recitation-app

# Rendre les scripts exécutables
chmod +x make-scripts-executable.sh
./make-scripts-executable.sh

# Configurer l'environnement
cp .env.example .env
nano .env  # Éditez avec vos paramètres

# Déployer
./deploy.sh
```

### 3. Configurer SSL (optionnel mais recommandé)
```bash
sudo ./setup-ssl.sh
```

### 4. Accéder à l'application
- Frontend: http://votre-serveur
- Backend API: http://votre-serveur/api
- API Docs: http://votre-serveur/api/docs

---

## Option 2: Déploiement Cloud (Vercel + Railway)

### Frontend sur Vercel

1. **Push sur GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Déployer sur Vercel**
   - Allez sur https://vercel.com
   - Importez votre repo
   - Root Directory: `frontend`
   - Framework: Next.js
   - Variables d'environnement:
     ```
     NEXT_PUBLIC_API_URL=https://votre-backend.railway.app
     ```

### Backend sur Railway.app

1. **Allez sur https://railway.app**
2. Créez un nouveau projet depuis GitHub
3. Root Directory: `backend`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## Mise à jour de l'application

```bash
./update.sh
```

---

## Commandes utiles

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Redémarrer
docker-compose -f docker-compose.prod.yml restart

# Arrêter
docker-compose -f docker-compose.prod.yml down

# Statut
docker-compose -f docker-compose.prod.yml ps
```

---

## 🆘 Support

- Documentation complète: voir `DEPLOYMENT.md`
- Problèmes: créez une issue sur GitHub
