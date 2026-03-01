#!/bin/bash

echo "🔄 Mise à jour de Quran Recitation App"
echo "======================================"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Pull les derniers changements
echo "📥 Récupération des derniers changements..."
git pull

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du git pull${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Code mis à jour${NC}"

# Rebuild et redémarrer
echo ""
echo "🔨 Reconstruction des images..."
docker-compose -f docker-compose.prod.yml build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la construction${NC}"
    exit 1
fi

echo ""
echo "🔄 Redémarrage des conteneurs..."
docker-compose -f docker-compose.prod.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du redémarrage${NC}"
    exit 1
fi

# Nettoyage des anciennes images
echo ""
echo "🧹 Nettoyage des anciennes images..."
docker image prune -f

echo ""
echo -e "${GREEN}✅ Mise à jour terminée!${NC}"
echo ""
echo "📊 Statut des conteneurs:"
docker-compose -f docker-compose.prod.yml ps
