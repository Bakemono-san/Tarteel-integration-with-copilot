# 🚀 DÉPLOIEMENT EN 5 MINUTES

## Méthode la plus simple (Docker)

### 1️⃣ Prérequis (1 minute)
```bash
# Installer Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Déconnectez-vous et reconnectez-vous
```

### 2️⃣ Configuration (2 minutes)
```bash
# Cloner
git clone https://github.com/votre-username/quran-recitation-app.git
cd quran-recitation-app

# Configurer
cp .env.example .env
nano .env  # Éditez ALLOWED_ORIGINS et SECRET_KEY
```

### 3️⃣ Déploiement (2 minutes)
```bash
# Déployer
chmod +x make-scripts-executable.sh && ./make-scripts-executable.sh
./deploy.sh
```

### ✅ C'est fait!
- Frontend: http://localhost
- Backend: http://localhost/api
- Docs: http://localhost/api/docs

---

## Ajouter SSL (Optionnel, +3 minutes)
```bash
sudo ./setup-ssl.sh
# Entrez votre domaine et email
```

---

## Avec Makefile (encore plus simple!)
```bash
make help        # Voir toutes les commandes
make deploy      # Déployer
make logs        # Voir les logs
make restart     # Redémarrer
make ssl         # Configurer SSL
```

---

## Commandes utiles

```bash
# Voir les logs
make logs

# Redémarrer
make restart

# Mettre à jour
make update

# Sauvegarder
make backup
```

---

## 📖 Documentation complète

- **Guide complet**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)
- **Makefile**: Tapez `make help`

---

## 🆘 Problème?

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Redémarrer
docker-compose -f docker-compose.prod.yml restart

# Tout arrêter et nettoyer
docker-compose -f docker-compose.prod.yml down
docker system prune -a
```

---

**C'est aussi simple que ça!** 🎉
