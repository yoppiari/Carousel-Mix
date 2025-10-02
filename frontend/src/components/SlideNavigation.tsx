import React from 'react';
import { useCarouselStore } from '../stores/carouselStore';
import { Button } from './ui/button';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SlideNavigationProps {
  className?: string;
}

export const SlideNavigation: React.FC<SlideNavigationProps> = ({ className }) => {
  const {
    document,
    selectedSlideIndex,
    setSelectedSlide,
    addSlide,
    duplicateSlide,
    deleteSlide
  } = useCarouselStore();

  if (!document || !document.slides) return null;

  const slides = document.slides;
  const totalSlides = slides.length;

  const handleAddSlide = () => {
    addSlide();
  };

  const handleDuplicateSlide = (index: number) => {
    duplicateSlide(index);
  };

  const handleDeleteSlide = (index: number) => {
    if (totalSlides > 1) {
      deleteSlide(index);
    }
  };

  return (
    <div className={cn('border-t bg-background', className)}>
      {/* Slide Thumbnails Container */}
      <div className="flex items-center gap-2 p-4 overflow-x-auto">
        {/* Add New Slide Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSlide}
          className="flex-shrink-0 h-16 w-24 flex flex-col items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">Add Slide</span>
        </Button>

        {/* Slide Thumbnails */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="flex-shrink-0 group relative"
          >
            {/* Slide Thumbnail */}
            <Button
              variant={selectedSlideIndex === index ? "default" : "outline"}
              onClick={() => setSelectedSlide(index)}
              className={cn(
                "h-16 w-24 p-1 relative overflow-hidden",
                selectedSlideIndex === index && "ring-2 ring-primary"
              )}
            >
              {/* Slide Preview */}
              <div className="w-full h-full bg-white rounded border flex items-center justify-center text-xs">
                <div className="text-center">
                  <div className="font-semibold">{index + 1}</div>
                  <div className="text-muted-foreground">
                    {slide.elements?.length || 0} items
                  </div>
                </div>
              </div>

              {/* Slide Number Badge */}
              <div className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {index + 1}
              </div>
            </Button>

            {/* Slide Actions (appear on hover) */}
            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateSlide(index);
                }}
                className="h-6 w-6"
              >
                <Copy className="h-3 w-3" />
              </Button>

              {totalSlides > 1 && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSlide(index);
                  }}
                  className="h-6 w-6"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* Slide Counter */}
        <div className="flex-shrink-0 ml-4 text-sm text-muted-foreground">
          {totalSlides} slide{totalSlides !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};