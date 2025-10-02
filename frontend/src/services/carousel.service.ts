import api from './api.service';
import type { CarouselDocument } from '../types/carousel.types';

interface GenerateResponse {
  success: boolean;
  jobId: string;
  downloadUrl: string;
  files: Array<{ url: string; filename: string }>;
}

interface BulkGenerateResponse {
  success: boolean;
  jobId: string;
  projectId: string;
  setsRequested: number;
  generatedFiles: Array<{
    id: string;
    filename: string;
    status: string;
    downloadUrl: string;
    setNumber: number;
    files: string[];
  }>;
}

class CarouselService {
  /**
   * Generate carousel images
   */
  async generate(projectId: string, document: CarouselDocument): Promise<GenerateResponse> {
    const response = await api.post('/api/carousel/generate', {
      projectId,
      document,
    });
    return response.data;
  }

  /**
   * Bulk generate carousels
   */
  async bulkGenerate(title: string, count: number, settings: any): Promise<BulkGenerateResponse> {
    const response = await api.post('/api/carousel/bulk-generate', {
      title,
      count,
      settings,
    });
    return response.data;
  }

  /**
   * Get project by ID (convenience method)
   */
  async getProject(id: string): Promise<any> {
    const response = await api.get(`/api/projects/${id}`);
    return response.data.data;
  }

  /**
   * Download carousel
   */
  getDownloadUrl(projectId: string): string {
    return `${api.defaults.baseURL}/api/carousel/project/${projectId}/download`;
  }

  /**
   * Get output file URL
   */
  getOutputUrl(path: string): string {
    return `${api.defaults.baseURL}/outputs/${path}`;
  }
}

export const carouselService = new CarouselService();
export default carouselService;
