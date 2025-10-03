import { createCanvas, Canvas, CanvasRenderingContext2D, GlobalFonts, loadImage } from '@napi-rs/canvas';
import sharp from 'sharp';
import {
  Slide,
  SlideElement,
  DocumentSettings,
  ThemeSettings,
  BrandSettings,
  FontSettings
} from '../types/carousel.types';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TextStyle {
  type: 'modern' | 'tiktok' | 'instagram' | 'elegant' | 'classic' | 'minimalist' | 'y2k' | 'kinetic' | 'sketch';
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

export class ImageGeneratorService {
  private defaultWidth = 1080;
  private defaultHeight = 1080;
  private canvas: Canvas | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.initializeFonts();
  }

  private initializeFonts() {
    // Register system fonts
    // In production, we might want to add custom fonts
    try {
      // GlobalFonts will use system fonts by default
      console.log('Fonts initialized');
    } catch (error) {
      console.error('Failed to initialize fonts:', error);
    }
  }

  /**
   * Generate a single slide image
   */
  async generateSlide(
    slide: Slide,
    settings: DocumentSettings,
    theme: ThemeSettings,
    brand?: BrandSettings,
    fonts?: FontSettings,
    slideNumber?: number,
    totalSlides?: number
  ): Promise<Buffer> {
    // Get dimensions from settings or use defaults
    const width = settings?.slideSize?.width || this.defaultWidth;
    const height = settings?.slideSize?.height || this.defaultHeight;

    // Create canvas
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');

    // Clear canvas with white background
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, width, height);

    // Draw background
    await this.drawBackground(slide.background, width, height, theme);

    // Draw elements
    for (const element of slide.elements) {
      await this.drawElement(element, theme, fonts);
    }

    // Add brand elements if provided
    if (brand) {
      await this.drawBrandElements(brand, width, height);
    }

    // Add page numbers if enabled
    if (settings.showPageNumbers && slideNumber !== undefined) {
      this.drawPageNumber(
        slideNumber,
        totalSlides || 1,
        settings.pageNumberPosition,
        width,
        height
      );
    }

    // Convert canvas to buffer
    const buffer = this.canvas.toBuffer('image/png');

    // Clean up
    this.canvas = null;
    this.ctx = null;

    return buffer;
  }

  /**
   * Draw background based on type
   */
  private async drawBackground(
    background: any,
    width: number,
    height: number,
    theme: ThemeSettings
  ) {
    if (!this.ctx) return;

    switch (background?.type) {
      case 'gradient':
        this.drawGradientBackground(background.value, width, height);
        break;

      case 'pattern':
        this.drawPatternBackground(background.value, width, height);
        break;

      case 'image':
        await this.drawImageBackground(background.value, width, height, background.opacity, background.blur);
        break;

      case 'solid':
      default:
        // Use background color from value or theme
        const bgColor = background?.value || theme?.background || '#FFFFFF';
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, width, height);
        break;
    }
  }

  /**
   * Draw gradient background
   */
  private drawGradientBackground(gradientValue: string, width: number, height: number) {
    if (!this.ctx) return;

    // Parse gradient value (format: "linear(0deg, #color1, #color2)")
    const gradientMatch = gradientValue?.match(/linear\((\d+)deg,\s*(#[A-Fa-f0-9]+),\s*(#[A-Fa-f0-9]+)\)/);

    if (gradientMatch) {
      const angle = parseInt(gradientMatch[1]);
      const color1 = gradientMatch[2];
      const color2 = gradientMatch[3];

      // Create linear gradient
      const gradient = this.ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, width, height);
    } else {
      // Fallback to default gradient
      const gradient = this.ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, width, height);
    }
  }

  /**
   * Draw pattern background
   */
  private drawPatternBackground(patternType: string, width: number, height: number) {
    if (!this.ctx) return;

    // Simple dot pattern for now
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.fillStyle = '#e0e0e0';
    const dotSize = 4;
    const spacing = 20;

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  /**
   * Draw image background
   */
  private async drawImageBackground(
    imagePath: string,
    width: number,
    height: number,
    opacity: number = 1,
    blur: number = 0
  ) {
    if (!this.ctx) return;

    try {
      // For now, we'll skip actual image loading
      // In production, we'd load and draw the image here
      // Just draw a placeholder gradient
      this.drawGradientBackground('linear(45deg, #667eea, #764ba2)', width, height);

      // Apply opacity if needed
      if (opacity < 1) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${1 - opacity})`;
        this.ctx.fillRect(0, 0, width, height);
      }
    } catch (error) {
      console.error('Failed to load background image:', error);
      // Fallback to solid color
      this.ctx.fillStyle = '#f5f5f5';
      this.ctx.fillRect(0, 0, width, height);
    }
  }

  /**
   * Draw a slide element
   */
  private async drawElement(
    element: SlideElement,
    theme: ThemeSettings,
    fonts?: FontSettings
  ) {
    if (!this.ctx) return;

    console.log(`\n=== Drawing Element: ${element.type} ===`);
    console.log(`Content: "${element.content?.substring(0, 100)}"`);
    console.log(`Style:`, element.style);

    switch (element.type) {
      case 'title':
      case 'subtitle':
      case 'description':
        console.log(`Calling drawTextElement for ${element.type}`);
        this.drawTextElement(element, theme, fonts);
        break;

      case 'image':
        console.log(`Calling drawImageElement for ${element.type}`);
        await this.drawImageElement(element);
        break;

      case 'shape':
        this.drawShapeElement(element);
        break;
    }
  }

  /**
   * Draw text element with styling
   */
  private drawTextElement(
    element: SlideElement,
    theme: ThemeSettings,
    fonts?: FontSettings
  ) {
    console.log(`\n=== DrawTextElement Called ===`);
    console.log(`Element content: "${element.content}"`);
    console.log(`Element style:`, element.style);

    if (!this.ctx || !element.content) {
      console.log(`ERROR: Missing context or content. Ctx: ${!!this.ctx}, Content: "${element.content}"`);
      return;
    }

    const ctx = this.ctx;
    const style = element.style || {};
    const textStyle = style.textStyle || 'modern'; // Get the style name

    console.log(`Text style detected: "${textStyle}"`);
    console.log(`Font size from style: "${style.fontSize}"`);

    // Save canvas state
    ctx.save();

    // Get actual font size from style
    const fontSizeStr = style.fontSize || '36px';
    const fontSize = parseInt(fontSizeStr.replace('px', '')) || 36;
    console.log(`Parsed font size: ${fontSize} from "${fontSizeStr}"`);

    // Get font family based on style
    const fontFamily = this.getFontFamily(textStyle, fonts);
    const fontWeight = style.fontWeight || this.getFontWeight(textStyle);

    // Set font
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    // Calculate position
    const x = element.position.x;
    const y = element.position.y;

    // Set text alignment
    ctx.textAlign = (style.textAlign as any) || 'center';
    ctx.textBaseline = 'middle';

    // Apply style-specific rendering
    this.applyTextStyle(ctx, element, textStyle, fontSize);

    // Restore canvas state
    ctx.restore();
  }

  /**
   * Apply text style based on style name
   */
  private applyTextStyle(
    ctx: CanvasRenderingContext2D,
    element: SlideElement,
    styleName: string,
    fontSize: number
  ) {
    const style = element.style || {};
    const x = element.position.x;
    const y = element.position.y;
    const text = element.content;

    switch(styleName) {
      case 'instagram':
        // Draw background box
        const metrics = ctx.measureText(text);
        const padding = 15;
        const boxWidth = metrics.width + padding * 2;
        const boxHeight = fontSize + padding;

        // Draw rounded rectangle background
        ctx.fillStyle = style.backgroundColor || 'rgba(0, 0, 0, 0.5)';
        this.roundRect(
          x - boxWidth/2,
          y - boxHeight/2,
          boxWidth,
          boxHeight,
          6
        );
        ctx.fill();

        // Draw text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, x, y);
        break;

      case 'tiktok':
        // Apply text transform
        const tiktokText = text.toUpperCase();

        // Draw stroke
        ctx.strokeStyle = style.strokeColor || '#000000';
        ctx.lineWidth = style.strokeWidth || 3;
        ctx.strokeText(tiktokText, x, y);

        // Draw fill
        ctx.fillStyle = style.color || '#FFFFFF';
        ctx.fillText(tiktokText, x, y);

        // Add shadow
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        break;

      case 'modern':
        // Add strong shadow
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = style.color || '#FFFFFF';
        ctx.fillText(text, x, y);
        break;

      case 'elegant':
        // Italic cursive style
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.fillStyle = style.color || '#FFFFFF';
        ctx.fillText(text, x, y);
        break;

      case 'classic':
        // White background with borders
        const classicMetrics = ctx.measureText(text);
        const classicPadding = 12;
        const classicWidth = classicMetrics.width + classicPadding * 2;
        const classicHeight = fontSize + classicPadding;

        // Draw white background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(
          x - classicWidth/2,
          y - classicHeight/2,
          classicWidth,
          classicHeight
        );

        // Draw borders
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - classicWidth/2, y - classicHeight/2);
        ctx.lineTo(x + classicWidth/2, y - classicHeight/2);
        ctx.moveTo(x - classicWidth/2, y + classicHeight/2);
        ctx.lineTo(x + classicWidth/2, y + classicHeight/2);
        ctx.stroke();

        // Draw text
        ctx.fillStyle = '#1f2937';
        ctx.fillText(text, x, y);
        break;

      case 'minimalist':
        // Light, spaced out text
        const minText = text.toLowerCase();
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Add letter spacing (manual)
        ctx.fillStyle = style.color || '#FFFFFF';
        const letters = minText.split('');
        let currentX = x - (ctx.measureText(minText).width / 2);
        letters.forEach(letter => {
          ctx.fillText(letter, currentX, y);
          currentX += ctx.measureText(letter).width + 3; // letter spacing
        });
        break;

      case 'y2k':
        // Retro digital style with glow
        ctx.fillStyle = style.color || '#f0f0f0';

        // Add neon glow effect
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 10;
        ctx.fillText(text, x, y);

        // Add secondary glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillText(text, x, y);
        break;

      case 'kinetic':
        // Dynamic style with RGB shift
        const kineticText = text.toUpperCase();

        // Draw with RGB shift effect
        ctx.fillStyle = 'rgba(255, 0, 255, 0.5)';
        ctx.fillText(kineticText, x - 3, y);

        ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.fillText(kineticText, x + 3, y);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(kineticText, x, y);
        break;

      case 'sketch':
        // Hand-drawn style
        const sketchMetrics = ctx.measureText(text);
        const sketchPadding = 6;

        // Draw rough background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.035); // Slight rotation for sketch effect
        ctx.fillRect(
          -sketchMetrics.width/2 - sketchPadding,
          -fontSize/2 - sketchPadding,
          sketchMetrics.width + sketchPadding * 2,
          fontSize + sketchPadding * 2
        );
        ctx.restore();

        // Draw text
        ctx.fillStyle = '#1f2937';
        ctx.fillText(text, x, y);
        break;

      default:
        // Default modern style
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.fillStyle = style.color || '#FFFFFF';
        ctx.fillText(text, x, y);
    }
  }

  /**
   * Get font family based on style
   */
  private getFontFamily(style: string, fonts?: FontSettings): string {
    if (fonts?.title && typeof fonts.title === 'object' && 'family' in fonts.title) {
      return fonts.title.family;
    }

    switch(style) {
      case 'elegant':
        return "'Dancing Script', 'Brush Script MT', cursive";
      case 'classic':
        return "'Playfair Display', 'Georgia', serif";
      case 'y2k':
        return "'Orbitron', 'Courier New', monospace";
      default:
        if (fonts?.body && typeof fonts.body === 'object' && 'family' in fonts.body) {
          return fonts.body.family;
        }
        return "'Inter', 'Arial', sans-serif";
    }
  }

  /**
   * Get font weight based on style
   */
  private getFontWeight(style: string): string {
    switch(style) {
      case 'tiktok':
        return '900';
      case 'modern':
        return '700';
      case 'minimalist':
        return '300';
      default:
        return '500';
    }
  }

  /**
   * Detect special text styles (Instagram, TikTok, etc.)
   */
  private detectSpecialStyle(text: string): TextStyle | null {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('instagram') || lowerText.includes('latar')) {
      return {
        type: 'instagram',
        fontSize: 36,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
        padding: 20,
        borderRadius: 10
      };
    }

    if (lowerText.includes('tiktok') || lowerText.includes('outline')) {
      return {
        type: 'tiktok',
        fontSize: 42,
        fontFamily: 'Arial Black, sans-serif',
        fontWeight: '900',
        color: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 3
      };
    }

    return null;
  }

  /**
   * Apply special text styles
   */
  private applySpecialTextStyle(
    style: TextStyle,
    element: SlideElement,
    baseFontSize: number
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    switch (style.type) {
      case 'instagram':
        // Instagram style with gradient background
        ctx.font = `bold ${baseFontSize}px Arial, sans-serif`;

        // Create gradient background box
        const metrics = ctx.measureText(element.content);
        const padding = 20;
        const x = element.position.x;
        const y = element.position.y;

        // Draw rounded rectangle with gradient
        const gradient = ctx.createLinearGradient(
          x - metrics.width / 2,
          y - baseFontSize / 2,
          x + metrics.width / 2,
          y + baseFontSize / 2
        );
        gradient.addColorStop(0, '#f09433');
        gradient.addColorStop(0.25, '#e6683c');
        gradient.addColorStop(0.5, '#dc2743');
        gradient.addColorStop(0.75, '#cc2366');
        gradient.addColorStop(1, '#bc1888');

        ctx.fillStyle = gradient;
        this.roundRect(
          x - metrics.width / 2 - padding,
          y - baseFontSize / 2 - padding,
          metrics.width + padding * 2,
          baseFontSize + padding * 2,
          10
        );
        ctx.fill();
        break;

      case 'tiktok':
        // TikTok style with outline
        ctx.font = `900 ${baseFontSize * 1.2}px Arial Black, sans-serif`;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        break;
    }
  }

  /**
   * Draw wrapped text
   */
  private drawWrappedText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    if (!this.ctx) return;

    const words = text.split(' ');
    let line = '';
    let yOffset = 0;

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && line !== '') {
        // Draw current line and start new one
        this.ctx.fillText(line.trim(), x, y + yOffset);
        line = word + ' ';
        yOffset += lineHeight;
      } else {
        line = testLine;
      }
    }

    // Draw remaining text
    if (line.trim()) {
      this.ctx.fillText(line.trim(), x, y + yOffset);
    }
  }

  /**
   * Draw image element
   */
  private async drawImageElement(element: SlideElement) {
    console.log('\n=== DrawImageElement Called ===');
    console.log(`Element type: ${element.type}`);
    console.log(`Has content: ${!!element.content}`);
    console.log(`Content type: ${typeof element.content}`);

    if (!this.ctx) {
      console.log('ERROR: No canvas context available');
      return;
    }

    const x = element.position.x;
    const y = element.position.y;
    const width = element.size?.width || 200;
    const height = element.size?.height || 200;

    console.log(`Position: (${x}, ${y}), Size: ${width}x${height}`);

    try {
      // Load image from base64 data URL or regular URL
      if (element.content) {
        console.log('Image content found, attempting to load...');
        console.log('Content preview (first 100 chars):', element.content.substring(0, 100));

        const image = await loadImage(element.content);
        console.log(`Image loaded successfully! Original size: ${image.width}x${image.height}`);

        // Calculate cropping to fill the entire canvas area (cover mode)
        const scale = Math.max(width / image.width, height / image.height);
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

        // Calculate source coordinates for center crop
        const srcAspect = image.width / image.height;
        const dstAspect = width / height;

        let srcX = 0, srcY = 0, srcW = image.width, srcH = image.height;

        if (srcAspect > dstAspect) {
          // Image is wider - crop horizontally
          srcW = image.height * dstAspect;
          srcX = (image.width - srcW) / 2;
        } else if (srcAspect < dstAspect) {
          // Image is taller - crop vertically
          srcH = image.width / dstAspect;
          srcY = (image.height - srcH) / 2;
        }

        // Draw cropped image to fill entire target area
        (this.ctx as any).drawImage(
          image,
          srcX, srcY, srcW, srcH,  // Source rectangle (cropped)
          x, y, width, height       // Destination rectangle (full size)
        );

        console.log(`SUCCESS: Drew cropped image at (${x}, ${y}) with size ${width}x${height}`);
      } else {
        console.log('WARNING: No image content found, drawing placeholder');

        // Fallback: draw placeholder if no content
        this.ctx.fillStyle = '#e0e0e0';
        this.ctx.fillRect(x, y, width, height);

        // Draw image icon
        this.ctx.fillStyle = '#999999';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🖼', x + width / 2, y + height / 2);
      }
    } catch (error) {
      console.error('Failed to load image:', error);
      // Draw error placeholder
      this.ctx.fillStyle = '#ffcccc';
      this.ctx.fillRect(x, y, width, height);

      this.ctx.fillStyle = '#ff0000';
      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('❌ Image Error', x + width / 2, y + height / 2);
    }
  }

  /**
   * Draw shape element
   */
  private drawShapeElement(element: SlideElement) {
    if (!this.ctx) return;

    const x = element.position.x;
    const y = element.position.y;
    const width = element.size?.width || 100;
    const height = element.size?.height || 100;

    this.ctx.fillStyle = element.style?.backgroundColor || '#cccccc';

    // For now, just draw rectangles
    // Could be extended to support circles, triangles, etc.
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Draw brand elements (logo, handle)
   */
  private async drawBrandElements(
    brand: BrandSettings,
    canvasWidth: number,
    canvasHeight: number
  ) {
    if (!this.ctx) return;

    // Draw brand handle/name
    if (brand.handle || brand.name) {
      const text = brand.handle ? `@${brand.handle}` : brand.name;

      this.ctx.font = 'bold 24px Arial, sans-serif';
      this.ctx.fillStyle = '#666666';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'bottom';

      // Position in bottom-left corner by default
      this.ctx.fillText(text, 30, canvasHeight - 30);
    }

    // Draw logo if available
    if (brand.avatar?.url) {
      // For now, draw a placeholder circle
      const size = brand.avatar.size === 'large' ? 80 :
                   brand.avatar.size === 'medium' ? 60 : 40;

      let logoX = 30;
      let logoY = 30;

      // Position based on brand.avatar.position
      switch (brand.avatar.position) {
        case 'top-right':
          logoX = canvasWidth - size - 30;
          logoY = 30;
          break;
        case 'bottom-left':
          logoX = 30;
          logoY = canvasHeight - size - 30;
          break;
        case 'bottom-right':
          logoX = canvasWidth - size - 30;
          logoY = canvasHeight - size - 30;
          break;
      }

      // Draw circle placeholder for logo
      this.ctx.beginPath();
      this.ctx.arc(logoX + size / 2, logoY + size / 2, size / 2, 0, Math.PI * 2);
      this.ctx.fillStyle = '#cccccc';
      this.ctx.fill();
    }
  }

  /**
   * Draw page number
   */
  private drawPageNumber(
    current: number,
    total: number,
    position: string,
    canvasWidth: number,
    canvasHeight: number
  ) {
    if (!this.ctx) return;

    const text = `${current}/${total}`;

    this.ctx.font = '20px Arial, sans-serif';
    this.ctx.fillStyle = '#999999';

    let x = 30;
    let y = 30;

    switch (position) {
      case 'top-right':
        x = canvasWidth - 30;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        break;
      case 'bottom-left':
        y = canvasHeight - 30;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';
        break;
      case 'bottom-right':
        x = canvasWidth - 30;
        y = canvasHeight - 30;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'bottom';
        break;
      default: // top-left
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
    }

    this.ctx.fillText(text, x, y);
  }

  /**
   * Helper: Draw rounded rectangle
   */
  private roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    if (!this.ctx) return;

    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
    this.ctx.lineTo(x, y + radius);
    this.ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    this.ctx.closePath();
  }

  /**
   * Generate carousel from document
   */
  async generateCarouselFromDocument(
    document: any,
    outputDir: string
  ): Promise<string[]> {
    const outputs: string[] = [];

    try {
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      const slides = document.slides || [];
      const settings = document.settings || {};
      const theme = document.theme || {};
      const brand = document.brand;
      const fonts = document.fonts;

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const slideNumber = i + 1;

        // Generate slide image
        const imageBuffer = await this.generateSlide(
          slide,
          settings,
          theme,
          brand,
          fonts,
          slideNumber,
          slides.length
        );

        // Save to file
        const filename = `slide-${slideNumber}.png`;
        const filepath = path.join(outputDir, filename);
        await fs.writeFile(filepath, imageBuffer);

        outputs.push(filepath);
        console.log(`Generated slide ${slideNumber}/${slides.length}: ${filepath}`);
      }

      return outputs;
    } catch (error) {
      console.error('Failed to generate carousel from document:', error);
      throw error;
    }
  }
}