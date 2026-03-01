#!/bin/bash

# Script de mise à jour pour VPS (mode localhost)
# Quran Recitation App

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "🔄 Mise à jour de Quran Recitation App (VPS)"
echo "============================================="
echo -e "${NC}"

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ] && [ ! -f "backend/main.py" ]; then
    echo -e "${YELLOW}⚠️  Exécutez ce script depuis le répertoire racine de l'application${NC}"
    exit 1
fi

echo "📥 1/5 - Récupération des derniers changements..."
git pull

echo ""
echo "🐍 2/5 - Mise à jour du backend..."
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
cd ..

echo ""
echo "⚛️  3/5 - Mise à jour du frontend..."
cd frontend
npm install
npm run build
cd ..

echo ""
echo "🔄 4/5 - Redémarrage des services..."
if command -v systemctl &> /dev/null; then
    sudo systemctl restart quran-backend quran-frontend
    echo -e "${GREEN}✅ Services redémarrés${NC}"
else
    echo -e "${YELLOW}⚠️  Systemd non disponible, redémarrez manuellement${NC}"
fi

echo ""
echo "✅ 5/5 - Vérification..."
sleep 3

if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend opérationnel${NC}"
else
    echo -e "${YELLOW}⚠️  Backend non accessible, vérifiez les logs${NC}"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend opérationnel${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend non accessible, vérifiez les logs${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Mise à jour terminée!${NC}"
echo ""
echo "📋 Pour voir les logs:"
echo "  sudo journalctl -u quran-backend -f"
echo "  sudo journalctl -u quran-frontend -f"
echo ""
