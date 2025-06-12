
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Dashboard from '@/components/Dashboard';
import AdminPanel from '@/components/AdminPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <LoginForm onToggleMode={() => setAuthMode('register')} />
    ) : (
      <RegisterForm onToggleMode={() => setAuthMode('login')} />
    );
  }

  return (
    <Layout>
      {user?.role === 'admin' ? (
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="admin">Admin Panel</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6">
            <Dashboard />
          </TabsContent>
          <TabsContent value="admin" className="mt-6">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      ) : (
        <Dashboard />
      )}
    </Layout>
  );
};

export default Index;
