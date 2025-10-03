import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Search, AlertCircle, RefreshCw, LogOut, Settings, ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/theme-toggle';
import { GitLabService } from '@/services/gitlab';
import type { GitLabProject } from '@/types/gitlab';

const STORAGE_KEY = 'gitlab_projects_cache';
const LAST_SYNC_KEY = 'gitlab_last_sync';
const ACTIVE_GROUPS_KEY = 'gitlab_active_groups';

interface ProjectSelectorProps {
  gitlabService: GitLabService;
  onProjectSelect: (project: GitLabProject) => void;
  onLogout: () => void;
}

interface GroupNode {
  path: string;
  name: string;
  projects: GitLabProject[];
  children: Map<string, GroupNode>;
  level: number;
}

export function ProjectSelector({ gitlabService, onProjectSelect, onLogout }: ProjectSelectorProps) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<GitLabProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<GitLabProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [activeGroups, setActiveGroups] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadProjectsFromCache();
    loadActiveGroups();
  }, []);

  useEffect(() => {
    let filtered = projects;

    // Filtrar por grupos ativos (incluindo subgrupos)
    filtered = filtered.filter(project => isProjectInActiveGroup(project));

    // Filtrar por busca
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.path_with_namespace.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  }, [searchQuery, projects, activeGroups]);

  const loadActiveGroups = () => {
    try {
      const stored = localStorage.getItem(ACTIVE_GROUPS_KEY);
      if (stored) {
        const groupIds = JSON.parse(stored) as number[];
        setActiveGroups(new Set(groupIds));
      } else {
        // Se não há grupos selecionados, mostrar todos
        setActiveGroups(new Set());
      }
    } catch (error) {
      console.error('Erro ao carregar grupos ativos:', error);
    }
  };

  // Função para verificar se um projeto pertence a um grupo ativo ou seus subgrupos
  const isProjectInActiveGroup = (project: GitLabProject): boolean => {
    if (activeGroups.size === 0) return true; // Se nenhum grupo selecionado, mostrar todos
    if (project.namespace.kind === 'user') return true; // Sempre mostrar projetos pessoais

    // Criar um mapa de grupos por full_path para busca rápida
    const groupPathToId = new Map<string, number>();
    projects.forEach(p => {
      if (p.namespace.kind === 'group') {
        groupPathToId.set(p.namespace.full_path, p.namespace.id);
      }
    });

    // Verificar se o projeto ou qualquer grupo pai está nos grupos ativos
    const projectPath = project.namespace.full_path;
    const pathParts = projectPath.split('/');

    // Verificar cada nível do caminho (do mais específico ao mais geral)
    for (let i = pathParts.length; i > 0; i--) {
      const partialPath = pathParts.slice(0, i).join('/');
      const groupId = groupPathToId.get(partialPath);
      
      if (groupId && activeGroups.has(groupId)) {
        return true;
      }
    }

    // Verificar diretamente pelo ID do namespace
    return activeGroups.has(project.namespace.id);
  };

  const buildGroupTree = (projects: GitLabProject[]): GroupNode => {
    const root: GroupNode = {
      path: '',
      name: 'root',
      projects: [],
      children: new Map(),
      level: 0,
    };

    projects.forEach(project => {
      if (project.namespace.kind === 'user') {
        root.projects.push(project);
        return;
      }

      const pathParts = project.namespace.full_path.split('/');
      let currentNode = root;

      pathParts.forEach((part, index) => {
        if (!currentNode.children.has(part)) {
          currentNode.children.set(part, {
            path: pathParts.slice(0, index + 1).join('/'),
            name: part,
            projects: [],
            children: new Map(),
            level: index + 1,
          });
        }
        currentNode = currentNode.children.get(part)!;
      });

      currentNode.projects.push(project);
    });

    return root;
  };

  const toggleGroup = (groupPath: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupPath)) {
      newExpanded.delete(groupPath);
    } else {
      newExpanded.add(groupPath);
    }
    setExpandedGroups(newExpanded);
  };

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

  const groupTree = buildGroupTree(filteredProjects);

  const renderGroupNode = (node: GroupNode, isRoot = false): JSX.Element | null => {
    if (isRoot) {
      return (
        <div className="space-y-4">
          {node.projects.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">
                Projetos Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {node.projects.map(project => renderProjectCard(project))}
              </div>
            </div>
          )}
          {Array.from(node.children.values()).map(child => renderGroupNode(child))}
        </div>
      );
    }

    const isExpanded = expandedGroups.has(node.path);
    const hasContent = node.projects.length > 0 || node.children.size > 0;

    if (!hasContent) return null;

    return (
      <div key={node.path} className="space-y-3">
        <button
          onClick={() => toggleGroup(node.path)}
          className="flex items-center gap-2 w-full text-left px-2 py-2 rounded-lg hover:bg-accent/50 transition-colors group"
          style={{ paddingLeft: `${node.level * 1}rem` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <FolderOpen className="w-5 h-5 text-primary" />
          <span className="font-semibold text-lg group-hover:text-primary transition-colors">
            {node.name}
          </span>
          <span className="text-sm text-muted-foreground">
            ({node.projects.length + Array.from(node.children.values()).reduce((acc, child) => acc + child.projects.length, 0)})
          </span>
        </button>

        {isExpanded && (
          <div className="space-y-3">
            {node.projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ paddingLeft: `${(node.level + 1) * 1}rem` }}>
                {node.projects.map(project => renderProjectCard(project))}
              </div>
            )}
            {Array.from(node.children.values()).map(child => renderGroupNode(child))}
          </div>
        )}
      </div>
    );
  };

  const renderProjectCard = (project: GitLabProject) => (
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
  );

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
            onClick={() => navigate('/settings/groups')}
            className="h-12 px-6"
            variant="outline"
          >
            <Settings className="w-4 h-4 mr-2" />
            Grupos
          </Button>
          <Button
            onClick={syncProjects}
            disabled={isSyncing}
            className="h-12 px-6"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
          <ThemeToggle />
          <Button
            onClick={onLogout}
            className="h-12 px-6"
            variant="outline"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
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
                {searchQuery ? 'Nenhum projeto encontrado' : activeGroups.size > 0 ? 'Nenhum projeto nos grupos selecionados' : 'Você não tem projetos ainda'}
              </p>
            </CardContent>
          </Card>
        )}

        {filteredProjects.length > 0 && renderGroupNode(groupTree, true)}
      </div>
    </div>
  );
}
