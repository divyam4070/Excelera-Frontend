import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, ExcelFile, Chart } from '@/types';
import { Users, FileSpreadsheet, BarChart, Shield, Trash2, Check, X, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
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
  };

  const fetchPendingUsers = async () => {
    setIsLoading(true);
    try {
      const users = await apiRequest<User[]>('/auth/pending-users');
      setPendingUsers(users);
    } catch (error: any) {
      console.error('Failed to fetch pending users:', error);
      toast({
        title: 'Error',
        description: `Failed to load pending users: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const fetchedFiles = await apiRequest<ExcelFile[]>('/excel/files');
      setFiles(fetchedFiles);
    } catch (error: any) {
      console.error('Failed to fetch files:', error);
      toast({
        title: 'Error',
        description: `Failed to load files: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const fetchCharts = async () => {
    try {
      const fetchedCharts = await apiRequest<Chart[]>('/excel/graphs');
      setCharts(fetchedCharts);
    } catch (error: any) {
      console.error('Failed to fetch charts:', error);
      toast({
        title: 'Error',
        description: `Failed to load charts: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
    fetchFiles();
    fetchCharts();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (actionInProgress) return;
    setActionInProgress(userId);
    try {
      await apiRequest(`/auth/users/${userId}`, { method: 'DELETE' });
      toast({
        title: 'User Deleted',
        description: 'User has been deleted successfully.',
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      toast({
        title: 'Error',
        description: `Failed to delete user: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (actionInProgress) return;
    setActionInProgress(fileId);
    try {
      await apiRequest(`/excel/files/${fileId}`, { method: 'DELETE' });
      toast({
        title: 'File Deleted',
        description: 'File has been deleted successfully.',
      });
      fetchFiles();
      fetchCharts(); // Refresh charts as some might be deleted
    } catch (error: any) {
      console.error('Failed to delete file:', error);
      toast({
        title: 'Error',
        description: `Failed to delete file: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (actionInProgress) return;
    setActionInProgress(userId);
    try {
      await apiRequest(`/auth/approve-user/${userId}`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      toast({
        title: 'User Approved',
        description: 'The user has been approved successfully.',
      });
      await Promise.all([fetchPendingUsers(), fetchUsers()]);
    } catch (error: any) {
      console.error('Failed to approve user:', error);
      toast({
        title: 'Error',
        description: `Failed to approve user: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (actionInProgress) return;
    setActionInProgress(userId);
    try {
      await apiRequest(`/auth/reject-user/${userId}`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      toast({
        title: 'User Rejected',
        description: 'The user has been rejected successfully.',
      });
      await Promise.all([fetchPendingUsers(), fetchUsers()]);
    } catch (error: any) {
      console.error('Failed to reject user:', error);
      toast({
        title: 'Error',
        description: `Failed to reject user: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const regularUsers = users.filter(user => user.role === 'user');
  const regularUserFiles = files.filter(file => {
    const fileOwner = users.find(u => u._id === file.user);
    return fileOwner?.role === 'user';
  });
  const regularUserCharts = charts.filter(chart => {
    const chartOwner = users.find(u => u._id === chart.user);
    return chartOwner?.role === 'user';
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <Alert className="w-full md:w-auto">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You have administrative access to manage users and view all platform data.
          </AlertDescription>
        </Alert>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{regularUsers.length}</p>
                <p className="text-sm text-gray-600">Regular Users</p>
                <p className="text-xs text-gray-500">
                  {users.length - regularUsers.length} admins
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{regularUserFiles.length}</p>
                <p className="text-sm text-gray-600">User Files</p>
                <p className="text-xs text-gray-500">
                  {files.length - regularUserFiles.length} admin files
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{regularUserCharts.length}</p>
                <p className="text-sm text-gray-600">User Charts</p>
                <p className="text-xs text-gray-500">
                  {charts.length - regularUserCharts.length} admin charts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending User Approvals */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Pending User Approvals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No pending user approvals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <Card key={user._id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Registered: {new Date(user.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {user.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApproveUser(user._id)}
                          disabled={!!actionInProgress}
                          className={`text-green-600 hover:text-green-800 ${
                            actionInProgress === user._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {actionInProgress === user._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRejectUser(user._id)}
                          disabled={!!actionInProgress}
                          className={`text-red-600 hover:text-red-800 ${
                            actionInProgress === user._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {actionInProgress === user._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          Reject
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

      {/* Users Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {user.status}
                    </Badge>
                  </div>
                </div>
                {user.role !== 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={!!actionInProgress}
                    className={`text-red-600 hover:text-red-800 ${
                      actionInProgress === user._id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {actionInProgress === user._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Files Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Files Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No files uploaded yet</p>
          ) : (
            <div className="space-y-4">
              {files.map(file => (
                <div key={file._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                  <div>
                    <p className="font-medium break-all">{file.fileName}</p>
                    <p className="text-sm text-gray-600">
                      Uploaded by {users.find(u => u._id === file.user)?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(file.uploadDate).toLocaleDateString()} • 
                      {file.totalSheets} sheets
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFile(file._id)}
                    disabled={!!actionInProgress}
                    className={`text-red-600 hover:text-red-800 ${
                      actionInProgress === file._id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {actionInProgress === file._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="h-5 w-5" />
            <span>Charts Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {charts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No charts created yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {charts.map(chart => (
                <Card key={chart._id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="font-medium truncate">{chart.title}</p>
                      <p className="text-sm text-gray-600">
                        Type: {chart.chartType}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(chart.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
