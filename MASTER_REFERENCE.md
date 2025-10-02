# 🎨 Carousel Mix - Master Reference Document

**Version**: 1.0.0
**Created**: 2025-10-02
**Purpose**: Independent Carousel Generator - No Credits, No Auth, No Dashboard

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Structure](#frontend-structure)
8. [Implementation Checklist](#implementation-checklist)
9. [Dependencies](#dependencies)
10. [Development Guide](#development-guide)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 PROJECT OVERVIEW

### What is Carousel Mix?

**Carousel Mix** adalah aplikasi web untuk membuat carousel/slideshow yang dapat digunakan untuk:
- LinkedIn carousels
- Instagram carousels
- Presentation slides
- Social media content

### Key Principles

✅ **Independent** - No external dependencies (auth, billing, etc.)
✅ **Simple** - Focus on core carousel creation
✅ **Local First** - SQLite database, local file storage
✅ **Single User** - No authentication needed
✅ **Offline Capable** - Works without internet

### What We DON'T Include

❌ Authentication system
❌ Credit/billing system
❌ Multi-user support
❌ Unified dashboard
❌ Complex deployment requirements

---

## 🏗️ ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Browser (Frontend)                  │
│  React + Vite + Zustand + Radix UI + Tailwind      │
│                                                      │
│  - Carousel Editor (Visual Drag & Drop)             │
│  - Project Management (Save/Load/Delete)            │
│  - Export (PNG/PDF/ZIP)                             │
│  - Bulk Generator (Multiple Sets)                   │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/REST API
                   ▼
┌─────────────────────────────────────────────────────┐
│             Backend (Express + TypeScript)           │
│                                                      │
│  - API Routes (Projects, Generation, Export)        │
│  - Image Generator (@napi-rs/canvas)                │
│  - Bulk Generator (Combinations)                    │
│  - File Storage (Local filesystem)                  │
│  - Archive Service (ZIP creation)                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              Storage Layer                           │
│                                                      │
│  - SQLite Database (Prisma ORM)                     │
│  - Local Files (outputs/)                           │
└─────────────────────────────────────────────────────┘
```

### Folder Structure

```
Carousel Mix/
├── backend/
│   ├── src/
│   │   ├── index.ts                    # Main server entry
│   │   ├── routes/
│   │   │   ├── project.routes.ts       # Project CRUD
│   │   │   ├── carousel.routes.ts      # Generation APIs
│   │   │   └── health.routes.ts        # Health check
│   │   ├── services/
│   │   │   ├── image-generator.service.ts    # Canvas-based generation
│   │   │   ├── bulk-generator.service.ts     # Bulk combinations
│   │   │   ├── file-storage.service.ts       # File management
│   │   │   └── archive.service.ts            # ZIP creation
│   │   ├── types/
│   │   │   └── carousel.types.ts       # Shared types
│   │   └── utils/
│   │       └── logger.ts               # Logging utility
│   ├── prisma/
│   │   ├── schema.prisma               # Database schema
│   │   └── migrations/                 # Migration history
│   ├── outputs/                        # Generated files
│   │   ├── projects/                   # Single projects
│   │   └── bulk/                       # Bulk generations
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                            # Environment config
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                    # React entry
│   │   ├── App.tsx                     # Root component
│   │   ├── pages/
│   │   │   ├── EditorPage.tsx          # Main editor
│   │   │   ├── ProjectsPage.tsx        # Project list
│   │   │   └── BulkGeneratorPage.tsx   # Bulk generation
│   │   ├── modules/                    # Feature modules
│   │   │   ├── carousel-editor/
│   │   │   │   ├── components/
│   │   │   │   │   ├── EditorCanvas.tsx
│   │   │   │   │   ├── Toolbar.tsx
│   │   │   │   │   ├── ElementEditor.tsx
│   │   │   │   │   └── SettingsModal.tsx
│   │   │   │   └── forms/
│   │   │   │       ├── ThemeForm.tsx
│   │   │   │       ├── BrandForm.tsx
│   │   │   │       └── FontsForm.tsx
│   │   │   ├── carousel-core/
│   │   │   │   ├── components/
│   │   │   │   │   ├── SlideView.tsx
│   │   │   │   │   ├── SlideCarousel.tsx
│   │   │   │   │   └── DraggableElement.tsx
│   │   │   │   └── schemas/
│   │   │   │       └── carousel.schema.ts
│   │   │   └── carousel-export/
│   │   │       ├── components/
│   │   │       │   └── ExportModal.tsx
│   │   │       └── services/
│   │   │           └── ExportService.ts
│   │   ├── components/
│   │   │   ├── MainNavigation.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ui/                     # Radix UI components
│   │   ├── stores/
│   │   │   ├── carouselStore.ts        # Carousel state
│   │   │   └── uiStore.ts              # UI state
│   │   ├── services/
│   │   │   ├── api.service.ts          # API client
│   │   │   ├── project.service.ts      # Project APIs
│   │   │   └── carousel.service.ts     # Carousel APIs
│   │   ├── types/
│   │   │   └── carousel.types.ts       # TypeScript types
│   │   ├── lib/
│   │   │   └── utils.ts                # Utilities
│   │   └── styles/
│   │       └── globals.css             # Global styles
│   ├── public/                         # Static assets
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── .env                            # Environment config
│
├── MASTER_REFERENCE.md                 # This file
├── README.md                           # User documentation
├── .gitignore
└── package.json                        # Root scripts (optional)
```

---

## 🛠️ TECHNOLOGY STACK

### Backend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **TypeScript** | ^5.0.0 | Type safety |
| **Express** | ^4.18.2 | Web framework |
| **Prisma** | ^5.0.0 | ORM for SQLite |
| **@napi-rs/canvas** | ^0.1.80 | Server-side canvas rendering |
| **sharp** | ^0.34.4 | Image processing |
| **archiver** | ^7.0.1 | ZIP file creation |
| **uuid** | ^9.0.0 | Unique ID generation |
| **cors** | ^2.8.5 | CORS middleware |
| **dotenv** | ^16.0.3 | Environment variables |

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | ^18.2.0 | UI framework |
| **Vite** | ^4.4.9 | Build tool & dev server |
| **TypeScript** | ^5.1.6 | Type safety |
| **React Router** | ^6.14.0 | Routing |
| **Zustand** | ^4.4.7 | State management |
| **immer** | ^10.1.3 | Immutable state |
| **Radix UI** | latest | Headless UI components |
| **Tailwind CSS** | ^3.3.3 | Styling |
| **html-to-image** | ^1.11.13 | Client-side export |
| **jspdf** | ^2.5.2 | PDF generation |
| **axios** | ^1.5.0 | HTTP client |
| **react-hook-form** | ^7.63.0 | Form handling |
| **zod** | ^3.22.2 | Schema validation |
| **lucide-react** | ^0.268.0 | Icons |

---

## ✨ FEATURES

### 1. Carousel Editor

**Visual Editor with:**
- Drag & drop elements
- Multiple slide support
- Text elements (title, subtitle, description)
- Image upload and placement
- Background customization (colors, gradients, images)
- Element positioning and sizing
- Real-time preview

**Settings:**
- Theme configuration (colors)
- Brand settings (logo, name, handle)
- Font customization
- Page numbering
- Slide dimensions

### 2. Project Management

**Functionality:**
- Create new project
- Save project (auto-save + manual)
- Load existing project
- List all projects
- Delete project
- Duplicate project

**Storage:**
- SQLite database (Prisma)
- JSON document structure
- Local file system

### 3. Export Capabilities

**Export Formats:**
- **PNG**: Individual slides as images
- **PDF**: All slides in single PDF
- **ZIP**: Package all slides

**Export Options:**
- Custom dimensions
- Quality settings
- Include/exclude page numbers
- Batch export

### 4. Bulk Generator

**Bulk Generation:**
- Define multiple text variations
- Define multiple image variations
- Generate combinations automatically
- Export as individual ZIP files per set
- Master ZIP with all sets

**Use Cases:**
- A/B testing content
- Multiple language versions
- Product variations
- Batch social media posts

---

## 🗄️ DATABASE SCHEMA

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Project {
  id        String   @id @default(cuid())
  title     String
  type      String   @default("carousel")
  content   String   // JSON stringified CarouselDocument
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([createdAt])
  @@index([type])
}
```

### CarouselDocument Structure (JSON in content field)

```typescript
interface CarouselDocument {
  id: string;
  version: string;
  metadata: {
    title: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    tags?: string[];
  };
  slides: Slide[];
  settings: DocumentSettings;
  theme: ThemeSettings;
  brand: BrandSettings;
  fonts: FontSettings;
}

interface Slide {
  id: string;
  order: number;
  elements: SlideElement[];
  background?: string | BackgroundImage;
}

interface SlideElement {
  id: string;
  type: 'title' | 'subtitle' | 'description' | 'image' | 'shape';
  content: string;
  position: { x: number; y: number; width?: number; height?: number };
  style: CSSProperties;
}

interface DocumentSettings {
  showPageNumbers: boolean;
  pageNumberPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  slideSize: {
    width: number;
    height: number;
    aspectRatio: string;
  };
}

interface ThemeSettings {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

interface BrandSettings {
  name?: string;
  logo?: string;
  handle?: string;
  avatarOpacity?: number;
}

interface FontSettings {
  title: FontConfig;
  subtitle: FontConfig;
  body: FontConfig;
}

interface FontConfig {
  family: string;
  size: string;
  weight: string;
}
```

---

## 🔌 API ENDPOINTS

### Health & Info

```
GET /health
Response: { success: true, service: "Carousel Mix", status: "healthy" }

GET /
Response: Service info and available endpoints
```

### Project Management

```
POST /api/projects
Body: { title: string, type?: string, document: CarouselDocument }
Response: { success: true, data: Project }

GET /api/projects
Response: { success: true, data: Project[] }

GET /api/projects/:id
Response: { success: true, data: Project }

PUT /api/projects/:id
Body: { title?: string, type?: string, document?: CarouselDocument }
Response: { success: true, data: Project }

DELETE /api/projects/:id
Response: { success: true, message: "Project deleted" }
```

### Carousel Generation

```
POST /api/carousel/generate
Body: { projectId: string, document: CarouselDocument }
Response: { success: true, jobId: string, downloadUrl: string }

POST /api/carousel/bulk-generate
Body: {
  title: string,
  count: number,
  settings: { slides: SlideConfig[], slideCount: number, width: number, height: number }
}
Response: {
  success: true,
  jobId: string,
  generatedFiles: Array<{ id, filename, downloadUrl, setNumber, files }>
}
```

### File Download

```
GET /api/carousel/outputs/:path
Response: File (image/png, application/zip)

GET /api/carousel/project/:id/download
Response: ZIP file with all project slides
```

---

## 🎨 FRONTEND STRUCTURE

### State Management (Zustand)

**carouselStore.ts** - Main carousel state
```typescript
interface CarouselStore {
  document: CarouselDocument | null;
  selectedSlideIndex: number;
  selectedElementId: string | null;
  isLoading: boolean;
  isDirty: boolean;
  lastSaved: Date | null;

  // Document actions
  setDocument: (doc: CarouselDocument) => void;
  createNewDocument: (title?: string) => void;

  // Slide actions
  addSlide: (slide?: Partial<Slide>) => void;
  updateSlide: (index: number, updates: Partial<Slide>) => void;
  deleteSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;

  // Element actions
  addElement: (slideIndex: number, element: Partial<SlideElement>) => void;
  updateElement: (slideIndex: number, elementId: string, updates: Partial<SlideElement>) => void;
  deleteElement: (slideIndex: number, elementId: string) => void;

  // Settings actions
  updateTheme: (theme: Partial<ThemeSettings>) => void;
  updateBrand: (brand: Partial<BrandSettings>) => void;
  updateFonts: (fonts: Partial<FontSettings>) => void;
}
```

**uiStore.ts** - UI state
```typescript
interface UIStore {
  rightPanelContent: 'settings' | 'elements' | null;
  modalContent: 'export' | 'settings' | null;
  isLoading: boolean;

  setRightPanelContent: (content: string | null) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
}
```

### Routing

```typescript
// App.tsx routes
<Routes>
  <Route path="/" element={<Navigate to="/editor" />} />
  <Route path="/editor" element={<EditorPage />} />
  <Route path="/editor/:projectId" element={<EditorPage />} />
  <Route path="/projects" element={<ProjectsPage />} />
  <Route path="/bulk-generator" element={<BulkGeneratorPage />} />
  <Route path="/bulk-generator/:projectId" element={<BulkGeneratorPage />} />
</Routes>
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Project Setup
- [ ] Create project directories
- [ ] Initialize Git repository
- [ ] Create `.gitignore`
- [ ] Write `README.md`
- [ ] Create this `MASTER_REFERENCE.md`

### Phase 2: Backend Setup
- [ ] Initialize Node.js project (`npm init`)
- [ ] Install backend dependencies
- [ ] Setup TypeScript configuration
- [ ] Setup Prisma with SQLite
- [ ] Create database schema
- [ ] Run Prisma migrations
- [ ] Create basic Express server
- [ ] Setup CORS middleware
- [ ] Create health check endpoint

### Phase 3: Backend Implementation
- [ ] Implement project routes (CRUD)
- [ ] Implement image generator service
- [ ] Implement file storage service
- [ ] Implement archive service
- [ ] Implement bulk generator service
- [ ] Create carousel generation endpoints
- [ ] Create file serving endpoints
- [ ] Add error handling
- [ ] Add logging

### Phase 4: Frontend Setup
- [ ] Initialize Vite + React project
- [ ] Install frontend dependencies
- [ ] Setup Tailwind CSS
- [ ] Configure TypeScript
- [ ] Setup environment variables
- [ ] Create basic routing

### Phase 5: Frontend Core
- [ ] Copy carousel types
- [ ] Create Zustand stores
- [ ] Create API service layer
- [ ] Setup Radix UI components
- [ ] Create Layout component
- [ ] Create Navigation component

### Phase 6: Carousel Editor
- [ ] Copy carousel editor components
- [ ] Implement EditorCanvas
- [ ] Implement Toolbar
- [ ] Implement ElementEditor
- [ ] Implement SettingsModal
- [ ] Implement drag & drop
- [ ] Implement text editing
- [ ] Implement image upload
- [ ] Implement background editing

### Phase 7: Project Management
- [ ] Create ProjectsPage
- [ ] Implement project list UI
- [ ] Implement project creation
- [ ] Implement project loading
- [ ] Implement project deletion
- [ ] Implement auto-save
- [ ] Add project search/filter

### Phase 8: Export Functionality
- [ ] Copy export components
- [ ] Implement ExportModal
- [ ] Implement PNG export (html-to-image)
- [ ] Implement PDF export (jspdf)
- [ ] Implement ZIP download
- [ ] Add export progress indicator

### Phase 9: Bulk Generator
- [ ] Create BulkGeneratorPage
- [ ] Implement bulk configuration UI
- [ ] Implement text variations input
- [ ] Implement image variations input
- [ ] Implement generation logic
- [ ] Implement set downloads
- [ ] Add progress tracking

### Phase 10: Testing & Polish
- [ ] Test all features locally
- [ ] Fix bugs
- [ ] Optimize performance
- [ ] Add loading states
- [ ] Add error messages
- [ ] Improve UX
- [ ] Write user documentation
- [ ] Create demo video/screenshots

---

## 📦 DEPENDENCIES

### Backend `package.json`

```json
{
  "name": "carousel-mix-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "@prisma/client": "^5.0.0",
    "@napi-rs/canvas": "^0.1.80",
    "sharp": "^0.34.4",
    "archiver": "^7.0.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/node": "^20.0.0",
    "@types/uuid": "^9.0.0",
    "typescript": "^5.0.0",
    "tsx": "^3.12.0",
    "prisma": "^5.0.0"
  }
}
```

### Frontend `package.json`

```json
{
  "name": "carousel-mix-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5173",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "zustand": "^4.4.7",
    "immer": "^10.1.3",
    "axios": "^1.5.0",
    "react-hook-form": "^7.63.0",
    "zod": "^3.22.2",
    "@radix-ui/react-dialog": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^1.2.2",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toast": "^1.2.15",
    "@radix-ui/react-tooltip": "^1.0.7",
    "tailwindcss": "^3.3.3",
    "tailwindcss-animate": "^1.0.7",
    "tailwind-merge": "^1.14.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.268.0",
    "html-to-image": "^1.11.13",
    "jspdf": "^2.5.2",
    "react-draggable": "^4.5.0",
    "react-dropzone": "^14.2.3",
    "uuid": "^13.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@types/uuid": "^10.0.0",
    "@vitejs/plugin-react": "^4.0.4",
    "typescript": "^5.1.6",
    "vite": "^4.4.9",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.28"
  }
}
```

---

## 🚀 DEVELOPMENT GUIDE

### Initial Setup

```bash
# 1. Clone or create project directory
cd "C:\Users\yoppi\Downloads\Carousel Mix"

# 2. Setup backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init

# 3. Setup frontend
cd ../frontend
npm install

# 4. Create .env files (see below)
```

### Environment Variables

**backend/.env**
```env
DATABASE_URL="file:./dev.db"
PORT=3003
NODE_ENV=development
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:3003
```

### Running Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Server: http://localhost:3003

# Terminal 2: Frontend
cd frontend
npm run dev
# App: http://localhost:5173
```

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name description

# View database
npx prisma studio
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

---

## 🐛 TROUBLESHOOTING

### Common Issues

**1. Database Connection Error**
```
Solution: Ensure DATABASE_URL is correct in .env
Check: SQLite file permissions
```

**2. Canvas Installation Fails**
```
Solution: Install build tools
Windows: npm install --global windows-build-tools
Mac: xcode-select --install
Linux: sudo apt-get install build-essential libcairo2-dev
```

**3. Port Already in Use**
```
Solution: Change PORT in .env
Or kill process:
  Windows: netstat -ano | findstr :3003 then taskkill /PID <PID> /F
  Mac/Linux: lsof -ti:3003 | xargs kill
```

**4. CORS Errors**
```
Solution: Check CORS origin in backend index.ts
Ensure frontend URL is whitelisted
```

**5. Image Export Not Working**
```
Solution: Check html-to-image and jspdf versions
Try: npm install html-to-image@1.11.13 jspdf@2.5.2
```

**6. Prisma Client Not Found**
```
Solution: Run npx prisma generate
Then restart dev server
```

---

## 📝 NOTES FOR CLAUDE

### If Error Occurs, Remember:

1. **This document is the SOURCE OF TRUTH**
2. **No authentication** - Remove all auth-related code
3. **No credits** - Remove all credit-related code
4. **SQLite only** - No PostgreSQL or other databases
5. **Copy from CarouselGeneratorPro** - But remove framework dependencies
6. **Complete each phase** - Don't skip steps
7. **Test after each feature** - Ensure it works before moving on

### Key Files to Copy (Adapted):

FROM: `C:\Users\yoppi\Downloads\Adopted Video Mix Pro\Apps\CarouselGeneratorPro`

**Frontend:**
- `frontend/src/modules/carousel-editor/` → Copy all components
- `frontend/src/modules/carousel-core/` → Copy all components
- `frontend/src/modules/carousel-export/` → Copy ExportModal and ExportService
- `frontend/src/components/ui/` → Copy all Radix UI components
- `frontend/src/stores/carouselStore.ts` → Copy and simplify
- `frontend/src/stores/uiStore.ts` → Copy as-is
- `frontend/src/types/carousel.types.ts` → Copy as-is
- `frontend/src/components/MainNavigation.tsx` → Copy and adapt

**Backend:**
- `backend/src/services/image-generator.service.ts` → Copy and adapt
- `backend/src/services/bulk-generator.service.ts` → Copy and adapt
- `backend/src/services/file-storage.service.ts` → Copy and adapt
- `backend/src/services/archive.service.ts` → Copy and adapt

**DO NOT COPY:**
- Anything with "auth" in the name
- Anything with "credit" in the name
- `@framework/*` dependencies
- LoginPage, CreditUsagePage, DashboardPage
- AuthContext, CreditContext

---

## ✅ COMPLETION CRITERIA

### Feature Checklist

- [ ] Can create new carousel project
- [ ] Can add/edit/delete slides
- [ ] Can add/edit text elements
- [ ] Can upload and place images
- [ ] Can change backgrounds (colors/gradients)
- [ ] Can customize theme colors
- [ ] Can set brand info
- [ ] Can adjust fonts
- [ ] Can save project to database
- [ ] Can load existing projects
- [ ] Can delete projects
- [ ] Can export to PNG
- [ ] Can export to PDF
- [ ] Can export to ZIP
- [ ] Can create bulk generations
- [ ] Can download bulk sets
- [ ] No errors in console
- [ ] Responsive UI works
- [ ] All navigation works

### Quality Checks

- [ ] TypeScript compiles without errors
- [ ] No console warnings
- [ ] All API endpoints respond correctly
- [ ] File uploads work
- [ ] File downloads work
- [ ] Database operations work
- [ ] Auto-save functions
- [ ] UI is responsive
- [ ] Loading states show
- [ ] Error messages display

---

## 🎯 SUCCESS METRICS

**If you can do ALL of these, the app is COMPLETE:**

1. ✅ Open `http://localhost:5173`
2. ✅ Create a new carousel
3. ✅ Add 3 slides
4. ✅ Add title text to each slide
5. ✅ Upload an image to slide 2
6. ✅ Change background color of slide 3
7. ✅ Save the project
8. ✅ See project in projects list
9. ✅ Load the project again
10. ✅ Export to PNG (all slides download)
11. ✅ Export to PDF (single file)
12. ✅ Export to ZIP (all files)
13. ✅ Create bulk generation with 2 sets
14. ✅ Download bulk sets
15. ✅ Delete the project

---

**Last Updated**: 2025-10-02
**Status**: Master Reference Created ✅
**Next**: Execute Implementation Plan
