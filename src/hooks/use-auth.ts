import { useState, useEffect } from 'react';
import { GitLabService } from '@/services/gitlab';

interface AuthState {
  token: string | null;
  gitlabUrl: string | null;
  gitlabService: GitLabService | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AUTH_STORAGE_KEY = 'gitlab-wiki-auth';

interface StoredAuth {
  token: string;
  gitlabUrl: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    gitlabUrl: null,
    gitlabService: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Verificar se há credenciais salvas ao inicializar
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          const { token, gitlabUrl }: StoredAuth = JSON.parse(storedAuth);
          
          // Validar se o token ainda é válido
          const service = new GitLabService(token, gitlabUrl);
          const isValid = await service.validateToken();
          
          if (isValid) {
            setAuthState({
              token,
              gitlabUrl,
              gitlabService: service,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token inválido, remover do storage
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (token: string, gitlabUrl: string): Promise<boolean> => {
    try {
      const service = new GitLabService(token, gitlabUrl);
      const isValid = await service.validateToken();

      if (isValid) {
        // Salvar credenciais no localStorage
        const authData: StoredAuth = { token, gitlabUrl };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

        setAuthState({
          token,
          gitlabUrl,
          gitlabService: service,
          isAuthenticated: true,
          isLoading: false,
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({
      token: null,
      gitlabUrl: null,
      gitlabService: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
}