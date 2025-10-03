import { ImageGeneratorService } from './image-generator.service';
import { FileStorageService } from './file-storage.service';
import { ArchiveService } from './archive.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

interface SlideConfig {
  images: Array<{ url: string; name: string }>;
  texts: string[];
  position: 'top' | 'center' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  style: string;
  fontSize: number;
}

interface BulkGenerationConfig {
  projectTitle?: string;
  title?: string;
  count?: number;
  slideCount: number;
  slides: SlideConfig[];
  setsToGenerate: number;
  width?: number;
  height?: number;
  theme?: any;
  brand?: any;
  fonts?: any;
  settings?: any;
}

interface GeneratedSet {
  setNumber: number;
  files: string[];
  metadata: any;
  zipPath?: string;
}

export class BulkGeneratorService {
  private imageGenerator: ImageGeneratorService;
  private fileStorage: FileStorageService;
  private archiveService: ArchiveService;

  constructor() {
    this.imageGenerator = new ImageGeneratorService();
    this.fileStorage = new FileStorageService();
    this.archiveService = new ArchiveService();
  }

  /**
   * Generate unique combinations of slides
   */
  generateCombinations(slides: SlideConfig[], count: number): SlideConfig[][] {
    const combinations: SlideConfig[][] = [];

    console.log(`\n📊 Bulk Generation Setup:`);
    console.log(`  Configured slides: ${slides.length}`);
    console.log(`  Sets to generate: ${count}\n`);

    // For each set to generate
    for (let setIndex = 0; setIndex < count; setIndex++) {
      const combination: SlideConfig[] = [];
      console.log(`\n📦 Generating Set ${setIndex + 1}:`);

      // Process each configured slide
      for (let slideIndex = 0; slideIndex < slides.length; slideIndex++) {
        const slideConfig = slides[slideIndex];
        const texts = slideConfig.texts || [];
        const images = slideConfig.images || [];

        // Skip if no content for this slide
        if (texts.length === 0 || images.length === 0) {
          console.warn(`  Slide ${slideIndex + 1}: No texts or images, skipping`);
          continue;
        }

        // Calculate which text and image to use for this slide in this set
        // Use rotation for variety across sets
        const totalTexts = texts.length;
        const totalImages = images.length;

        // For variety: rotate through available content based on set index
        const textIndex = (setIndex + slideIndex) % totalTexts;
        const imageIndex = (setIndex + slideIndex) % totalImages;

        const selectedText = texts[textIndex];
        const selectedImage = images[imageIndex];

        console.log(`  Slide ${slideIndex + 1}: Text[${textIndex}] "${selectedText.substring(0, 30)}..." + Image[${imageIndex}] "${selectedImage.name}"`);
        console.log(`    Settings: fontSize=${slideConfig.fontSize}px, position=${slideConfig.position}, alignment=${slideConfig.alignment}, style=${slideConfig.style}`);

        // Create slide with EXACTLY ONE text and ONE image
        // BUT preserve ALL the original slide's configuration settings
        const slideVariant: SlideConfig = {
          ...slideConfig,  // Keep ALL settings from this specific slide
          texts: [selectedText],  // Only ONE text
          images: [selectedImage] // Only ONE image
        };

        combination.push(slideVariant);
      }

      if (combination.length > 0) {
        combinations.push(combination);
        console.log(`✅ Generated set ${setIndex + 1} with ${combination.length} slides`);
      }
    }

    return combinations;
  }

