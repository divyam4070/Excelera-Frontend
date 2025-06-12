import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { ExcelFile } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';

interface FileUploadProps {
  onFileUploaded: (file: ExcelFile) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError('');
    console.log('Starting file upload process for:', file.name);

    if (!user?._id) {
      console.error('Upload attempted without user authentication');
      setError('User not authenticated. Please log in.');
      setIsProcessing(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Sending file to server...');
      const response = await apiRequest<ExcelFile>(
        '/excel/upload',
        {
          method: 'POST',
          body: formData,
          isFormData: true,
        }
      );
      console.log('Server response:', response);

      if (!response._id) {
        throw new Error('Invalid response from server: missing file ID');
      }

      onFileUploaded(response);
      console.log('File upload completed successfully');

    } catch (err) {
      console.error('File upload error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to upload or process file. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [onFileUploaded, user?._id]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload Excel File</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          
          {isProcessing ? (
            <div>
              <p className="text-lg font-medium text-gray-600 mb-2">Processing file...</p>
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : isDragActive ? (
            <p className="text-lg text-blue-600">Drop the Excel file here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-600 mb-2">
                Drag & drop an Excel file here, or click to select
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports .xlsx and .xls files
              </p>
              <Button variant="outline">
                Choose File
              </Button>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
