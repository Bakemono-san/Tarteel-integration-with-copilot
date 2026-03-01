# ✅ CHECKLIST DE DÉPLOIEMENT

## Avant le déploiement

- [ ] Code testé en local
- [ ] Tous les bugs corrigés
- [ ] Variables d'environnement configurées (.env)
- [ ] Domaine acheté et configuré (optionnel)
- [ ] Serveur/VPS prêt (si applicable)

---

## Déploiement Docker (Recommandé)

### Étape 1: Préparation
```bash
# Sur votre serveur
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Déconnectez-vous et reconnectez-vous
```

### Étape 2: Installation
```bash
git clone https://github.com/votre-username/quran-recitation-app.git
cd quran-recitation-app
chmod +x make-scripts-executable.sh
./make-scripts-executable.sh
```

### Étape 3: Configuration
```bash
cp .env.example .env
nano .env
# Modifiez:
# - ALLOWED_ORIGINS avec votre domaine
# - SECRET_KEY avec une clé aléatoire
# - NEXT_PUBLIC_API_URL avec votre URL backend
```

### Étape 4: Déploiement
```bash
./deploy.sh
```

### Étape 5: SSL (Recommandé)
```bash
sudo ./setup-ssl.sh
# Entrez votre domaine et email
```

### Étape 6: Vérification
- [ ] Frontend accessible: https://votre-domaine.com
- [ ] Backend API: https://votre-domaine.com/api/docs
- [ ] WebSocket fonctionne (testez la récitation)
- [ ] Speech-to-Text fonctionne
- [ ] Audio des surahs fonctionne

---

## Déploiement Cloud

### Frontend (Vercel)
1. Push sur GitHub
2. Connectez Vercel à votre repo
3. Configurez:
   - Framework: Next.js
   - Root: `frontend`
   - Env: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`

### Backend (Railway.app)
1. Créez un projet Railway depuis GitHub
2. Configurez:
   - Root: `backend`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## Post-déploiement

### Configuration du pare-feu
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Monitoring
```bash
# Logs backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Logs frontend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Statut
docker-compose -f docker-compose.prod.yml ps
```

### Sauvegardes
```bash
# Créer un backup manuel
tar -czf backup-$(date +%Y%m%d).tar.gz quran-recitation-app/

# Configurer les backups automatiques (voir DEPLOYMENT.md)
```

---

## Maintenance

### Mise à jour
```bash
cd quran-recitation-app
./update.sh
```

### Redémarrage
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Nettoyage
```bash
# Supprimer les anciennes images
docker image prune -f

# Supprimer les anciens volumes
docker volume prune -f
```

---

## Problèmes courants

### L'application ne démarre pas
```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs

# Vérifier les ports
sudo netstat -tulpn | grep -E ':(80|443|3000|8000)'
```

### Erreur de mémoire
```bash
# Ajouter du swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Certificat SSL expiré
```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## 🎉 Félicitations!

Votre application Quran Recitation est maintenant déployée!

### Prochaines étapes:
1. Testez toutes les fonctionnalités
2. Configurez un monitoring (UptimeRobot, etc.)
3. Configurez des alertes email
4. Documentez votre infrastructure
5. Planifiez les backups réguliers

### Support:
- Documentation: DEPLOYMENT.md
- Guide rapide: QUICKSTART-DEPLOYMENT.md
- Issues: GitHub

---

**Fait avec ❤️ pour la communauté musulmane**
