# Carousel Mix - Documentation

## Overview

Carousel Mix adalah aplikasi independen untuk membuat carousel Instagram dengan sistem bulk generation. Aplikasi ini adalah versi standalone yang tidak terhubung dengan sistem Lumiku AI Suite.

## Features

### ✨ Core Features
- **Bulk Carousel Generator**: Generate multiple carousel sets dengan berbagai kombinasi gambar dan teks
- **9 Text Styles**: Modern, TikTok, Instagram, Elegant, Classic, Minimalist, Y2K, Kinetic, Sketch
- **Visual Style Preview**: Lihat preview semua text style sebelum generate
- **Project Management**: Save, load, dan manage multiple projects
- **Download Manager**: Download hasil generate dalam format ZIP
- **Unlimited Credits**: Sistem tanpa batasan kredit (local-only)

### 🎨 Text Styles
1. **Modern** - Bold clean text dengan backdrop blur
2. **TikTok (Outline)** - Bold uppercase dengan stroke outline hitam
3. **Instagram** - Gradient background dengan rounded corners
4. **Elegant** - Script/handwritten style dengan shadow
5. **Classic** - Serif font dengan border atas bawah
6. **Minimalist** - Lightweight dengan letter spacing
7. **Cyber Y2K** - Neon futuristik dengan glow effect
8. **Kinetic (Motion)** - RGB shift effect dengan gradient animasi
9. **Sketch (Personal)** - Hand-drawn style dengan dashed border

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: SQLite + Prisma ORM
- **Image Processing**: @napi-rs/canvas + Sharp
- **Archive**: Archiver (ZIP creation)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **UI Components**: Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Date Formatting**: date-fns

## Project Structure

```
Carousel Mix/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Main server file
│   │   ├── services/
│   │   │   ├── image-generator.service.ts   # Canvas rendering + text styles
│   │   │   ├── bulk-generator.service.ts    # Bulk set generation logic
│   │   │   ├── file-storage.service.ts      # File system operations
│   │   │   └── archive.service.ts           # ZIP creation
│   │   ├── types/
│   │   │   └── carousel.types.ts            # TypeScript types
│   │   └── utils/
│   │       └── db.ts                        # Prisma client
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── outputs/                  # Generated files
│   │   ├── projects/             # Single carousel outputs
│   │   └── bulk/                 # Bulk generation outputs
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Radix UI components
│   │   │   ├── Layout.tsx        # App layout with sidebar
│   │   │   ├── TextStyleSelector.tsx
│   │   │   └── StylePreviewGallery.tsx
│   │   ├── pages/
│   │   │   ├── BulkGeneratorPage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   └── CarouselEditorPage.tsx
│   │   ├── services/
│   │   │   ├── carousel.service.ts
│   │   │   └── project.service.ts
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx   # Dummy auth (always authenticated)
│   │   │   └── CreditContext.tsx # Dummy credits (unlimited)
│   │   ├── types/
│   │   │   └── carousel.types.ts
│   │   ├── styles/
│   │   │   └── text-styles.css   # CSS for all 9 text styles
│   │   └── lib/
│   │       ├── utils.ts
│   │       └── dateUtils.ts
│   └── package.json
│
└── docs/
    ├── README.md                 # This file
    ├── API.md                    # API documentation
    ├── DEVELOPMENT.md            # Development guide
    └── DEPLOYMENT.md             # Deployment guide
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm atau yarn
- Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/yoppiari/Carousel-Mix.git
cd Carousel-Mix

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup database
cd backend
npx prisma generate
npx prisma migrate dev

# Run development servers
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Backend akan running di `http://localhost:3003`
Frontend akan running di `http://localhost:5178` (atau port lain jika 5178 digunakan)

## Database Schema

```prisma
model Project {
  id        String   @id @default(uuid())
  title     String
  type      String   @default("carousel")
  content   String   // JSON string dengan configuration
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Content field berisi JSON dengan struktur:
- `metadata`: title, type ('bulk'), totalCombinations, setsToGenerate, etc.
- `settings`: width, height, slideCount
- `slides`: array of slide configurations dengan images, texts, textConfig

## API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /` - API info & available endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Carousel Generation
- `POST /api/carousel/generate` - Generate single carousel
- `POST /api/carousel/bulk-generate` - Bulk generate multiple sets
- `GET /api/carousel/project/:id/download` - Download project ZIP

