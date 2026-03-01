#!/bin/bash

echo "🔒 Configuration SSL avec Let's Encrypt"
echo "======================================="

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier que le script est exécuté en tant que root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Ce script doit être exécuté en tant que root${NC}"
   echo "Utilisez: sudo ./setup-ssl.sh"
   exit 1
fi

# Demander le nom de domaine
read -p "Entrez votre nom de domaine (ex: example.com): " DOMAIN
read -p "Entrez votre email pour les notifications SSL: " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Domaine et email sont requis${NC}"
    exit 1
fi

echo ""
echo "Configuration pour:"
echo "  Domaine: $DOMAIN"
echo "  Email: $EMAIL"
echo ""
read -p "Continuer? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Installer certbot si nécessaire
echo ""
echo "📦 Installation de Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Arrêter nginx temporairement
echo ""
echo "⏸️  Arrêt de Nginx..."
systemctl stop nginx

# Obtenir le certificat
echo ""
echo "🔐 Obtention du certificat SSL..."
certbot certonly --standalone \
    -d $DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de l'obtention du certificat${NC}"
    systemctl start nginx
    exit 1
fi

echo -e "${GREEN}✅ Certificat obtenu avec succès${NC}"

# Mettre à jour nginx.conf avec le domaine
echo ""
echo "📝 Mise à jour de la configuration Nginx..."
sed -i "s/votre-domaine.com/$DOMAIN/g" /home/bakemono/Documents/quran-recitation-app/nginx/nginx.conf

# Redémarrer nginx
echo ""
echo "🔄 Redémarrage de Nginx..."
systemctl start nginx
systemctl enable nginx

# Configurer le renouvellement automatique
echo ""
echo "⏰ Configuration du renouvellement automatique..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -

echo ""
echo "================================================"
echo -e "${GREEN}✅ Configuration SSL terminée!${NC}"
echo "================================================"
echo ""
echo "🔐 Certificat SSL installé pour: $DOMAIN"
echo "🔄 Renouvellement automatique configuré (tous les jours à 3h)"
echo ""
echo "🌐 Votre site est maintenant accessible via:"
echo "   https://$DOMAIN"
echo ""
echo "📝 Le certificat expire dans 90 jours et sera renouvelé automatiquement."
echo ""
