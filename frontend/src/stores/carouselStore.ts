import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type {
  CarouselDocument,
  Slide,
  SlideElement,
  ThemeSettings,
  BrandSettings,
  FontSettings,
  DocumentSettings
} from '../types/carousel.types';

interface CarouselStore {
  // State
  document: CarouselDocument | null;
  selectedSlideIndex: number;
  selectedElementId: string | null;
  isLoading: boolean;
  isDirty: boolean;
  lastSaved: Date | null;

  // Document Actions
  setDocument: (doc: CarouselDocument) => void;
  createNewDocument: (title?: string) => void;
  clearDocument: () => void;

  // Slide Actions
  addSlide: (slide?: Partial<Slide>) => void;
  setSelectedSlide: (index: number) => void;
  updateSlide: (index: number, updates: Partial<Slide>) => void;
  deleteSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;

  // Element Actions
  addElement: (slideIndex: number, element: Partial<SlideElement>) => void;
  updateElement: (slideIndex: number, elementId: string, updates: Partial<SlideElement>) => void;
  deleteElement: (slideIndex: number, elementId: string) => void;
  duplicateElement: (slideIndex: number, elementId: string) => void;
  reorderElements: (slideIndex: number, fromIndex: number, toIndex: number) => void;

  // Selection Actions
  selectSlide: (index: number) => void;
  selectElement: (elementId: string | null) => void;

  // Settings Actions
  updateTheme: (theme: Partial<ThemeSettings>) => void;
  updateBrand: (brand: Partial<BrandSettings>) => void;
  updateFonts: (fonts: Partial<FontSettings>) => void;
  updateSettings: (settings: Partial<DocumentSettings>) => void;

  // Utility Actions
  setLoading: (loading: boolean) => void;
  markDirty: () => void;
  markClean: () => void;
  setLastSaved: (date: Date) => void;
}

const createDefaultDocument = (title = 'Untitled Carousel'): CarouselDocument => ({
  id: uuidv4(),
  version: '1.0.0',
  metadata: {
    title,
    description: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: 'User',
    tags: [],
  },
  slides: [
    createSocialMediaSlide('Cover Slide', {
      id: uuidv4(),
      order: 0,
      elements: [
        {
          id: uuidv4(),
          type: 'title',
          content: '🚀 Your Awesome Carousel',
          style: {
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'left',
            color: '#FFFFFF',
          },
          position: {
            x: 20,
            y: 100,
            width: 240,
            height: 100,
          },
        },
        {
          id: uuidv4(),
          type: 'subtitle',
          content: 'Swipe to discover amazing insights →',
          style: {
            fontSize: '18px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#F0F9FF',
            opacity: 0.9,
          },
          position: {
            x: 20,
            y: 220,
            width: 240,
            height: 80,
          },
        },
      ],
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }),
  ],
  settings: {
    showPageNumbers: true,
    pageNumberPosition: 'bottom-right',
    slideSize: {
      width: 1080,
      height: 1080,
      aspectRatio: '1:1',
    },
  },
  theme: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#f8fafc',
    text: '#1e293b',
    accent: '#f59e0b',
  },
  brand: {
    name: 'Your Brand',
    handle: '@yourbrand',
    avatarOpacity: 100,
  },
  fonts: {
    title: {
      family: 'Inter',
      size: '32px',
      weight: '700',
    },
    subtitle: {
      family: 'Inter',
      size: '18px',
      weight: '500',
    },
    body: {
      family: 'Inter',
      size: '16px',
      weight: '400',
    },
  },
});

