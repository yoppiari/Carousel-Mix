import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ThemeFormSchema } from '../../carousel-core/schemas/carousel.schema';
import { useCarouselStore } from '../../../stores/carouselStore';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Palette } from 'lucide-react';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorField: React.FC<ColorFieldProps> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex gap-2">
      <Input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 h-10 p-1 cursor-pointer"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        pattern="^#[0-9A-F]{6}$"
      />
    </div>
  </div>
);

export const ThemeForm: React.FC = () => {
  const { document, updateTheme } = useCarouselStore();

  const form = useForm({
    resolver: zodResolver(ThemeFormSchema),
    defaultValues: {
      primary: document?.theme.primary || '#3B82F6',
      secondary: document?.theme.secondary || '#8B5CF6',
      background: document?.theme.background || '#FFFFFF',
      text: document?.theme.text || '#1F2937',
      accent: document?.theme.accent || '#F59E0B',
    },
  });

  const handleColorChange = (field: string, value: string) => {
    form.setValue(field as any, value);
    const values = form.getValues();
    updateTheme(values);
  };

  const presetThemes = [
    {
      name: '📱 Instagram',
      colors: {
        primary: '#E1306C',
        secondary: '#F56040',
        background: '#FAFAFA',
        text: '#262626',
        accent: '#0095F6',
      },
    },
    {
      name: '💼 LinkedIn',
      colors: {
        primary: '#0077B5',
        secondary: '#00A0DC',
        background: '#F3F2EF',
        text: '#000000',
        accent: '#70B5F9',
      },
    },
    {
      name: '🌈 Vibrant',
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        background: '#FFF7F0',
        text: '#2C3E50',
        accent: '#FFE66D',
      },
    },
    {
      name: '🌙 Dark Mode',
      colors: {
        primary: '#BB86FC',
        secondary: '#03DAC6',
        background: '#121212',
        text: '#FFFFFF',
        accent: '#CF6679',
      },
    },
    {
      name: '🌿 Minimal',
      colors: {
        primary: '#2ECC71',
        secondary: '#27AE60',
        background: '#FFFFFF',
        text: '#2C3E50',
        accent: '#F39C12',
      },
    },
    {
      name: '🔥 Gradient',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        background: '#f093fb',
        text: '#FFFFFF',
        accent: '#f5576c',
      },
    },
  ];

  const applyPreset = (preset: typeof presetThemes[0]) => {
    Object.entries(preset.colors).forEach(([field, value]) => {
      form.setValue(field as any, value);
    });
    updateTheme(preset.colors);
  };

  return (
    <form className="space-y-4">
      {/* Preset Themes */}
      <div className="space-y-2">
        <Label>Preset Themes</Label>
        <div className="grid grid-cols-3 gap-2">
          {presetThemes.map((preset) => (
            <Button
              key={preset.name}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset)}
              className="justify-start gap-2"
            >
              <div className="flex gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.colors.primary }}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.colors.secondary }}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.colors.accent }}
                />
              </div>
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Color Fields */}
      <ColorField
        label="Primary Color"
        value={form.watch('primary')}
        onChange={(value) => handleColorChange('primary', value)}
      />

      <ColorField
        label="Secondary Color"
        value={form.watch('secondary')}
        onChange={(value) => handleColorChange('secondary', value)}
      />

      <ColorField
        label="Background Color"
        value={form.watch('background')}
        onChange={(value) => handleColorChange('background', value)}
      />

      <ColorField
        label="Text Color"
        value={form.watch('text')}
        onChange={(value) => handleColorChange('text', value)}
      />

      <ColorField
        label="Accent Color"
        value={form.watch('accent')}
        onChange={(value) => handleColorChange('accent', value)}
      />

      {/* Color Preview */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: form.watch('background') }}
        >
          <div
            className="text-2xl font-bold mb-2"
            style={{ color: form.watch('primary') }}
          >
            Primary Text
          </div>
          <div
            className="text-lg font-medium mb-2"
            style={{ color: form.watch('secondary') }}
          >
            Secondary Text
          </div>
          <div
            className="text-base mb-2"
            style={{ color: form.watch('text') }}
          >
            Regular text content appears here
          </div>
          <div
            className="inline-block px-3 py-1 rounded"
            style={{
              backgroundColor: form.watch('accent'),
              color: form.watch('background'),
            }}
          >
            Accent Button
          </div>
        </div>
      </div>
    </form>
  );
};