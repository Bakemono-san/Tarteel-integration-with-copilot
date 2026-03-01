# 🚨 START HERE - Got Errors? Read This First!

## ⚠️ You Got This Error?

```
./start.sh: line 27: venv/bin/activate: No such file or directory
python: command not found
sh: 1: next: not found
```

**This is NORMAL on first run!** You just need to set up the application first.

---

## ✅ QUICK FIX (3 Steps)

### Step 1: Run the Quick Fix Script

```bash
chmod +x quick-fix.sh
./quick-fix.sh
```

⏱️ **Wait 5-10 minutes** while it installs everything.

### Step 2: Start the Application

```bash
./start.sh
```

### Step 3: Open Your Browser

Go to: **http://localhost:3000**

🎉 **Done!** You should see the app!

---

## 🆘 If Quick Fix Fails

### Option A: Use Emergency Start (Does Everything)

```bash
chmod +x emergency-start.sh
./emergency-start.sh
```

This will:
- ✅ Check prerequisites
- ✅ Install all dependencies
- ✅ Start both servers automatically

### Option B: Manual Setup

**Terminal 1 (Backend):**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔍 What You Need First

Before anything works, you need:

1. **Python 3.10+**
   ```bash
   python3 --version  # Check if installed
   ```
   
   If not installed:
   - Ubuntu: `sudo apt install python3 python3-venv python3-pip`
   - macOS: `brew install python@3.10`

2. **Node.js 18+**
   ```bash
   node --version  # Check if installed
   ```
   
   If not installed:
   - Ubuntu: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`
   - macOS: `brew install node`

---

## 📋 Complete Flow

```
1. Install Python 3.10+ and Node.js 18+
   ↓
2. Run: chmod +x quick-fix.sh && ./quick-fix.sh
   (Wait 5-10 minutes)
   ↓
3. Run: ./start.sh
   ↓
4. Open: http://localhost:3000
   ↓
5. Start practicing! 🎉
```

---

## 💡 Understanding the Error

The error means:
- ❌ **Backend venv** doesn't exist yet (needs `python3 -m venv venv`)
- ❌ **Frontend node_modules** don't exist yet (needs `npm install`)
- ❌ **Dependencies** not installed yet

**Solution**: Run setup first, then start!

---

## 🎯 Quick Checklist

Before running `./start.sh`, make sure:

- [ ] Python 3.10+ is installed
- [ ] Node.js 18+ is installed
- [ ] You've run `./quick-fix.sh` or `./setup.sh`
- [ ] `backend/venv/` directory exists
- [ ] `frontend/node_modules/` directory exists
- [ ] Ports 3000 and 8000 are free

---

## 📞 Need More Help?

1. **Check Prerequisites**: Read section above
2. **Run Tests**: `chmod +x test.sh && ./test.sh`
3. **Read Troubleshooting**: Open `TROUBLESHOOTING.md`
4. **Check Logs**: Look at `backend.log` and `frontend.log`

---

## 🎊 When It Works

You'll see:
```
Backend:  http://localhost:8000
Frontend: http://localhost:3000
API Docs: http://localhost:8000/docs
```

And opening http://localhost:3000 will show the beautiful app! 🌟

---

## 🚀 TL;DR (Too Long, Didn't Read)

```bash
# If you got errors, just run this:
chmod +x quick-fix.sh && ./quick-fix.sh

# Then:
./start.sh

# Open:
# http://localhost:3000
```

**That's it!** 🎉

---

*P.S. First time setup takes longer because AI models need to download. Be patient!* ⏳
