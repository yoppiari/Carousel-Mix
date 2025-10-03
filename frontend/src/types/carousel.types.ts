// Core Carousel Type Definitions

export interface CarouselDocument {
  id: string;
  version: string;
  metadata: DocumentMetadata;
  slides: Slide[];
  settings: DocumentSettings;
  theme: ThemeSettings;
  brand: BrandSettings;
  fonts: FontSettings;
}

export interface DocumentMetadata {
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  tags?: string[];
  type?: string;
  totalCombinations?: number;
  maxSets?: number;
  setsToGenerate?: number;
}

export interface Slide {
  id: string;
  order: number;
  elements: SlideElement[];
  background?: string;
  transitions?: TransitionSettings;
}

export interface SlideElement {
  id: string;
  type: ElementType;
  content: string;
  position?: Position;
  style: ElementStyle;
  animation?: AnimationSettings;
}

export type ElementType = 'title' | 'subtitle' | 'description' | 'image' | 'shape';

export interface Position {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface ElementStyle {
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: string;
  margin?: string;
  borderRadius?: string;
  opacity?: number;
}

export interface DocumentSettings {
  showPageNumbers: boolean;
  pageNumberPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  slideSize: SlideSize;
  autoPlay?: boolean;
  autoPlayDelay?: number;
}

export interface SlideSize {
  width: number;
  height: number;
  aspectRatio?: string;
}

export interface ThemeSettings {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  error?: string;
  success?: string;
  warning?: string;
}

export interface BrandSettings {
  name: string;
  handle: string;
  avatarUrl?: string;
  avatarOpacity?: number;
  logo?: string;
  website?: string;
}

export interface FontSettings {
  title: FontConfig;
  subtitle: FontConfig;
  body: FontConfig;
}

export interface FontConfig {
  family: string;
  size: string;
  weight: string;
  lineHeight?: string;
  letterSpacing?: string;
}

export interface TransitionSettings {
  type: 'fade' | 'slide' | 'zoom' | 'none';
  duration: number;
  easing?: string;
}

export interface AnimationSettings {
  type: 'fadeIn' | 'slideIn' | 'bounceIn' | 'none';
  delay?: number;
  duration?: number;
}

// Export/Import Types
export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'json';
  quality?: number;
  scale?: number;
  includeMetadata?: boolean;
}

// AI Generation Types
export interface AIGenerationOptions {
  prompt: string;
  slideCount?: number;
  style?: 'professional' | 'creative' | 'minimal' | 'playful';
  includeImages?: boolean;
  language?: string;
}

export interface AIGenerationResult {
  success: boolean;
  slides?: Slide[];
  error?: string;
  creditsUsed?: number;
}

// Project Types
export interface CarouselProject {
  id: string;
  userId: string;
  title: string;
  document: CarouselDocument;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl?: string;
}

// Credit System Types
export interface CreditOperation {
  type: 'ai_generate' | 'export_pdf' | 'export_image' | 'save_project';
  cost: number;
  description?: string;
}

// Form Types
export interface CarouselFormData {
  slides: SlideFormData[];
  brand: BrandFormData;
  theme: ThemeFormData;
  fonts: FontFormData;
  settings: SettingsFormData;
}

export interface SlideFormData {
  elements: ElementFormData[];
  background?: string;
}

export interface ElementFormData {
  type: ElementType;
  content: string;
  style?: Partial<ElementStyle>;
}

export interface BrandFormData {
  name: string;
  handle: string;
  avatarUrl?: string;
  avatarOpacity?: number;
}

export interface ThemeFormData {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

export interface FontFormData {
  titleFont: string;
  subtitleFont: string;
  bodyFont: string;
}

export interface SettingsFormData {
  showPageNumbers: boolean;
  pageNumberPosition?: string;
}