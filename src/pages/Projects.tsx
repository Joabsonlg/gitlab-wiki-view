import { useNavigate } from 'react-router-dom';
import { ProjectSelector } from '@/components/ProjectSelector';
import { useAuth } from '@/hooks/use-auth';
import type { GitLabProject } from '@/types/gitlab';

export default function Projects() {
  const navigate = useNavigate();
  const { gitlabService, logout } = useAuth();

  const handleProjectSelect = (project: GitLabProject) => {
    // Salvar projeto selecionado no sessionStorage para recuperar na página wiki
    sessionStorage.setItem('selected_project', JSON.stringify(project));
    navigate(`/projects/${project.id}/wiki`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!gitlabService) {
    return null;
  }

  return (
    <ProjectSelector
      gitlabService={gitlabService}
      onProjectSelect={handleProjectSelect}
      onLogout={handleLogout}
    />
  );
}
