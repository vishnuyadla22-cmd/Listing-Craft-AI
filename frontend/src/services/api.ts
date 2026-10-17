import {
  ListingGenerationRequest,
  GeneratedListing,
  HealthStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export const api = {
  /**
   * Health check to query backend and Ollama connectivity
   */
  async getHealth(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ApiError(`Health check returned ${response.status}`, response.status);
      }

      return await response.json();
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        'Backend server is not reachable. Ensure the FastAPI server is running on port 8000.',
        0,
        { is_backend_down: true }
      );
    }
  },

  /**
   * Request full listing generation
   */
  async generateListing(request: ListingGenerationRequest): Promise<GeneratedListing> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-listing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorDetail = data?.detail || {};
        const msg =
          typeof errorDetail === 'string'
            ? errorDetail
            : errorDetail.message || 'Failed to generate listing from AI service';

        throw new ApiError(msg, response.status, errorDetail);
      }

      return data as GeneratedListing;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        err.message || 'Network error connecting to backend API',
        0,
        { error: 'Connection Failure' }
      );
    }
  },

  /**
   * Regenerate a single section
   */
  async regenerateSection(
    section: string,
    context: ListingGenerationRequest,
    currentValue?: any
  ): Promise<{ section: string; value: any; is_demo_mode: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/regenerate-section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          context,
          current_value: currentValue,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = data?.detail?.message || data?.detail || 'Failed to regenerate section';
        throw new ApiError(msg, response.status, data?.detail);
      }

      return data;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Failed to regenerate section', 0);
    }
  },
};
