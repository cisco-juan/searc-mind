import { useState } from 'react';
import type { QueryRequest, QueryResponse } from '@search-mind/libs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  components: {
    ollama: 'operational' | 'unavailable';
    database: 'operational' | 'unavailable';
  };
  statistics: {
    totalDocuments: number;
    lastUpdated: Date | null;
  };
  timestamp: string;
}

interface StatisticsResponse {
  success: boolean;
  totalDocuments: number;
  lastUpdated: Date | null;
  timestamp: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  filename: string;
  totalDocuments: number;
  timestamp: string;
}

interface ClearDocumentsResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/agent`;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  async query(request: QueryRequest): Promise<QueryResponse> {
    return this.request<QueryResponse>('/query', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async getStatistics(): Promise<StatisticsResponse> {
    return this.request<StatisticsResponse>('/statistics');
  }

  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('document', file);

    return this.request<UploadResponse>('/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async clearDocuments(): Promise<ClearDocumentsResponse> {
    return this.request<ClearDocumentsResponse>('/documents', {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

// Hook personalizado para manejar queries con estado
export const useQuery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = async (request: QueryRequest): Promise<QueryResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.query(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { query, isLoading, error };
};

// Re-export types for convenience
export type { 
  QueryRequest, 
  QueryResponse, 
  HealthResponse, 
  StatisticsResponse, 
  UploadResponse,
  ClearDocumentsResponse 
};