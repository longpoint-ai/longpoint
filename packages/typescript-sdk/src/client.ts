import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { paths, components } from './types';

export interface ClientConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

export class Longpoint {
  private httpClient: AxiosInstance;
  media: MediaClient;
  tools: ToolsClient;

  constructor(config: ClientConfig = {}) {
    this.httpClient = axios.create({
      baseURL: config.baseUrl || 'http://localhost:3000/api',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` })
      }
    });
    this.media = new MediaClient(this.httpClient);
    this.tools = new ToolsClient(this.httpClient);
  }
}

class MediaClient {
  constructor(private httpClient: AxiosInstance) {}

    /**
   * Create a media container
   *
   * Creates an empty media container that is ready to receive an upload.
   */
    async createMediaContainer(data: components['schemas']['CreateMediaContainer']): Promise<components['schemas']['CreateMediaContainerResponse']> {
        const url = `media`;
        const response = await this.httpClient.post(url, data);
        return response.data;
  }

    /**
   * Get a media container
   */
    async getMediaContainer(containerId: string): Promise<components['schemas']['MediaContainer']> {
        const url = `media/${containerId}`;
        const response = await this.httpClient.get(url);
        return response.data;
  }

    /**
   * Update a media container
   */
    async updateMediaContainer(containerId: string, data: components['schemas']['UpdateMediaContainer']): Promise<components['schemas']['MediaContainer']> {
        const url = `media/${containerId}`;
        const response = await this.httpClient.patch(url, data);
        return response.data;
  }

    /**
   * Delete a media container
   *
   * Deletes a media container and all associated assets.
   */
    async deleteMediaContainer(containerId: string, data: components['schemas']['DeleteMediaContainer']): Promise<void> {
        const url = `media/${containerId}`;
        const response = await this.httpClient.delete(url, { data });
        return response.data;
  }

    /**
   * Upload an asset to a media container
   */
    async upload(containerId: string, options?: { token?: string }): Promise<void> {
        const params = new URLSearchParams();
        if (options) {
          if (options.token !== undefined) {
            params.append('token', String(options.token));
          }
        }
        const queryString = params.toString();
        const url = `media/${containerId}/upload${queryString ? `?${queryString}` : ''}`;
        const response = await this.httpClient.put(url);
        return response.data;
  }
}

class ToolsClient {
  constructor(private httpClient: AxiosInstance) {}

    /**
   * Get first time setup status
   */
    async getSetupStatus(): Promise<components['schemas']['SetupStatus']> {
        const url = `setup/status`;
        const response = await this.httpClient.get(url);
        return response.data;
  }
}

// Export default instance
export const longpoint = new Longpoint();
export default longpoint;
