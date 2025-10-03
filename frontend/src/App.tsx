import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import { CarouselEditorPage } from '@/pages/CarouselEditorPage';
import BulkGeneratorPage from '@/pages/BulkGeneratorPage';
import ProjectsPage from '@/pages/ProjectsPage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/editor" replace />} />
          <Route path="editor" element={<CarouselEditorPage />} />
          <Route path="editor/:projectId" element={<CarouselEditorPage />} />
          <Route path="bulk-generator" element={<BulkGeneratorPage />} />
          <Route path="bulk-generator/:projectId" element={<BulkGeneratorPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
