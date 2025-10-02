import { useState } from 'react';
import { Button } from '@/components/ui/button';

function EditorPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Carousel Editor</h1>
        <p className="text-gray-600 mt-2">Create beautiful carousels with AI assistance</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Canvas</h2>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500">Editor canvas will be here</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Controls</h2>
            <div className="space-y-4">
              <Button 
                className="w-full"
                onClick={() => setIsGenerating(!isGenerating)}
              >
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </Button>
              <p className="text-sm text-gray-500">Editor controls will be implemented here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;