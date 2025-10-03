import { useState } from 'react';
import { GitBranch, Key, AlertCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GitLabService } from '@/services/gitlab';

interface LoginPageProps {
  onLogin: (token: string, gitlabUrl: string) => Promise<boolean>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [token, setToken] = useState('');
  const [gitlabUrl, setGitlabUrl] = useState('https://gitlab.com');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!token.trim()) {
      setError('Por favor, insira um token de acesso válido.');
      return;
    }

    if (!gitlabUrl.trim()) {
      setError('Por favor, insira a URL da instância do GitLab.');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const success = await onLogin(token, gitlabUrl);
      
      if (!success) {
        setError('Token inválido. Verifique e tente novamente.');
      }
    } catch (err) {
      setError('Erro ao validar token. Verifique sua conexão e a URL da instância.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
            <GitBranch className="w-9 h-9 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">GitLab Wiki Viewer</CardTitle>
            <CardDescription className="text-base mt-2">
              Visualize a documentação dos seus projetos GitLab
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="gitlabUrl" className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Instância do GitLab
            </label>
            <Input
              id="gitlabUrl"
              type="url"
              placeholder="https://gitlab.com ou https://projetos.imd.ufrn.br"
              value={gitlabUrl}
              onChange={(e) => setGitlabUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              URL da sua instância do GitLab (ex: gitlab.com, projetos.imd.ufrn.br)
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="token" className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4 text-muted-foreground" />
              Token de Acesso Pessoal
            </label>
            <Input
              id="token"
              type="password"
              placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Você pode criar um token em GitLab → Settings → Access Tokens
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleLogin}
            disabled={isValidating}
            className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md"
          >
            {isValidating ? 'Validando...' : 'Conectar ao GitLab'}
          </Button>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Permissões necessárias:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• read_api - Para acessar a API do GitLab</li>
              <li>• read_repository - Para ler conteúdo das wikis</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
