# 🚀 VPS Localhost - Installation en 5 minutes

## Installation Ultra-Rapide

### 1️⃣ Sur votre VPS (2 minutes)

```bash
# Cloner l'application
cd ~
git clone https://github.com/votre-username/quran-recitation-app.git
cd quran-recitation-app

# Installer automatiquement
chmod +x vps-install.sh
sudo ./vps-install.sh
```

Le script fait TOUT automatiquement ! ⏱️ Durée: ~10-15 minutes

### 2️⃣ C'est fini! ✅

L'application tourne maintenant sur votre VPS:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🌐 Accéder depuis votre ordinateur

### Option 1: SSH Tunnel (Recommandé)

Sur votre ordinateur local:
```bash
ssh -L 3000:localhost:3000 -L 8000:localhost:8000 user@IP-DE-VOTRE-VPS
```

Puis ouvrez: http://localhost:3000

### Option 2: Accès direct via IP

Sur votre VPS:
```bash
# Ouvrir les ports
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw enable
```

Puis depuis n'importe où: http://IP-DE-VOTRE-VPS:3000

---

## 🔄 Commandes utiles

```bash
# Voir les logs
sudo journalctl -u quran-backend -f
sudo journalctl -u quran-frontend -f

# Redémarrer
sudo systemctl restart quran-backend quran-frontend

# Statut
sudo systemctl status quran-backend quran-frontend

# Mettre à jour
cd ~/quran-recitation-app
chmod +x vps-update.sh
./vps-update.sh
```

---

## 🆘 Problème?

```bash
# Voir les erreurs
sudo journalctl -u quran-backend -n 50
sudo journalctl -u quran-frontend -n 50

# Redémarrer tout
sudo systemctl restart quran-backend quran-frontend
```

---

## 📖 Documentation complète

Voir: **VPS-LOCALHOST-SETUP.md**

---

**C'est aussi simple que ça!** 🎉
