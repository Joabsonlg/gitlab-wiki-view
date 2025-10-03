export interface GitLabProject {
  id: number;
  name: string;
  description: string;
  path_with_namespace: string;
  web_url: string;
  avatar_url: string | null;
  namespace: {
    id: number;
    name: string;
    path: string;
    kind: 'user' | 'group';
    full_path: string;
  };
}

export interface GitLabGroup {
  id: number;
  name: string;
  path: string;
  full_path: string;
  parent_id: number | null;
}

export interface GitLabWikiPage {
  slug: string;
  title: string;
  format: string;
}

export interface GitLabWikiPageContent extends GitLabWikiPage {
  content: string;
}
