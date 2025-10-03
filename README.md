# 🎨 Carousel Mix

> Standalone carousel generator dengan 9 text styles untuk Instagram

Carousel Mix adalah aplikasi independen untuk membuat carousel Instagram dengan sistem bulk generation. Generate multiple carousel sets dengan berbagai kombinasi gambar dan teks, lengkap dengan 9 pilihan text style yang menarik.

## ✨ Features

- **🔄 Bulk Generation**: Generate multiple carousel sets sekaligus
- **🎨 9 Text Styles**: Modern, TikTok Outline, Instagram Gradient, Elegant, Classic, Minimalist, Cyber Y2K, Kinetic, Sketch
- **👁️ Visual Preview**: Lihat preview semua text style sebelum generate
- **💾 Project Management**: Save dan load multiple projects
- **📦 ZIP Download**: Download hasil dalam format ZIP terorganisir
- **♾️ Unlimited**: Tidak ada batasan kredit (local-only)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm atau yarn

### Installation
```bash
# Clone repository
git clone https://github.com/yoppiari/Carousel-Mix.git
cd Carousel-Mix

# Install backend dependencies
cd backend && npm install && npx prisma generate && npx prisma migrate dev

# Install frontend dependencies
cd ../frontend && npm install
```

### Running
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## 📖 Documentation

- 📚 [Full Documentation](./docs/README.md)
- 🔌 [API Documentation](./docs/API.md)

## 🎭 Text Styles

| Style | Description |
|-------|-------------|
| Modern | Bold clean text dengan backdrop blur |
| TikTok | Bold uppercase dengan stroke outline |
| Instagram | Gradient background box |
| Elegant | Script/handwritten dengan shadow |
| Classic | Serif font dengan border |
| Minimalist | Lightweight dengan letter spacing |
| Cyber Y2K | Neon futuristik dengan glow |
| Kinetic | RGB shift motion effect |
| Sketch | Hand-drawn style |

## 🛠️ Tech Stack

**Backend**: Express.js, TypeScript, SQLite, Prisma, @napi-rs/canvas
**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI

## 📝 License

MIT License

## 👨‍💻 Credits

Developed by Claude (Anthropic AI) | Maintained by [@yoppiari](https://github.com/yoppiari)

---

**Made with ❤️ using Claude Code**
