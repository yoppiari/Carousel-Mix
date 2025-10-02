import React, { useState } from 'react';
import { useCarouselStore } from '../../../stores/carouselStore';
import { useUIStore } from '../../../stores/uiStore';
import { exportService } from '../services/ExportService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Slider } from '../../../components/ui/slider';
import { Switch } from '../../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import {
  FileImage,
  FileText,
  FileJson,
  Download,
  Loader2,
  AlertCircle,
  CreditCard,
} from 'lucide-react';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ open, onClose }) => {
  const { document } = useCarouselStore();
  const { addNotification } = useUIStore();

  const [exportType, setExportType] = useState<'image' | 'pdf' | 'json'>('image');
  const [imageFormat, setImageFormat] = useState<'png' | 'jpg'>('png');
  const [quality, setQuality] = useState(95);
  const [scale, setScale] = useState(2);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [exportAllSlides, setExportAllSlides] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const creditCosts = {
    image: 1,
    pdf: 2,
    json: 0,
  };

  const handleExport = async () => {
    if (!document) {
      addNotification({
        type: 'error',
        title: 'No Document',
        message: 'Please create or load a carousel document first',
        duration: 3000,
      });
      return;
    }

    setIsExporting(true);

    try {
      const options = {
        quality: quality / 100,
        scale,
        includeMetadata,
      };

      switch (exportType) {
        case 'image':
          if (exportAllSlides) {
            await exportService.exportAllSlidesAsImages(
              document,
              'carousel-export-container',
              imageFormat,
              options
            );
          } else {
            await exportService.exportAsImage(
              'carousel-export-container',
              imageFormat,
              options
            );
          }
          break;

        case 'pdf':
          await exportService.exportAsPDF(
            document,
            'carousel-export-container',
            options
          );
          break;

        case 'json':
          exportService.exportAsJSON(document);
          break;
      }

      addNotification({
        type: 'success',
        title: 'Export Successful',
        message: `Your carousel has been exported as ${exportType.toUpperCase()}`,
        duration: 3000,
      });

      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error instanceof Error ? error.message : 'An error occurred during export',
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Carousel</DialogTitle>
          <DialogDescription>
            Choose your export format and customize the output settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Type Selection */}
          <Tabs value={exportType} onValueChange={(v) => setExportType(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="image" className="gap-2">
                <FileImage className="h-4 w-4" />
                Image
              </TabsTrigger>
              <TabsTrigger value="pdf" className="gap-2">
                <FileText className="h-4 w-4" />
                PDF
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-2">
                <FileJson className="h-4 w-4" />
                JSON
              </TabsTrigger>
            </TabsList>

            {/* Image Export Options */}
            <TabsContent value="image" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <RadioGroup value={imageFormat} onValueChange={(v) => setImageFormat(v as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="png" id="png" />
                    <Label htmlFor="png">PNG (Higher quality, larger file)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="jpg" id="jpg" />
                    <Label htmlFor="jpg">JPG (Smaller file, good for photos)</Label>
                  </div>
                </RadioGroup>
              </div>

              {imageFormat === 'jpg' && (
                <div className="space-y-2">
                  <Label>Quality ({quality}%)</Label>
                  <Slider
                    value={[quality]}
                    onValueChange={([v]) => setQuality(v)}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Resolution Scale ({scale}x)</Label>
                <Slider
                  value={[scale]}
                  onValueChange={([v]) => setScale(v)}
                  min={1}
                  max={4}
                  step={0.5}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values produce sharper images but larger file sizes
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="export-all">Export All Slides Separately</Label>
                <Switch
                  id="export-all"
                  checked={exportAllSlides}
                  onCheckedChange={setExportAllSlides}
                />
              </div>
            </TabsContent>

            {/* PDF Export Options */}
            <TabsContent value="pdf" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Resolution Scale ({scale}x)</Label>
                <Slider
                  value={[scale]}
                  onValueChange={([v]) => setScale(v)}
                  min={1}
                  max={4}
                  step={0.5}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-metadata">Include Document Metadata</Label>
                <Switch
                  id="include-metadata"
                  checked={includeMetadata}
                  onCheckedChange={setIncludeMetadata}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  All slides will be included in the PDF as separate pages
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* JSON Export Options */}
            <TabsContent value="json" className="space-y-4 mt-4">
              <Alert>
                <FileJson className="h-4 w-4" />
                <AlertDescription>
                  Export your carousel as a JSON file that can be imported later.
                  This includes all slides, settings, and customizations.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Included in export:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All slides and elements</li>
                  <li>• Theme and color settings</li>
                  <li>• Brand information</li>
                  <li>• Font configurations</li>
                  <li>• Document settings</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {/* Credit Cost Display */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">Credit Cost:</span>
            </div>
            <span className="text-sm font-bold">
              {creditCosts[exportType]} {creditCosts[exportType] === 1 ? 'Credit' : 'Credits'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};