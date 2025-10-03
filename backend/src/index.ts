import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import * as url from 'url';
import { prisma, connectDatabase } from './utils/db.js';
import { ImageGeneratorService } from './services/image-generator.service.js';
import { BulkGeneratorService } from './services/bulk-generator.service.js';
import { FileStorageService } from './services/file-storage.service.js';
import { ArchiveService } from './services/archive.service.js';
import { AuthService } from './services/auth.service.js';
import { authMiddleware, AuthRequest } from './middleware/auth.middleware.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors({
  origin: ['http://localhost:5178', 'http://localhost:5177', 'http://localhost:5176', 'http://localhost:5175', 'http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize services
const imageGenerator = new ImageGeneratorService();
const bulkGenerator = new BulkGeneratorService();
const fileStorage = new FileStorageService();
const archiveService = new ArchiveService();
const authService = new AuthService();

// Serve static files from outputs directory
app.use('/outputs', express.static(path.join(__dirname, '..', 'outputs')));

// ===================
// HEALTH & INFO
// ===================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Carousel Mix Backend',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Carousel Mix Backend',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      projects: {
        list: 'GET /api/projects',
        create: 'POST /api/projects',
        get: 'GET /api/projects/:id',
        update: 'PUT /api/projects/:id',
        delete: 'DELETE /api/projects/:id'
      },
      carousel: {
        generate: 'POST /api/carousel/generate',
        bulkGenerate: 'POST /api/carousel/bulk-generate',
        download: 'GET /api/carousel/project/:id/download'
      }
    }
  });
});

// ===================
// AUTH ROUTES
// ===================

// Login or auto-register
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const result = await authService.loginOrRegister(username, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});

// Verify current user
app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await authService.verifyUser(req.userId!);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'User verification failed',
      error: error.message
    });
  }
});

// ===================
// PROJECT ROUTES
// ===================

// Get all projects
app.get('/api/projects', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    // Parse content field from JSON string
    const parsedProjects = projects.map(project => ({
      ...project,
      document: JSON.parse(project.content)
    }));

    res.json({
      success: true,
      data: parsedProjects
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
});

// Get single project
app.get('/api/projects/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...project,
        document: JSON.parse(project.content)
      }
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
});

// Create new project
app.post('/api/projects', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, type = 'carousel', document } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const project = await prisma.project.create({
      data: {
        title,
        type,
        content: JSON.stringify(document || {}),
        userId: req.userId!
      }
    });

    res.json({
      success: true,
      data: {
        ...project,
        document: JSON.parse(project.content)
      }
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// Update project
app.put('/api/projects/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, type, document } = req.body;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (title) updateData.title = title;
    if (type) updateData.type = type;
    if (document) updateData.content = JSON.stringify(document);

    const project = await prisma.project.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: {
        ...project,
        document: JSON.parse(project.content)
      }
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// Delete project
app.delete('/api/projects/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id, userId: req.userId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await prisma.project.delete({
      where: { id }
    });

    // Also delete associated files
    await fileStorage.deleteProjectDirectory(id, 'projects');

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

// ===================
// CAROUSEL GENERATION ROUTES
// ===================

// Generate single carousel
app.post('/api/carousel/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { projectId, document } = req.body;

    if (!document || !document.slides) {
      return res.status(400).json({
        success: false,
        message: 'Document with slides is required'
      });
    }

    const jobId = `carousel-${Date.now()}`;
    const outputFiles: string[] = [];

    // Generate images for each slide
    for (let i = 0; i < document.slides.length; i++) {
      const slide = document.slides[i];
      const slideNumber = i + 1;

      const imageBuffer = await imageGenerator.generateSlide(
        slide,
        document.settings,
        document.theme,
        document.brand,
        document.fonts,
        slideNumber,
        document.slides.length
      );

      const filename = `slide-${slideNumber}.png`;
      const relativePath = await fileStorage.saveFile(
        imageBuffer,
        filename,
        projectId || jobId,
        'projects'
      );

      outputFiles.push(relativePath);
    }

    // Create ZIP archive
    const zipPath = await archiveService.createCarouselArchive(
      projectId || jobId,
      outputFiles
    );

    res.json({
      success: true,
      jobId,
      downloadUrl: `/outputs/projects/${projectId || jobId}/download.zip`,
      files: outputFiles.map(file => ({
        url: `/outputs/${file}`,
        filename: path.basename(file)
      }))
    });
  } catch (error: any) {
    console.error('Error generating carousel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate carousel',
      error: error.message
    });
  }
});

// Bulk generate carousels
app.post('/api/carousel/bulk-generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title = 'Bulk Carousel', count = 1, settings = {} } = req.body;

    const projectId = `bulk-${Date.now()}`;

    // Transform settings
    const transformedSlides = (settings.slides || []).map((slide: any) => ({
      images: (slide.mediaFiles || []).map((media: any) => ({
        url: media.preview,
        name: media.name
      })),
      texts: slide.texts || [],
      position: slide.textConfig?.position || 'center',
      alignment: slide.textConfig?.alignment || 'center',
      style: slide.textConfig?.style || 'modern',
      fontSize: slide.textConfig?.fontSize || 36
    }));

    // Generate bulk sets
    const generatedSets = await bulkGenerator.generateBulkSets(projectId, {
      title,
      count,
      settings,
      slides: transformedSlides,
      setsToGenerate: count,
      slideCount: settings.slideCount || 3,
      width: settings.width || 1080,
      height: settings.height || 1080,
      theme: settings.theme,
      brand: settings.brand,
      fonts: settings.fonts
    });

    const generatedFiles = generatedSets.map((set, index) => ({
      id: `set-${index + 1}`,
      filename: `set-${set.setNumber}.zip`,
      status: 'completed',
      downloadUrl: `http://localhost:${PORT}/outputs/bulk/${set.zipPath}`,
      setNumber: set.setNumber,
      files: set.files
    }));

    res.json({
      success: true,
      message: 'Bulk generation completed',
      jobId: projectId,
      projectId,
      setsRequested: count,
      generatedFiles
    });
  } catch (error: any) {
    console.error('Error in bulk generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate carousel sets',
      error: error.message
    });
  }
});

// Download project
app.get('/api/carousel/project/:id/download', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const zipPath = path.join(__dirname, '..', 'outputs', 'projects', id, 'download.zip');

    res.download(zipPath, `carousel-${id}.zip`);
  } catch (error: any) {
    console.error('Error downloading project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download project',
      error: error.message
    });
  }
});

// ===================
// ERROR HANDLING
// ===================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// ===================
// START SERVER
// ===================

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Carousel Mix Backend`);
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🗄️  Database: SQLite (Prisma)`);
      console.log(`✨ Ready to create amazing carousels!\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
