#!/bin/bash

# Script d'installation automatique pour VPS (mode localhost)
# Quran Recitation App

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║       🕌 QURAN RECITATION APP - INSTALLATION VPS 🕌          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Vérifier que le script est exécuté en tant que root ou avec sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Ce script doit être exécuté en tant que root ou avec sudo${NC}"
   echo "Utilisez: sudo ./vps-install.sh"
   exit 1
fi

# Obtenir l'utilisateur réel (pas root)
REAL_USER=${SUDO_USER:-$USER}
USER_HOME=$(eval echo ~$REAL_USER)

echo -e "${GREEN}Installation pour l'utilisateur: $REAL_USER${NC}"
echo -e "${GREEN}Répertoire home: $USER_HOME${NC}"
echo ""

# Demander confirmation
read -p "Continuer l'installation? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation annulée."
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}1️⃣  MISE À JOUR DU SYSTÈME${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
apt update && apt upgrade -y

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}2️⃣  INSTALLATION DE PYTHON 3.10+${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
apt install -y python3.10 python3.10-venv python3-pip
apt install -y ffmpeg libsndfile1 curl git

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}3️⃣  INSTALLATION DE NODE.JS 18+${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}4️⃣  CONFIGURATION DE L'APPLICATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# Vérifier si l'app est déjà clonée
if [ ! -d "$USER_HOME/quran-recitation-app" ]; then
    echo "Le répertoire n'existe pas encore."
    echo "Veuillez d'abord cloner le repo dans $USER_HOME/"
    echo ""
    echo "Commandes à exécuter (en tant qu'utilisateur normal) :"
    echo "  cd ~"
    echo "  git clone https://github.com/votre-username/quran-recitation-app.git"
    echo "  cd quran-recitation-app"
    echo "  sudo ./vps-install.sh"
    exit 1
fi

cd "$USER_HOME/quran-recitation-app"
echo -e "${GREEN}✅ Application trouvée dans: $(pwd)${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}5️⃣  CONFIGURATION DU BACKEND${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
cd backend

# Créer venv en tant qu'utilisateur normal
echo "Création de l'environnement virtuel Python..."
sudo -u $REAL_USER python3 -m venv venv

# Activer et installer
echo "Installation des dépendances Python..."
sudo -u $REAL_USER bash -c "
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    python3 -c 'from services.quran_service import QuranService; QuranService()' || true
    deactivate
"

echo -e "${GREEN}✅ Backend configuré${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}6️⃣  CONFIGURATION DU FRONTEND${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
cd ../frontend

echo "Installation des dépendances Node.js..."
sudo -u $REAL_USER npm install

echo "Build du frontend..."
sudo -u $REAL_USER npm run build

echo -e "${GREEN}✅ Frontend configuré${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}7️⃣  CRÉATION DES SERVICES SYSTEMD${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# Service Backend
echo "Création du service backend..."
cat > /etc/systemd/system/quran-backend.service << EOF
[Unit]
Description=Quran Recitation Backend API
After=network.target

[Service]
Type=simple
User=$REAL_USER
WorkingDirectory=$USER_HOME/quran-recitation-app/backend
Environment="PATH=$USER_HOME/quran-recitation-app/backend/venv/bin"
ExecStart=$USER_HOME/quran-recitation-app/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Service Frontend
echo "Création du service frontend..."
cat > /etc/systemd/system/quran-frontend.service << EOF
[Unit]
Description=Quran Recitation Frontend
After=network.target

[Service]
Type=simple
User=$REAL_USER
WorkingDirectory=$USER_HOME/quran-recitation-app/frontend
Environment="PATH=/usr/bin:/usr/local/bin"
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✅ Services systemd créés${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}8️⃣  ACTIVATION DES SERVICES${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

systemctl daemon-reload
systemctl enable quran-backend quran-frontend
systemctl start quran-backend quran-frontend

sleep 5

echo -e "${GREEN}✅ Services démarrés${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}9️⃣  VÉRIFICATION DE L'INSTALLATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

echo "Statut des services:"
systemctl status quran-backend --no-pager -l
systemctl status quran-frontend --no-pager -l

echo ""
echo "Test du backend..."
sleep 3
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend fonctionne!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend pourrait avoir besoin de quelques secondes supplémentaires${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ INSTALLATION TERMINÉE!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}🎉 L'application Quran Recitation est maintenant installée!${NC}"
echo ""
echo "📊 Statut des services:"
echo "  sudo systemctl status quran-backend"
echo "  sudo systemctl status quran-frontend"
echo ""
echo "📋 Voir les logs:"
echo "  sudo journalctl -u quran-backend -f"
echo "  sudo journalctl -u quran-frontend -f"
echo ""
echo "🌐 Accès à l'application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "🔄 Commandes utiles:"
echo "  sudo systemctl restart quran-backend quran-frontend  # Redémarrer"
echo "  sudo systemctl stop quran-backend quran-frontend     # Arrêter"
echo "  sudo journalctl -u quran-backend -n 50               # Logs backend"
echo ""
echo "📖 Documentation complète: VPS-LOCALHOST-SETUP.md"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}💡 Pour accéder depuis votre ordinateur:${NC}"
echo "  ssh -L 3000:localhost:3000 -L 8000:localhost:8000 $REAL_USER@$(hostname -I | awk '{print $1}')"
echo ""
echo -e "${YELLOW}💡 Ou configurez votre pare-feu pour accéder via l'IP:${NC}"
echo "  sudo ufw allow 3000/tcp"
echo "  sudo ufw allow 8000/tcp"
echo "  Puis accédez à: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
