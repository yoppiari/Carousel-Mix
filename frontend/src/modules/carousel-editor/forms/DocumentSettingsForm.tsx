import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SettingsFormSchema } from '../../carousel-core/schemas/carousel.schema';
import { useCarouselStore } from '../../../stores/carouselStore';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';

export const DocumentSettingsForm: React.FC = () => {
  const { document, updateSettings } = useCarouselStore();

  const form = useForm({
    resolver: zodResolver(SettingsFormSchema),
    defaultValues: {
      showPageNumbers: document?.settings.showPageNumbers || false,
      pageNumberPosition: document?.settings.pageNumberPosition || 'bottom-right',
    },
  });

  const handleChange = (field: string, value: any) => {
    form.setValue(field as any, value);
    const values = form.getValues();
    updateSettings(values);
  };

  const slideSizePresets = [
    { label: '📱 Instagram Post (1080x1080)', width: 1080, height: 1080, ratio: '1:1' },
    { label: '💼 LinkedIn Carousel (1080x1080)', width: 1080, height: 1080, ratio: '1:1' },
    { label: '📊 LinkedIn Post (1200x630)', width: 1200, height: 630, ratio: '16:9' },
    { label: '🐦 Twitter Post (1200x675)', width: 1200, height: 675, ratio: '16:9' },
    { label: '📘 Facebook Post (1200x630)', width: 1200, height: 630, ratio: '16:9' },
    { label: '📖 Instagram Story (1080x1920)', width: 1080, height: 1920, ratio: '9:16' },
    { label: '🎥 Presentation (1920x1080)', width: 1920, height: 1080, ratio: '16:9' },
    { label: '📄 A4 Portrait (794x1123)', width: 794, height: 1123, ratio: '1:1.41' },
  ];

  const handleSizePreset = (preset: typeof slideSizePresets[0]) => {
    updateSettings({
      slideSize: {
        width: preset.width,
        height: preset.height,
        aspectRatio: preset.ratio,
      },
    });
  };

  return (
    <form className="space-y-4">
      {/* Page Numbers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-page-numbers">Show Page Numbers</Label>
          <Switch
            id="show-page-numbers"
            checked={form.watch('showPageNumbers')}
            onCheckedChange={(checked) => handleChange('showPageNumbers', checked)}
          />
        </div>

        {form.watch('showPageNumbers') && (
          <div className="space-y-2">
            <Label>Page Number Position</Label>
            <Select
              value={form.watch('pageNumberPosition')}
              onValueChange={(value) => handleChange('pageNumberPosition', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Slide Size */}
      <div className="space-y-3">
        <Label>Slide Size</Label>
        
        {/* Preset Sizes */}
        <Select onValueChange={(value) => {
          const preset = slideSizePresets.find(p => p.label === value);
          if (preset) handleSizePreset(preset);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a preset size" />
          </SelectTrigger>
          <SelectContent>
            {slideSizePresets.map((preset) => (
              <SelectItem key={preset.label} value={preset.label}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom Size */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Width (px)</Label>
            <Input
              type="number"
              value={document?.settings.slideSize.width || 1200}
              onChange={(e) => updateSettings({
                slideSize: {
                  ...document?.settings.slideSize,
                  width: parseInt(e.target.value) || 1200,
                },
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Height (px)</Label>
            <Input
              type="number"
              value={document?.settings.slideSize.height || 630}
              onChange={(e) => updateSettings({
                slideSize: {
                  ...document?.settings.slideSize,
                  height: parseInt(e.target.value) || 630,
                },
              })}
            />
          </div>
        </div>

        {/* Current Size Display */}
        <div className="p-3 bg-muted/50 rounded-lg text-sm">
          Current: {document?.settings.slideSize.width} × {document?.settings.slideSize.height}px
          {document?.settings.slideSize.aspectRatio && (
            <span className="text-muted-foreground"> ({document.settings.slideSize.aspectRatio})</span>
          )}
        </div>
      </div>

      {/* Auto Play Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-play">Auto Play Slides</Label>
          <Switch
            id="auto-play"
            checked={document?.settings.autoPlay || false}
            onCheckedChange={(checked) => updateSettings({ autoPlay: checked })}
          />
        </div>

        {document?.settings.autoPlay && (
          <div className="space-y-2">
            <Label>Auto Play Delay (seconds)</Label>
            <Input
              type="number"
              min="1"
              max="60"
              value={(document?.settings.autoPlayDelay || 5000) / 1000}
              onChange={(e) => updateSettings({
                autoPlayDelay: parseInt(e.target.value) * 1000 || 5000,
              })}
            />
          </div>
        )}
      </div>

      {/* Document Info */}
      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-sm font-semibold">Document Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Slides:</span>
            <span>{document?.slides.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>
              {document?.metadata.createdAt
                ? new Date(document.metadata.createdAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Updated:</span>
            <span>
              {document?.metadata.updatedAt
                ? new Date(document.metadata.updatedAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </form>
  );
};