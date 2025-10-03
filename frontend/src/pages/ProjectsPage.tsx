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
import { Package, Eye, Loader2, Trash2, Edit, Layers } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import projectService, { Project } from '@/services/project.service';
import { formatRelative, formatDate } from '@/lib/dateUtils';

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectType = (project: Project): 'bulk' | 'editor' => {
    // Check if project has document metadata indicating bulk type
    if (project.document?.metadata?.type === 'bulk') {
      return 'bulk';
    }
    // Parse content if it's a string
    if (typeof project.content === 'string') {
      try {
        const parsed = JSON.parse(project.content);
        if (parsed.metadata?.type === 'bulk') {
          return 'bulk';
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return 'editor';
  };

  const handleView = (project: Project) => {
    const projectType = getProjectType(project);
    if (projectType === 'bulk') {
      navigate(`/bulk-generator/${project.id}`);
    } else {
      navigate(`/editor/${project.id}`);
    }
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      setDeletingId(projectToDelete.id);
      setDeleteDialogOpen(false);

      await projectService.delete(projectToDelete.id);

      toast({
        title: 'Project Deleted',
        description: `"${projectToDelete.title}" has been deleted successfully`,
      });

      // Refresh the projects list
      fetchProjects();
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast({
        title: 'Delete Failed',
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
          {projects.map((project) => {
            const projectType = getProjectType(project);
            const isBulk = projectType === 'bulk';

            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <CardTitle className="text-lg truncate">{project.title}</CardTitle>
                    </div>
                    <Badge
                      variant={isBulk ? "secondary" : "default"}
                      className="ml-auto flex items-center gap-1"
                    >
                      {isBulk ? (
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
                    <span className="text-gray-700">{formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last edited:</span>
                    <span className="text-gray-700">{formatRelative(project.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={() => handleView(project)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Open
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
            );
          })}
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