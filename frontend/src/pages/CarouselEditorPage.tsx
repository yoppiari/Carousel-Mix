import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MainNavigation } from '../components/MainNavigation';
import { EditorCanvas } from '../modules/carousel-editor/components/EditorCanvas';
import { SettingsModal } from '../modules/carousel-editor/components/SettingsModal';
import { AIPanel } from '../modules/carousel-ai/components/AIPanel';
import { ExportModal } from '../modules/carousel-export/components/ExportModal';
import { useCarouselStore } from '../stores/carouselStore';
import { useUIStore } from '../stores/uiStore';
import { projectService } from '../services/ProjectService';
import carouselService from '../services/carousel.service';
import { X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';

export const CarouselEditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const { toast } = useToast();
  const { document, createNewDocument, setDocument, isDirty } = useCarouselStore();
  const {
    rightPanelContent,
    modalContent,
    closeModal,
    setRightPanelContent,
  } = useUIStore();

  // Load project if projectId is provided, otherwise create new
  useEffect(() => {
    const loadProject = async () => {
      if (projectId) {
        try {
          // Load the project from backend
          const project = await carouselService.getProject(projectId);

          // Parse the content/settings to get the document
          let projectDocument;
          if (project.document) {
            projectDocument = project.document;
          } else if (project.settings) {
            projectDocument = project.settings;
          } else if (project.content) {
            projectDocument = typeof project.content === 'string'
              ? JSON.parse(project.content)
              : project.content;
          }

          if (projectDocument) {
            // Set the document in the store
            setDocument(projectDocument);
            // Store the projectId for future saves
            localStorage.setItem('currentProjectId', projectId);
          } else {
            throw new Error('No document data found in project');
          }
        } catch (error) {
          console.error('Failed to load project:', error);
          toast({
            title: '❌ Failed to load project',
            description: 'Creating a new project instead',
            variant: 'destructive',
          });
          // Create new document if loading fails
          createNewDocument('My Carousel Project');
          // Don't remove projectId - let user retry or explicitly navigate away
        }
      } else if (!document) {
        // No projectId and no existing document, create new
        createNewDocument('My Carousel Project');
        // Only clear if there's no projectId at all
        if (!projectId) {
          localStorage.removeItem('currentProjectId');
        }
      }
    };

    loadProject();
  }, [projectId]);

  // Auto-save functionality
  useEffect(() => {
    if (document && isDirty) {
      const currentProjectId = projectId || localStorage.getItem('currentProjectId');
      projectService.autoSave(currentProjectId, document);
    }
  }, [document, isDirty, projectId]);

  return (
    <div className="flex h-screen bg-background flex-col">
      {/* Main Navigation Bar */}
      <MainNavigation projectId={projectId} />

      {/* Main Content Area - Full Width */}
      <div className="flex-1 flex flex-col bg-muted/20">
        {/* Editor Canvas - Full Width */}
        <div className="flex-1 relative">
          <EditorCanvas />

          {/* Bottom AI Panel Integration */}
          {rightPanelContent === 'ai' && (
            <div className="absolute bottom-0 left-0 right-0 bg-background border-t max-h-96 overflow-y-auto z-50 shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  AI Generation
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightPanelContent(null)}
                  className="h-8 w-8"
                  title="Close AI Panel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <AIPanel />
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        open={modalContent === 'settings'}
        onClose={closeModal}
      />

      {/* Export Modal */}
      <ExportModal
        open={modalContent === 'export'}
        onClose={closeModal}
      />

      {/* Export Container for html-to-image */}
      <div id="carousel-export-container" className="hidden">
        {document && document.slides.map((slide) => (
          <div key={slide.id} className="slide-view">
            {/* This would be rendered properly for export */}
          </div>
        ))}
      </div>
    </div>
  );
};