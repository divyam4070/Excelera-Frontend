import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ExcelFile, Chart, SheetProcessedData } from '@/types';
import Chart2D from './charts/Chart2D';
import Chart3D from './charts/Chart3D';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Download, RefreshCw, Eye, EyeOff, Palette, Zap, Camera, Save, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/lib/api';
import { Input } from '@/components/ui/input';

interface ChartGeneratorProps {
  file: ExcelFile;
  sheetData: SheetProcessedData;
  onChartSaved: () => void;
}

const ChartGenerator: React.FC<ChartGeneratorProps> = ({ file, sheetData, onChartSaved }) => {
  const [chartType, setChartType] = useState<'2d' | '3d'>('2d');
  const [chart2DType, setChart2DType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [generatedChart, setGeneratedChart] = useState<Chart | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([0.5]);
  const [colorScheme, setColorScheme] = useState<keyof typeof colorSchemes>('default');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chartTitle, setChartTitle] = useState('New Chart');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart3DRef = useRef<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const colorSchemes: Record<string, string[]> = {
    default: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'],
    neon: ['#00F5FF', '#FF1493', '#00FF00', '#FFD700', '#FF4500', '#8A2BE2'],
    ocean: ['#006994', '#0891b2', '#06b6d4', '#67e8f9', '#a7f3d0', '#34d399'],
    sunset: ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#118AB2', '#073B4C'],
    pastel: ['#FFB5BA', '#BFCFFF', '#98FB98', '#FFE4B5', '#DDA0DD', '#F0E68C']
  };

  const numericColumns = sheetData.headers.filter(col => {
    const sample = sheetData.data[0]?.[col];
    return !isNaN(Number(sample));
  });

  const handleGenerateChart = () => {
    if (!xAxis || !yAxis) {
      toast({
        title: "Missing Selection",
        description: "Please select both X and Y axis columns",
        variant: "destructive",
      });
      return;
    }

    const tempChart: Chart = {
      _id: `preview-${Date.now()}`,
      fileId: file._id,
      fileName: file.fileName,
      sheetName: sheetData.sheetName,
      type: chartType,
      chartType: chartType === '3d' ? '3d-column' : chart2DType,
      xAxis,
      yAxis,
      title: chartTitle,
      config: { 
        colorScheme: colorSchemes[colorScheme] || colorSchemes['default'],
        animationSpeed: animationSpeed[0] 
      },
      isPublic: false,
      tags: [],
      createdAt: new Date().toISOString(),
      userId: user?._id || ''
    };
    setGeneratedChart(tempChart);

    toast({
      title: "Chart Generated",
      description: `${chartType.toUpperCase()} chart created with ${colorScheme} theme!`,
    });
  };

  const handleSaveChart = async () => {
    if (!generatedChart) {
      toast({
        title: "No Chart to Save",
        description: "Please generate a chart first.",
        variant: "destructive",
      });
      return;
    }

    if (!user?._id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save charts.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const chartToSave = {
        title: chartTitle || 'Untitled Chart',
        type: chartType,
        chartType: chartType === '3d' ? '3d-column' : chart2DType,
        data: sheetData.data,
        config: {
          colorScheme: colorSchemes[colorScheme] || colorSchemes['default'],
          animationSpeed: animationSpeed[0] || 0.5
        },
        sheetName: sheetData.sheetName,
        fileId: file._id,
        xAxis,
        yAxis,
        user: user._id
      };

      console.log('Saving chart:', chartToSave);

      const savedChart = await apiRequest('/excel/save-graph', {
        method: 'POST',
        body: JSON.stringify(chartToSave),
      });

      console.log('Chart saved successfully:', savedChart);

      // Notify parent component to refresh charts list BEFORE clearing the form
      onChartSaved();

      toast({
        title: "Success",
        description: `${chartToSave.title} has been saved successfully.`,
      });
      
      // Clear the form after notifying parent
      setChartTitle('New Chart');
      setXAxis('');
      setYAxis('');
      setGeneratedChart(null);

    } catch (error: any) {
      console.error('Error saving chart:', error);
      toast({
        title: "Save Failed",
        description: error.message || 'Failed to save chart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadChart = async (format: 'png' | 'pdf') => {
    if (!chartContainerRef.current || !generatedChart) {
      toast({
        title: "Error",
        description: "No chart available for download",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    try {
      const chartContainer = chartContainerRef.current;
      
      // Wait for any animations to complete and ensure labels are visible
      await new Promise(resolve => setTimeout(resolve, 1000));

      let canvas;
      if (chartType === '3d') {
        // For 3D charts, get the WebGL canvas
        const webglCanvas = chartContainer.querySelector('canvas');
        if (!webglCanvas) {
          throw new Error('3D canvas not found');
        }

        // Create a new canvas with the same dimensions
        canvas = document.createElement('canvas');
        const scale = 2; // Higher resolution
        canvas.width = webglCanvas.width * scale;
        canvas.height = webglCanvas.height * scale;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.scale(scale, scale);
          
          // Set white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the WebGL canvas
          ctx.drawImage(webglCanvas, 0, 0);

          // Get all HTML labels
          const labels = chartContainer.querySelectorAll('.axis-label, .category-label, .value-label');
          labels.forEach((label: HTMLElement) => {
            const rect = label.getBoundingClientRect();
            const containerRect = chartContainer.getBoundingClientRect();
            
            // Calculate relative position
            const x = (rect.left - containerRect.left) * scale;
            const y = (rect.top - containerRect.top) * scale;
            
            // Draw label background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(x, y, rect.width * scale, rect.height * scale);
            
            // Draw label text
            ctx.font = `${parseInt(window.getComputedStyle(label).fontSize) * scale}px Arial`;
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(label.textContent || '', x + 4, y + 4);
          });

          // Add chart title
          ctx.font = `bold ${24 * scale}px Arial`;
          ctx.fillStyle = '#333333';
          ctx.textAlign = 'center';
          ctx.fillText(chartTitle, canvas.width / 2, 40 * scale);
        }
      } else {
        // For 2D charts, use html2canvas with specific settings
        const scale = 2; // Higher resolution
        canvas = await html2canvas(chartContainer, {
          useCORS: true,
          allowTaint: true,
          scale: scale,
          backgroundColor: '#ffffff',
          logging: false,
          width: chartContainer.offsetWidth,
          height: chartContainer.offsetHeight,
          onclone: (clonedDoc) => {
            const clonedContainer = clonedDoc.querySelector('.chart-container') as HTMLElement;
            if (clonedContainer) {
              clonedContainer.style.height = `${chartContainer.offsetHeight}px`;
              
              // Make all labels visible in the clone
              const labels = clonedContainer.querySelectorAll(
                '.recharts-text, .recharts-label, .recharts-cartesian-axis-tick-value, ' +
                '.axis-label, .category-label, .value-label'
              );
              labels.forEach((label: HTMLElement) => {
                label.style.opacity = '1';
                label.style.visibility = 'visible';
                label.style.display = 'block';
                // Ensure text color is dark for visibility
                label.style.fill = '#333333';
                label.style.color = '#333333';
                label.style.fontSize = '14px';
                if (label.classList.contains('recharts-label')) {
                  label.style.fontSize = '16px';
                  label.style.fontWeight = 'bold';
                }
              });

              // Ensure axis lines are visible
              const axisLines = clonedContainer.querySelectorAll(
                '.recharts-cartesian-axis-line, .recharts-cartesian-grid-horizontal, ' +
                '.recharts-cartesian-grid-vertical'
              );
              axisLines.forEach((line: SVGElement) => {
                line.style.opacity = '1';
                line.style.stroke = '#666666';
                line.style.strokeWidth = '1';
              });

              // Make axis titles more prominent
              const axisTitles = clonedContainer.querySelectorAll('.recharts-label');
              axisTitles.forEach((title: SVGElement) => {
                title.style.fontWeight = 'bold';
                title.style.fontSize = '16px';
              });
            }
          }
        });
      }

      if (!canvas) {
        throw new Error('Failed to capture chart');
      }

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `chart-${chartType}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download Complete",
          description: `${chartType.toUpperCase()} Chart saved as PNG successfully!`,
        });
      } else {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`chart-${chartType}-${Date.now()}.pdf`);
        
        toast({
          title: "Download Complete",
          description: `${chartType.toUpperCase()} Chart saved as PDF successfully!`,
        });
      }
    } catch (error) {
      console.error('Error downloading chart:', error);
      toast({
        title: "Download Failed", 
        description: "Failed to capture chart. Please ensure the chart is fully loaded and try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  React.useEffect(() => {
    if (autoRefresh && generatedChart) {
      const interval = setInterval(() => {
        handleGenerateChart();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, generatedChart, handleGenerateChart]);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="break-all">{file.fileName}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                id="auto-refresh"
              />
              <Label htmlFor="auto-refresh" className="text-sm">Auto Refresh</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="animate-pulse-glow"
            >
              <Zap className="h-4 w-4 mr-1" />
              Advanced
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Chart Dimension</Label>
            <Select value={chartType} onValueChange={(value: '2d' | '3d') => setChartType(value)}>
              <SelectTrigger className="hover:border-blue-400 transition-all duration-200 hover:shadow-md">
                <SelectValue placeholder="Select dimension" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2d">2D Charts</SelectItem>
                <SelectItem value="3d">3D Charts ✨</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {chartType === '2d' && (
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select value={chart2DType} onValueChange={(value: 'bar' | 'line' | 'pie' | 'scatter') => setChart2DType(value)}>
                <SelectTrigger className="hover:border-blue-400 transition-all duration-200 hover:shadow-md">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>X-Axis (Category)</Label>
            <Select value={xAxis} onValueChange={setXAxis}>
              <SelectTrigger className="hover:border-blue-400 transition-all duration-200 hover:shadow-md">
                <SelectValue placeholder="Select X-Axis column" />
              </SelectTrigger>
              <SelectContent>
                {sheetData.headers.map(header => (
                  <SelectItem key={header} value={header}>{header}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Y-Axis (Value)</Label>
            <Select value={yAxis} onValueChange={setYAxis}>
              <SelectTrigger className="hover:border-blue-400 transition-all duration-200 hover:shadow-md">
                <SelectValue placeholder="Select Y-Axis column" />
              </SelectTrigger>
              <SelectContent>
                {numericColumns.map(header => (
                  <SelectItem key={header} value={header}>{header}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="space-y-2">
              <Label>Chart Title</Label>
              <Input
                type="text"
                placeholder="Enter chart title"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <Select 
                value={colorScheme} 
                onValueChange={(value: string) => setColorScheme(value as keyof typeof colorSchemes)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color scheme" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(colorSchemes).map(scheme => (
                    <SelectItem key={scheme} value={scheme}>
                      {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-full">
              <Label>Animation Speed</Label>
              <Slider
                defaultValue={[0.5]}
                max={2}
                step={0.1}
                value={animationSpeed}
                onValueChange={setAnimationSpeed}
                className="w-full"
              />
              <div className="text-right text-sm text-gray-500">{animationSpeed[0].toFixed(1)}x</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={handleGenerateChart} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            <BarChart className="h-4 w-4 mr-2" />
            Generate Chart
          </Button>
          <Button 
            onClick={handleSaveChart} 
            className="w-full bg-green-500 hover:bg-green-600 transition-colors duration-200 shadow-lg" 
            disabled={isSaving || !generatedChart}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Chart'}
          </Button>
          <Button 
            onClick={() => handleDownloadChart('png')} 
            className="w-full bg-gray-500 hover:bg-gray-600 transition-colors duration-200 shadow-lg" 
            disabled={isDownloading || !generatedChart}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'PNG'}
          </Button>
          <Button 
            onClick={() => handleDownloadChart('pdf')} 
            className="w-full bg-gray-500 hover:bg-gray-600 transition-colors duration-200 shadow-lg" 
            disabled={isDownloading || !generatedChart}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'PDF'}
          </Button>
        </div>

        {generatedChart && (
          <Card className="mt-6 border shadow-inner transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold truncate">{generatedChart.title}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </CardHeader>
            {showPreview && (
              <CardContent className="min-h-[300px] sm:h-[400px] w-full relative" ref={chartContainerRef}>
                {generatedChart.type === '2d' ? (
                  <Chart2D 
                    data={sheetData.data} 
                    xAxis={generatedChart.xAxis} 
                    yAxis={generatedChart.yAxis} 
                    chartType={generatedChart.chartType as 'bar' | 'line' | 'pie' | 'scatter'} 
                    colorScheme={colorSchemes[colorScheme]}
                    animationSpeed={animationSpeed[0]}
                  />
                ) : (
                  <Chart3D 
                    data={sheetData.data} 
                    xAxis={generatedChart.xAxis} 
                    yAxis={generatedChart.yAxis} 
                    animationSpeed={animationSpeed[0]} 
                    colorScheme={colorSchemes[colorScheme]}
                  />
                )}
              </CardContent>
            )}
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartGenerator;