  /**
   * Generate bulk carousel sets
   */
  async generateBulkSets(
    projectId: string,
    config: BulkGenerationConfig,
    onProgress?: (current: number, total: number) => void
  ): Promise<GeneratedSet[]> {
    const generatedSets: GeneratedSet[] = [];

    try {
      // Generate unique combinations
      const combinations = this.generateCombinations(config.slides.slice(0, config.slideCount), config.setsToGenerate);

      console.log(`Generated ${combinations.length} unique combinations for bulk generation`);

      // Process each combination
      for (let i = 0; i < combinations.length; i++) {
        const combination = combinations[i];
        const setNumber = i + 1;

        // Report progress
        if (onProgress) {
          onProgress(setNumber, combinations.length);
        }

        // Generate slides for this set
        const setFiles: string[] = [];

        for (let slideIndex = 0; slideIndex < combination.length; slideIndex++) {
          const slideConfig = combination[slideIndex];
          const slideNumber = slideIndex + 1;

          // Create slide object
          const slide = this.createSlideFromConfig(slideConfig, slideNumber);

          // Generate image
          const imageBuffer = await this.imageGenerator.generateSlide(
            slide,
            {
              showPageNumbers: true,
              pageNumberPosition: 'bottom-right',
              slideSize: {
                width: config.width || 1080,
                height: config.height || 1080,
                aspectRatio: '1:1'
              }
            },
            config.theme || {
              primary: '#007bff',
              secondary: '#6c757d',
              background: '#ffffff',
              text: '#000000',
              accent: '#28a745'
            },
            config.brand,
            config.fonts,
            slideNumber,
            combination.length
          );

          // Save image
          const filename = `set-${setNumber}-slide-${slideNumber}.png`;
          const relativePath = await this.fileStorage.saveFile(
            imageBuffer,
            filename,
            projectId,
            'bulk'
          );

          setFiles.push(relativePath);
        }

        // Create metadata for this set
        const setMetadata = {
          setNumber,
          slideCount: combination.length,
          generatedAt: new Date().toISOString(),
          config: combination
        };

        // Create individual ZIP for this set
        const setZipPath = await this.archiveService.createSetArchive(
          projectId,
          setNumber,
          setFiles
        );

        // Add set with zip path to generated sets
        generatedSets.push({
          setNumber,
          files: setFiles,
          metadata: setMetadata,
          zipPath: setZipPath
        });

        console.log(`Generated set ${setNumber}/${combinations.length} with ZIP: ${setZipPath}`);
      }

      // Create master ZIP archive with all sets
      if (generatedSets.length > 0) {
        const allFiles = generatedSets.flatMap(set => set.files);
        const masterZipPath = await this.archiveService.createBulkCarouselArchive(
          projectId,
          generatedSets.map(set => ({
            setNumber: set.setNumber,
            files: set.files
          }))
        );

        console.log(`Created master archive: ${masterZipPath}`);
      }

      return generatedSets;

    } catch (error) {
      console.error('Bulk generation failed:', error);
      throw error;
    }
  }

  /**
   * Create slide object from configuration
   */
  private createSlideFromConfig(config: SlideConfig, slideNumber: number): any {
    const elements: any[] = [];

    console.log(`\n🔍 Creating Slide ${slideNumber}:`);
    console.log(`  - Texts: ${config.texts?.length || 0} items`);
    console.log(`  - Images: ${config.images?.length || 0} items`);
    console.log(`  - Style: ${config.style}`);
    console.log(`  - Font Size: ${config.fontSize}px`);
    console.log(`  - Position: ${config.position}, Alignment: ${config.alignment}`);

    // First add images as background (behind text)
    const images = config.images || [];
    if (images.length > 0) {
      images.forEach((image, index) => {
        if (image.url) {
          console.log(`  Adding background image: ${image.name}`);
          const imageElement = {
            id: uuidv4(),
            type: 'image',
            content: image.url,
            position: {
              x: 0,  // Start from left edge
              y: 0   // Start from top edge
            },
            size: { width: 1080, height: 1080 },  // Full canvas size
            style: {
              objectFit: 'cover'  // Cover entire area
            },
            zIndex: 0  // Behind text elements
          };
          elements.push(imageElement);
        }
      });
    }

    // Calculate positions based on alignment and position
    const getXPosition = (alignment: string, width: number): number => {
      switch (alignment) {
        case 'left': return 100;
        case 'right': return 980;
        case 'center':
        default: return 540;
      }
    };

    const getYPosition = (position: string, index: number): number => {
      const spacing = 80; // Space between text elements
      switch(position) {
        case 'top':
          return 100 + (index * spacing);
        case 'bottom':
          return 880 - ((1 - index) * spacing);
        case 'center':
        default:
          return 500 + (index * spacing);
      }
    };

    // Add text element with style-specific properties (should be only ONE text)
    const texts = config.texts || [];
    console.log(`\n=== Adding Text Elements - Slide ${slideNumber} ===`);
    console.log(`Found ${texts.length} text(s) to add`);
    console.log(`Text style: ${config.style}, Font size: ${config.fontSize}px`);

    // Should only have ONE text per slide now
    if (texts.length > 0) {
      const text = texts[0]; // Take only the first text (there should only be one)
      console.log(`Adding text: "${text}"`);

      const styleProps = this.getStyleProperties(config.style);

      // For center positioning, put text in actual center of canvas
      const textY = config.position === 'center' ? 540 :
                    config.position === 'top' ? 100 : 880;

      const textElement = {
        id: uuidv4(),
        type: 'title', // Single text is always title
        content: text,
        position: {
          x: getXPosition(config.alignment, 1080),
          y: textY
        },
        size: { width: 900, height: 100 },
        style: {
          fontSize: `${config.fontSize * 4}px`,  // Scale font size for 1080px canvas (4x multiplier)
          fontWeight: 'bold', // Single text should be prominent
          textAlign: config.alignment,
          textStyle: config.style,  // Pass the style name
          ...styleProps  // Apply style-specific properties
        },
        zIndex: 10  // Ensure text is above images
      };

      console.log(`Created text element:`, {
        type: textElement.type,
        content: textElement.content.substring(0, 50) + '...',
        style: textElement.style.textStyle,
        fontSize: textElement.style.fontSize,
        position: textElement.position
      });

      elements.push(textElement);

      // Warn if more than one text was provided (shouldn't happen with new logic)
      if (texts.length > 1) {
        console.warn(`WARNING: Slide ${slideNumber} has ${texts.length} texts but only displaying the first one`);
      }
    }

    return {
      id: uuidv4(),
      order: slideNumber,
      layout: 'content',
      elements,
      background: {
        type: 'gradient',
        value: 'linear(45deg, #f0f0f0, #ffffff)'
      }
    };
  }

