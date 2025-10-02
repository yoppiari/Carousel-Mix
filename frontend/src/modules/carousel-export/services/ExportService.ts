import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import type { CarouselDocument, ExportOptions } from '../../../types/carousel.types';

export class ExportService {
  private readonly DEFAULT_QUALITY = 0.95;
  private readonly DEFAULT_SCALE = 2;

  /**
   * Export carousel as image (PNG or JPG)
   */
  async exportAsImage(
    elementId: string,
    format: 'png' | 'jpg',
    options?: Partial<ExportOptions>
  ): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Carousel element not found');
    }

    const quality = options?.quality || this.DEFAULT_QUALITY;
    const scale = options?.scale || this.DEFAULT_SCALE;

    try {
      let dataUrl: string;

      const exportOptions = {
        quality,
        pixelRatio: scale,
        cacheBust: true,
        filter: (node: Element) => {
          // Filter out any UI controls that shouldn't be in the export
          return !node.classList?.contains('no-export');
        },
      };

      if (format === 'png') {
        dataUrl = await toPng(element, exportOptions);
      } else {
        dataUrl = await toJpeg(element, exportOptions);
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `carousel-${timestamp}.${format}`;

      // Download the image
      this.downloadDataUrl(dataUrl, filename);
    } catch (error) {
      console.error('Failed to export image:', error);
      throw new Error(`Failed to export as ${format.toUpperCase()}`);
    }
  }

  /**
   * Export carousel as PDF
   */
  async exportAsPDF(
    document: CarouselDocument,
    elementId: string,
    options?: Partial<ExportOptions>
  ): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Carousel element not found');
    }

    const scale = options?.scale || this.DEFAULT_SCALE;

    try {
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: document.settings.slideSize.width > document.settings.slideSize.height
          ? 'landscape'
          : 'portrait',
        unit: 'px',
        format: [document.settings.slideSize.width, document.settings.slideSize.height],
      });

      // Get all slide elements
      const slideElements = element.querySelectorAll('.slide-view');

      for (let i = 0; i < slideElements.length; i++) {
        const slideElement = slideElements[i] as HTMLElement;

        // Convert slide to image
        const dataUrl = await toPng(slideElement, {
          quality: 1,
          pixelRatio: scale,
          cacheBust: true,
        });

        // Add image to PDF
        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          dataUrl,
          'PNG',
          0,
          0,
          document.settings.slideSize.width,
          document.settings.slideSize.height
        );

        // Add metadata if requested
        if (options?.includeMetadata && i === 0) {
          pdf.setProperties({
            title: document.metadata.title,
            subject: document.metadata.description || '',
            author: document.metadata.author,
            keywords: document.metadata.tags?.join(', ') || '',
            creator: 'CarouselGeneratorPro',
          });
        }
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `carousel-${timestamp}.pdf`;

      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      throw new Error('Failed to export as PDF');
    }
  }

  /**
   * Export carousel as JSON
   */
  exportAsJSON(document: CarouselDocument): void {
    try {
      const json = JSON.stringify(document, null, 2);
      const blob = new Blob([json], { type: 'application/json' });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `carousel-${timestamp}.json`;

      saveAs(blob, filename);
    } catch (error) {
      console.error('Failed to export JSON:', error);
      throw new Error('Failed to export as JSON');
    }
  }

  /**
   * Import carousel from JSON
   */
  async importFromJSON(file: File): Promise<CarouselDocument> {
    try {
      const text = await file.text();
      const document = JSON.parse(text) as CarouselDocument;

      // Validate the imported document structure
      if (!this.validateDocument(document)) {
        throw new Error('Invalid carousel document format');
      }

      return document;
    } catch (error) {
      console.error('Failed to import JSON:', error);
      throw new Error('Failed to import carousel from JSON');
    }
  }

  /**
   * Export single slide as image
   */
  async exportSlideAsImage(
    slideElement: HTMLElement,
    format: 'png' | 'jpg',
    slideNumber: number,
    options?: Partial<ExportOptions>
  ): Promise<void> {
    const quality = options?.quality || this.DEFAULT_QUALITY;
    const scale = options?.scale || this.DEFAULT_SCALE;

    try {
      const exportOptions = {
        quality,
        pixelRatio: scale,
        cacheBust: true,
      };

      const dataUrl = format === 'png'
        ? await toPng(slideElement, exportOptions)
        : await toJpeg(slideElement, exportOptions);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `slide-${slideNumber}-${timestamp}.${format}`;

      this.downloadDataUrl(dataUrl, filename);
    } catch (error) {
      console.error('Failed to export slide:', error);
      throw new Error(`Failed to export slide as ${format.toUpperCase()}`);
    }
  }

  /**
   * Batch export all slides as separate images
   */
  async exportAllSlidesAsImages(
    document: CarouselDocument,
    elementId: string,
    format: 'png' | 'jpg',
    options?: Partial<ExportOptions>
  ): Promise<void> {
    const element = window.document.getElementById(elementId);
    if (!element) {
      throw new Error('Carousel element not found');
    }

    const slideElements = element.querySelectorAll('.slide-view');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

    for (let i = 0; i < slideElements.length; i++) {
      await this.exportSlideAsImage(
        slideElements[i] as HTMLElement,
        format,
        i + 1,
        options
      );
    }
  }

  /**
   * Helper function to download data URL
   */
  private downloadDataUrl(dataUrl: string, filename: string): void {
    const link = window.document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  /**
   * Validate imported document structure
   */
  private validateDocument(document: any): document is CarouselDocument {
    return (
      document &&
      typeof document === 'object' &&
      'id' in document &&
      'version' in document &&
      'metadata' in document &&
      'slides' in document &&
      Array.isArray(document.slides) &&
      'settings' in document &&
      'theme' in document &&
      'brand' in document &&
      'fonts' in document
    );
  }
}

// Export singleton instance
export const exportService = new ExportService();