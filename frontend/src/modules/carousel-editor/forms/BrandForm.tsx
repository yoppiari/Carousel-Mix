import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BrandFormSchema } from '../../carousel-core/schemas/carousel.schema';
import { useCarouselStore } from '../../../stores/carouselStore';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Slider } from '../../../components/ui/slider';
import { Button } from '../../../components/ui/button';
import { Upload } from 'lucide-react';

export const BrandForm: React.FC = () => {
  const { document, updateBrand } = useCarouselStore();

  const form = useForm({
    resolver: zodResolver(BrandFormSchema),
    defaultValues: {
      name: document?.brand.name || 'Your Brand',
      handle: document?.brand.handle || '@yourbrand',
      avatarUrl: document?.brand.avatarUrl || '',
      avatarOpacity: document?.brand.avatarOpacity || 100,
    },
  });

  const handleChange = (field: string, value: any) => {
    form.setValue(field as any, value);
    const values = form.getValues();
    updateBrand({
      name: values.name,
      handle: values.handle,
      avatarUrl: values.avatarUrl,
      avatarOpacity: values.avatarOpacity,
    });
  };

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="brand-name">Brand Name</Label>
        <Input
          id="brand-name"
          {...form.register('name')}
          placeholder="Your Brand"
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand-handle">Handle</Label>
        <Input
          id="brand-handle"
          {...form.register('handle')}
          placeholder="@yourbrand"
          onChange={(e) => handleChange('handle', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar-url">Avatar URL</Label>
        <div className="flex gap-2">
          <Input
            id="avatar-url"
            {...form.register('avatarUrl')}
            placeholder="https://example.com/avatar.png"
            onChange={(e) => handleChange('avatarUrl', e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Upload Avatar"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {form.watch('avatarUrl') && (
        <>
          <div className="space-y-2">
            <Label>Avatar Preview</Label>
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
              <img
                src={form.watch('avatarUrl')}
                alt="Avatar"
                className="w-full h-full object-cover"
                style={{ opacity: (form.watch('avatarOpacity') || 100) / 100 }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Avatar Opacity ({form.watch('avatarOpacity')}%)</Label>
            <Slider
              value={[form.watch('avatarOpacity') || 100]}
              onValueChange={([value]) => handleChange('avatarOpacity', value)}
              max={100}
              step={1}
            />
          </div>
        </>
      )}
    </form>
  );
};