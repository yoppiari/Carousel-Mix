import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TextStyleSelector from '@/components/TextStyleSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Sparkles, AlertCircle, Download, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCredit } from '@/contexts/CreditContext';
import carouselService from '@/services/carousel.service';

interface UploadedFile {
  file: File;
  preview: string;
}

interface SlideConfig {
  images: UploadedFile[];
  texts: string[];
  position: 'top' | 'center' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  style: string;
  fontSize: number;
}

const textStyles = [
  {
    value: 'modern',
    label: 'Modern (Tebal)',
    previewText: 'Modern (Tebal)',
    className: 'font-bold',
    dropdownClass: 'style-modern'
  },
  {
    value: 'tiktok',
    label: 'TikTok (Outline)',
    previewText: 'TIKTOK (OUTLINE)',
    className: 'font-black uppercase',
    dropdownClass: 'style-tiktok'
  },
  {
    value: 'instagram',
    label: 'Instagram (Latar)',
    previewText: 'Instagram (Latar)',
    className: 'font-medium',
    dropdownClass: 'style-instagram'
  },
  {
    value: 'elegant',
    label: 'Elegan (Tulisan Tangan)',
    previewText: 'Elegan (Tulisan Tangan)',
    className: 'italic',
    dropdownClass: 'style-elegant'
  },
  {
    value: 'classic',
    label: 'Classic (Serif)',
    previewText: 'Classic Text',
    className: 'font-serif font-bold',
    dropdownClass: 'style-classic'
  },
  {
    value: 'minimalist',
    label: 'Minimalist',
    previewText: 'minimalist text',
    className: 'font-light lowercase tracking-wider',
    dropdownClass: 'style-minimalist'
  },
  {
    value: 'y2k',
    label: 'Cyber Y2K',
    previewText: 'CYBER TEXT',
    className: 'font-bold uppercase',
    dropdownClass: 'style-y2k'
  },
  {
    value: 'kinetic',
    label: 'Kinetic (Motion)',
    previewText: 'KINETIC TEXT',
    className: 'font-black uppercase',
    dropdownClass: 'style-kinetic'
  },
  {
    value: 'sketch',
    label: 'Sketch (Personal)',
    previewText: 'Sketch Style',
    className: 'italic',
    dropdownClass: 'style-sketch'
  }
];

const defaultTexts = [
  "Selamat pagi!\nTips produktif hari ini\nInspirasi dari buku\nQuote motivasi\nFakta menarik",
  "Langkah pertama\nProses di balik layar\nData yang mendukung",
  "Studi kasus sukses\nManfaat utama produk\nDetail fitur A",
  "Kesalahan umum\nCara menghindari masalah\nSolusi cepat\nTips dari ahli\nChecklist penting",
  "Ajak diskusi di komentar!\nDaftar sekarang!\nKunjungi website kami",
  "Testimoni pelanggan\nBukti nyata hasil\nKisah sukses terbaru",
  "Promo spesial\nDiskon terbatas\nPenawaran eksklusif\nGratis ongkir",
  "Tutorial lengkap\nPanduan step-by-step\nTips dan trik\nCara mudah",
  "Before & After\nTransformasi nyata\nHasil yang memukau\nPerubahan signifikan",
  "Call to action\nHubungi kami sekarang\nDapatkan bonus\nJangan lewatkan!"
];

