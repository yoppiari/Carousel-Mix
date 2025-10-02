import { z } from 'zod';

// Element Style Schema
export const ElementStyleSchema = z.object({
  fontSize: z.string().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  padding: z.string().optional(),
  margin: z.string().optional(),
  borderRadius: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

// Position Schema
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Animation Settings Schema
export const AnimationSettingsSchema = z.object({
  type: z.enum(['fadeIn', 'slideIn', 'bounceIn', 'none']),
  delay: z.number().optional(),
  duration: z.number().optional(),
});

// Slide Element Schema
export const SlideElementSchema = z.object({
  id: z.string(),
  type: z.enum(['title', 'subtitle', 'description', 'image', 'shape']),
  content: z.string(),
  position: PositionSchema.optional(),
  style: ElementStyleSchema,
  animation: AnimationSettingsSchema.optional(),
});

// Transition Settings Schema
export const TransitionSettingsSchema = z.object({
  type: z.enum(['fade', 'slide', 'zoom', 'none']),
  duration: z.number(),
  easing: z.string().optional(),
});

// Slide Schema
export const SlideSchema = z.object({
  id: z.string(),
  order: z.number(),
  elements: z.array(SlideElementSchema),
  background: z.string().optional(),
  transitions: TransitionSettingsSchema.optional(),
});

// Theme Settings Schema
export const ThemeSettingsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  background: z.string(),
  text: z.string(),
  accent: z.string(),
  error: z.string().optional(),
  success: z.string().optional(),
  warning: z.string().optional(),
});

// Brand Settings Schema
export const BrandSettingsSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  handle: z.string().min(1, 'Brand handle is required'),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  avatarOpacity: z.number().min(0).max(1).optional(),
  logo: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

// Font Config Schema
export const FontConfigSchema = z.object({
  family: z.string(),
  size: z.string(),
  weight: z.string(),
  lineHeight: z.string().optional(),
  letterSpacing: z.string().optional(),
});

// Font Settings Schema
export const FontSettingsSchema = z.object({
  title: FontConfigSchema,
  subtitle: FontConfigSchema,
  body: FontConfigSchema,
});

// Slide Size Schema
export const SlideSizeSchema = z.object({
  width: z.number(),
  height: z.number(),
  aspectRatio: z.string().optional(),
});

// Document Settings Schema
export const DocumentSettingsSchema = z.object({
  showPageNumbers: z.boolean(),
  pageNumberPosition: z.enum([
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
    'bottom-center',
  ]).optional(),
  slideSize: SlideSizeSchema,
  autoPlay: z.boolean().optional(),
  autoPlayDelay: z.number().optional(),
});

// Document Metadata Schema
export const DocumentMetadataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  author: z.string(),
  tags: z.array(z.string()).optional(),
});

// Carousel Document Schema
export const CarouselDocumentSchema = z.object({
  id: z.string(),
  version: z.string(),
  metadata: DocumentMetadataSchema,
  slides: z.array(SlideSchema),
  settings: DocumentSettingsSchema,
  theme: ThemeSettingsSchema,
  brand: BrandSettingsSchema,
  fonts: FontSettingsSchema,
});

// AI Generation Options Schema
export const AIGenerationOptionsSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  slideCount: z.number().min(1).max(30).optional(),
  style: z.enum(['professional', 'creative', 'minimal', 'playful']).optional(),
  includeImages: z.boolean().optional(),
  language: z.string().optional(),
});

// Export Options Schema
export const ExportOptionsSchema = z.object({
  format: z.enum(['png', 'jpg', 'pdf', 'json']),
  quality: z.number().min(0).max(1).optional(),
  scale: z.number().min(0.5).max(3).optional(),
  includeMetadata: z.boolean().optional(),
});

// Form Schemas for UI forms
export const BrandFormSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  handle: z.string().min(1, 'Handle is required').regex(/^@/, 'Handle must start with @'),
  avatarUrl: z.string().optional(),
  avatarOpacity: z.number().min(0).max(100).optional(),
});

export const ThemeFormSchema = z.object({
  primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  background: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  text: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  accent: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
});

export const FontFormSchema = z.object({
  titleFont: z.string().min(1, 'Title font is required'),
  titleSize: z.string().min(1, 'Title size is required'),
  titleWeight: z.string().min(1, 'Title weight is required'),
  subtitleFont: z.string().min(1, 'Subtitle font is required'),
  subtitleSize: z.string().min(1, 'Subtitle size is required'),
  subtitleWeight: z.string().min(1, 'Subtitle weight is required'),
  bodyFont: z.string().min(1, 'Body font is required'),
  bodySize: z.string().min(1, 'Body size is required'),
  bodyWeight: z.string().min(1, 'Body weight is required'),
});

export const SettingsFormSchema = z.object({
  showPageNumbers: z.boolean(),
  pageNumberPosition: z.enum([
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
    'bottom-center',
  ]).optional(),
});

// Type exports from schemas
export type CarouselDocument = z.infer<typeof CarouselDocumentSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type SlideElement = z.infer<typeof SlideElementSchema>;
export type ThemeSettings = z.infer<typeof ThemeSettingsSchema>;
export type BrandSettings = z.infer<typeof BrandSettingsSchema>;
export type FontSettings = z.infer<typeof FontSettingsSchema>;
export type DocumentSettings = z.infer<typeof DocumentSettingsSchema>;
export type AIGenerationOptions = z.infer<typeof AIGenerationOptionsSchema>;
export type ExportOptions = z.infer<typeof ExportOptionsSchema>;