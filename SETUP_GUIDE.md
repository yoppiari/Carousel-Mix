# 🚀 Carousel Mix - Setup Guide

Complete step-by-step guide to get Carousel Mix running on your local machine.

---

## 📋 Prerequisites

Before starting, make sure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **NPM** (comes with Node.js)
- **Git** (optional, for version control)
- **Code Editor** (VS Code recommended)

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install all backend dependencies including Express, Prisma, Canvas, etc.

### Step 2: Setup Database

```bash
# Still in backend directory
npx prisma generate
npx prisma migrate dev --name init
```

This creates the SQLite database and generates Prisma client.

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This installs React, Vite, Tailwind, and all UI dependencies.

### Step 4: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Carousel Mix Backend
📡 Server running on http://localhost:3003
🗄️  Database: SQLite (Prisma)
✨ Ready to create amazing carousels!
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v4.4.9  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5: Open the App

Open your browser and go to: **http://localhost:5173**

🎉 **You're done!** The app should be running!

---

## 🔍 Troubleshooting

### Problem: `npm install` fails with canvas errors

**Windows:**
```bash
npm install --global windows-build-tools
```

**Mac:**
```bash
xcode-select --install
```

**Linux:**
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

Then try `npm install` again.

### Problem: Port 3003 already in use

Change the port in `backend/.env`:
```env
PORT=3005  # or any other available port
```

Also update `frontend/.env`:
```env
VITE_API_URL=http://localhost:3005
```

### Problem: Database migration fails

Delete the database and try again:
```bash
cd backend
rm dev.db
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### Problem: Frontend shows blank page

1. Check browser console for errors (F12)
2. Make sure backend is running
3. Check that `frontend/.env` has correct API URL
4. Try clearing browser cache

---

## 📝 Environment Variables

### Backend `.env`
```env
DATABASE_URL="file:./dev.db"
PORT=3003
NODE_ENV=development
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3003
```

---

## 🧪 Testing the App

### 1. Create Your First Carousel

1. App opens on Editor page
2. You'll see a default slide
3. Click on text to edit it
4. Click "+ Slide" to add more slides
5. Click "Save Project" to save

### 2. Test Export

1. Click "Export" button in toolbar
2. Choose PNG, PDF, or ZIP
3. Files should download

### 3. Test Bulk Generator

1. Click "Bulk Generator" in navigation
2. Configure slides with text variations
3. Upload images
4. Set number of sets to generate
5. Click "Generate"
6. Download individual sets or master ZIP

### 4. Test Project Management

1. Click "Projects" in navigation
2. See all saved projects
3. Click a project to open it
4. Delete projects you don't need

---

## 🏗️ Project Structure

```
Carousel Mix/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Main server
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utilities
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── outputs/               # Generated files (created auto)
│   ├── package.json
│   └── .env                   # Environment config
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Root component
│   │   ├── pages/             # Page components
│   │   ├── components/        # UI components
│   │   ├── modules/           # Feature modules
│   │   ├── stores/            # Zustand stores
│   │   ├── services/          # API clients
│   │   └── styles/            # CSS files
│   ├── package.json
│   └── .env                   # Environment config
│
├── MASTER_REFERENCE.md        # Complete documentation
├── SETUP_GUIDE.md             # This file
└── README.md                  # Project overview
```

---

## 🔧 Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- **Frontend**: Changes reflect immediately
- **Backend**: Server restarts automatically (via tsx watch)

### Database Management

View your database:
```bash
cd backend
npx prisma studio
```

This opens a web UI at http://localhost:5555

### Logs

- **Backend logs**: In the terminal running `npm run dev`
- **Frontend logs**: Browser console (F12)

### Reset Everything

If something goes wrong, reset:

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
rm dev.db
npm install
npx prisma generate
npx prisma migrate dev --name init

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Building for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

Built files will be in `frontend/dist/`

---

## 🎯 Next Steps

1. **Read MASTER_REFERENCE.md** for complete documentation
2. **Customize the app** - Add your own features
3. **Deploy** - Deploy to a server if needed
4. **Share** - Create amazing carousels!

---

## 💡 Common Use Cases

### LinkedIn Carousel

1. Set slide size to 1080x1080 (square)
2. Use professional colors and fonts
3. Add your branding
4. Export as PNG

### Instagram Carousel

1. Keep it visual with images
2. Use eye-catching colors
3. Export as PNG or PDF

### Presentation Slides

1. Create multiple slides
2. Use consistent theme
3. Export as PDF

### Bulk Social Media Posts

1. Use Bulk Generator
2. Add text variations (A/B testing)
3. Generate multiple versions
4. Download all at once

---

## 🆘 Getting Help

1. **Check MASTER_REFERENCE.md** for detailed info
2. **Check browser console** for errors (F12)
3. **Check backend logs** in terminal
4. **Reset database** if data looks corrupted
5. **Reinstall dependencies** if modules missing

---

## ✅ Checklist

Before asking for help, make sure:

- [ ] Node.js 18+ is installed
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Database migrated (`npx prisma migrate dev`)
- [ ] Both servers are running
- [ ] No error messages in terminal
- [ ] Browser console has no errors
- [ ] `.env` files are configured correctly

---

**🎉 Happy Creating! Build amazing carousels with Carousel Mix!**

Last Updated: 2025-10-02
