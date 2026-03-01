#!/bin/bash

echo "🚀 Déploiement de Quran Recitation App - Docker"
echo "================================================"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé!${NC}"
    echo "Installez Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé!${NC}"
    echo "Installez Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker et Docker Compose sont installés${NC}"

# Vérifier .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Fichier .env manquant${NC}"
    echo "Création depuis .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Veuillez éditer .env avec vos paramètres avant de continuer${NC}"
    echo "nano .env"
    exit 1
fi

echo -e "${GREEN}✅ Fichier .env trouvé${NC}"

# Demander confirmation
echo ""
echo "Cette opération va:"
echo "  1. Construire les images Docker"
echo "  2. Démarrer les conteneurs en mode production"
echo "  3. Configurer le réseau et les volumes"
echo ""
read -p "Continuer? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Déploiement annulé."
    exit 1
fi

# Arrêter les conteneurs existants
echo ""
echo "📦 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down

# Construire les images
echo ""
echo "🏗️  Construction des images Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la construction${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Images construites avec succès${NC}"

# Démarrer les conteneurs
echo ""
echo "🚀 Démarrage des conteneurs..."
docker-compose -f docker-compose.prod.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du démarrage${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Conteneurs démarrés${NC}"

# Attendre que les services soient prêts
echo ""
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état
echo ""
echo "📊 État des conteneurs:"
docker-compose -f docker-compose.prod.yml ps

# Afficher les logs
echo ""
echo "📋 Derniers logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

# Résumé
echo ""
echo "================================================"
echo -e "${GREEN}✅ Déploiement terminé!${NC}"
echo "================================================"
echo ""
echo "🌐 Accès à l'application:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost/api"
echo "   API Docs: http://localhost/api/docs"
echo ""
echo "📊 Commandes utiles:"
echo "   Voir les logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Arrêter: docker-compose -f docker-compose.prod.yml down"
echo "   Redémarrer: docker-compose -f docker-compose.prod.yml restart"
echo "   Statut: docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "🔒 N'oubliez pas de:"
echo "   1. Configurer votre domaine dans nginx/nginx.conf"
echo "   2. Obtenir un certificat SSL avec certbot"
echo "   3. Configurer votre pare-feu (ports 80, 443)"
echo ""