const createSocialMediaSlide = (type: string, overrides?: Partial<Slide>): Slide => {
  const socialSlideTemplates = {
    'Cover Slide': {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      elements: [
        {
          id: uuidv4(),
          type: 'title' as const,
          content: '✨ Start Here',
          style: {
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'left',
            color: '#FFFFFF',
          },
          position: {
            x: 20,
            y: 100,
            width: 240,
            height: 100,
          },
        },
      ],
    },
    'Content Slide': {
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      elements: [
        {
          id: uuidv4(),
          type: 'title' as const,
          content: 'Key Point',
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'left',
            color: '#1e293b',
          },
          position: {
            x: 20,
            y: 60,
            width: 240,
            height: 80,
          },
        },
        {
          id: uuidv4(),
          type: 'description' as const,
          content: 'Add your compelling content here that engages your audience...',
          style: {
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#475569',
            lineHeight: '1.6',
          },
          position: {
            x: 20,
            y: 160,
            width: 240,
            height: 140,
          },
        },
      ],
    },
    'Stats Slide': {
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      elements: [
        {
          id: uuidv4(),
          type: 'title' as const,
          content: '85%',
          style: {
            fontSize: '64px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1e293b',
          },
          position: {
            x: 20,
            y: 120,
            width: 240,
            height: 100,
          },
        },
        {
          id: uuidv4(),
          type: 'subtitle' as const,
          content: 'of users found this helpful',
          style: {
            fontSize: '18px',
            fontWeight: 'normal',
            textAlign: 'center',
            color: '#475569',
          },
          position: {
            x: 20,
            y: 240,
            width: 240,
            height: 60,
          },
        },
      ],
    },
  };

  const template = socialSlideTemplates[type as keyof typeof socialSlideTemplates] || socialSlideTemplates['Content Slide'];

  return {
    id: uuidv4(),
    order: 0,
    ...template,
    ...overrides,
  };
};

