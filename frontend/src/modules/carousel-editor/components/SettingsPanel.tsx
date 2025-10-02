import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { BrandForm } from '../forms/BrandForm';
import { ThemeForm } from '../forms/ThemeForm';
import { FontsForm } from '../forms/FontsForm';
import { DocumentSettingsForm } from '../forms/DocumentSettingsForm';
import { Palette, User, Type, Settings } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  return (
    <Tabs defaultValue="brand" className="w-full h-full flex flex-col">
      <div className="px-4 pt-2">
        <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1">
          <TabsTrigger value="brand" className="flex flex-col gap-1 h-12 text-xs">
            <User className="h-4 w-4" />
            Brand
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex flex-col gap-1 h-12 text-xs">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
        </TabsList>
        <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1 mt-2">
          <TabsTrigger value="fonts" className="flex flex-col gap-1 h-12 text-xs">
            <Type className="h-4 w-4" />
            Fonts
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex flex-col gap-1 h-12 text-xs">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto">
        <TabsContent value="brand" className="p-4 space-y-4 m-0">
          <div>
            <h3 className="text-sm font-semibold mb-4">Brand Settings</h3>
            <BrandForm />
          </div>
        </TabsContent>

        <TabsContent value="theme" className="p-4 space-y-4 m-0">
          <div>
            <h3 className="text-sm font-semibold mb-4">Theme Colors</h3>
            <ThemeForm />
          </div>
        </TabsContent>

        <TabsContent value="fonts" className="p-4 space-y-4 m-0">
          <div>
            <h3 className="text-sm font-semibold mb-4">Typography</h3>
            <FontsForm />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="p-4 space-y-4 m-0">
          <div>
            <h3 className="text-sm font-semibold mb-4">Document Settings</h3>
            <DocumentSettingsForm />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};