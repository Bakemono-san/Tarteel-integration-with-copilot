# 🖥️ Déploiement VPS - Mode Localhost

Guide pour déployer l'application Quran Recitation sur un VPS en mode localhost (sans Docker).

---

## 📋 Prérequis

- VPS Ubuntu 22.04 ou Debian 11+
- Au moins 2GB RAM
- Accès SSH root ou sudo
- 10GB d'espace disque libre

---

## 🚀 Installation Automatique (Recommandé)

```bash
# Sur votre VPS
wget https://raw.githubusercontent.com/votre-repo/quran-recitation-app/main/vps-install.sh
chmod +x vps-install.sh
sudo ./vps-install.sh
```

Ou clonez le repo et exécutez :

```bash
git clone https://github.com/votre-username/quran-recitation-app.git
cd quran-recitation-app
chmod +x vps-install.sh
sudo ./vps-install.sh
```

Le script fera tout automatiquement ! ⏱️ Durée : ~10-15 minutes

---

## 🔧 Installation Manuelle (Étape par étape)

### 1️⃣ Mettre à jour le système

```bash
sudo apt update && sudo apt upgrade -y
```

### 2️⃣ Installer Python 3.10+

```bash
sudo apt install -y python3.10 python3.10-venv python3-pip
sudo apt install -y ffmpeg libsndfile1  # Pour l'audio
```

### 3️⃣ Installer Node.js 18+

```bash
# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier
node --version  # devrait afficher v18.x ou plus
npm --version
```

### 4️⃣ Cloner l'application

```bash
cd ~
git clone https://github.com/votre-username/quran-recitation-app.git
cd quran-recitation-app
```

### 5️⃣ Configuration Backend

```bash
cd ~/quran-recitation-app/backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install --upgrade pip
pip install -r requirements.txt

# Pré-charger le cache Quran
python3 -c "from services.quran_service import QuranService; QuranService()"
```

### 6️⃣ Configuration Frontend

```bash
cd ~/quran-recitation-app/frontend

# Installer les dépendances
npm install

# Build pour production
npm run build
```

### 7️⃣ Créer les services systemd

**Service Backend :**

```bash
sudo nano /etc/systemd/system/quran-backend.service
```

Copiez ce contenu :

```ini
[Unit]
Description=Quran Recitation Backend API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/quran-recitation-app/backend
Environment="PATH=/home/$USER/quran-recitation-app/backend/venv/bin"
ExecStart=/home/$USER/quran-recitation-app/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Service Frontend :**

```bash
sudo nano /etc/systemd/system/quran-frontend.service
```

Copiez ce contenu :

```ini
[Unit]
Description=Quran Recitation Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/quran-recitation-app/frontend
Environment="PATH=/usr/bin:/usr/local/bin"
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 8️⃣ Activer et démarrer les services

```bash
# Recharger systemd
sudo systemctl daemon-reload

# Activer les services (démarrage automatique)
sudo systemctl enable quran-backend quran-frontend

# Démarrer les services
sudo systemctl start quran-backend quran-frontend

# Vérifier le statut
sudo systemctl status quran-backend
sudo systemctl status quran-frontend
```

### 9️⃣ Configurer le pare-feu (si activé)

```bash
# Permettre SSH (important!)
sudo ufw allow 22/tcp

# Permettre les ports de l'application
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8000/tcp  # Backend

# Activer le pare-feu
sudo ufw enable
```

---

## ✅ Vérification

### Vérifier que tout fonctionne :

```bash
# Vérifier les services
sudo systemctl status quran-backend
sudo systemctl status quran-frontend

# Vérifier les ports
sudo netstat -tulpn | grep -E ':(3000|8000)'

# Tester le backend
curl http://localhost:8000/health

# Tester l'API
curl http://localhost:8000/api/quran/surahs
```

### Accéder à l'application :

**En local sur le VPS :**
```bash
# Via tunnel SSH depuis votre ordinateur
ssh -L 3000:localhost:3000 -L 8000:localhost:8000 user@votre-vps
```

Puis ouvrez dans votre navigateur :
- Frontend : http://localhost:3000
- Backend API : http://localhost:8000/api/docs

**Ou via l'IP du VPS :**
- Frontend : http://IP-DE-VOTRE-VPS:3000
- Backend : http://IP-DE-VOTRE-VPS:8000

---

## 🔄 Commandes de gestion

### Voir les logs

```bash
# Backend logs
sudo journalctl -u quran-backend -f

# Frontend logs
sudo journalctl -u quran-frontend -f

# Logs récents
sudo journalctl -u quran-backend -n 50
sudo journalctl -u quran-frontend -n 50
```

