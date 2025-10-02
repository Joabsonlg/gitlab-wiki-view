import { useState } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { ProjectSelector } from '@/components/ProjectSelector';
import { WikiViewer } from '@/components/WikiViewer';
import { GitLabService } from '@/services/gitlab';
import type { GitLabProject } from '@/types/gitlab';

type View = 'login' | 'projects' | 'wiki';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [gitlabService, setGitlabService] = useState<GitLabService | null>(null);
  const [selectedProject, setSelectedProject] = useState<GitLabProject | null>(null);

  const handleLogin = (token: string, gitlabUrl: string) => {
    const service = new GitLabService(token, gitlabUrl);
    setGitlabService(service);
    setCurrentView('projects');
  };

  const handleProjectSelect = (project: GitLabProject) => {
    setSelectedProject(project);
    setCurrentView('wiki');
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setCurrentView('projects');
  };

  if (currentView === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentView === 'projects' && gitlabService) {
    return (
      <ProjectSelector
        gitlabService={gitlabService}
        onProjectSelect={handleProjectSelect}
      />
    );
  }

  if (currentView === 'wiki' && gitlabService && selectedProject) {
    return (
      <WikiViewer
        project={selectedProject}
        gitlabService={gitlabService}
        onBack={handleBackToProjects}
      />
    );
  }

  return null;
};

export default Index;
