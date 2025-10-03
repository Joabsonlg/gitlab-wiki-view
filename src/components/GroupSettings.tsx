import { useEffect, useState } from 'react';
import { Settings, Check, X, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitLabService } from '@/services/gitlab';
import { toast } from 'sonner';
import type { GitLabGroup } from '@/types/gitlab';

const ACTIVE_GROUPS_KEY = 'gitlab_active_groups';

interface GroupSettingsProps {
  gitlabService: GitLabService;
  onBack: () => void;
}

export function GroupSettings({ gitlabService, onBack }: GroupSettingsProps) {
  const [groups, setGroups] = useState<GitLabGroup[]>([]);
  const [activeGroups, setActiveGroups] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGroups();
    loadActiveGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const groupsData = await gitlabService.getGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveGroups = () => {
    try {
      const stored = localStorage.getItem(ACTIVE_GROUPS_KEY);
      if (stored) {
        const groupIds = JSON.parse(stored) as number[];
        setActiveGroups(new Set(groupIds));
      }
    } catch (error) {
      console.error('Erro ao carregar grupos ativos:', error);
    }
  };

  const toggleGroup = (groupId: number, groupName: string) => {
    const newActiveGroups = new Set(activeGroups);
    const wasActive = newActiveGroups.has(groupId);
    
    if (wasActive) {
      newActiveGroups.delete(groupId);
      toast.success(`Grupo "${groupName}" desmarcado`, {
        description: 'Os projetos deste grupo não serão mais exibidos',
      });
    } else {
      newActiveGroups.add(groupId);
      toast.success(`Grupo "${groupName}" selecionado`, {
        description: 'Os projetos deste grupo serão exibidos',
      });
    }
    
    setActiveGroups(newActiveGroups);
    localStorage.setItem(ACTIVE_GROUPS_KEY, JSON.stringify(Array.from(newActiveGroups)));
  };

  const selectAll = () => {
    const allGroupIds = new Set(groups.map(g => g.id));
    setActiveGroups(allGroupIds);
    localStorage.setItem(ACTIVE_GROUPS_KEY, JSON.stringify(Array.from(allGroupIds)));
    toast.success('Todos os grupos selecionados', {
      description: `${groups.length} grupos foram marcados`,
    });
  };

  const deselectAll = () => {
    setActiveGroups(new Set());
    localStorage.setItem(ACTIVE_GROUPS_KEY, JSON.stringify([]));
    toast.success('Todos os grupos desmarcados', {
      description: 'Todos os projetos serão exibidos',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Configuração de Grupos</CardTitle>
                <CardDescription>
                  Selecione os grupos que você está trabalhando atualmente
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={selectAll} variant="outline" size="sm">
                <Check className="w-4 h-4 mr-2" />
                Selecionar Todos
              </Button>
              <Button onClick={deselectAll} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Desmarcar Todos
              </Button>
              <div className="flex-1" />
              <span className="text-sm text-muted-foreground self-center">
                {activeGroups.size} de {groups.length} selecionados
              </span>
            </div>

            <ScrollArea className="h-[500px] rounded-md border">
              <div className="p-4 space-y-2">
                {groups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum grupo encontrado
                  </div>
                ) : (
                  groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => toggleGroup(group.id, group.name)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        activeGroups.has(group.id)
                          ? 'bg-primary/5 border-primary/50'
                          : 'bg-background border-border hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            activeGroups.has(group.id)
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {activeGroups.has(group.id) && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{group.name}</p>
                          <p className="text-xs text-muted-foreground">{group.full_path}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
