# 🎨 Carousel Mix

**Independent Carousel Generator** - Create stunning carousels for LinkedIn, Instagram, and social media.

## ✨ Features

- 🎯 **Visual Editor** - Drag & drop interface for easy carousel creation
- 📝 **Text Elements** - Add titles, subtitles, and descriptions
- 🖼️ **Image Support** - Upload and place images anywhere
- 🎨 **Customization** - Themes, colors, fonts, and branding
- 💾 **Project Management** - Save, load, and manage carousel projects
- 📤 **Export** - PNG, PDF, and ZIP formats
- 🔄 **Bulk Generation** - Create multiple carousel variations at once

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- NPM or PNPM package manager

### Installation

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Setup database
npx prisma generate
npx prisma migrate dev --name init

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Development

```bash
# Terminal 1: Start backend (port 3003)
cd backend
npm run dev

# Terminal 2: Start frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Documentation

See [MASTER_REFERENCE.md](MASTER_REFERENCE.md) for complete documentation.

## 🛠️ Tech Stack

- **Backend**: Express.js + TypeScript + Prisma + SQLite
- **Frontend**: React + Vite + Zustand + Radix UI + Tailwind CSS
- **Image Processing**: @napi-rs/canvas + sharp
- **Export**: html-to-image + jspdf

## 📝 License

MIT

## 🤝 Contributing

This is a personal project. Feel free to fork and modify for your own use.
