import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface LoginFormProps {
  onToggleMode: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Floating particles animation
  const FloatingParticle = ({ delay, size, duration }: { delay: number; size: number; duration: number }) => (
    <div
      className={`absolute rounded-full bg-blue-400/20 animate-pulse`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic gradient that follows mouse */}
        <div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <FloatingParticle 
            key={i} 
            delay={i * 0.5} 
            size={Math.random() * 20 + 10} 
            duration={Math.random() * 3 + 2}
          />
        ))}

        {/* Geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-blue-200/30 rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-purple-200/30 rotate-12 animate-bounce" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse" />
      </div>

      <Card className="w-full max-w-md shadow-xl relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={theme === 'dark' ? '/darklogo.png' : '/lightlogo.png'} 
              alt="Excelera Logo" 
              className="h-12 w-12 transition-transform hover:scale-110 duration-300"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full transition-all duration-300 ${
                      focusedField === 'email' 
                        ? 'ring-2 ring-blue-500/50 border-blue-400 shadow-lg scale-105' 
                        : 'hover:shadow-md'
                    }`}
                  />
                  {focusedField === 'email' && (
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full transition-all duration-300 ${
                      focusedField === 'password' 
                        ? 'ring-2 ring-blue-500/50 border-blue-400 shadow-lg scale-105' 
                        : 'hover:shadow-md'
                    }`}
                  />
                  {focusedField === 'password' && (
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none" />
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit"
                variant="default"
                className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span className="relative z-10">Sign In</span>
                )}
                {!isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    onClick={onToggleMode}
                    className="text-blue-600 hover:text-blue-800 font-medium p-0 hover:text-purple-600 transition-colors duration-200 hover:underline"
                  >
                    Sign up
                  </Button>
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;

