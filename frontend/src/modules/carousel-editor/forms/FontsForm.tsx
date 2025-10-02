import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FontFormSchema } from '../../carousel-core/schemas/carousel.schema';
import { useCarouselStore } from '../../../stores/carouselStore';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

const fontFamilies = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Playfair Display',
  'Merriweather',
  'Georgia',
  'Times New Roman',
  'Arial',
  'Helvetica',
  'system-ui',
];

const fontWeights = [
  { label: 'Thin', value: '100' },
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Black', value: '900' },
];

interface FontSectionProps {
  title: string;
  fontKey: 'title' | 'subtitle' | 'body';
  form: any;
  onChange: (field: string, value: string) => void;
}

const FontSection: React.FC<FontSectionProps> = ({ title, fontKey, form, onChange }) => (
  <div className="space-y-3 p-3 border rounded-lg">
    <h4 className="text-sm font-medium">{title}</h4>
    
    <div className="space-y-2">
      <Label>Font Family</Label>
      <Select
        value={form.watch(`${fontKey}Font`)}
        onValueChange={(value) => onChange(`${fontKey}Font`, value)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fontFamilies.map((font) => (
            <SelectItem key={font} value={font}>
              <span style={{ fontFamily: font }}>{font}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label>Size</Label>
        <Input
          {...form.register(`${fontKey}Size`)}
          placeholder="48px"
          onChange={(e) => onChange(`${fontKey}Size`, e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Weight</Label>
        <Select
          value={form.watch(`${fontKey}Weight`)}
          onValueChange={(value) => onChange(`${fontKey}Weight`, value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontWeights.map((weight) => (
              <SelectItem key={weight.value} value={weight.value}>
                {weight.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Preview */}
    <div
      className="p-2 bg-muted/50 rounded text-center"
      style={{
        fontFamily: form.watch(`${fontKey}Font`),
        fontSize: fontKey === 'title' ? '24px' : fontKey === 'subtitle' ? '18px' : '14px',
        fontWeight: form.watch(`${fontKey}Weight`),
      }}
    >
      {fontKey === 'title' ? 'Title Preview' : fontKey === 'subtitle' ? 'Subtitle Preview' : 'Body text preview'}
    </div>
  </div>
);

export const FontsForm: React.FC = () => {
  const { document, updateFonts } = useCarouselStore();

  const form = useForm({
    resolver: zodResolver(FontFormSchema),
    defaultValues: {
      titleFont: document?.fonts.title.family || 'Inter',
      titleSize: document?.fonts.title.size || '48px',
      titleWeight: document?.fonts.title.weight || '700',
      subtitleFont: document?.fonts.subtitle.family || 'Inter',
      subtitleSize: document?.fonts.subtitle.size || '24px',
      subtitleWeight: document?.fonts.subtitle.weight || '500',
      bodyFont: document?.fonts.body.family || 'Inter',
      bodySize: document?.fonts.body.size || '16px',
      bodyWeight: document?.fonts.body.weight || '400',
    },
  });

  const handleChange = (field: string, value: string) => {
    form.setValue(field as any, value);
    const values = form.getValues();
    
    updateFonts({
      title: {
        family: values.titleFont,
        size: values.titleSize,
        weight: values.titleWeight,
      },
      subtitle: {
        family: values.subtitleFont,
        size: values.subtitleSize,
        weight: values.subtitleWeight,
      },
      body: {
        family: values.bodyFont,
        size: values.bodySize,
        weight: values.bodyWeight,
      },
    });
  };

  return (
    <form className="space-y-4">
      <FontSection
        title="Title Font"
        fontKey="title"
        form={form}
        onChange={handleChange}
      />

      <FontSection
        title="Subtitle Font"
        fontKey="subtitle"
        form={form}
        onChange={handleChange}
      />

      <FontSection
        title="Body Font"
        fontKey="body"
        form={form}
        onChange={handleChange}
      />
    </form>
  );
};