import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Package, Download, Eye, Loader2, Trash2, Edit, Layers } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import carouselService, { CarouselProject } from '@/services/carousel.service';
import { formatRelativeTime, formatDateTime } from '@/lib/dateUtils';

function ProjectsPage() {
  const [projects, setProjects] = useState<CarouselProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<CarouselProject | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await carouselService.getProjects();
      setProjects(data);
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      toast({
        title: '❌ Error',
        description: error.message || 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (projectId: string) => {
    try {
      setDownloadingId(projectId);
      await carouselService.downloadProject(projectId);
      toast({
        title: '✅ Success',
        description: 'Project downloaded successfully',
      });
    } catch (error: any) {
      console.error('Download failed:', error);
      toast({
        title: '❌ Error',
        description: error.message || 'Failed to download project',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = (project: CarouselProject) => {
    if (project.type === 'bulk') {
      // Navigate to bulk generator for bulk projects
      navigate(`/bulk-generator/${project.id}`);
    } else {
      // Navigate to editor for regular projects
      navigate(`/editor/${project.id}`);
    }
  };

  const handleDeleteClick = (project: CarouselProject) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      setDeletingId(projectToDelete.id);
      setDeleteDialogOpen(false);

      await carouselService.deleteProject(projectToDelete.id);

      toast({
        title: '✅ Project Deleted',
        description: `"${projectToDelete.title}" has been deleted successfully`,
      });

      // Refresh the projects list
      fetchProjects();
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast({
        title: '❌ Delete Failed',
        description: error.message || 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <p className="text-gray-600 mt-2">View and manage your carousel projects</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-lg font-semibold mb-2">No projects yet</h2>
            <p className="text-gray-500 mb-4">Start creating your first carousel</p>
            <Button onClick={() => navigate('/editor')}>Create New Carousel</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <CardTitle className="text-lg truncate">{project.title}</CardTitle>
                  </div>
                  <Badge
                    variant={project.type === 'bulk' ? 'secondary' : 'default'}
                    className="ml-auto flex items-center gap-1"
                  >
                    {project.type === 'bulk' ? (
                      <>
                        <Layers className="h-3 w-3" />
                        Bulk
                      </>
                    ) : (
                      <>
                        <Edit className="h-3 w-3" />
                        Editor
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span>{formatDateTime(project.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last edited:</span>
                    <span>{formatDateTime(project.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Slides:</span>
                    <span>{project.slides}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Credits Used:</span>
                    <span>{project.creditsUsed}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleView(project)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownload(project.id)}
                    disabled={downloadingId === project.id}
                  >
                    {downloadingId === project.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClick(project)}
                    disabled={deletingId === project.id}
                  >
                    {deletingId === project.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ProjectsPage;