import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WikiViewer } from '@/components/WikiViewer';
import { useAuth } from '@/hooks/use-auth';
import type { GitLabProject } from '@/types/gitlab';

export default function Wiki() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { gitlabService, logout } = useAuth();
  const [project, setProject] = useState<GitLabProject | null>(null);

  useEffect(() => {
    // Recuperar projeto do sessionStorage
    const storedProject = sessionStorage.getItem('selected_project');
    if (storedProject) {
      const parsedProject = JSON.parse(storedProject) as GitLabProject;
      // Verificar se é o projeto correto
      if (parsedProject.id === Number(projectId)) {
        setProject(parsedProject);
      } else {
        // Se não for o projeto correto, voltar para projetos
        navigate('/projects', { replace: true });
      }
    } else {
      // Se não tem projeto salvo, voltar para projetos
      navigate('/projects', { replace: true });
    }
  }, [projectId, navigate]);

  const handleBack = () => {
    navigate('/projects');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!gitlabService || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <WikiViewer
      project={project}
      gitlabService={gitlabService}
      onBack={handleBack}
      onLogout={handleLogout}
    />
  );
}
