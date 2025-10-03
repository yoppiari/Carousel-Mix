import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import { CarouselEditorPage } from '@/pages/CarouselEditorPage';
import BulkGeneratorPage from '@/pages/BulkGeneratorPage';
import ProjectsPage from '@/pages/ProjectsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/bulk-generator" replace />} />
          <Route path="editor" element={<CarouselEditorPage />} />
          <Route path="editor/:projectId" element={<CarouselEditorPage />} />
          <Route path="bulk-generator" element={<BulkGeneratorPage />} />
          <Route path="bulk-generator/:projectId" element={<BulkGeneratorPage />} />
          <Route path="projects" element={<ProjectsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
