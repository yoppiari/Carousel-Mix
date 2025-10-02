import archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import { FileStorageService } from './file-storage.service.js';

interface ArchiveOptions {
  format?: 'zip' | 'tar';
  compressionLevel?: number;
}

export class ArchiveService {
  private fileStorage: FileStorageService;

  constructor() {
    this.fileStorage = new FileStorageService();
  }

  /**
   * Create ZIP archive from files
   */
  async createZipArchive(
    files: Array<{ path: string; name: string }>,
    outputPath: string,
    options: ArchiveOptions = {}
  ): Promise<string> {
    const { format = 'zip', compressionLevel = 9 } = options;

    return new Promise((resolve, reject) => {
      const outputDir = path.dirname(outputPath);
      fs.mkdirSync(outputDir, { recursive: true });

      const output = fs.createWriteStream(outputPath);
      const archive = archiver(format, {
        zlib: { level: compressionLevel }
      });

      output.on('close', () => {
        console.log(`✅ Archive created: ${outputPath} (${archive.pointer()} bytes)`);
        resolve(outputPath);
      });

      archive.on('warning', (err: any) => {
        if (err.code === 'ENOENT') {
          console.warn('Archive warning:', err);
        } else {
          reject(err);
        }
      });

      archive.on('error', (err: any) => {
        reject(err);
      });

      archive.pipe(output);

      for (const file of files) {
        if (fs.existsSync(file.path)) {
          archive.file(file.path, { name: file.name });
        } else {
          console.warn(`File not found: ${file.path}`);
        }
      }

      archive.finalize();
    });
  }

  /**
   * Create individual set ZIP archive
   */
  async createSetArchive(
    projectId: string,
    setNumber: number,
    files: string[]
  ): Promise<string> {
    const outputDir = this.fileStorage.getProjectOutputDir(projectId, 'bulk');
    const outputPath = path.join(outputDir, `set-${setNumber}.zip`);

    const archiveFiles: Array<{ path: string; name: string }> = [];

    for (const file of files) {
      const filePath = this.fileStorage.getFilePath(file);
      const fileName = path.basename(file);

      if (fs.existsSync(filePath)) {
        archiveFiles.push({ path: filePath, name: fileName });
      }
    }

    await this.createZipArchive(archiveFiles, outputPath);

    return path.relative(
      this.fileStorage.getProjectOutputDir('', 'bulk'),
      outputPath
    ).replace(/\\/g, '/');
  }

  /**
   * Create bulk carousel ZIP archive
   */
  async createBulkCarouselArchive(
    projectId: string,
    sets: Array<{ setNumber: number; files: string[] }>
  ): Promise<string> {
    const outputDir = this.fileStorage.getProjectOutputDir(projectId, 'bulk');
    const outputPath = path.join(outputDir, 'download.zip');

    const archiveFiles: Array<{ path: string; name: string }> = [];

    for (const set of sets) {
      for (const file of set.files) {
        const filePath = this.fileStorage.getFilePath(file);
        const fileName = `set-${set.setNumber}/${path.basename(file)}`;

        if (fs.existsSync(filePath)) {
          archiveFiles.push({ path: filePath, name: fileName });
        }
      }
    }

    await this.createZipArchive(archiveFiles, outputPath);

    return path.relative(
      this.fileStorage.getProjectOutputDir('', 'bulk'),
      outputPath
    ).replace(/\\/g, '/');
  }

  /**
   * Create single carousel ZIP archive
   */
  async createCarouselArchive(
    projectId: string,
    files: string[]
  ): Promise<string> {
    const outputDir = this.fileStorage.getProjectOutputDir(projectId, 'projects');
    const outputPath = path.join(outputDir, 'download.zip');

    const archiveFiles: Array<{ path: string; name: string }> = [];

    for (const file of files) {
      const filePath = this.fileStorage.getFilePath(file);
      const fileName = path.basename(file);

      if (fs.existsSync(filePath)) {
        archiveFiles.push({ path: filePath, name: fileName });
      }
    }

    await this.createZipArchive(archiveFiles, outputPath);

    return path.relative(
      this.fileStorage.getProjectOutputDir('', 'projects'),
      outputPath
    ).replace(/\\/g, '/');
  }
}