### Redémarrer les services

```bash
sudo systemctl restart quran-backend
sudo systemctl restart quran-frontend
```

### Arrêter les services

```bash
sudo systemctl stop quran-backend
sudo systemctl stop quran-frontend
```

### Activer/Désactiver le démarrage automatique

```bash
# Activer
sudo systemctl enable quran-backend quran-frontend

# Désactiver
sudo systemctl disable quran-backend quran-frontend
```

---

## 🔄 Mise à jour de l'application

```bash
cd ~/quran-recitation-app

# Pull les derniers changements
git pull

# Mettre à jour le backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Mettre à jour le frontend
cd ../frontend
npm install
npm run build

# Redémarrer les services
sudo systemctl restart quran-backend quran-frontend
```

Ou utilisez le script automatique :

```bash
cd ~/quran-recitation-app
chmod +x vps-update.sh
./vps-update.sh
```

---

## 🐛 Dépannage

### Les services ne démarrent pas

```bash
# Vérifier les erreurs
sudo journalctl -u quran-backend -n 50
sudo journalctl -u quran-frontend -n 50

# Vérifier les permissions
ls -la ~/quran-recitation-app/backend
ls -la ~/quran-recitation-app/frontend

# Tester manuellement
cd ~/quran-recitation-app/backend
source venv/bin/activate
python main.py  # Devrait démarrer sans erreurs
```

### Port déjà utilisé

```bash
# Voir ce qui utilise le port
sudo lsof -i :8000
sudo lsof -i :3000

# Tuer le processus si nécessaire
sudo kill -9 PID
```

### Erreur de mémoire

```bash
# Ajouter du swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Frontend ne build pas

```bash
cd ~/quran-recitation-app/frontend

# Nettoyer et réinstaller
rm -rf node_modules .next
npm install
npm run build
```

---

## 📊 Monitoring

### Voir l'utilisation des ressources

```bash
# CPU et RAM
htop  # Installer avec: sudo apt install htop

# Espace disque
df -h

# Processus
ps aux | grep -E '(python|node)'
```

### Logs en temps réel

```bash
# Les deux services
sudo journalctl -u quran-backend -u quran-frontend -f

# Avec filtrage
sudo journalctl -u quran-backend -f | grep ERROR
```

---

## 🔒 Sécurité

### Mettre à jour régulièrement

```bash
# Système
sudo apt update && sudo apt upgrade -y

# Application
cd ~/quran-recitation-app && git pull
```

### Configurer le pare-feu

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw enable
```

### Limiter l'accès SSH (recommandé)

```bash
sudo nano /etc/ssh/sshd_config
# Modifier: PermitRootLogin no
# Modifier: PasswordAuthentication no (si vous utilisez des clés SSH)
sudo systemctl restart sshd
```

---

## 📦 Sauvegardes

### Créer une sauvegarde

```bash
cd ~
tar -czf quran-app-backup-$(date +%Y%m%d).tar.gz quran-recitation-app/
```

### Sauvegarde automatique (cron)

```bash
# Créer le script de backup
nano ~/backup-quran.sh
```

Contenu :
```bash
#!/bin/bash
cd ~
tar -czf quran-app-backup-$(date +%Y%m%d).tar.gz quran-recitation-app/
find ~ -name "quran-app-backup-*.tar.gz" -mtime +7 -delete
```

```bash
chmod +x ~/backup-quran.sh

# Ajouter au crontab (tous les jours à 3h)
crontab -e
# Ajouter: 0 3 * * * /home/$USER/backup-quran.sh
```

---

## ✅ Checklist Post-Installation

- [ ] Services démarrés et actifs
- [ ] Logs sans erreurs
- [ ] Backend accessible sur http://localhost:8000
- [ ] Frontend accessible sur http://localhost:3000
- [ ] API docs accessible sur http://localhost:8000/docs
- [ ] Pare-feu configuré
- [ ] Démarrage automatique activé
- [ ] Sauvegardes configurées
- [ ] Monitoring en place

---

## 🎯 Performance

### Optimisations recommandées

```bash
# Augmenter les workers backend (si vous avez 4+ cores)
# Dans /etc/systemd/system/quran-backend.service
# Modifier: --workers 4

# Activer le cache npm
npm config set cache ~/.npm-cache --global

# Nettoyer les logs anciens
sudo journalctl --vacuum-time=7d
```

---

## 📞 Support

- Logs: `sudo journalctl -u quran-backend -u quran-frontend -f`
- Statut: `sudo systemctl status quran-backend quran-frontend`
- Documentation complète: Voir README.md

---

**Bon déploiement! 🚀**
