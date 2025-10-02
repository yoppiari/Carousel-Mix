import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AIGenerationOptionsSchema } from '../../carousel-core/schemas/carousel.schema';
import { useCarouselStore } from '../../../stores/carouselStore';
import { useUIStore } from '../../../stores/uiStore';
import { creditService } from '../../../services/CreditService';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Slider } from '../../../components/ui/slider';
import { Switch } from '../../../components/ui/switch';
import { Sparkles, AlertCircle, Loader2, Coins } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';

const promptTemplates = [
  {
    name: 'Instagram Tips',
    prompt: 'Create an engaging Instagram carousel with 5 actionable tips about [topic]. Use emojis, vibrant colors, and short punchy text perfect for social media.',
  },
  {
    name: 'LinkedIn Professional',
    prompt: 'Create a professional LinkedIn carousel about [topic] that provides value to professionals. Include statistics, insights, and actionable advice.',
  },
  {
    name: 'Tutorial Steps',
    prompt: 'Create a step-by-step tutorial carousel showing how to [skill/process]. Make it visual, easy to follow, and social media friendly.',
  },
  {
    name: 'Before & After',
    prompt: 'Create a transformation carousel showing before and after results for [topic]. Include compelling visuals and inspiring copy.',
  },
  {
    name: 'Myth Busters',
    prompt: 'Create a myth-busting carousel that debunks common misconceptions about [topic]. Make it engaging and shareable.',
  },
  {
    name: 'Quick Facts',
    prompt: 'Create a fun facts carousel about [topic] with surprising and interesting information that people want to share.',
  },
  {
    name: 'Personal Story',
    prompt: 'Create a personal storytelling carousel about [experience/journey]. Make it relatable and authentic for social media.',
  },
  {
    name: 'Problem-Solution',
    prompt: 'Create a problem-solving carousel that identifies common [problem] and provides practical solutions. Perfect for adding value on social media.',
  },
];

export const AIPanel: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [hasEnoughCredits, setHasEnoughCredits] = useState(true);
  const { setDocument } = useCarouselStore();
  const { addNotification } = useUIStore();

  useEffect(() => {
    loadCreditBalance();
  }, []);

  const loadCreditBalance = async () => {
    try {
      const balance = await creditService.getBalance();
      setCreditBalance(balance.credits);
      setHasEnoughCredits(balance.credits >= 5);
    } catch (error) {
      console.error('Failed to load credit balance:', error);
    }
  };

  const form = useForm({
    resolver: zodResolver(AIGenerationOptionsSchema),
    defaultValues: {
      prompt: '',
      slideCount: 10,
      style: 'professional' as const,
      includeImages: false,
      language: 'en',
    },
  });

  const handleGenerate = async (data: any) => {
    setIsGenerating(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:3003/api/carousel/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to generate carousel');
      }

      const result = await response.json();

      // Check if we got slides in the response
      const slides = result.slides || (result.data && result.data.slides);
      const document = result.document || (result.data && result.data.document);

      if (slides && slides.length > 0) {
        // Create a new document with generated slides
        const newDocument = {
          id: Date.now().toString(),
          version: '1.0.0',
          metadata: {
            title: 'AI Generated Carousel',
            description: data.prompt,
            createdAt: new Date(),
            updatedAt: new Date(),
            author: 'AI',
            tags: ['ai-generated'],
          },
          slides: slides || [],
          settings: {
            showPageNumbers: true,
            pageNumberPosition: 'bottom-right' as const,
            slideSize: { width: 1200, height: 630, aspectRatio: '16:9' },
          },
          theme: {
            primary: '#3B82F6',
            secondary: '#8B5CF6',
            background: '#FFFFFF',
            text: '#1F2937',
            accent: '#F59E0B',
          },
          brand: {
            name: 'Your Brand',
            handle: '@yourbrand',
          },
          fonts: {
            title: { family: 'Inter', size: '48px', weight: '700' },
            subtitle: { family: 'Inter', size: '24px', weight: '500' },
            body: { family: 'Inter', size: '16px', weight: '400' },
          },
        };

        setDocument(newDocument as any);
        
        addNotification({
          type: 'success',
          title: 'Carousel Generated!',
          message: `Created ${slides.length} slides from your prompt`,
          duration: 5000,
        });

        // Reload credit balance
        loadCreditBalance();

        // Reset form
        form.reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: err instanceof Error ? err.message : 'An error occurred',
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const applyTemplate = (template: typeof promptTemplates[0]) => {
    form.setValue('prompt', template.prompt);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Credit Display */}
      <Alert>
        <Coins className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>AI generation costs 5 credits per carousel</span>
          {creditBalance !== null && (
            <span className="font-semibold">
              Balance: {creditBalance} credits
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Insufficient Credits Warning */}
      {!hasEnoughCredits && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Insufficient credits. You need at least 5 credits to generate a carousel.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
        {/* Prompt Templates */}
        <div className="space-y-2">
          <Label>Quick Templates</Label>
          <Select onValueChange={(value) => {
            const template = promptTemplates.find(t => t.name === value);
            if (template) applyTemplate(template);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template" />
            </SelectTrigger>
            <SelectContent>
              {promptTemplates.map((template) => (
                <SelectItem key={template.name} value={template.name}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <Label>Describe Your Carousel</Label>
          <Textarea
            {...form.register('prompt')}
            placeholder="E.g., Create an Instagram carousel with 7 tips for productivity that working professionals can use daily. Use engaging visuals and actionable advice."
            rows={4}
            className="resize-none"
          />
          {form.formState.errors.prompt && (
            <p className="text-sm text-red-500">
              {form.formState.errors.prompt.message}
            </p>
          )}
        </div>

        {/* Slide Count */}
        <div className="space-y-2">
          <Label>Number of Slides ({form.watch('slideCount')})</Label>
          <Slider
            value={[form.watch('slideCount') || 10]}
            onValueChange={([value]) => form.setValue('slideCount', value)}
            min={5}
            max={20}
            step={1}
          />
        </div>

        {/* Style Selection */}
        <div className="space-y-2">
          <Label>Visual Style</Label>
          <Select
            value={form.watch('style')}
            onValueChange={(value: any) => form.setValue('style', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="playful">Playful</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Include Images */}
        <div className="flex items-center justify-between">
          <Label htmlFor="include-images">Include AI Images</Label>
          <Switch
            id="include-images"
            checked={form.watch('includeImages')}
            onCheckedChange={(checked) => form.setValue('includeImages', checked)}
          />
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Generate Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isGenerating || !form.watch('prompt') || !hasEnoughCredits}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Carousel (5 Credits)
            </>
          )}
        </Button>
      </form>

      {/* Tips */}
      <div className="pt-4 border-t space-y-2">
        <h4 className="text-sm font-semibold">Tips for Better Social Media Carousels</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Be specific about your platform (Instagram, LinkedIn, etc.)</li>
          <li>• Mention your target audience (entrepreneurs, students, etc.)</li>
          <li>• Ask for engaging elements like emojis, hooks, and CTAs</li>
          <li>• Request actionable tips people can implement immediately</li>
          <li>• Specify the desired tone (inspirational, educational, fun)</li>
        </ul>
      </div>
    </div>
  );
};