import { Card, CardContent } from '@/components/ui/card';
import '../styles/text-styles.css';

interface StylePreviewGalleryProps {
  styles: Array<{
    value: string;
    label: string;
    previewText: string;
    description?: string;
  }>;
  selectedStyle?: string;
  onSelectStyle?: (style: string) => void;
}

export default function StylePreviewGallery({
  styles,
  selectedStyle,
  onSelectStyle
}: StylePreviewGalleryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Style Preview Gallery</h3>
      <p className="text-sm text-muted-foreground">
        Click on a style to see how it will look on your carousels
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {styles.map((style) => (
          <Card
            key={style.value}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedStyle === style.value ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectStyle?.(style.value)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{style.label}</h4>
                  {selectedStyle === style.value && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Selected
                    </span>
                  )}
                </div>

                {/* Visual Preview Box */}
                <div className="relative aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg overflow-hidden">
                  <div className={`preview-text pos-center align-center style-${style.value}`}>
                    {style.previewText}
                  </div>
                </div>

                {style.description && (
                  <p className="text-xs text-muted-foreground">
                    {style.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
