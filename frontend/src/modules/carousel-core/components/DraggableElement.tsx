import React, { useState, useCallback } from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import { cn } from '../../../lib/utils';
import type { SlideElement } from '../../../types/carousel.types';
import { Move, Maximize2 } from 'lucide-react';

interface DraggableElementProps {
  element: SlideElement;
  isSelected: boolean;
  onElementClick: (elementId: string) => void;
  onPositionChange: (elementId: string, position: { x: number; y: number; width?: number; height?: number }) => void;
  slideWidth: number;
  slideHeight: number;
  scale?: number;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  isSelected,
  onElementClick,
  onPositionChange,
  slideWidth,
  slideHeight,
  scale = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleDrag = useCallback((e: DraggableEvent, data: DraggableData) => {
    // Keep element within slide boundaries with padding
    const padding = 10; // Minimum padding from edges
    const maxX = Math.max(0, slideWidth - (element.position?.width || 200) - padding);
    const maxY = Math.max(0, slideHeight - (element.position?.height || 100) - padding);

    const boundedX = Math.max(padding, Math.min(maxX, data.x));
    const boundedY = Math.max(padding, Math.min(maxY, data.y));

    onPositionChange(element.id, {
      x: boundedX,
      y: boundedY,
      width: element.position?.width,
      height: element.position?.height,
    });
  }, [element, slideWidth, slideHeight, onPositionChange]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.position?.width || 200,
      height: element.position?.height || 100,
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - e.clientX;
      const deltaY = moveEvent.clientY - e.clientY;

      const padding = 10;
      const newWidth = Math.max(80, Math.min(slideWidth - (element.position?.x || 0) - padding, resizeStart.width + deltaX / scale));
      const newHeight = Math.max(40, Math.min(slideHeight - (element.position?.y || 0) - padding, resizeStart.height + deltaY / scale));

      onPositionChange(element.id, {
        x: element.position?.x || 0,
        y: element.position?.y || 0,
        width: newWidth,
        height: newHeight,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging && !isResizing) {
      onElementClick(element.id);
    }
  };

  const elementStyle = {
    ...element.style,
    width: element.position?.width || 200,
    height: element.position?.height || 100,
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
  };

  const renderContent = () => {
    if (element.type === 'image') {
      return (
        <img
          src={element.content}
          alt=""
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      );
    }

    if (element.type === 'shape') {
      return (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: element.style?.backgroundColor,
            borderRadius: element.style?.borderRadius,
          }}
        />
      );
    }

    // Calculate dynamic font size based on element size
    const calculateFontSize = () => {
      const height = element.position?.height || 100;
      const width = element.position?.width || 200;
      const contentLength = (element.content || '').length;

      let baseFontSize = parseInt(element.style?.fontSize ||
        (element.type === 'title' ? '28px' :
         element.type === 'subtitle' ? '20px' : '14px'));

      // Adjust font size based on container dimensions
      if (element.type === 'title') {
        baseFontSize = Math.min(baseFontSize, height * 0.3, width * 0.1);
      } else if (element.type === 'subtitle') {
        baseFontSize = Math.min(baseFontSize, height * 0.25, width * 0.08);
      } else {
        baseFontSize = Math.min(baseFontSize, height * 0.2, width * 0.07);
      }

      // Further reduce if content is very long
      if (contentLength > 100) {
        baseFontSize = baseFontSize * 0.8;
      } else if (contentLength > 50) {
        baseFontSize = baseFontSize * 0.9;
      }

      return Math.max(10, Math.floor(baseFontSize)) + 'px';
    };

    return (
      <div className="w-full h-full p-2 overflow-hidden flex items-center justify-center">
        <div
          className={cn(
            "w-full",
            element.type === 'title' && "font-bold",
            element.type === 'subtitle' && "font-semibold",
            element.type === 'description' && "font-normal"
          )}
          style={{
            fontSize: calculateFontSize(),
            lineHeight: '1.3',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            textAlign: element.style?.textAlign || 'center',
            color: element.style?.color,
            maxHeight: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: element.style?.textAlign === 'left' ? 'flex-start' :
                          element.style?.textAlign === 'right' ? 'flex-end' : 'center',
          }}
        >
          <span style={{
            display: 'block',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxHeight: '100%',
          }}>
            {element.content || `[${element.type}]`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Draggable
      position={{ x: element.position?.x || 0, y: element.position?.y || 0 }}
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
      onDrag={handleDrag}
      bounds="parent"
      disabled={!isSelected}
      scale={scale}
    >
      <div
        className={cn(
          "absolute group cursor-move transition-all duration-200 bg-white/5",
          isSelected && "ring-2 ring-blue-500 ring-offset-1",
          isDragging && "opacity-80",
          !isSelected && "hover:ring-1 hover:ring-gray-300"
        )}
        style={elementStyle}
        onClick={handleClick}
      >
        {/* Visual indicators - Only visible when selected */}
        {isSelected && (
          <>

            {/* Resize Handle - Bottom Right */}
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600 transition-all z-10 flex items-center justify-center"
              onMouseDown={handleResizeStart}
              style={{ opacity: isSelected ? 1 : 0 }}
            >
              <Maximize2 className="h-3 w-3 text-white" />
            </div>

            {/* Corner resize handles */}
            {['top-left', 'top-right', 'bottom-left'].map((corner) => (
              <div
                key={corner}
                className={cn(
                  "absolute w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                  corner === 'top-left' && "-top-1.5 -left-1.5 cursor-nw-resize",
                  corner === 'top-right' && "-top-1.5 -right-1.5 cursor-ne-resize",
                  corner === 'bottom-left' && "-bottom-1.5 -left-1.5 cursor-sw-resize"
                )}
              />
            ))}

            {/* Edge resize handles */}
            {['top', 'right', 'bottom', 'left'].map((edge) => (
              <div
                key={edge}
                className={cn(
                  "absolute bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity",
                  edge === 'top' && "top-0 left-1/2 -translate-x-1/2 w-12 h-1 -mt-0.5 cursor-n-resize",
                  edge === 'right' && "right-0 top-1/2 -translate-y-1/2 w-1 h-12 -mr-0.5 cursor-e-resize",
                  edge === 'bottom' && "bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 -mb-0.5 cursor-s-resize",
                  edge === 'left' && "left-0 top-1/2 -translate-y-1/2 w-1 h-12 -ml-0.5 cursor-w-resize"
                )}
              />
            ))}
          </>
        )}

        {/* Content */}
        {renderContent()}
      </div>
    </Draggable>
  );
};