function BulkGeneratorPage() {
  const { projectId: urlProjectId } = useParams<{ projectId?: string }>();
  // Removed projectId state - using urlProjectId directly
  const [projectTitle, setProjectTitle] = useState('');
  const [slideCount, setSlideCount] = useState(3);
  const [slides, setSlides] = useState<SlideConfig[]>([]);
  const [setsToGenerate, setSetsToGenerate] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSlides, setPreviewSlides] = useState<any[]>([]);

  // Progress tracking states
  const [generationProgress, setGenerationProgress] = useState({
    current: 0,
    total: 0,
    isGenerating: false,
    estimatedTimeRemaining: 0,
    status: 'idle' as 'idle' | 'generating' | 'completed' | 'error'
  });

  // Download manager states
  const [generatedFiles, setGeneratedFiles] = useState<Array<{
    id: string;
    filename: string;
    status: 'pending' | 'downloading' | 'completed' | 'error';
    downloadUrl?: string;
    setNumber: number;
  }>>([]);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { credits } = useCredit();

  // Only use projectId from URL, not from localStorage
  // This ensures clicking "Bulk Generator" menu always starts fresh
  const effectiveProjectId = urlProjectId;

  // Store projectId in localStorage when available, clear when not present
  useEffect(() => {
    if (urlProjectId) {
      localStorage.setItem('currentBulkProjectId', urlProjectId);
      console.log('[BulkGenerator] Stored projectId in localStorage:', urlProjectId);
    } else {
      // Clear localStorage when accessing bulk generator without projectId
      localStorage.removeItem('currentBulkProjectId');
      console.log('[BulkGenerator] Cleared projectId from localStorage - starting fresh');
    }
  }, [urlProjectId]);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to use the Bulk Generator',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);

  // Removed syncing useEffect - using urlProjectId directly

  // Initialize slides or load project configuration
  useEffect(() => {
    const loadConfiguration = async () => {
      console.log('[BulkGenerator] Component mount with projectId:', effectiveProjectId);

      if (effectiveProjectId) {
        setIsLoadingProject(true);
        console.log('[BulkGenerator] Loading existing project:', effectiveProjectId);
        // Removed redundant setProjectId - we'll use urlProjectId directly
        try {
          // Load the project from backend
          const project = await carouselService.getProject(effectiveProjectId);

          // Parse the configuration
          let config;
          if (project.document) {
            config = project.document;
          } else if (project.content) {
            config = typeof project.content === 'string'
              ? JSON.parse(project.content)
              : project.content;
          }

          if (config) {
            // Load the configuration
            setProjectTitle(config.metadata?.title || '');
            setSlideCount(config.settings?.slideCount || 3);
            setSetsToGenerate(config.metadata?.setsToGenerate || 1);

            // Load slides configuration
            if (config.slides && Array.isArray(config.slides)) {
              const loadedSlides = config.slides.map((slide: any) => ({
                images: slide.mediaFiles?.map((file: any) => ({
                  preview: file.preview,
                  file: {
                    name: file.name,
                    type: file.type,
                    size: file.size
                  }
                })) || [],
                texts: slide.texts || [],
                position: slide.textConfig?.position || 'center',
                alignment: slide.textConfig?.alignment || 'center',
                style: slide.textConfig?.style || 'modern',
                fontSize: slide.textConfig?.fontSize || 16
              }));

              // Ensure we have at least 10 slides
              while (loadedSlides.length < 10) {
                loadedSlides.push({
                  images: [],
                  texts: [],
                  position: 'center',
                  alignment: 'center',
                  style: 'modern',
                  fontSize: 16
                });
              }

              setSlides(loadedSlides);
            }
          }

          toast({
            title: 'Configuration Loaded',
            description: 'Bulk generator configuration has been loaded successfully',
          });
        } catch (error) {
          console.error('[BulkGenerator] Failed to load project:', error);
          // Phase 3: Error recovery - clear invalid projectId
          if (error.response?.status === 404) {
            localStorage.removeItem('currentBulkProjectId');
            toast({
              title: 'Project Not Found',
              description: 'The project could not be found. Starting fresh.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error',
              description: 'Failed to load configuration. Starting fresh.',
              variant: 'destructive',
            });
          }
          // Initialize with default slides if loading fails
          initializeDefaultSlides();
        } finally {
          setIsLoadingProject(false);
        }
      } else {
        // No projectId, initialize with default slides
        console.log('[BulkGenerator] No projectId - creating new project');
        initializeDefaultSlides();
      }
    };

    const initializeDefaultSlides = () => {
      const initialSlides: SlideConfig[] = [];
      for (let i = 0; i < 10; i++) {
        initialSlides.push({
          images: [],
          texts: defaultTexts[i]?.split('\n').filter(t => t.trim()) || [],
          position: 'center',
          alignment: 'center',
          style: 'modern',
          fontSize: 16
        });
      }
      setSlides(initialSlides);
    };

    loadConfiguration();
  }, [effectiveProjectId, toast]);

  // Calculate total combinations
  const calculateCombinations = () => {
    let total = 1;
    for (let i = 0; i < slideCount; i++) {
      const slide = slides[i];
      if (slide) {
        const imageCount = slide.images.length || 0;
        const textCount = slide.texts.filter(t => t.trim()).length || 0;
        if (imageCount > 0 && textCount > 0) {
          total *= (imageCount * textCount);
        } else {
          return 0;
        }
      }
    }
    return total;
  };

  const totalCombinations = calculateCombinations();
  const maxSets = totalCombinations; // Remove 100 limit - allow full possibilities
  const totalCost = setsToGenerate; // 1 credit per set
  const hasEnoughCredits = credits >= totalCost;
  const estimatedTime = Math.ceil(setsToGenerate / 10); // Estimate 10 sets per minute

  // Update setsToGenerate when totalCombinations changes
  useEffect(() => {
    if (totalCombinations > 0) {
      setSetsToGenerate(Math.min(setsToGenerate, totalCombinations));
    }
  }, [totalCombinations, setsToGenerate]);

  // Handle file upload
  const handleFileUpload = async (slideIndex: number, files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      newFiles.push({ file, preview });
    }

    const newSlides = [...slides];
    newSlides[slideIndex].images = [...newSlides[slideIndex].images, ...newFiles];
    setSlides(newSlides);
  };

  // Update slide config
  const updateSlideConfig = (index: number, field: keyof SlideConfig, value: any) => {
    const newSlides = [...slides];
    (newSlides[index] as any)[field] = value;
    setSlides(newSlides);
  };

  // Update texts from textarea
  const updateSlideTexts = (index: number, textValue: string) => {
    const texts = textValue.split('\n').filter(t => t.trim());
    updateSlideConfig(index, 'texts', texts);
  };

  // Generate random preview
  const generatePreview = () => {
    const previews = [];
    for (let i = 0; i < slideCount; i++) {
      const slide = slides[i];
      if (slide && slide.images.length > 0 && slide.texts.length > 0) {
        const randomImage = slide.images[Math.floor(Math.random() * slide.images.length)];
        const randomText = slide.texts[Math.floor(Math.random() * slide.texts.length)];
        previews.push({
          image: randomImage.preview,
          text: randomText,
          position: slide.position,
          alignment: slide.alignment,
          style: slide.style,
          fontSize: slide.fontSize
        });
      }
    }
    setPreviewSlides(previews);
    setShowPreview(true);
  };

  // Save project configuration
  const handleSave = async () => {
    if (!projectTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a project title first',
        variant: 'destructive',
      });
      return;
    }

    // Allow saving work-in-progress configurations
    // No need to check for complete configuration

    try {
      setIsSaving(true);
      console.log('[BulkGenerator] Starting save with projectId:', effectiveProjectId);

      // Prepare carousel configuration document
      const document = {
        metadata: {
          title: projectTitle,
          type: 'bulk',
          totalCombinations,
          maxSets,
          setsToGenerate,
          createdAt: new Date().toISOString()
        },
        settings: {
          width: 1080,
          height: 1080,
          slideCount
        },
        slides: slides.slice(0, slideCount).map((slide, index) => ({
          slideNumber: index + 1,
          mediaFiles: slide.images.map(img => ({
            preview: img.preview,
            name: img.file.name,
            type: img.file.type,
            size: img.file.size
          })),
          texts: slide.texts,
          textConfig: {
            position: slide.position,
            alignment: slide.alignment,
            style: slide.style,
            fontSize: slide.fontSize
          }
        }))
      };

      // Save or update project based on whether we have a projectId
      let response;
      if (urlProjectId) {
        // Update existing project
        response = await carouselService.updateProject(urlProjectId, {
          title: projectTitle,
          document: document
        });
        toast({
          title: 'Success',
          description: 'Bulk generator configuration updated successfully',
        });
      } else {
        // Create new project
        console.log('[BulkGenerator] API call: CREATE new project');
        response = await carouselService.createProject({
          title: projectTitle,
          document: document
        });
        toast({
          title: 'Success',
          description: 'Bulk generator configuration saved successfully',
        });
      }

      // If we created a new project, update URL and localStorage
      if (!effectiveProjectId && response?.id) {
        console.log('[BulkGenerator] New project created with ID:', response.id);
        localStorage.setItem('currentBulkProjectId', response.id);
        navigate(`/bulk-generator/${response.id}`);
      } else {
        console.log('[BulkGenerator] Project updated successfully');
        // Navigate to projects page after update
        navigate('/projects');
      }
    } catch (error: any) {
      console.error('[BulkGenerator] Save failed:', error);
      // Phase 3: More detailed error handling
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save configuration';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle bulk generation
  const handleGenerate = async () => {
    if (!projectTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a project title first',
        variant: 'destructive',
      });
      return;
    }

    if (totalCombinations === 0) {
      toast({
        title: 'Error',
        description: 'Each active slide must have at least 1 image and 1 text',
        variant: 'destructive',
      });
      return;
    }

    if (!hasEnoughCredits) {
      toast({
        title: 'Insufficient Credits',
        description: `You need ${totalCost} credits but only have ${credits}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);

      // Initialize progress tracking
      setGenerationProgress({
        current: 0,
        total: setsToGenerate,
        isGenerating: true,
        estimatedTimeRemaining: Math.ceil(setsToGenerate / 10), // Estimate 10 sets per minute
        status: 'initializing'
      });

      // Initialize generated files array
      setGeneratedFiles(
        Array.from({ length: setsToGenerate }, (_, index) => ({
          id: `set-${index + 1}`,
          filename: `set-${index + 1}.zip`,  // Match backend's actual filename
          status: 'pending' as const,
          downloadUrl: '',
          setNumber: index + 1
        }))
      );

      // Prepare carousel settings for bulk generation
      const settings = {
        width: 1080,
        height: 1080,
        slideCount,
        slides: slides.slice(0, slideCount).map(slide => ({
          mediaFiles: slide.images.map(img => ({
            preview: img.preview,  // Include the base64 preview data
            name: img.file.name,
            type: img.file.type,
            size: img.file.size
          })),
          texts: slide.texts,
          textConfig: {
            position: slide.position,
            alignment: slide.alignment,
            style: slide.style,
            fontSize: slide.fontSize
          }
        }))
      };

      // Update status to generating
      setGenerationProgress(prev => ({
        ...prev,
        status: 'generating'
      }));

      // Use the correct field names for backend
      const response = await carouselService.generateBulk({
        title: projectTitle,
        settings: settings as any,
        count: setsToGenerate,
        format: 'png',
      });

      // Check if backend returned generated files
      if (response.generatedFiles && response.generatedFiles.length > 0) {
        // Use the real generated files from backend
        setGeneratedFiles(response.generatedFiles.map((file: any) => ({
          ...file,
          progress: 100,
          status: 'completed'
        })));

        // Update progress to complete
        setGenerationProgress({
          current: setsToGenerate,
          total: setsToGenerate,
          isGenerating: false,
          estimatedTimeRemaining: 0,
          status: 'completed'
        });

        setIsGenerating(false);
        toast({
          title: 'Generation Complete',
          description: `All ${setsToGenerate} carousel sets have been generated successfully!`,
        });
      } else {
        // Fallback: Simulate progress updates for demo
        const progressInterval = setInterval(() => {
          setGenerationProgress(prev => {
            if (prev.current < prev.total) {
              const newCurrent = prev.current + 1;
              const remainingTime = Math.ceil((prev.total - newCurrent) / 10);

              // Update corresponding file status (but don't override downloadUrl from backend)
              setGeneratedFiles(prevFiles =>
                prevFiles.map((file, index) =>
                  index === newCurrent - 1
                    ? {
                        ...file,
                        status: 'completed',
                        progress: 100
                        // Don't override downloadUrl - keep the one from backend response
                      }
                    : file
                )
              );

              // Check if this is the last item
              const isComplete = newCurrent === prev.total;

              // Clear interval and update state when complete
              if (isComplete) {
                clearInterval(progressInterval);
                setIsGenerating(false);
                toast({
                  title: 'Generation Complete',
                  description: `All ${prev.total} carousel sets have been generated successfully!`,
                });
              }

              return {
                ...prev,
                current: newCurrent,
                estimatedTimeRemaining: isComplete ? 0 : remainingTime,
                isGenerating: !isComplete,
                status: isComplete ? 'completed' : 'generating'
              };
            }

            return prev;
          });
        }, 2000); // Update every 2 seconds for demo
      }

      toast({
        title: 'Generation Started',
        description: `Started generating ${setsToGenerate} carousel sets`,
      });

    } catch (error: any) {
      console.error('Bulk generation failed:', error);
      setIsGenerating(false);
      setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        status: 'error'
      }));
      toast({
        title: 'Error',
        description: error.message || 'Failed to start carousel generation',
        variant: 'destructive',
      });
    }
  };

  // Show loading state while loading project
  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Bulk Generator</h1>
        <p className="text-muted-foreground mt-2">
          Create hundreds of unique carousel sets automatically from your prepared materials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input & Configuration */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>1. Input Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Title */}
              <div>
                <Label htmlFor="project-title">Project Title</Label>
                <Input
                  id="project-title"
                  placeholder="Enter project title"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Slide Count Selector */}
              <div>
                <Label htmlFor="slide-count">Number of Slides to Use</Label>
                <Select value={slideCount.toString()} onValueChange={(v) => setSlideCount(Number(v))}>
                  <SelectTrigger id="slide-count" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Slides</SelectItem>
                    <SelectItem value="4">4 Slides</SelectItem>
                    <SelectItem value="5">5 Slides</SelectItem>
                    <SelectItem value="6">6 Slides</SelectItem>
                    <SelectItem value="7">7 Slides</SelectItem>
                    <SelectItem value="8">8 Slides</SelectItem>
                    <SelectItem value="9">9 Slides</SelectItem>
                    <SelectItem value="10">10 Slides</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Slide Cards */}
              <div className="space-y-4">
                {slides.slice(0, slideCount).map((slide, index) => (
                  <Card
                    key={index}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Slide {index + 1}</CardTitle>
                        <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                          {slide.images.length} file{slide.images.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* File Upload */}
                      <div>
                        <Label>Upload Images/Videos</Label>
                        <label className="mt-1 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="mt-2 text-sm text-primary font-medium">
                            Choose files to upload
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*,video/*"
                            onChange={(e) => handleFileUpload(index, e.target.files)}
                          />
                        </label>
                        {/* Image Preview */}
                        {slide.images.length > 0 && (
                          <div className="mt-3 grid grid-cols-4 gap-2">
                            {slide.images.map((img, imgIndex) => (
                              <div key={imgIndex} className="relative aspect-square">
                                <img
                                  src={img.preview}
                                  alt={`Preview ${imgIndex + 1}`}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Text Options */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Label>Text Options (1 per line)</Label>
                          <span className="text-sm text-muted-foreground">
                            {slide.texts.length} text{slide.texts.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <Textarea
                          rows={4}
                          value={slide.texts.join('\n')}
                          onChange={(e) => updateSlideTexts(index, e.target.value)}
                          placeholder="Enter text, one per line"
                        />
                      </div>

                      {/* Text Settings */}
                      <div className="border-t pt-4 space-y-3">
                        <h5 className="font-semibold text-sm">Text Settings</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Position */}
                          <div>
                            <Label className="text-xs">Vertical Position</Label>
                            <Select
                              value={slide.position}
                              onValueChange={(v: any) => updateSlideConfig(index, 'position', v)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="top">Top</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="bottom">Bottom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Alignment */}
                          <div>
                            <Label className="text-xs">Text Alignment</Label>
                            <Select
                              value={slide.alignment}
                              onValueChange={(v: any) => updateSlideConfig(index, 'alignment', v)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Text Style */}
                        <div>
                          <Label className="text-xs">Text Style</Label>
                          <TextStyleSelector
                            value={slide.style}
                            onValueChange={(v) => updateSlideConfig(index, 'style', v)}
                            options={textStyles}
                            className="mt-1"
                          />
                        </div>

                        {/* Font Size */}
                        <div>
                          <Label className="text-xs">Font Size (px)</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              min={3}
                              max={48}
                              value={slide.fontSize}
                              onChange={(e) => updateSlideConfig(index, 'fontSize', Number(e.target.value))}
                              className="w-20 h-9"
                            />
                            <input
                              type="range"
                              min={3}
                              max={48}
                              value={slide.fontSize}
                              onChange={(e) => updateSlideConfig(index, 'fontSize', Number(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {slide.fontSize}px
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Output & Preview */}
        <div className="space-y-6">
          {/* Combination Summary */}
          <Card>
            <CardHeader>
              <CardTitle>2. Results & Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Combination Count */}
              <Alert className="border-primary">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-primary">
                      Potential Unique Combinations
                    </div>
                    <div className="text-3xl font-bold">
                      {totalCombinations.toLocaleString('id-ID')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Carousel sets can be generated.
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Generate Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={generatePreview}
                disabled={totalCombinations === 0}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Random Preview
              </Button>

              {/* Preview */}
              {showPreview && previewSlides.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Preview Results:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previewSlides.map((preview, index) => (
                      <div key={index} className="border rounded-lg p-2 bg-card">
                        <div className="relative aspect-square overflow-hidden rounded">
                          <img
                            src={preview.image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className={`preview-text pos-${preview.position} align-${preview.alignment} style-${preview.style}`}
                            style={{ fontSize: `${preview.fontSize}px` }}
                          >
                            {preview.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    Preview will appear here after you press the button.
                  </p>
                </div>
              )}

              {/* Cost Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cost Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span>Total Possible Sets:</span>
                      <span className="font-medium">
                        {totalCombinations.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Sets to Generate Input */}
                    {totalCombinations > 0 && (
                      <div className="space-y-4">
                        <Label className="text-sm">Sets to Generate (max {totalCombinations})</Label>

                        {/* Input Field with Quick Buttons */}
                        <div className="space-y-3">
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              min="1"
                              max={totalCombinations}
                              value={setsToGenerate}
                              onChange={(e) => {
                                const value = Math.min(Number(e.target.value) || 1, totalCombinations);
                                setSetsToGenerate(value);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter number of sets"
                            />
                          </div>

                          {/* Quick Selection Buttons */}
                          <div className="flex gap-1 flex-wrap">
                            {[10, 50, 100, 500].filter(num => num <= totalCombinations).map(num => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setSetsToGenerate(num)}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                              >
                                {num}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setSetsToGenerate(totalCombinations)}
                              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded text-blue-700 transition-colors"
                            >
                              All ({totalCombinations})
                            </button>
                          </div>

                          {/* Cost and Time Estimate */}
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Cost: <span className="font-medium">{totalCost} credits</span></div>
                            <div>Estimated time: <span className="font-medium">{estimatedTime} minutes</span></div>
                            {!hasEnoughCredits && (
                              <div className="text-red-600">⚠️ Insufficient credits (need {totalCost}, have {credits})</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-2 space-y-2">
                      <div className="flex justify-between">
                        <span>Credits per set:</span>
                        <span className="font-medium">1</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total Credits:</span>
                        <span>{totalCost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available Credits:</span>
                        <span className={hasEnoughCredits ? 'text-green-600' : 'text-destructive'}>
                          {credits}
                        </span>
                      </div>
                    </div>
                    {!hasEnoughCredits && totalCombinations > 0 && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-xs">
                          Insufficient credits!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {/* Save Button */}
                <Button
                  className="flex-1"
                  size="lg"
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving || !projectTitle.trim()}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </Button>

                {/* Generate Button */}
                <Button
                  className="flex-1"
                  size="lg"
                  variant="default"
                  onClick={handleGenerate}
                  disabled={isGenerating || !hasEnoughCredits || totalCombinations === 0 || !projectTitle.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate {setsToGenerate} Set{setsToGenerate !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>

              {/* Progress Tracking Section */}
              {(generationProgress.isGenerating || generationProgress.status === 'completed') && (
                <Card className={generationProgress.status === 'completed' ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {generationProgress.status === 'completed' ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          Generation Complete
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Generating Carousel Sets
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {generationProgress.current} of {generationProgress.total} sets</span>
                        <span>{Math.round((generationProgress.current / generationProgress.total) * 100)}%</span>
                      </div>
                      <Progress
                        value={(generationProgress.current / generationProgress.total) * 100}
                        className={generationProgress.status === 'completed' ? "bg-green-100" : ""}
                      />
                    </div>

                    {/* Status and Time Estimate */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={generationProgress.status === 'completed'
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"}
                        >
                          {generationProgress.status}
                        </Badge>
                      </div>
                      {generationProgress.estimatedTimeRemaining > 0 && generationProgress.status !== 'completed' && (
                        <span className="text-muted-foreground">
                          Est. {Math.ceil(generationProgress.estimatedTimeRemaining)} min remaining
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Download Manager Section */}
              {generatedFiles.length > 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Generated Sets ({generatedFiles.length})
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-100 hover:bg-green-200 border-green-300"
                        onClick={() => {
                          // Download all generated ZIP files
                          console.log('Download All clicked, files:', generatedFiles);

                          // Filter completed files with download URLs
                          const filesToDownload = generatedFiles.filter(
                            file => file.status === 'completed' && file.downloadUrl
                          );

                          // Download each file with delays to avoid browser blocking
                          filesToDownload.forEach((file, index) => {
                            setTimeout(() => {
                              console.log(`Downloading ${index + 1}/${filesToDownload.length}:`, file.filename);

                              // Create a temporary anchor element
                              const link = document.createElement('a');
                              link.href = file.downloadUrl!;
                              link.download = file.filename;
                              link.style.display = 'none';

                              // Append to body, click, and remove
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }, index * 500); // 500ms delay between each download
                          });

                          // Show notification if there are files to download
                          if (filesToDownload.length > 0) {
                            toast({
                              title: 'Downloads started',
                              description: `Downloading ${filesToDownload.length} ZIP files...`,
                            });
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download All ZIPs
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {generatedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{file.filename}</span>
                            <Badge
                              variant={file.status === 'completed' ? 'default' : 'secondary'}
                              className={
                                file.status === 'completed'
                                  ? 'bg-green-100 text-green-700 border-green-300'
                                  : file.status === 'generating'
                                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                                  : 'bg-gray-100 text-gray-700 border-gray-300'
                              }
                            >
                              {file.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            {file.status === 'generating' && (
                              <Progress value={file.progress} className="w-16 h-2" />
                            )}
                            {file.status === 'completed' && (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    console.log('Download clicked for:', file.filename);
                                    console.log('Download URL:', file.downloadUrl);

                                    if (file.downloadUrl) {
                                      // Use the downloadUrl directly from backend
                                      window.open(file.downloadUrl, '_blank');
                                    } else {
                                      // Fallback: construct download URL properly
                                      const link = document.createElement('a');
                                      link.href = `/api/carousel/downloads/${file.filename}`;
                                      link.download = file.filename;
                                      link.click();
                                    }
                                  }}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BulkGeneratorPage;