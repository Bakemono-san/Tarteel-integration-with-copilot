#!/bin/bash

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🕌 QURAN RECITATION APP - DÉPLOIEMENT VPS LOCALHOST 🕌             ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝

📚 GUIDES DISPONIBLES POUR VPS LOCALHOST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VPS-QUICK.md              - Guide ultra-rapide (5 minutes)
✅ VPS-LOCALHOST-SETUP.md    - Guide complet avec dépannage
✅ vps-install.sh            - Script d'installation automatique
✅ vps-update.sh             - Script de mise à jour

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 INSTALLATION VPS EN 3 ÉTAPES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  CONNECTEZ-VOUS À VOTRE VPS
────────────────────────────────
    ssh votre-user@votre-vps-ip


2️⃣  CLONEZ ET INSTALLEZ
────────────────────────
    cd ~
    git clone https://github.com/votre-username/quran-recitation-app.git
    cd quran-recitation-app
    chmod +x vps-install.sh
    sudo ./vps-install.sh

    ⏱️  Durée: 10-15 minutes (automatique)


3️⃣  ACCÉDEZ À L'APPLICATION
────────────────────────────

    Sur le VPS directement:
      http://localhost:3000    (Frontend)
      http://localhost:8000    (Backend)

    Depuis votre ordinateur (SSH Tunnel):
      ssh -L 3000:localhost:3000 -L 8000:localhost:8000 user@vps-ip
      Puis: http://localhost:3000

    Ou via l'IP du VPS:
      sudo ufw allow 3000/tcp
      sudo ufw allow 8000/tcp
      Puis: http://VOTRE-VPS-IP:3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 CARACTÉRISTIQUES DU DÉPLOIEMENT VPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Installation automatique complète
✅ Services systemd (démarrage automatique)
✅ Backend: http://localhost:8000
✅ Frontend: http://localhost:3000
✅ Logs centralisés avec journalctl
✅ Redémarrage automatique en cas d'erreur
✅ Mise à jour simplifiée avec script
✅ Pas besoin de Docker
✅ Performances optimales
✅ Configuration minimale requise: 2GB RAM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMMANDES ESSENTIELLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Installation:
  sudo ./vps-install.sh                              # Installer

Gestion des services:
  sudo systemctl status quran-backend quran-frontend # Statut
  sudo systemctl restart quran-backend               # Redémarrer backend
  sudo systemctl restart quran-frontend              # Redémarrer frontend
  sudo systemctl stop quran-backend quran-frontend   # Arrêter
  sudo systemctl start quran-backend quran-frontend  # Démarrer

Logs:
  sudo journalctl -u quran-backend -f                # Logs backend (temps réel)
  sudo journalctl -u quran-frontend -f               # Logs frontend (temps réel)
  sudo journalctl -u quran-backend -n 50             # 50 dernières lignes backend

Mise à jour:
  cd ~/quran-recitation-app                          # Aller dans le dossier
  ./vps-update.sh                                    # Mettre à jour

Tests:
  curl http://localhost:8000/health                  # Tester backend
  curl http://localhost:8000/api/quran/surahs        # Tester API
  curl http://localhost:3000                         # Tester frontend

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 CONFIGURATION PARE-FEU (Optionnel):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pour accéder via l'IP du VPS:

  sudo ufw allow 22/tcp      # SSH (important!)
  sudo ufw allow 3000/tcp    # Frontend
  sudo ufw allow 8000/tcp    # Backend
  sudo ufw enable

Puis accédez à: http://VOTRE-VPS-IP:3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🆘 DÉPANNAGE RAPIDE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Service ne démarre pas:
  sudo journalctl -u quran-backend -n 50             # Voir les erreurs
  sudo systemctl restart quran-backend               # Redémarrer

Port déjà utilisé:
  sudo lsof -i :8000                                 # Voir ce qui utilise le port
  sudo kill -9 PID                                   # Tuer le processus

Erreur de mémoire:
  sudo fallocate -l 2G /swapfile                     # Créer swap
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile

Frontend ne build pas:
  cd ~/quran-recitation-app/frontend
  rm -rf node_modules .next
  npm install
  npm run build

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 DOCUMENTATION COMPLÈTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• VPS-QUICK.md              - Guide rapide (COMMENCEZ ICI!)
• VPS-LOCALHOST-SETUP.md    - Guide complet avec tous les détails
• README.md                 - Documentation générale
• TROUBLESHOOTING.md        - Guide de dépannage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ AVANTAGES DU DÉPLOIEMENT VPS LOCALHOST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Pas besoin de Docker
✓ Installation automatique (10-15 min)
✓ Services systemd (démarrage auto)
✓ Performances optimales
✓ Logs centralisés
✓ Facile à maintenir
✓ Configuration minimale
✓ Mise à jour simplifiée

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fait avec ❤️ pour la communauté musulmane

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
