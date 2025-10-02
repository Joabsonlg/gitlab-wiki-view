export interface GitLabProject {
  id: number;
  name: string;
  description: string;
  path_with_namespace: string;
  web_url: string;
  avatar_url: string | null;
}

export interface GitLabWikiPage {
  slug: string;
  title: string;
  format: string;
}

export interface GitLabWikiPageContent extends GitLabWikiPage {
  content: string;
}
