# 🆘 INSTALLATION TROUBLESHOOTING

## Quick Fix - You're Getting Errors

If you're seeing errors like:
- `venv/bin/activate: No such file or directory`
- `python: command not found`
- `next: not found`

**This means the setup hasn't been run yet!**

---

## ✅ SOLUTION - Follow These Steps

### Step 1: Check Prerequisites

```bash
# Check if Python3 is installed
python3 --version
# Should show: Python 3.10.x or higher

# Check if Node.js is installed
node --version
# Should show: v18.x.x or higher

# Check npm
npm --version
# Should show: 9.x.x or higher
```

**If any command fails**, install the missing tool first:

#### Install Python 3.10+
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-venv python3-pip

# macOS
brew install python@3.10

# Arch Linux
sudo pacman -S python python-pip
```

#### Install Node.js 18+
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Arch Linux
sudo pacman -S nodejs npm
```

---

### Step 2: Run Setup (Choose ONE method)

#### Method A: Automated Setup (Recommended)
```bash
cd /home/bakemono/Documents/quran-recitation-app

# Make script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

Wait 5-10 minutes for all dependencies to install.

#### Method B: Emergency Setup (If setup.sh fails)
```bash
cd /home/bakemono/Documents/quran-recitation-app

# Make script executable
chmod +x emergency-start.sh

# Run emergency setup and start
./emergency-start.sh
```

This will setup AND start the application automatically.

#### Method C: Manual Setup (If both scripts fail)
```bash
cd /home/bakemono/Documents/quran-recitation-app

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
cd ..

# Frontend setup
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
```

---

### Step 3: Start the Application

After setup completes, start the app:

#### Option A: Using start script
```bash
chmod +x start.sh
./start.sh
```

#### Option B: Manual start (2 terminals)

**Terminal 1 - Backend:**
```bash
cd /home/bakemono/Documents/quran-recitation-app/backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd /home/bakemono/Documents/quran-recitation-app/frontend
npm run dev
```

---

## 🔍 Common Errors & Solutions

### Error: "python: command not found"
**Cause**: Python not installed or using wrong command  
**Solution**: 
```bash
# Use python3 instead
python3 --version

# If still fails, install Python
sudo apt install python3 python3-pip
```

### Error: "venv/bin/activate: No such file or directory"
**Cause**: Virtual environment not created yet  
**Solution**:
```bash
cd backend
python3 -m venv venv
```

### Error: "next: not found"
**Cause**: Frontend dependencies not installed  
**Solution**:
```bash
cd frontend
npm install
```

### Error: "pip: command not found"
**Cause**: pip not installed  
**Solution**:
```bash
sudo apt install python3-pip
```

### Error: "Cannot find module '@next/...'"
**Cause**: Node modules corrupted or incomplete  
**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 8000 already in use"
**Cause**: Backend already running or port occupied  
**Solution**:
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9

# Or use different port
cd backend
source venv/bin/activate
uvicorn main:app --port 8001
```

### Error: "Port 3000 already in use"
**Cause**: Frontend already running or port occupied  
**Solution**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
cd frontend
npm run dev -- -p 3001
```

---

## 🧪 Verify Installation

After setup, verify everything is working:

```bash
cd /home/bakemono/Documents/quran-recitation-app

# Make test script executable
chmod +x test.sh

# Run tests
./test.sh
```

You should see all tests passing with green checkmarks ✓

---

## 📊 Check Status

### Check if Backend is running:
```bash
curl http://localhost:8000/health
```

Expected output:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

### Check if Frontend is running:
```bash
curl -I http://localhost:3000
```

Expected: `HTTP/1.1 200 OK`

---

## 🆘 Still Having Issues?

### Check Logs

**Backend logs:**
```bash
# If using emergency-start.sh
cat backend.log

# If running manually, check terminal output
```

**Frontend logs:**
```bash
# If using emergency-start.sh
cat frontend.log

# If running manually, check terminal output
```

### Get Detailed Error Info

```bash
# Check Python version
python3 --version

# Check Node version
node --version

# Check if ports are free
lsof -i :8000
lsof -i :3000

# Check if virtual environment exists
ls -la backend/venv/

# Check if node_modules exists
ls -la frontend/node_modules/
```

---

## 🎯 Quick Recovery

If everything is broken, start fresh:

```bash
cd /home/bakemono/Documents/quran-recitation-app

# Clean everything
rm -rf backend/venv
rm -rf frontend/node_modules
rm -rf frontend/.next

# Run emergency setup
chmod +x emergency-start.sh
./emergency-start.sh
```

---

## ✅ Success Checklist

Before reporting an issue, verify:

- [ ] Python 3.10+ installed: `python3 --version`
- [ ] Node.js 18+ installed: `node --version`
- [ ] npm installed: `npm --version`
- [ ] Backend venv exists: `ls backend/venv/`
- [ ] Frontend node_modules exists: `ls frontend/node_modules/`
- [ ] No processes on port 8000: `lsof -i :8000`
- [ ] No processes on port 3000: `lsof -i :3000`
- [ ] Internet connection working (for model downloads)
- [ ] At least 4GB free RAM
- [ ] At least 5GB free disk space

---

## 💡 Tips

1. **First time setup takes time**: Model downloads can take 5-15 minutes
2. **Use two terminals**: One for backend, one for frontend
3. **Check logs**: Always check error messages in logs
4. **Internet required**: Initial setup needs internet for downloads
5. **Patience**: First run may take longer as models download

---

## 📞 Need More Help?

1. Read **QUICKSTART.md** for detailed instructions
2. Check **README.md** for complete documentation
3. Review **INDEX.md** for navigation
4. Ensure all prerequisites are met

---

## 🎉 When It Works

You'll know it's working when:
- ✅ Backend starts on http://localhost:8000
- ✅ Frontend starts on http://localhost:3000
- ✅ No error messages in terminal
- ✅ Opening http://localhost:3000 shows the app
- ✅ You can click "Start Practicing" button

**Then you're ready to go! 🎊**