## How Bulk Generation Works

1. **User Input**:
   - Upload gambar untuk setiap slide
   - Input multiple text variations (separated by newlines)
   - Pilih text style, position, alignment, font size
   - Set jumlah sets yang ingin di-generate

2. **Combination Logic**:
   - Setiap slide: rotate text dan image berdasarkan set index
   - Formula: `textIndex = (setIndex + slideIndex) % totalTexts`
   - Menghasilkan variasi yang berbeda untuk setiap set

3. **Image Generation**:
   - Backend render menggunakan @napi-rs/canvas
   - Apply text style sesuai pilihan (TikTok, Instagram, dll)
   - Text positioning: top, center, bottom
   - Text alignment: left, center, right

4. **Output**:
   - Setiap set: 3 gambar PNG (slide-1.png, slide-2.png, slide-3.png)
   - Individual ZIP per set: `set-1.zip`, `set-2.zip`, dll
   - Master ZIP: `download.zip` (contains all sets)

## Text Style Implementation

Setiap text style di-render di backend menggunakan Canvas API:

### Modern
```javascript
ctx.shadowColor = 'rgba(0,0,0,0.8)';
ctx.shadowBlur = 4;
ctx.fillStyle = '#FFFFFF';
ctx.fillText(text, x, y);
```

### TikTok (Outline)
```javascript
// Stroke outline
ctx.strokeStyle = '#000000';
ctx.lineWidth = 3;
ctx.strokeText(text.toUpperCase(), x, y);

// Fill text
ctx.fillStyle = '#FFFFFF';
ctx.fillText(text.toUpperCase(), x, y);
```

### Instagram (Gradient Box)
```javascript
// Background box
ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
roundRect(x, y, width, height, 6);

// White text
ctx.fillStyle = '#FFFFFF';
ctx.fillText(text, x, y);
```

Dan seterusnya untuk 6 style lainnya.

## Development Notes

### Type Safety
- ✅ Backend: 100% TypeScript error-free
- ✅ Frontend: 100% TypeScript error-free (active pages)
- Menggunakan strict type checking

### Key Decisions
1. **No Auth System**: Simplified untuk local use
2. **Unlimited Credits**: Tidak ada pembatasan
3. **SQLite Database**: Simple, portable, tidak perlu setup
4. **Base64 Images**: Stored in database untuk portability

### Performance Considerations
- Canvas rendering: ~1-2 detik per slide
- Bulk generation: Sequential processing
- ZIP creation: Efficient streaming
- File cleanup: Automatic on project delete

## Future Improvements

### Potential Features
- [ ] Video carousel generation
- [ ] Template library
- [ ] Custom font upload
- [ ] Batch export to Instagram
- [ ] Animation preview
- [ ] Real-time collaboration
- [ ] Cloud storage integration

### Performance Optimizations
- [ ] Parallel image generation
- [ ] Image caching
- [ ] Progressive ZIP download
- [ ] WebWorker for client-side preview

## Troubleshooting

### Port Conflicts
Jika port 3003 atau 5178 sudah digunakan:
- Backend: Edit `backend/src/index.ts` line 18: `const PORT = 3003`
- Frontend: Edit `frontend/package.json` scripts atau Vite akan auto-increment

### CORS Errors
Pastikan frontend port sudah ditambahkan di backend CORS config:
```typescript
// backend/src/index.ts line 21-24
app.use(cors({
  origin: ['http://localhost:5178', 'http://localhost:5173', ...],
  credentials: true
}));
```

### Database Issues
```bash
cd backend
npx prisma migrate reset  # Reset database
npx prisma generate       # Regenerate client
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Contributing

Ini adalah standalone project. Untuk kontribusi:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - Free to use and modify

## Credits

Developed by: Claude (Anthropic AI)
Maintained by: @yoppiari

Based on CarouselGeneratorPro architecture, redesigned as independent standalone application.

---

**Last Updated**: January 2025
**Version**: 1.0.0
