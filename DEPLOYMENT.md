# 🚀 Quran Recitation App - Guide de Déploiement

## Options de Déploiement

### Option 1: Déploiement avec Docker (Recommandé)
### Option 2: Déploiement sur VPS (Ubuntu/Debian)
### Option 3: Déploiement Cloud (Vercel + Railway/Render)

---

## 📦 Option 1: Déploiement Docker (Le plus simple)

### Prérequis
- Docker et Docker Compose installés
- Domaine ou sous-domaine (optionnel mais recommandé)

### Étapes

1. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditez .env avec vos paramètres
```

2. **Construire et lancer les conteneurs**
```bash
# Mode production
docker-compose -f docker-compose.prod.yml up -d --build

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f
```

3. **Accéder à l'application**
- Frontend: http://votre-domaine.com
- Backend API: http://votre-domaine.com/api
- API Docs: http://votre-domaine.com/api/docs

### Commandes utiles
```bash
# Arrêter l'application
docker-compose -f docker-compose.prod.yml down

# Redémarrer
docker-compose -f docker-compose.prod.yml restart

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Mettre à jour l'application
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🖥️ Option 2: Déploiement sur VPS (Ubuntu 22.04)

### Prérequis
- Serveur Ubuntu 22.04 avec au moins 2GB RAM
- Accès SSH
- Domaine pointant vers votre serveur

### 1. Installation des dépendances

```bash
# Se connecter au serveur
ssh user@votre-serveur.com

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Python 3.10+
sudo apt install python3.10 python3.10-venv python3-pip -y

# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Installer FFmpeg (pour le traitement audio)
sudo apt install ffmpeg -y

# Installer Nginx
sudo apt install nginx -y

# Installer Certbot (pour SSL)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Cloner et configurer l'application

```bash
# Créer un utilisateur pour l'app
sudo useradd -m -s /bin/bash quranapp
sudo su - quranapp

# Cloner le repo
git clone https://github.com/votre-username/quran-recitation-app.git
cd quran-recitation-app

# Configuration Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Télécharger le cache Quran
python -c "from services.quran_service import QuranService; QuranService()"

# Configuration Frontend
cd ../frontend
npm install
npm run build

# Créer le fichier .env
cd ..
cp .env.example .env
nano .env  # Éditez avec vos paramètres
```

### 3. Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/quran-app
```

Collez cette configuration:
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    client_max_body_size 50M;
}
```

Activez la configuration:
```bash
sudo ln -s /etc/nginx/sites-available/quran-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Configurer SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d votre-domaine.com
```

### 5. Créer des services systemd

**Backend Service:**
```bash
sudo nano /etc/systemd/system/quran-backend.service
```

```ini
[Unit]
Description=Quran Recitation Backend
After=network.target

[Service]
Type=simple
User=quranapp
WorkingDirectory=/home/quranapp/quran-recitation-app/backend
Environment="PATH=/home/quranapp/quran-recitation-app/backend/venv/bin"
ExecStart=/home/quranapp/quran-recitation-app/backend/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Frontend Service:**
```bash
sudo nano /etc/systemd/system/quran-frontend.service
```

```ini
[Unit]
Description=Quran Recitation Frontend
After=network.target

[Service]
Type=simple
User=quranapp
WorkingDirectory=/home/quranapp/quran-recitation-app/frontend
Environment="PATH=/usr/bin:/usr/local/bin"
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activez les services:
```bash
sudo systemctl daemon-reload
sudo systemctl enable quran-backend quran-frontend
sudo systemctl start quran-backend quran-frontend

# Vérifier le statut
sudo systemctl status quran-backend
sudo systemctl status quran-frontend
```

---

## ☁️ Option 3: Déploiement Cloud

### Frontend: Vercel

1. **Push vers GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Déployer sur Vercel**
- Allez sur [vercel.com](https://vercel.com)
- Importez votre repo GitHub
- Configurez:
  - Framework: Next.js
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `.next`
- Variables d'environnement:
  ```
  NEXT_PUBLIC_API_URL=https://votre-backend.railway.app
  ```

### Backend: Railway.app ou Render.com

**Railway.app:**
1. Allez sur [railway.app](https://railway.app)
2. Créez un nouveau projet depuis GitHub
3. Configurez:
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Variables d'environnement:
   ```
   PYTHON_VERSION=3.10
   ```

**Render.com:**
1. Allez sur [render.com](https://render.com)
2. Créez un nouveau Web Service
3. Configurez:
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 🔒 Sécurité en Production

### 1. Variables d'environnement
Créez un fichier `.env`:
```env
# Backend
PYTHON_ENV=production
ALLOWED_ORIGINS=https://votre-domaine.com
SECRET_KEY=votre-cle-secrete-tres-longue

# Frontend
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
NODE_ENV=production
```

### 2. Pare-feu (UFW)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 3. Limiter les requêtes (Rate Limiting)
Déjà configuré dans le code FastAPI

### 4. Sauvegardes automatiques
```bash
# Créer un script de backup
sudo nano /usr/local/bin/backup-quran-app.sh
```

```bash
#!/bin/bash
BACKUP_DIR=/home/quranapp/backups
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf $BACKUP_DIR/quran-app-$DATE.tar.gz /home/quranapp/quran-recitation-app
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-quran-app.sh
# Ajouter au crontab (tous les jours à 3h)
sudo crontab -e
0 3 * * * /usr/local/bin/backup-quran-app.sh
```

---

## 📊 Monitoring

### Logs
```bash
# Backend logs
sudo journalctl -u quran-backend -f

# Frontend logs
sudo journalctl -u quran-frontend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Performance Monitoring
Installez `htop` pour surveiller les ressources:
```bash
sudo apt install htop
htop
```

---

## 🔄 Mise à jour de l'application

```bash
cd /home/quranapp/quran-recitation-app

# Pull les derniers changements
git pull

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart quran-backend

# Frontend
cd ../frontend
npm install
npm run build
sudo systemctl restart quran-frontend
```

---

## ⚡ Optimisations Production

### 1. Cache CDN (Cloudflare)
- Configurez Cloudflare pour votre domaine
- Activez le cache pour les assets statiques
- Activez la compression Brotli

### 2. Base de données (optionnel)
Pour stocker les statistiques utilisateurs:
```bash
sudo apt install postgresql
# Configuration PostgreSQL...
```

### 3. Redis (optionnel)
Pour le cache des résultats:
```bash
sudo apt install redis-server
sudo systemctl enable redis-server
```

---

## 🆘 Dépannage

### Backend ne démarre pas
```bash
sudo systemctl status quran-backend
sudo journalctl -u quran-backend -n 50
```

### Frontend ne démarre pas
```bash
sudo systemctl status quran-frontend
sudo journalctl -u quran-frontend -n 50
```

### Erreur de permissions
```bash
sudo chown -R quranapp:quranapp /home/quranapp/quran-recitation-app
```

### Out of Memory
Augmentez le swap:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 📞 Support

Pour toute question:
- Documentation: Voir README.md
- Issues: GitHub Issues
- Logs: Consultez les logs ci-dessus

---

## ✅ Checklist de Déploiement

- [ ] Domaine configuré et pointant vers le serveur
- [ ] SSL/HTTPS activé
- [ ] Variables d'environnement configurées
- [ ] Pare-feu configuré
- [ ] Services systemd activés
- [ ] Nginx configuré et testé
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring en place
- [ ] Tests de performance effectués
- [ ] Documentation mise à jour

Bon déploiement! 🚀
