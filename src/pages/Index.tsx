import { useState } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { ProjectSelector } from '@/components/ProjectSelector';
import { WikiViewer } from '@/components/WikiViewer';
import { useAuth } from '@/hooks/use-auth';
import type { GitLabProject } from '@/types/gitlab';

type View = 'projects' | 'wiki';

const Index = () => {
  const { isAuthenticated, isLoading, gitlabService, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('projects');
  const [selectedProject, setSelectedProject] = useState<GitLabProject | null>(null);

  // Resetar view quando logout acontecer
  const handleLogout = () => {
    setCurrentView('projects');
    setSelectedProject(null);
    logout();
  };

  const handleLogin = async (token: string, gitlabUrl: string) => {
    const success = await login(token, gitlabUrl);
    if (success) {
      setCurrentView('projects');
    }
    return success;
  };

  const handleProjectSelect = (project: GitLabProject) => {
    setSelectedProject(project);
    setCurrentView('wiki');
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setCurrentView('projects');
  };

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Mostrar login se não estiver autenticado
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Mostrar seletor de projetos se autenticado
  if (currentView === 'projects' && gitlabService) {
    return (
      <ProjectSelector
        gitlabService={gitlabService}
        onProjectSelect={handleProjectSelect}
        onLogout={handleLogout}
      />
    );
  }

  // Mostrar visualizador de wiki se projeto selecionado
  if (currentView === 'wiki' && gitlabService && selectedProject) {
    return (
      <WikiViewer
        project={selectedProject}
        gitlabService={gitlabService}
        onBack={handleBackToProjects}
        onLogout={handleLogout}
      />
    );
  }

  return null;
};

export default Index;
