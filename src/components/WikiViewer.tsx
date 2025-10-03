import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, AlertCircle, Loader2, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitLabService } from '@/services/gitlab';
import type { GitLabProject, GitLabWikiPage, GitLabWikiPageContent } from '@/types/gitlab';

interface WikiViewerProps {
  project: GitLabProject;
  gitlabService: GitLabService;
  onBack: () => void;
  onLogout: () => void;
}

export function WikiViewer({ project, gitlabService, onBack, onLogout }: WikiViewerProps) {
  const [wikiPages, setWikiPages] = useState<GitLabWikiPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<GitLabWikiPageContent | null>(null);
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWikiPages();
  }, [project.id]);

  const loadWikiPages = async () => {
    try {
      setIsLoadingPages(true);
      setError('');
      const pages = await gitlabService.getWikiPages(project.id);
      setWikiPages(pages);

      if (pages.length > 0) {
        loadPageContent(pages[0].slug);
      }
    } catch (err) {
      setError('Erro ao carregar páginas da wiki.');
    } finally {
      setIsLoadingPages(false);
    }
  };

  const loadPageContent = async (slug: string) => {
    try {
      setIsLoadingContent(true);
      setError('');
      const content = await gitlabService.getWikiPageContent(project.id, slug);
      setSelectedPage(content);
    } catch (err) {
      setError('Erro ao carregar conteúdo da página.');
    } finally {
      setIsLoadingContent(false);
    }
  };

  if (isLoadingPages) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando wiki...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background w-full">
      {/* Sidebar */}
      <aside className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border space-y-3">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex-1 justify-start"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Projetos
            </Button>
            <Button
              variant="ghost"
              onClick={onLogout}
              size="sm"
              className="px-3"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <h2 className="font-semibold text-lg truncate">{project.name}</h2>
            <p className="text-xs text-muted-foreground truncate">
              {project.path_with_namespace}
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {wikiPages.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">Sem páginas na wiki</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Este projeto não possui páginas de documentação ainda.
                </p>
              </div>
            </div>
          ) : (
            <nav className="p-2 space-y-1">
              {wikiPages.map((page) => (
                <button
                  key={page.slug}
                  onClick={() => loadPageContent(page.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedPage?.slug === page.slug
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{page.title}</span>
                  </div>
                </button>
              ))}
            </nav>
          )}
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoadingContent ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : selectedPage ? (
            <article>
              <header className="mb-8 pb-6 border-b border-border">
                <h1 className="text-4xl font-bold mb-2">{selectedPage.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Formato: {selectedPage.format}
                </p>
              </header>

              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedPage.content}
                </ReactMarkdown>
              </div>
            </article>
          ) : wikiPages.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">Wiki vazia</h2>
                <p className="text-muted-foreground">
                  Comece criando páginas de documentação no GitLab.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
