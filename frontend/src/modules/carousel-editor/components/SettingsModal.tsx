import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { BrandForm } from '../forms/BrandForm';
import { ThemeForm } from '../forms/ThemeForm';
import { FontsForm } from '../forms/FontsForm';
import { DocumentSettingsForm } from '../forms/DocumentSettingsForm';
import { Palette, User, Type, Settings } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-xl font-semibold">Carousel Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="theme" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger
                value="brand"
                className="flex items-center gap-2 py-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Brand</span>
              </TabsTrigger>
              <TabsTrigger
                value="theme"
                className="flex items-center gap-2 py-2"
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Theme</span>
              </TabsTrigger>
              <TabsTrigger
                value="fonts"
                className="flex items-center gap-2 py-2"
              >
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">Fonts</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center gap-2 py-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Document</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <TabsContent value="brand" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold mb-1">Brand Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure your brand identity for the carousel
                  </p>
                </div>
                <BrandForm />
              </div>
            </TabsContent>

            <TabsContent value="theme" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold mb-1">Theme Colors</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customize the color scheme for your carousel
                  </p>
                </div>
                <ThemeForm />
              </div>
            </TabsContent>

            <TabsContent value="fonts" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold mb-1">Typography</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set font styles for titles, subtitles, and body text
                  </p>
                </div>
                <FontsForm />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold mb-1">Document Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure slide dimensions and display options
                  </p>
                </div>
                <DocumentSettingsForm />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};