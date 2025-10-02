import React from 'react';
import { cn } from '../../../lib/utils';
import { DraggableElement } from './DraggableElement';
import type { Slide, SlideElement } from '../../../types/carousel.types';

interface SlideViewProps {
  slide: Slide;
  isSelected?: boolean;
  showPageNumber?: boolean;
  pageNumber?: number;
  pageNumberPosition?: string;
  scale?: number;
  onClick?: () => void;
  onElementClick?: (elementId: string) => void;
  onElementPositionChange?: (slideId: string, elementId: string, position: { x: number; y: number; width?: number; height?: number }) => void;
  selectedElementId?: string | null;
  className?: string;
  isEditing?: boolean;
}

export const SlideView: React.FC<SlideViewProps> = ({
  slide,
  isSelected = false,
  showPageNumber = false,
  pageNumber,
  pageNumberPosition = 'bottom-right',
  scale = 1,
  onClick,
  onElementClick,
  onElementPositionChange,
  selectedElementId,
  className,
  isEditing = true, // Enable editing by default when in editor
}) => {
  const handleElementClick = (elementId: string) => {
    onElementClick?.(elementId);
  };

  const handlePositionChange = (elementId: string, position: { x: number; y: number; width?: number; height?: number }) => {
    onElementPositionChange?.(slide.id, elementId, position);
  };

  const getPageNumberClass = () => {
    const positions: Record<string, string> = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    };
    return positions[pageNumberPosition] || positions['bottom-right'];
  };

  const renderStaticElement = (element: SlideElement) => {
    const isElementSelected = selectedElementId === element.id;

    const elementStyle = {
      ...element.style,
      position: element.position ? 'absolute' as const : 'relative' as const,
      left: element.position?.x,
      top: element.position?.y,
      width: element.position?.width || 'auto',
      height: element.position?.height || 'auto',
      maxWidth: '100%',
      overflow: 'hidden',
      wordWrap: 'break-word' as const,
      overflowWrap: 'break-word' as const,
    };

    const elementClass = cn(
      'transition-all duration-200 break-words hover:opacity-80',
      isElementSelected && 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/20',
      element.type === 'title' && 'font-bold leading-tight',
      element.type === 'subtitle' && 'font-semibold leading-relaxed',
      element.type === 'description' && 'leading-relaxed',
      element.position && 'absolute',
      'p-2 rounded'
    );

    if (element.type === 'image') {
      return (
        <div
          key={element.id}
          className={cn(elementClass, 'cursor-pointer')}
          style={elementStyle}
          onClick={(e) => {
            e.stopPropagation();
            handleElementClick(element.id);
          }}
        >
          <img
            src={element.content}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    if (element.type === 'shape') {
      return (
        <div
          key={element.id}
          className={cn(elementClass, 'cursor-pointer')}
          style={elementStyle}
          onClick={(e) => {
            e.stopPropagation();
            handleElementClick(element.id);
          }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.style?.backgroundColor,
              borderRadius: element.style?.borderRadius,
            }}
          />
        </div>
      );
    }

    return (
      <div
        key={element.id}
        className={cn(elementClass, 'cursor-pointer select-none')}
        style={elementStyle}
        onClick={(e) => {
          e.stopPropagation();
          handleElementClick(element.id);
        }}
        title="Click to edit"
      >
        {element.content || `[${element.type}]`}
      </div>
    );
  };

  const isGradientBackground = slide.background?.includes('gradient');

  // Calculate actual slide dimensions
  const slideWidth = 320; // Fixed width for carousel slides
  const slideHeight = 320; // 1:1 aspect ratio

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden rounded-lg transition-all duration-200',
        isSelected && 'ring-4 ring-primary',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        background: slide.background || '#ffffff',
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        aspectRatio: '1 / 1',
      }}
      onClick={(e) => {
        // If clicking on the slide background (not on an element), deselect element
        if (isEditing && selectedElementId && e.target === e.currentTarget) {
          onElementClick?.(null as any);
        }
        onClick?.();
      }}
    >
      {/* Background overlay for better text readability on gradients */}
      {isGradientBackground && (
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      )}

      {/* Slide Elements - Draggable when editing, static otherwise */}
      <div
        className="relative w-full h-full"
        onClick={(e) => {
          // Also handle clicks on the inner container
          if (isEditing && selectedElementId && e.target === e.currentTarget) {
            onElementClick?.(null as any);
          }
        }}>
        {isEditing && onElementPositionChange ? (
          // Draggable elements for editing mode
          (slide.elements || []).map((element) => (
            <DraggableElement
              key={element.id}
              element={element}
              isSelected={selectedElementId === element.id}
              onElementClick={handleElementClick}
              onPositionChange={handlePositionChange}
              slideWidth={slideWidth}
              slideHeight={slideHeight}
              scale={scale}
            />
          ))
        ) : (
          // Static elements for preview mode
          (slide.elements || []).map(renderStaticElement)
        )}
      </div>

      {/* Page Number */}
      {showPageNumber && pageNumber !== undefined && (
        <div
          className={cn(
            'absolute text-sm font-medium z-10',
            isGradientBackground ? 'text-white/70' : 'text-gray-500',
            getPageNumberClass()
          )}
          style={{
            textShadow: isGradientBackground ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          {pageNumber}
        </div>
      )}

      {/* Brand watermark for social media style */}
      <div className="absolute bottom-4 left-4 opacity-40 z-10">
        <div className="text-xs font-medium text-white/70">
          @yourbrand
        </div>
      </div>
    </div>
  );
};