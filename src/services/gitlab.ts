import axios from 'axios';
import type { GitLabProject, GitLabWikiPage, GitLabWikiPageContent } from '@/types/gitlab';

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
}
