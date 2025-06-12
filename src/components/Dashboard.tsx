import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExcelFile, Chart, SheetProcessedData, User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import FileUpload from './FileUpload';
import ChartGenerator from './ChartGenerator';
import { FileSpreadsheet, BarChart, Calendar, Eye, Trash2, Loader2, X, Download, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import Chart2D from './charts/Chart2D';
import Chart3D from './charts/Chart3D';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedFile, setSelectedFile] = useState<ExcelFile | null>(null);
  const [selectedChart, setSelectedChart] = useState<Chart | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const colorSchemes = {
    default: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'],
    neon: ['#00F5FF', '#FF1493', '#00FF00', '#FFD700', '#FF4500', '#8A2BE2'],
    ocean: ['#006994', '#0891b2', '#06b6d4', '#67e8f9', '#a7f3d0', '#34d399'],
    sunset: ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#118AB2', '#073B4C'],
    pastel: ['#FFB5BA', '#BFCFFF', '#98FB98', '#FFE4B5', '#DDA0DD', '#F0E68C']
  };

  const fetchFiles = useCallback(async () => {
    if (!isAuthenticated || !user?._id) return;
    console.log('Fetching files for user:', user._id);
    setIsLoadingFiles(true);
    try {
      const fetchedFiles = await apiRequest<ExcelFile[]>('/excel/files');
      console.log('Fetched files:', fetchedFiles);
      setFiles(fetchedFiles);
    } catch (error: any) {
      console.error('Failed to fetch Excel files:', error);
      toast({
        title: 'Error',
        description: `Failed to load files: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFiles(false);
    }
  }, [isAuthenticated, user?._id, toast]);

  const fetchCharts = useCallback(async () => {
    if (!isAuthenticated || !user?._id) return;
    setIsLoadingCharts(true);
    try {
      const fetchedCharts = await apiRequest<Chart[]>('/excel/graphs');
      console.log('Fetched charts:', fetchedCharts);
      setCharts(fetchedCharts);
    } catch (error: any) {
      console.error('Failed to fetch charts:', error);
      toast({
        title: 'Error',
        description: `Failed to load charts: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCharts(false);
    }
  }, [isAuthenticated, user?._id, toast]);

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    try {
      const fetchedUsers = await apiRequest<User[]>('/auth/users');
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast({
        title: 'Error',
        description: `Failed to load users: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  }, [isAuthenticated, user?.role, toast]);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      console.log('Initial data fetch for user:', user._id);
      fetchFiles();
      fetchCharts();
    }
  }, [isAuthenticated, user?._id, fetchFiles, fetchCharts]);

  const handleFileUploaded = async (uploadedFile: ExcelFile) => {
    console.log('File uploaded:', uploadedFile);
    try {
      // Add the uploaded file to the files list
      setFiles(prevFiles => [...prevFiles, uploadedFile]);
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
    } catch (error: any) {
      console.error('Error processing uploaded file:', error);
      toast({
        title: "Error",
        description: `Failed to process uploaded file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file and all its associated charts?')) {
      return;
    }
    try {
      await apiRequest(`/excel/files/${fileId}`, { method: 'DELETE' });
      toast({
        title: 'File Deleted',
        description: 'File and associated charts deleted successfully.',
      });
      setSelectedFile(null); // Deselect if the current file is deleted
      fetchFiles(); // Re-fetch files
      fetchCharts(); // Re-fetch charts as some might have been deleted
    } catch (error: any) {
      console.error('Failed to delete file:', error);
      toast({
        title: 'Error',
        description: `Failed to delete file: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Assume ChartGenerator will call this when a chart is saved
  const handleChartSaved = () => {
    console.log('Chart saved, refreshing charts list...');
    fetchCharts(); // Re-fetch charts to include the new one
    toast({
      title: 'Chart Saved',
      description: 'Your chart configuration has been saved.',
    });
  };

  // Get combined data, headers, and column types for the selected sheet of the selected file
  const getSelectedSheetData = (): SheetProcessedData | null => {
    if (!selectedFile || selectedFile.sheets.length === 0) return null;
    const firstSheet = selectedFile.sheets[0];
    return {
      sheetName: firstSheet.sheetName,
      data: firstSheet.data,
      headers: firstSheet.headers,
      columnTypes: firstSheet.columnTypes,
      rowCount: firstSheet.rowCount,
      columnCount: firstSheet.columnCount,
    };
  };

  const currentSheetData = getSelectedSheetData();
  const fileCharts = selectedFile ? charts.filter(chart => {
    console.log('Comparing chart fileId:', chart.fileId, 'with selected file id:', selectedFile._id);
    // Handle both string and ObjectId types by comparing string values
    const chartFileId = typeof chart.fileId === 'object' ? chart.fileId._id : chart.fileId;
    const selectedFileId = selectedFile._id.toString();
    return chartFileId === selectedFileId;
  }) : [];
  console.log('Filtered charts for current file:', fileCharts);

  const handleViewChart = async (chartId: string) => {
    try {
      console.log('Fetching chart with id:', chartId);
      const chart = await apiRequest<Chart>(`/excel/graphs/${chartId}`);
      console.log('Received chart:', chart);
      
      if (!chart.data) {
        throw new Error('Chart data is missing');
      }

      // Create the selected chart with the data from the response
      const selectedChart: Chart = {
        ...chart,
        config: {
          colorScheme: chart.config?.colorScheme || ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'],
          animationSpeed: chart.config?.animationSpeed || 0.5
        }
      };
     
      setSelectedChart(selectedChart);
    } catch (error: any) {
      console.error('View chart error details:', {
        error: error.message,
        stack: error.stack,
        status: error.status,
        response: error.response
      });
      toast({
        title: 'Error Viewing Chart',
        description: `Failed to load chart: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChart = async (chartId: string) => {
    if (!window.confirm('Are you sure you want to delete this chart?')) {
      return;
    }
    try {
      await apiRequest(`/excel/graphs/${chartId}`, { method: 'DELETE' });
      toast({
        title: 'Chart Deleted',
        description: 'Chart has been deleted successfully.',
      });
      setSelectedChart(null); // Close modal if open
      fetchCharts(); // Refresh charts list
    } catch (error: any) {
      console.error('Failed to delete chart:', error);
      toast({
        title: 'Error',
        description: `Failed to delete chart: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Filter files and charts based on user role
  const userFiles = files.filter(file => {
    if (user?.role === 'admin') {
      // For admin, show all files
      return true;
    }
    // For regular users, show their own files
    return (file.user === user?._id || file.userId === user?._id);
  });

  const userCharts = charts.filter(chart => {
    if (user?.role === 'admin') {
      // For admin, show all charts
      return true;
    }
    // For regular users, show their own charts
    return (chart.user === user?._id || chart.userId === user?._id);
  });

  const handleDownloadPDF = async (chartContainer: HTMLElement | null) => {
    if (!chartContainer || !selectedChart) {
      toast({
        title: "Error",
        description: "No chart available for download",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Processing",
        description: "Preparing your chart for download...",
      });

      // Wait longer for 3D charts to fully render
      const renderDelay = selectedChart.type === '3d' ? 2000 : 1000;
      await new Promise(resolve => setTimeout(resolve, renderDelay));

      let canvas;
      if (selectedChart.type === '3d') {
        // For 3D charts, get the WebGL canvas
        const webglCanvas = chartContainer.querySelector('canvas');
        if (!webglCanvas) {
          throw new Error('3D chart canvas not found');
        }

        // Create a new canvas with larger dimensions for better quality
        canvas = document.createElement('canvas');
        canvas.width = webglCanvas.width * 2;  // Double the size for better quality
        canvas.height = webglCanvas.height * 2;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get 2D context');
        }

        // Set white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Scale up the context for better quality
        ctx.scale(2, 2);
        
        // Draw the WebGL canvas content
        ctx.drawImage(webglCanvas, 0, 0);
      } else {
        // For 2D charts, use html2canvas with improved settings
        canvas = await html2canvas(chartContainer, {
          useCORS: true,
          allowTaint: true,
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          width: chartContainer.offsetWidth,
          height: chartContainer.offsetHeight,
          onclone: (clonedDoc) => {
            const clonedContainer = clonedDoc.querySelector('#chart-container') as HTMLElement;
            if (clonedContainer) {
              clonedContainer.style.width = `${chartContainer.offsetWidth}px`;
              clonedContainer.style.height = `${chartContainer.offsetHeight}px`;
              // Ensure axes are visible
              const axes = clonedContainer.querySelectorAll('.axis');
              axes.forEach((axis: HTMLElement) => {
                axis.style.visibility = 'visible';
                axis.style.opacity = '1';
              });
            }
          }
        });
      }

      if (!canvas) {
        throw new Error('Failed to create canvas');
      }

      // Create PDF with proper dimensions and margins
      const imgData = canvas.toDataURL('image/png', 1.0);
      const margin = 20; // Add margins for better appearance
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width + (margin * 2), canvas.height + (margin * 2)]
      });

      // Add the chart image with margins
      pdf.addImage(imgData, 'PNG', margin, margin, canvas.width, canvas.height);

      // Save the PDF
      pdf.save(`${selectedChart.title}-${Date.now()}.pdf`);

      toast({
        title: "Success",
        description: "Chart downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading chart:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download chart",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Admin Panel Link for admin users */}
      {user?.role === 'admin' && (
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="outline" className="w-full sm:w-auto">
              <Shield className="h-4 w-4 mr-2" />
              Open Admin Panel
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileSpreadsheet className="h-8 w-8 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-2xl font-bold truncate">
                  {isLoadingFiles ? <Loader2 className="h-6 w-6 animate-spin" /> : userFiles.length}
                </p>
                <p className="text-sm text-gray-600">Your Excel Files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <BarChart className="h-8 w-8 text-green-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-2xl font-bold truncate">
                  {isLoadingCharts ? <Loader2 className="h-6 w-6 animate-spin" /> : userCharts.length}
                </p>
                <p className="text-sm text-gray-600">Your Generated Charts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-purple-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-2xl font-bold truncate">{isAuthenticated ? 'Active' : 'Inactive'}</p>
                <p className="text-sm text-gray-600">Account Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!selectedFile && <FileUpload onFileUploaded={handleFileUploaded} />}

      {selectedFile ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg sm:text-xl break-all">Analyzing: {selectedFile.fileName}</CardTitle>
              <Button variant="outline" onClick={() => setSelectedFile(null)} className="w-full sm:w-auto">
                Back to Files
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Total Sheets</p>
                  <p className="text-lg font-semibold">{selectedFile.totalSheets}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Rows (1st sheet)</p>
                  <p className="text-lg font-semibold">{selectedFile.sheets[0]?.rowCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Columns (1st sheet)</p>
                  <p className="text-lg font-semibold">{selectedFile.sheets[0]?.columnCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upload Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(selectedFile.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Available Columns (1st sheet):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFile.sheets[0]?.headers.map(column => (
                    <Badge key={column} variant="secondary" className="break-all">{column}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <ChartGenerator file={selectedFile} sheetData={selectedFile.sheets[0]} onChartSaved={handleChartSaved} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart className="h-5 w-5 text-green-600" />
                <span className="break-all">Charts for {selectedFile.fileName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userCharts.filter(chart => {
                const chartFileId = typeof chart.fileId === 'object' ? chart.fileId._id : chart.fileId;
                const selectedFileId = selectedFile._id.toString();
                return chartFileId === selectedFileId;
              }).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No charts generated for this file yet.</p>
                  <p>Generate a chart above to save and view it here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userCharts
                    .filter(chart => {
                      const chartFileId = typeof chart.fileId === 'object' ? chart.fileId._id : chart.fileId;
                      const selectedFileId = selectedFile._id.toString();
                      return chartFileId === selectedFileId;
                    })
                    .map(chart => (
                      <Card key={chart._id} className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-md break-all">{chart.title}</CardTitle>
                          <p className="text-sm text-gray-500">Type: {chart.chartType}</p>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex flex-col gap-1 w-full sm:w-auto">
                            <span className="break-all">X: {chart.xAxis}</span>
                            <span className="break-all">Y: {chart.yAxis}</span>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewChart(chart._id)}
                              className="text-blue-600 hover:text-blue-800 w-full sm:w-auto"
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteChart(chart._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Excel Files</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingFiles ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading your Excel files...</p>
              </div>
            ) : userFiles.length === 0 ? (
              <div className="text-center py-8">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No Excel files uploaded yet</p>
                <p className="text-sm text-gray-500">Upload your first Excel file to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userFiles.map(file => (
                  <Card key={file._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-8 w-8 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-medium break-all">{file.fileName}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.sheets[0] ? `${file.sheets[0].rowCount} rows • ${file.sheets[0].columnCount} columns` : 'N/A rows • N/A columns'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                            onClick={() => setSelectedFile(file)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Analyze
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chart View Modal */}
      {selectedChart && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5" />
              <span>{selectedChart.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={chartContainerRef}
              id="chart-container" 
              className="min-h-[300px] sm:h-[400px] w-full relative"
            >
              {selectedChart.type === '3d' ? (
                <Chart3D
                  data={selectedChart.data || []}
                  xAxis={selectedChart.xAxis}
                  yAxis={selectedChart.yAxis}
                  colorScheme={selectedChart.config?.colorScheme}
                  animationSpeed={selectedChart.config?.animationSpeed}
                />
              ) : (
                <Chart2D
                  data={selectedChart.data || []}
                  xAxis={selectedChart.xAxis}
                  yAxis={selectedChart.yAxis}
                  chartType={selectedChart.chartType as 'bar' | 'line' | 'pie' | 'scatter'}
                  colorScheme={selectedChart.config?.colorScheme}
                  animationSpeed={selectedChart.config?.animationSpeed}
                />
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Sheet: {selectedChart.sheetName}</p>
              <p>Created: {new Date(selectedChart.updatedAt).toLocaleString()}</p>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => handleDownloadPDF(chartContainerRef.current)}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedChart(null)}
                className="flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
