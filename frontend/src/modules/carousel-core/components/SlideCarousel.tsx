import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SlideView } from './SlideView';
import { useCarouselStore } from '../../../stores/carouselStore';
import { Button } from '../../../components/ui/button';

interface SlideCarouselProps {
  className?: string;
}

export const SlideCarousel: React.FC<SlideCarouselProps> = ({ className }) => {
  const {
    document,
    selectedSlideIndex,
    selectedElementId,
    selectSlide,
    selectElement,
    addSlide,
    updateElement,
    deleteSlide,
  } = useCarouselStore();

  // Disable carousel drag when an element is selected for editing
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: !selectedElementId, // Disable drag when element is selected
    slidesToScroll: 1,
    watchDrag: !selectedElementId, // Prevent drag handling when element is selected
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // React to selectedElementId changes to update carousel drag behavior
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit({
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: !selectedElementId,
        slidesToScroll: 1,
        watchDrag: !selectedElementId,
      });
    }
  }, [selectedElementId, emblaApi]);

  // Add ESC key handler to deselect element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedElementId) {
        selectElement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, selectElement]);

  if (!document) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-600">No Carousel Document</h3>
          <p className="text-sm text-gray-500">Create a new carousel to get started</p>
        </div>
      </div>
    );
  }

  // Calculate slide dimensions for multi-slide view
  const SLIDE_BASE_WIDTH = 320; // Base width for each slide
  const SLIDE_GAP = 16; // Gap between slides
  const PADDING = 48; // Padding around carousel
  const ADD_BUTTON_WIDTH = 120; // Width of add slide button

  const slideWidth = SLIDE_BASE_WIDTH;
  const slideHeight = slideWidth; // 1:1 aspect ratio for social media

  const handleAddSlide = () => {
    addSlide(); // This now uses the new social media templates
  };

  const handleDeleteSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent slide selection
    if (document && document.slides.length > 1) {
      deleteSlide(index);
      // Select the previous slide if deleting the last one
      if (index === document.slides.length - 1 && index > 0) {
        selectSlide(index - 1);
      }
    }
  };

  const handleSlideClick = (index: number) => {
    selectSlide(index);
    // Scroll to show the selected slide prominently
    emblaApi?.scrollTo(index);
  };

  const handleElementClick = (slideIndex: number, elementId: string) => {
    // First select the slide if it's not already selected
    if (selectedSlideIndex !== slideIndex) {
      selectSlide(slideIndex);
    }
    // Then select the element
    selectElement(elementId);
  };

  const handleElementPositionChange = (slideId: string, elementId: string, position: { x: number; y: number; width?: number; height?: number }) => {
    const slideIndex = document?.slides.findIndex(s => s.id === slideId);
    if (slideIndex !== undefined && slideIndex >= 0) {
      updateElement(slideIndex, elementId, {
        position: {
          x: position.x,
          y: position.y,
          width: position.width || 200,
          height: position.height || 100,
        },
      });
    }
  };

  return (
    <div className={cn('relative h-full flex flex-col', className)}>
      {/* Navigation Controls */}
      <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 flex justify-between pointer-events-none z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="pointer-events-auto bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white/90"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="pointer-events-auto bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white/90"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Carousel Container */}
      <div
        className={cn(
          "flex-1 flex items-center justify-center overflow-hidden transition-all",
          selectedElementId ? "ring-2 ring-blue-400 ring-opacity-30" : "",
          !selectedElementId ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        )}
        ref={emblaRef}
        title={selectedElementId ? "Element editing mode - carousel drag disabled" : "Drag to scroll carousel"}>
        <div
          className="flex"
          style={{
            gap: `${SLIDE_GAP}px`,
            paddingLeft: PADDING,
            paddingRight: PADDING,
            paddingTop: PADDING,
            paddingBottom: PADDING,
          }}
        >
          {/* Add New Slide Button - Beginning */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer group"
            style={{
              width: `${ADD_BUTTON_WIDTH}px`,
              height: `${slideHeight}px`,
            }}
            onClick={handleAddSlide}
          >
            <Plus className="h-8 w-8 text-gray-400 group-hover:text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
              Add Slide
            </span>
          </div>

          {/* Existing Slides */}
          {document.slides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                'flex-shrink-0 relative cursor-pointer transition-all duration-200 rounded-lg overflow-hidden',
                index === selectedSlideIndex
                  ? 'ring-2 ring-primary shadow-xl scale-105 z-10'
                  : 'shadow-md hover:shadow-lg hover:scale-[1.02]'
              )}
              style={{
                width: `${slideWidth}px`,
                height: `${slideHeight}px`,
              }}
              onClick={() => handleSlideClick(index)}
            >
              <SlideView
                slide={slide}
                isSelected={index === selectedSlideIndex}
                showPageNumber={document.settings.showPageNumbers}
                pageNumber={index + 1}
                pageNumberPosition={document.settings.pageNumberPosition}
                onElementClick={(elementId) => handleElementClick(index, elementId)}
                onElementPositionChange={handleElementPositionChange}
                selectedElementId={selectedElementId}
                className="w-full h-full"
                isEditing={true}
              />

              {/* Slide Number Badge */}
              <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-sm z-10">
                {index + 1}
              </div>

              {/* Delete Button - Only show if more than one slide */}
              {document.slides.length > 1 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteSlide(index, e)}
                    title="Delete slide"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Selected Slide Indicator */}
              {index === selectedSlideIndex && (
                <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
              )}
            </div>
          ))}

          {/* Add New Slide Button - End */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer group"
            style={{
              width: `${ADD_BUTTON_WIDTH}px`,
              height: `${slideHeight}px`,
            }}
            onClick={handleAddSlide}
          >
            <Plus className="h-8 w-8 text-gray-400 group-hover:text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
              Add Slide
            </span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t bg-muted/30 px-4 py-2 text-sm text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Slide {selectedSlideIndex + 1} of {document.slides.length}</span>
          {selectedElementId && (
            <span className="flex items-center gap-2 text-blue-600">
              <span className="animate-pulse">●</span>
              Edit Mode - Carousel drag disabled
            </span>
          )}
        </div>
        <div className="text-xs">
          {selectedElementId
            ? "Press ESC or click background to exit edit mode"
            : "Click element to edit, drag carousel to scroll"
          }
        </div>
      </div>
    </div>
  );
};