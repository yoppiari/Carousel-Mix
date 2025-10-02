import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class FileStorageService {
  private baseDir: string;
  private outputsDir: string;
  private tempDir: string;

  constructor() {
    this.baseDir = process.cwd();
    this.outputsDir = path.join(this.baseDir, 'outputs');
    this.tempDir = path.join(this.outputsDir, 'temp');

    this.initializeDirectories();
  }

  /**
   * Initialize required directories
   */
  private async initializeDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.outputsDir, { recursive: true });
      await fs.mkdir(path.join(this.outputsDir, 'projects'), { recursive: true });
      await fs.mkdir(path.join(this.outputsDir, 'bulk'), { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });

      console.log('✅ Storage directories initialized');
    } catch (error) {
      console.error('❌ Failed to initialize directories:', error);
    }
  }

  /**
   * Get output directory for a project
   */
  getProjectOutputDir(projectId: string, type: 'projects' | 'bulk' = 'projects'): string {
    return path.join(this.outputsDir, type, projectId);
  }

  /**
   * Get temp directory
   */
  getTempDir(): string {
    return this.tempDir;
  }

  /**
   * Create project directory
   */
  async createProjectDirectory(projectId: string, type: 'projects' | 'bulk' = 'projects'): Promise<string> {
    const projectDir = this.getProjectOutputDir(projectId, type);
    await fs.mkdir(projectDir, { recursive: true });
    return projectDir;
  }

  /**
   * Save file to storage
   */
  async saveFile(buffer: Buffer, filename: string, projectId: string, type: 'projects' | 'bulk' = 'projects'): Promise<string> {
    const projectDir = await this.createProjectDirectory(projectId, type);
    const filepath = path.join(projectDir, filename);

    await fs.writeFile(filepath, buffer);

    // Return relative path for URL
    return path.relative(this.outputsDir, filepath).replace(/\\/g, '/');
  }

  /**
   * Save multiple files
   */
  async saveFiles(files: Array<{ buffer: Buffer; filename: string }>, projectId: string, type: 'projects' | 'bulk' = 'projects'): Promise<string[]> {
    const projectDir = await this.createProjectDirectory(projectId, type);
    const savedPaths: string[] = [];

    for (const file of files) {
      const filepath = path.join(projectDir, file.filename);
      await fs.writeFile(filepath, file.buffer);

      const relativePath = path.relative(this.outputsDir, filepath).replace(/\\/g, '/');
      savedPaths.push(relativePath);
    }

    return savedPaths;
  }

  /**
   * Get file path
   */
  getFilePath(relativePath: string): string {
    return path.join(this.outputsDir, relativePath);
  }

  /**
   * Check if file exists
   */
  async fileExists(relativePath: string): Promise<boolean> {
    try {
      const filepath = this.getFilePath(relativePath);
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read file
   */
  async readFile(relativePath: string): Promise<Buffer> {
    const filepath = this.getFilePath(relativePath);
    return await fs.readFile(filepath);
  }

  /**
   * Delete file
   */
  async deleteFile(relativePath: string): Promise<void> {
    const filepath = this.getFilePath(relativePath);
    await fs.unlink(filepath);
  }

  /**
   * Delete project directory
   */
  async deleteProjectDirectory(projectId: string, type: 'projects' | 'bulk' = 'projects'): Promise<void> {
    const projectDir = this.getProjectOutputDir(projectId, type);

    try {
      await fs.rm(projectDir, { recursive: true, force: true });
    } catch (error) {
      console.error(`Failed to delete project directory ${projectId}:`, error);
    }
  }

  /**
   * List files in project directory
   */
  async listProjectFiles(projectId: string, type: 'projects' | 'bulk' = 'projects'): Promise<string[]> {
    const projectDir = this.getProjectOutputDir(projectId, type);

    try {
      const files = await fs.readdir(projectDir);
      return files.map(file => path.join(type, projectId, file).replace(/\\/g, '/'));
    } catch (error) {
      console.error(`Failed to list project files ${projectId}:`, error);
      return [];
    }
  }

  /**
   * Get file stats
   */
  async getFileStats(relativePath: string): Promise<{ size: number; createdAt: Date; modifiedAt: Date } | null> {
    try {
      const filepath = this.getFilePath(relativePath);
      const stats = await fs.stat(filepath);

      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    } catch (error) {
      console.error(`Failed to get file stats for ${relativePath}:`, error);
      return null;
    }
  }

  /**
   * Clean up temp files older than specified hours
   */
  async cleanupTempFiles(hoursOld: number = 24): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = hoursOld * 60 * 60 * 1000;

      for (const file of files) {
        const filepath = path.join(this.tempDir, file);
        const stats = await fs.stat(filepath);

        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filepath);
          console.log(`Deleted old temp file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup temp files:', error);
    }
  }

  /**
   * Create a temporary file
   */
  async createTempFile(buffer: Buffer, extension: string = 'tmp'): Promise<string> {
    const filename = `${uuidv4()}.${extension}`;
    const filepath = path.join(this.tempDir, filename);

    await fs.writeFile(filepath, buffer);

    return filepath;
  }
}
