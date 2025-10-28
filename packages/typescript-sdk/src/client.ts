import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { paths, components } from './types';

export interface ClientConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

export class Longpoint {
  private httpClient: AxiosInstance;
  ai: AiClient;
  library: LibraryClient;
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
    this.ai = new AiClient(this.httpClient);
    this.library = new LibraryClient(this.httpClient);
    this.media = new MediaClient(this.httpClient);
    this.tools = new ToolsClient(this.httpClient);
  }
}

class AiClient {
  constructor(private httpClient: AxiosInstance) {}

    /**
   * Get an AI provider
   */
    async getAiProvider(providerId: string): Promise<components['schemas']['AiProvider']> {
        const url = `ai/providers/${encodeURIComponent(String(providerId))}`;
        const response = await this.httpClient.get(url);
        return response.data;
  }

    /**
   * Update the config for an AI provider
   */
    async updateAiProviderConfig(providerId: string, data: components['schemas']['UpdateAiProviderConfig']): Promise<components['schemas']['AiProvider']> {
        const url = `ai/providers/${encodeURIComponent(String(providerId))}`;
        const response = await this.httpClient.patch(url, data);
        return response.data;
  }

    /**
   * Create a classifier
   */
    async createClassifier(data: components['schemas']['CreateClassifier']): Promise<components['schemas']['Classifier']> {
        const url = `ai/classifiers`;
        const response = await this.httpClient.post(url, data);
        return response.data;
  }

    /**
   * List classifiers
   */
    async listClassifiers(): Promise<components['schemas']['ClassifierSummary'][]> {
        const url = `ai/classifiers`;
        const response = await this.httpClient.get(url);
        return response.data;
  }

    /**
   * Get a classifier
   */
    async getClassifier(classifierId: string): Promise<components['schemas']['Classifier']> {
        const url = `ai/classifiers/${encodeURIComponent(String(classifierId))}`;
        const response = await this.httpClient.get(url);
        return response.data;
  }

    /**
   * Update a classifier
   */
    async updateClassifier(classifierId: string, data: components['schemas']['UpdateClassifier']): Promise<components['schemas']['Classifier']> {
        const url = `ai/classifiers/${encodeURIComponent(String(classifierId))}`;
        const response = await this.httpClient.patch(url, data);
        return response.data;
  }

    /**
   * Delete a classifier
   */
    async deleteClassifier(classifierId: string): Promise<void> {
        const url = `ai/classifiers/${encodeURIComponent(String(classifierId))}`;
        const response = await this.httpClient.delete(url);
        return response.data;
  }

    /**
   * Get a model
   */
    async getModel(id: string): Promise<components['schemas']['AiModel']> {
        const url = `ai/models/${encodeURIComponent(String(id))}`;
        const response = await this.httpClient.get(url);
        return response.data;
  }

    /**
   * List installed models
   */
    async listModels(): Promise<components['schemas']['AiModel'][]> {
        const url = `ai/models`;
        const response = await this.httpClient.get(url);
        return response.data;
  }
}

class LibraryClient {
  constructor(private httpClient: AxiosInstance) {}

    /**
   * List the contents of a library tree
   */
    async getTree(options?: { path?: string }): Promise<components['schemas']['LibraryTree']> {
        const params = new URLSearchParams();
        if (options) {
          if (options.path !== undefined) {
            params.append('path', String(options.path));
          }
        }
        const queryString = params.toString();
        const url = `library/tree${queryString ? `?${queryString}` : ''}`;
        const response = await this.httpClient.get(url);
        return response.data;
  }
}

class MediaClient {
  constructor(private httpClient: AxiosInstance) {}

    /**
   * Create a media container
   *
   * Creates an empty container that is ready to receive an upload.
   */
    async createMedia(data: components['schemas']['CreateMediaContainer']): Promise<components['schemas']['CreateMediaContainerResponse']> {
        const url = `media`;
        const response = await this.httpClient.post(url, data);
        return response.data;
  }

    /**
   * Get a media container
   */
    async getMedia(containerId: string): Promise<components['schemas']['MediaContainer']> {
        const url = `media/${encodeURIComponent(String(containerId))}`;
        const response = await this.httpClient.get(url);
        return response.data;
  }

    /**
   * Update a media container
   */
    async updateMedia(containerId: string, data: components['schemas']['UpdateMediaContainer']): Promise<components['schemas']['MediaContainer']> {
        const url = `media/${encodeURIComponent(String(containerId))}`;
        const response = await this.httpClient.patch(url, data);
        return response.data;
  }

    /**
   * Delete a media container
   *
   * All associated assets will be deleted.
   */
    async deleteMedia(containerId: string, data: components['schemas']['DeleteMediaContainer']): Promise<void> {
        const url = `media/${encodeURIComponent(String(containerId))}`;
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
        const url = `media/${encodeURIComponent(String(containerId))}/upload${queryString ? `?${queryString}` : ''}`;
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
