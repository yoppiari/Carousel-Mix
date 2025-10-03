// Carousel Document Types (matching frontend types)

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
  description: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  tags: string[];
}

export interface Slide {
  id: string;
  order: number;
  layout: 'title' | 'content' | 'split' | 'comparison' | 'stats';
  elements: SlideElement[];
  background: SlideBackground;
  animations?: AnimationSettings;
  notes?: string;
}

export interface SlideElement {
  id: string;
  type: 'title' | 'subtitle' | 'description' | 'image' | 'shape';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: ElementStyle;
  zIndex: number;
  animation?: AnimationSettings;
}

export interface ElementStyle {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: string;
  padding?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  opacity?: number;
  transform?: string;
  textStyle?: string;
  strokeColor?: string;
  strokeWidth?: number;
  textShadow?: string;
  objectFit?: string;
}

export interface SlideBackground {
  type: 'solid' | 'gradient' | 'image' | 'pattern';
  value: string;
  opacity?: number;
  blur?: number;
}

export interface AnimationSettings {
  entrance?: 'fadeIn' | 'slideIn' | 'zoomIn' | 'bounceIn';
  exit?: 'fadeOut' | 'slideOut' | 'zoomOut' | 'bounceOut';
  duration?: number;
  delay?: number;
  easing?: string;
}

export interface DocumentSettings {
  showPageNumbers: boolean;
  pageNumberPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  slideSize: {
    width: number;
    height: number;
    aspectRatio: '16:9' | '4:3' | '1:1' | 'custom';
  };
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
  showNavigation?: boolean;
  showProgress?: boolean;
}

export interface ThemeSettings {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  custom?: Record<string, string>;
}

export interface BrandSettings {
  name: string;
  handle: string;
  logo?: string;
  website?: string;
  avatar?: {
    url: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    size: 'small' | 'medium' | 'large';
  };
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