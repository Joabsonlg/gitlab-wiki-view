import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginPage } from '@/components/LoginPage';
import { useAuth } from '@/hooks/use-auth';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/projects', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (token: string, gitlabUrl: string) => {
    const success = await login(token, gitlabUrl);
    if (success) {
      navigate('/projects', { replace: true });
    }
    return success;
  };

  return <LoginPage onLogin={handleLogin} />;
}
