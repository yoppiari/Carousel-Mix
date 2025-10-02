import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Download,
  Save,
  FileText,
  Loader2,
  Sparkles,
  Settings,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useCarouselStore } from '../stores/carouselStore';
import { useUIStore } from '../stores/uiStore';
import { projectService } from '../services/ProjectService';
import { ExportModal } from '../modules/carousel-export/components/ExportModal';
import { cn } from '../lib/utils';
import { useToast } from './ui/use-toast';

interface MainNavigationProps {
  className?: string;
  projectId?: string;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ className, projectId: propProjectId }) => {
  const { toast } = useToast();

  const {
    document,
    selectedSlideIndex,
    setSelectedSlide,
    saveProject,
    isDirty,
    markClean
  } = useCarouselStore();

  const {
    openModal,
    addNotification,
    toggleSidebar,
    setRightPanelContent
  } = useUIStore();

  const [projectName, setProjectName] = React.useState('My Carousel Project');
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const totalSlides = document?.slides.length || 0;

  // Sync project name with document metadata
  React.useEffect(() => {
    if (document?.metadata?.title) {
      setProjectName(document.metadata.title);
    }
  }, [document]);

  // Load projectId from prop or localStorage
  React.useEffect(() => {
    if (propProjectId) {
      setProjectId(propProjectId);
      localStorage.setItem('currentProjectId', propProjectId);
    } else {
      const storedProjectId = localStorage.getItem('currentProjectId');
      if (storedProjectId) {
        setProjectId(storedProjectId);
      } else {
        // No project ID from props or localStorage
        setProjectId(null);
      }
    }
  }, [propProjectId]);

  const handleSave = async () => {
    if (!document) return;

    setIsSaving(true);
    try {
      // Update document metadata with new name from input field
      const updatedDocument = {
        ...document,
        metadata: {
          ...document.metadata,
          title: projectName
        }
      };
      // Use projectId from state (which comes from props or localStorage)
      const savedProject = await projectService.saveProject(projectName, updatedDocument, projectId || undefined);

      // Store the project ID for future saves
      if (!projectId && savedProject.id) {
        setProjectId(savedProject.id);
        localStorage.setItem('currentProjectId', savedProject.id);
      }

      toast({
        title: '✅ Project Saved',
        description: 'Your carousel has been saved successfully',
      });

      // Mark as clean after successful save
      markClean();
    } catch (error) {
      toast({
        title: '❌ Save Failed',
        description: 'Could not save your project',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    openModal('export');
  };

  const handleAIGenerate = () => {
    setRightPanelContent('ai');
  };

  const handlePrevSlide = () => {
    if (selectedSlideIndex > 0) {
      setSelectedSlide(selectedSlideIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (selectedSlideIndex < totalSlides - 1) {
      setSelectedSlide(selectedSlideIndex + 1);
    }
  };

  return (
    <div
      className={cn(
        "flex h-14 items-center justify-between border-b bg-background px-6",
        className
      )}
    >
      {/* Left Section - Logo and Project Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span className="font-bold text-lg">Carousel Pro</span>
        </div>

        <div className="hidden md:block">
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="h-8 w-48"
            placeholder="Project name"
          />
        </div>
      </div>

      {/* Center Section - Slide Navigation */}
      <div className="hidden lg:flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevSlide}
          disabled={selectedSlideIndex === 0}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground px-2">
          Slide {selectedSlideIndex + 1} / {totalSlides}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextSlide}
          disabled={selectedSlideIndex >= totalSlides - 1}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAIGenerate}
          className="hidden md:flex"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          AI Generate
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => openModal('settings')}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};