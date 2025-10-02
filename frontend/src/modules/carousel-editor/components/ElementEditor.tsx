import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Copy, X } from 'lucide-react';
import { useCarouselStore } from '../../../stores/carouselStore';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Slider } from '../../../components/ui/slider';
import { cn } from '../../../lib/utils';

const ElementFormSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  opacity: z.number().min(0).max(100).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

type ElementFormData = z.infer<typeof ElementFormSchema>;

interface ElementEditorProps {
  className?: string;
}

export const ElementEditor: React.FC<ElementEditorProps> = ({ className }) => {
  const {
    document,
    selectedSlideIndex,
    selectedElementId,
    updateElement,
    deleteElement,
    duplicateElement,
    selectElement,
  } = useCarouselStore();

  const selectedSlide = document?.slides[selectedSlideIndex];
  const selectedElement = selectedSlide?.elements.find(el => el.id === selectedElementId);

  const form = useForm<ElementFormData>({
    resolver: zodResolver(ElementFormSchema),
    defaultValues: {
      content: selectedElement?.content || '',
      fontSize: selectedElement?.style?.fontSize || '16px',
      fontWeight: selectedElement?.style?.fontWeight || 'normal',
      color: selectedElement?.style?.color || '#000000',
      backgroundColor: selectedElement?.style?.backgroundColor || '',
      textAlign: selectedElement?.style?.textAlign || 'left',
      opacity: selectedElement?.style?.opacity ? selectedElement.style.opacity * 100 : 100,
      x: selectedElement?.position?.x || 0,
      y: selectedElement?.position?.y || 0,
      width: selectedElement?.position?.width || 200,
      height: selectedElement?.position?.height || 100,
    },
  });

  React.useEffect(() => {
    if (selectedElement) {
      form.reset({
        content: selectedElement.content,
        fontSize: selectedElement.style?.fontSize || '16px',
        fontWeight: selectedElement.style?.fontWeight || 'normal',
        color: selectedElement.style?.color || '#000000',
        backgroundColor: selectedElement.style?.backgroundColor || '',
        textAlign: selectedElement.style?.textAlign || 'left',
        opacity: selectedElement.style?.opacity ? selectedElement.style.opacity * 100 : 100,
        x: selectedElement.position?.x || 0,
        y: selectedElement.position?.y || 0,
        width: selectedElement.position?.width || 200,
        height: selectedElement.position?.height || 100,
      });
    }
  }, [selectedElement, form]);

  const handleUpdate = (data: ElementFormData) => {
    if (!selectedElement || selectedElementId === null) return;

    updateElement(selectedSlideIndex, selectedElementId, {
      content: data.content,
      style: {
        ...selectedElement.style,
        fontSize: data.fontSize,
        fontWeight: data.fontWeight,
        color: data.color,
        backgroundColor: data.backgroundColor,
        textAlign: data.textAlign,
        opacity: data.opacity ? data.opacity / 100 : 1,
      },
      position: {
        x: data.x || 0,
        y: data.y || 0,
        width: data.width || 200,
        height: data.height || 100,
      },
    });
  };

  const handleDelete = () => {
    if (!selectedElementId) return;
    deleteElement(selectedSlideIndex, selectedElementId);
    selectElement(null);
  };

  const handleDuplicate = () => {
    if (!selectedElementId) return;
    duplicateElement(selectedSlideIndex, selectedElementId);
  };

  if (!selectedElement) {
    return (
      <div className={cn('p-4 border-l bg-muted/10', className)}>
        <div className="text-center text-sm text-muted-foreground">
          Select an element to edit its properties
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with Close Button */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <h3 className="text-sm font-semibold capitalize">
          {selectedElement.type} Properties
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDuplicate}
            className="h-8 w-8"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => selectElement(null)}
            className="h-8 w-8"
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">

        {/* Content Field */}
        <div className="space-y-2">
          <Label>Content</Label>
          {selectedElement.type === 'description' ? (
            <Textarea
              {...form.register('content')}
              placeholder="Enter content..."
              rows={4}
              onChange={(e) => {
                form.setValue('content', e.target.value);
                handleUpdate(form.getValues());
              }}
            />
          ) : (
            <Input
              {...form.register('content')}
              placeholder="Enter content..."
              onChange={(e) => {
                form.setValue('content', e.target.value);
                handleUpdate(form.getValues());
              }}
            />
          )}
        </div>

        {/* Text Alignment */}
        <div className="space-y-2">
          <Label>Text Alignment</Label>
          <Select
            value={form.watch('textAlign')}
            onValueChange={(value: 'left' | 'center' | 'right') => {
              form.setValue('textAlign', value);
              handleUpdate(form.getValues());
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label>Font Size</Label>
          <Input
            {...form.register('fontSize')}
            placeholder="e.g., 16px, 1.5rem"
            onChange={(e) => {
              form.setValue('fontSize', e.target.value);
              handleUpdate(form.getValues());
            }}
          />
        </div>

        {/* Font Weight */}
        <div className="space-y-2">
          <Label>Font Weight</Label>
          <Select
            value={form.watch('fontWeight')}
            onValueChange={(value) => {
              form.setValue('fontWeight', value);
              handleUpdate(form.getValues());
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="500">Medium</SelectItem>
              <SelectItem value="600">Semibold</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label>Text Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              {...form.register('color')}
              className="w-16 h-10 p-1"
              onChange={(e) => {
                form.setValue('color', e.target.value);
                handleUpdate(form.getValues());
              }}
            />
            <Input
              {...form.register('color')}
              placeholder="#000000"
              onChange={(e) => {
                form.setValue('color', e.target.value);
                handleUpdate(form.getValues());
              }}
            />
          </div>
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <Label>Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              {...form.register('backgroundColor')}
              className="w-16 h-10 p-1"
              onChange={(e) => {
                form.setValue('backgroundColor', e.target.value);
                handleUpdate(form.getValues());
              }}
            />
            <Input
              {...form.register('backgroundColor')}
              placeholder="transparent"
              onChange={(e) => {
                form.setValue('backgroundColor', e.target.value);
                handleUpdate(form.getValues());
              }}
            />
          </div>
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <Label>Opacity ({form.watch('opacity')}%)</Label>
          <Slider
            value={[form.watch('opacity') || 100]}
            onValueChange={([value]) => {
              form.setValue('opacity', value);
              handleUpdate(form.getValues());
            }}
            max={100}
            step={1}
          />
        </div>

        {/* Position & Size Controls */}
        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Position & Size</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">X Position</Label>
              <Input
                type="number"
                {...form.register('x', { valueAsNumber: true })}
                onChange={(e) => {
                  form.setValue('x', parseInt(e.target.value) || 0);
                  handleUpdate(form.getValues());
                }}
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Y Position</Label>
              <Input
                type="number"
                {...form.register('y', { valueAsNumber: true })}
                onChange={(e) => {
                  form.setValue('y', parseInt(e.target.value) || 0);
                  handleUpdate(form.getValues());
                }}
                className="h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                {...form.register('width', { valueAsNumber: true })}
                onChange={(e) => {
                  form.setValue('width', parseInt(e.target.value) || 200);
                  handleUpdate(form.getValues());
                }}
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                {...form.register('height', { valueAsNumber: true })}
                onChange={(e) => {
                  form.setValue('height', parseInt(e.target.value) || 100);
                  handleUpdate(form.getValues());
                }}
                className="h-8"
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};