import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Show register form for /register or when coming from "Get Started"
    if (location.pathname === '/register' || location.state?.fromGetStarted) {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Update URL to match the current form
    navigate(isLogin ? '/register' : '/login', { replace: true });
  };

  return (
    <div>
      {isLogin ? (
        <LoginForm onToggleMode={toggleMode} />
      ) : (
        <RegisterForm onToggleMode={toggleMode} />
      )}
    </div>
  );
};

export default Auth; 