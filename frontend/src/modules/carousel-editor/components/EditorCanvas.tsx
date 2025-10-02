import React from 'react';
import { SlideCarousel } from '../../carousel-core/components/SlideCarousel';
import { ElementEditor } from './ElementEditor';
import { Toolbar } from './Toolbar';
import { cn } from '../../../lib/utils';
import { useUIStore } from '../../../stores/uiStore';
import { useCarouselStore } from '../../../stores/carouselStore';

interface EditorCanvasProps {
  className?: string;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ className }) => {
  const { selectedElementId, selectElement } = useCarouselStore();
  const { showGrid, showRulers } = useUIStore();

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <Toolbar />

      {/* Main Editor Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Grid Background */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, #e5e7eb 19px, #e5e7eb 20px),
                 repeating-linear-gradient(90deg, transparent, transparent 19px, #e5e7eb 19px, #e5e7eb 20px)`,
            }}
          />
        )}

        {/* Rulers */}
        {showRulers && (
          <>
            {/* Top Ruler */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-muted border-b z-10">
              <div className="h-full flex items-end overflow-hidden">
                {Array.from({ length: 100 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-10 border-r border-border/30 text-xs text-muted-foreground px-1"
                  >
                    {i % 5 === 0 ? i * 10 : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Left Ruler */}
            <div className="absolute top-6 left-0 bottom-0 w-6 bg-muted border-r z-10">
              <div className="h-full flex flex-col overflow-hidden">
                {Array.from({ length: 100 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 h-10 border-b border-border/30 text-xs text-muted-foreground px-1 flex items-center"
                  >
                    {i % 5 === 0 ? i * 10 : ''}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Slide Carousel - Always Centered */}
        <div
          className={cn(
            "absolute inset-0 z-20",
            showRulers && "top-6 left-6",
            selectedElementId && "mr-80" // Add margin when panel is open
          )}
        >
          <SlideCarousel />
        </div>

        {/* Element Editor Panel - Overlay on Right */}
        {selectedElementId && (
          <div className="absolute top-0 right-0 bottom-0 w-80 border-l bg-background shadow-xl z-30 overflow-y-auto animate-in slide-in-from-right duration-300">
            <ElementEditor />
          </div>
        )}
      </div>
    </div>
  );
};