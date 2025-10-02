import React, { useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Grid,
  Ruler,
  Eye,
  EyeOff,
  RotateCcw,
  Type,
  Square,
  Image,
  Undo,
  Redo,
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { useCarouselStore } from '../../../stores/carouselStore';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { cn } from '../../../lib/utils';

export const Toolbar: React.FC = () => {
  const {
    zoom,
    showGrid,
    showRulers,
    setZoom,
    toggleGrid,
    toggleRulers,
    openModal,
  } = useUIStore();

  const {
    document,
    selectedSlideIndex,
    addElement,
  } = useCarouselStore();

  const handleZoomIn = () => {
    setZoom(Math.min(200, zoom + 10));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(25, zoom - 10));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const handleAddText = () => {
    addElement(selectedSlideIndex, {
      type: 'description',
      content: 'New Text Element',
      style: {
        fontSize: '16px',
        fontWeight: 'normal',
        textAlign: 'left',
      },
    });
  };

  const handleAddTitle = () => {
    addElement(selectedSlideIndex, {
      type: 'title',
      content: 'New Title',
      style: {
        fontSize: '48px',
        fontWeight: 'bold',
        textAlign: 'center',
      },
    });
  };

  const handleAddSubtitle = () => {
    addElement(selectedSlideIndex, {
      type: 'subtitle',
      content: 'New Subtitle',
      style: {
        fontSize: '24px',
        fontWeight: '500',
        textAlign: 'center',
      },
    });
  };

  const handleAddShape = () => {
    addElement(selectedSlideIndex, {
      type: 'shape',
      content: '',
      style: {
        backgroundColor: '#3B82F6',
        borderRadius: '8px',
      },
      position: {
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      },
    });
  };

  const handleAddImage = () => {
    // This would open a file picker in a real implementation
    // TODO: Implement image upload
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Plus: Zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        handleZoomIn();
      }

      // Ctrl/Cmd + Minus: Zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }

      // Ctrl/Cmd + 0: Reset zoom
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }

      // G: Toggle grid
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          toggleGrid();
        }
      }

      // R: Toggle rulers
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          toggleRulers();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!document) return null;

  return (
    <div className="flex items-center justify-between px-4 h-14 border-b bg-background">
      {/* Left Section - Add Elements */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddTitle}
          title="Add Title"
        >
          <Type className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddSubtitle}
          title="Add Subtitle"
        >
          <Type className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddText}
          title="Add Text"
        >
          <Type className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddShape}
          title="Add Shape"
        >
          <Square className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddImage}
          title="Add Image"
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>

      {/* Center Section - Document Title */}
      <div className="text-sm font-medium">
        {document.metadata.title}
      </div>

      {/* Right Section - View Controls */}
      <div className="flex items-center gap-2">
        {/* Grid Toggle */}
        <Button
          variant={showGrid ? 'secondary' : 'ghost'}
          size="sm"
          onClick={toggleGrid}
          title="Toggle Grid"
        >
          <Grid className="h-4 w-4" />
        </Button>

        {/* Rulers Toggle */}
        <Button
          variant={showRulers ? 'secondary' : 'ghost'}
          size="sm"
          onClick={toggleRulers}
          title="Toggle Rulers"
        >
          <Ruler className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Zoom Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= 25}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetZoom}
          className="min-w-[60px]"
        >
          {zoom}%
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= 200}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};