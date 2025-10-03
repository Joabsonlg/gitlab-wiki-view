import axios from 'axios';
import type { GitLabProject, GitLabWikiPage, GitLabWikiPageContent, GitLabGroup } from '@/types/gitlab';

export class GitLabService {
  private token: string;
  private axiosInstance;

  constructor(token: string, gitlabUrl: string = 'https://gitlab.com') {
    this.token = token;
    // Ensure URL has https:// protocol
    const baseUrl = gitlabUrl.startsWith('http') ? gitlabUrl : `https://${gitlabUrl}`;
    const apiUrl = `${baseUrl}/api/v4`;
    
    this.axiosInstance = axios.create({
      baseURL: apiUrl,
      headers: {
        'PRIVATE-TOKEN': token,
      },
    });
  }

  async getProjects(): Promise<GitLabProject[]> {
    const response = await this.axiosInstance.get('/projects', {
      params: {
        membership: true,
        per_page: 100,
        order_by: 'last_activity_at',
      },
    });
    return response.data as GitLabProject[];
  }

  async getWikiPages(projectId: number): Promise<GitLabWikiPage[]> {
    try {
      const response = await this.axiosInstance.get(
        `/projects/${projectId}/wikis`
      );
      return response.data as GitLabWikiPage[];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async getWikiPageContent(
    projectId: number,
    slug: string
  ): Promise<GitLabWikiPageContent> {
    const response = await this.axiosInstance.get(
      `/projects/${projectId}/wikis/${slug}`
    );
    return response.data as GitLabWikiPageContent;
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.axiosInstance.get('/user');
      return true;
    } catch {
      return false;
    }
  }

  async getGroups(): Promise<GitLabGroup[]> {
    try {
      // Buscar todos os grupos (incluindo subgrupos)
      const allGroups: GitLabGroup[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 10) { // Limitar a 10 páginas para evitar loops infinitos
        const response = await this.axiosInstance.get('/groups', {
          params: {
            per_page: 100,
            page: page,
            order_by: 'name',
            all_available: true, // Incluir todos os grupos disponíveis
          },
        });

        const groups = response.data as GitLabGroup[];
        allGroups.push(...groups);

        // Verificar se há mais páginas
        hasMore = groups.length === 100;
        page++;
      }

      return allGroups;
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      return [];
    }
  }
}
