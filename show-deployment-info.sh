#!/bin/bash

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🕌 QURAN RECITATION APP - RÉSUMÉ DE DÉPLOIEMENT 🕌         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📚 FICHIERS DE DÉPLOIEMENT CRÉÉS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ DEPLOYMENT.md                  - Guide complet de déploiement
✅ QUICKSTART-DEPLOYMENT.md       - Guide rapide
✅ DEPLOYMENT-CHECKLIST.md        - Checklist étape par étape
✅ docker-compose.prod.yml        - Configuration Docker production
✅ .env.example                   - Variables d'environnement
✅ deploy.sh                      - Script de déploiement automatique
✅ update.sh                      - Script de mise à jour
✅ setup-ssl.sh                   - Configuration SSL/HTTPS
✅ nginx/nginx.conf               - Configuration Nginx
✅ backend/Dockerfile.prod        - Dockerfile backend production
✅ frontend/Dockerfile.prod       - Dockerfile frontend production
✅ .gitignore                     - Fichiers à ignorer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 DÉPLOIEMENT RAPIDE (3 OPTIONS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTION 1: DOCKER (Le plus simple) 🐳
────────────────────────────────────
1. Installer Docker:
   curl -fsSL https://get.docker.com | sh

2. Rendre les scripts exécutables:
   chmod +x make-scripts-executable.sh
   ./make-scripts-executable.sh

3. Configurer l'environnement:
   cp .env.example .env
   nano .env

4. Déployer:
   ./deploy.sh

5. (Optionnel) Configurer SSL:
   sudo ./setup-ssl.sh


OPTION 2: VPS MANUEL 🖥️
────────────────────────
Voir le guide complet: DEPLOYMENT.md section "Option 2"


OPTION 3: CLOUD (Vercel + Railway) ☁️
─────────────────────────────────────
Frontend (Vercel):
1. Push sur GitHub
2. Importez sur vercel.com
3. Root: frontend, Framework: Next.js

Backend (Railway):
1. Importez sur railway.app
2. Root: backend
3. Start: uvicorn main:app --host 0.0.0.0 --port $PORT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMMANDES UTILES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Déploiement:
  ./deploy.sh                                    # Déployer en production

Mise à jour:
  ./update.sh                                    # Mettre à jour l'app

Logs:
  docker-compose -f docker-compose.prod.yml logs -f         # Tous les logs
  docker-compose -f docker-compose.prod.yml logs -f backend # Backend seulement

Contrôle:
  docker-compose -f docker-compose.prod.yml ps              # Statut
  docker-compose -f docker-compose.prod.yml restart         # Redémarrer
  docker-compose -f docker-compose.prod.yml down            # Arrêter
  docker-compose -f docker-compose.prod.yml up -d           # Démarrer

SSL:
  sudo ./setup-ssl.sh                            # Configurer SSL
  sudo certbot renew                             # Renouveler certificat

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 CONFIGURATION REQUISE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Minimum:
  • CPU: 2 cores
  • RAM: 2 GB
  • Stockage: 10 GB
  • OS: Ubuntu 22.04 / Debian 11+

Recommandé:
  • CPU: 4 cores
  • RAM: 4 GB
  • Stockage: 20 GB
  • Domaine avec SSL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 SÉCURITÉ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Changez SECRET_KEY dans .env
✓ Configurez ALLOWED_ORIGINS avec votre domaine
✓ Activez le pare-feu (ports 80, 443, 22)
✓ Installez un certificat SSL
✓ Configurez les backups automatiques

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 DOCUMENTATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• DEPLOYMENT.md               - Guide complet (toutes les options)
• QUICKSTART-DEPLOYMENT.md    - Démarrage rapide
• DEPLOYMENT-CHECKLIST.md     - Checklist de déploiement
• README.md                   - Documentation générale
• API.md                      - Documentation API

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 PROCHAINES ÉTAPES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Lisez DEPLOYMENT.md pour choisir votre méthode
2. Suivez DEPLOYMENT-CHECKLIST.md étape par étape
3. Configurez .env avec vos paramètres
4. Exécutez ./deploy.sh
5. Testez votre application
6. Configurez SSL avec ./setup-ssl.sh
7. Profitez! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 BESOIN D'AIDE?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Documentation: Voir les fichiers .md ci-dessus
• GitHub Issues: Créez une issue pour le support
• Logs: Consultez les logs Docker pour déboguer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fait avec ❤️ pour la communauté musulmane

EOF