  /**
   * Get style-specific properties based on style name
   */
  private getStyleProperties(style: string): any {
    switch(style) {
      case 'instagram':
        return {
          color: '#FFFFFF',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '10px 20px',
          borderRadius: '6px',
          backdropFilter: 'blur(4px)'
        };

      case 'tiktok':
        return {
          color: '#FFFFFF',
          textTransform: 'uppercase',
          strokeColor: '#000000',
          strokeWidth: 2,
          textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
          fontWeight: '900'
        };

      case 'modern':
        return {
          color: '#FFFFFF',
          fontWeight: '700',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        };

      case 'elegant':
        return {
          color: '#FFFFFF',
          fontFamily: 'Dancing Script, cursive',
          fontStyle: 'italic',
          fontSize: '1.2em',
          textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
        };

      case 'classic':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          color: '#1f2937',
          padding: '8px 12px',
          borderTop: '2px solid #1f2937',
          borderBottom: '2px solid #1f2937'
        };

      case 'minimalist':
        return {
          color: '#FFFFFF',
          fontWeight: '300',
          textTransform: 'lowercase',
          letterSpacing: '0.15em',
          fontSize: '0.9em',
          textShadow: '1px 1px 2px rgba(0,0,0,0.4)'
        };

      case 'y2k':
        return {
          color: '#f0f0f0',
          fontFamily: 'Orbitron, monospace',
          fontWeight: '700',
          textTransform: 'uppercase',
          textShadow: '0 0 10px #ff00ff, 0 0 20px #00ffff'
        };

      case 'kinetic':
        return {
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '900',
          textTransform: 'uppercase',
          textShadow: '3px 0px 1px rgba(255, 0, 255, 0.5), -3px 0px 1px rgba(0, 255, 255, 0.5)'
        };

      case 'sketch':
        return {
          color: '#1f2937',
          fontFamily: 'Dancing Script, cursive',
          fontWeight: '700',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          padding: '2px 6px',
          transform: 'rotate(-2deg)'
        };

      default:
        return {
          color: '#FFFFFF',
          textShadow: '2px 2px 4px rgba(0,0,0,0.6)'
        };
    }
  }

  /**
   * Generate carousel from bulk data structure
   */
  async generateFromBulkData(
    projectId: string,
    data: any,
    setsToGenerate: number
  ): Promise<{ outputs: any[]; zipPath: string }> {
    const outputs: any[] = [];

    try {
      // Parse the bulk data structure
      const settings = data.settings || {};
      const slides = settings.slides || [];

      // Convert to our config format
      const config: BulkGenerationConfig = {
        projectTitle: data.title || 'Bulk Carousel',
        slideCount: settings.slideCount || slides.length,
        slides: slides.map((slide: any) => ({
          texts: slide.texts || [],
          images: slide.mediaFiles || [],
          position: slide.textConfig?.position || 'center',
          alignment: slide.textConfig?.alignment || 'center',
          style: slide.textConfig?.style || 'modern',
          fontSize: slide.textConfig?.fontSize || 36
        })),
        setsToGenerate,
        width: settings.width || 1080,
        height: settings.height || 1080
      };

      // Generate the sets
      const generatedSets = await this.generateBulkSets(
        projectId,
        config,
        (current, total) => {
          console.log(`Generating set ${current}/${total}`);
        }
      );

      // Prepare outputs array
      for (const set of generatedSets) {
        for (const file of set.files) {
          const stats = await this.fileStorage.getFileStats(file);
          outputs.push({
            id: uuidv4(),
            setNumber: set.setNumber,
            filename: `set-${set.setNumber}/${path.basename(file)}`,
            path: `/outputs/${file}`,
            size: stats?.size || 0,
            createdAt: new Date()
          });
        }
      }

      // Get ZIP path
      const zipPath = `/outputs/bulk/${projectId}/download.zip`;

      return { outputs, zipPath };

    } catch (error) {
      console.error('Failed to generate from bulk data:', error);
      throw error;
    }
  }
}