export const useCarouselStore = create<CarouselStore>()(
  immer((set) => ({
    // Initial State
    document: null,
    selectedSlideIndex: 0,
    selectedElementId: null,
    isLoading: false,
    isDirty: false,
    lastSaved: null,

    // Document Actions
    setDocument: (doc) => set((state) => {
      state.document = doc;
      state.selectedSlideIndex = 0;
      state.selectedElementId = null;
      state.isDirty = false;
    }),

    createNewDocument: (title) => set((state) => {
      state.document = createDefaultDocument(title);
      state.selectedSlideIndex = 0;
      state.selectedElementId = null;
      state.isDirty = false;
      state.lastSaved = null;
    }),

    clearDocument: () => set((state) => {
      state.document = null;
      state.selectedSlideIndex = 0;
      state.selectedElementId = null;
      state.isDirty = false;
    }),

    // Slide Actions
    addSlide: (slide) => set((state) => {
      if (!state.document) return;

      const slideTypes = ['Content Slide', 'Stats Slide', 'Cover Slide'];
      const randomType = slideTypes[Math.floor(Math.random() * slideTypes.length)];

      const newSlide = createSocialMediaSlide(randomType, {
        order: state.document.slides.length,
        ...slide,
      });

      state.document.slides.push(newSlide);
      state.selectedSlideIndex = state.document.slides.length - 1;
      state.isDirty = true;
    }),

    updateSlide: (index, updates) => set((state) => {
      if (!state.document || !state.document.slides[index]) return;

      Object.assign(state.document.slides[index], updates);
      state.isDirty = true;
    }),

    deleteSlide: (index) => set((state) => {
      if (!state.document || state.document.slides.length <= 1) return;

      state.document.slides.splice(index, 1);

      // Update order numbers
      state.document.slides.forEach((slide, i) => {
        slide.order = i;
      });

      // Adjust selected index
      if (state.selectedSlideIndex >= state.document.slides.length) {
        state.selectedSlideIndex = state.document.slides.length - 1;
      }

      state.isDirty = true;
    }),

    duplicateSlide: (index) => set((state) => {
      if (!state.document || !state.document.slides[index]) return;

      const originalSlide = state.document.slides[index];
      const duplicatedSlide: Slide = {
        ...originalSlide,
        id: uuidv4(),
        order: index + 1,
        elements: originalSlide.elements.map(elem => ({
          ...elem,
          id: uuidv4(),
        })),
      };

      state.document.slides.splice(index + 1, 0, duplicatedSlide);

      // Update order numbers
      state.document.slides.forEach((slide, i) => {
        slide.order = i;
      });

      state.selectedSlideIndex = index + 1;
      state.isDirty = true;
    }),

    reorderSlides: (fromIndex, toIndex) => set((state) => {
      if (!state.document) return;

      const [movedSlide] = state.document.slides.splice(fromIndex, 1);
      state.document.slides.splice(toIndex, 0, movedSlide);

      // Update order numbers
      state.document.slides.forEach((slide, i) => {
        slide.order = i;
      });

      // Update selected index if needed
      if (state.selectedSlideIndex === fromIndex) {
        state.selectedSlideIndex = toIndex;
      }

      state.isDirty = true;
    }),

    // Element Actions
    addElement: (slideIndex, element) => set((state) => {
      if (!state.document || !state.document.slides[slideIndex]) return;

      const newElement: SlideElement = {
        id: uuidv4(),
        type: 'description',
        content: 'New Element',
        style: {},
        ...element,
      };

      state.document.slides[slideIndex].elements.push(newElement);
      state.selectedElementId = newElement.id;
      state.isDirty = true;
    }),

    updateElement: (slideIndex, elementId, updates) => set((state) => {
      if (!state.document || !state.document.slides[slideIndex]) return;

      const element = state.document.slides[slideIndex].elements.find(
        el => el.id === elementId
      );

      if (element) {
        Object.assign(element, updates);
        state.isDirty = true;
      }
    }),

    deleteElement: (slideIndex, elementId) => set((state) => {
      if (!state.document || !state.document.slides[slideIndex]) return;

      const elements = state.document.slides[slideIndex].elements;
      const index = elements.findIndex(el => el.id === elementId);

      if (index !== -1) {
        elements.splice(index, 1);

        if (state.selectedElementId === elementId) {
          state.selectedElementId = null;
        }

        state.isDirty = true;
      }
    }),

    duplicateElement: (slideIndex, elementId) => set((state) => {
      if (!state.document || !state.document.slides[slideIndex]) return;

      const elements = state.document.slides[slideIndex].elements;
      const element = elements.find(el => el.id === elementId);

      if (element) {
        const duplicatedElement: SlideElement = {
          ...element,
          id: uuidv4(),
        };

        elements.push(duplicatedElement);
        state.selectedElementId = duplicatedElement.id;
        state.isDirty = true;
      }
    }),

    reorderElements: (slideIndex, fromIndex, toIndex) => set((state) => {
      if (!state.document || !state.document.slides[slideIndex]) return;

      const elements = state.document.slides[slideIndex].elements;
      const [movedElement] = elements.splice(fromIndex, 1);
      elements.splice(toIndex, 0, movedElement);

      state.isDirty = true;
    }),

    // Selection Actions
    selectSlide: (index) => set((state) => {
      if (!state.document || index < 0 || index >= state.document.slides.length) return;

      state.selectedSlideIndex = index;
      state.selectedElementId = null;
    }),

    setSelectedSlide: (index) => set((state) => {
      if (!state.document || index < 0 || index >= state.document.slides.length) return;

      state.selectedSlideIndex = index;
      state.selectedElementId = null;
    }),

    selectElement: (elementId) => set((state) => {
      state.selectedElementId = elementId;
    }),

    // Settings Actions
    updateTheme: (theme) => set((state) => {
      if (!state.document) return;

      Object.assign(state.document.theme, theme);
      state.isDirty = true;
    }),

    updateBrand: (brand) => set((state) => {
      if (!state.document) return;

      Object.assign(state.document.brand, brand);
      state.isDirty = true;
    }),

    updateFonts: (fonts) => set((state) => {
      if (!state.document) return;

      Object.assign(state.document.fonts, fonts);
      state.isDirty = true;
    }),

    updateSettings: (settings) => set((state) => {
      if (!state.document) return;

      Object.assign(state.document.settings, settings);
      state.isDirty = true;
    }),

    // Utility Actions
    setLoading: (loading) => set((state) => {
      state.isLoading = loading;
    }),

    markDirty: () => set((state) => {
      state.isDirty = true;
    }),

    markClean: () => set((state) => {
      state.isDirty = false;
    }),

    setLastSaved: (date) => set((state) => {
      state.lastSaved = date;
      state.isDirty = false;
    }),
  }))
);