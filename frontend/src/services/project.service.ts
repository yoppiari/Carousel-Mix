import api from './api.service';
import type { CarouselDocument } from '../types/carousel.types';

export interface Project {
  id: string;
  title: string;
  type: string;
  content: string;
  document?: CarouselDocument;
  createdAt: Date;
  updatedAt: Date;
}

class ProjectService {
  /**
   * Get all projects
   */
  async getAll(): Promise<Project[]> {
    const response = await api.get('/api/projects');
    return response.data.data;
  }

  /**
   * Get single project
   */
  async getById(id: string): Promise<Project> {
    const response = await api.get(`/api/projects/${id}`);
    return response.data.data;
  }

  /**
   * Create new project
   */
  async create(title: string, document: CarouselDocument): Promise<Project> {
    const response = await api.post('/api/projects', {
      title,
      type: 'carousel',
      document,
    });
    return response.data.data;
  }

  /**
   * Update project
   */
  async update(id: string, title?: string, document?: CarouselDocument): Promise<Project> {
    const response = await api.put(`/api/projects/${id}`, {
      title,
      document,
    });
    return response.data.data;
  }

  /**
   * Delete project
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/api/projects/${id}`);
  }

  /**
   * Auto-save functionality
   */
  private saveTimeout: NodeJS.Timeout | null = null;

  autoSave(projectId: string | null, document: CarouselDocument): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      try {
        if (projectId) {
          await this.update(projectId, undefined, document);
          console.log('✅ Auto-saved');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000); // 2 second debounce
  }
}

export const projectService = new ProjectService();
export default projectService;
