import { useEffect, useState } from 'react';
import { Folder, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GitLabService } from '@/services/gitlab';
import type { GitLabProject } from '@/types/gitlab';

const STORAGE_KEY = 'gitlab_projects_cache';
const LAST_SYNC_KEY = 'gitlab_last_sync';

interface ProjectSelectorProps {
  gitlabService: GitLabService;
  onProjectSelect: (project: GitLabProject) => void;
}

export function ProjectSelector({ gitlabService, onProjectSelect }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<GitLabProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<GitLabProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    loadProjectsFromCache();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.path_with_namespace.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  const loadProjectsFromCache = () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      const lastSyncDate = localStorage.getItem(LAST_SYNC_KEY);
      
      if (cached) {
        const projectsData = JSON.parse(cached);
        setProjects(projectsData);
        setFilteredProjects(projectsData);
        setLastSync(lastSyncDate);
        setIsLoading(false);
      } else {
        // Se não tem cache, sincroniza automaticamente
        syncProjects();
      }
    } catch (err) {
      console.error('Erro ao carregar cache:', err);
      syncProjects();
    }
  };

  const syncProjects = async () => {
    try {
      setIsSyncing(true);
      setError('');
      const projectsData = await gitlabService.getProjects();
      
      // Salva no localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projectsData));
      const syncDate = new Date().toISOString();
      localStorage.setItem(LAST_SYNC_KEY, syncDate);
      
      setProjects(projectsData);
      setFilteredProjects(projectsData);
      setLastSync(syncDate);
    } catch (err) {
      setError('Erro ao sincronizar projetos. Verifique suas permissões.');
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `há ${diffDays}d`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Seus Projetos GitLab</h1>
          <p className="text-muted-foreground">Selecione um projeto para visualizar sua wiki</p>
          {lastSync && (
            <p className="text-xs text-muted-foreground">
              Última sincronização: {formatLastSync(lastSync)}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button
            onClick={syncProjects}
            disabled={isSyncing}
            className="h-12 px-6"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {filteredProjects.length === 0 && !error && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Nenhum projeto encontrado' : 'Você não tem projetos ainda'}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 group"
              onClick={() => onProjectSelect(project)}
            >
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start gap-3">
                  {project.avatar_url ? (
                    <img
                      src={project.avatar_url}
                      alt={project.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                      <Folder className="w-6 h-6 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {project.path_with_namespace}
                    </p>
                  </div>
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
