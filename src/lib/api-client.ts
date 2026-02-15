import type { ApiClient, ApiError, InventoryError } from '@/types';

class ApiClientImpl implements ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      throw new InventoryError(
        errorData.message || 'An error occurred',
        errorData.code || 'UNKNOWN_ERROR',
        response.status,
        errorData.details
      );
    }

    try {
      return await response.json();
    } catch {
      return {} as T;
    }
  }

  async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof InventoryError) {
        throw error;
      }
      throw new InventoryError(
        'Network error occurred',
        'NETWORK_ERROR',
        500,
        error
      );
    }
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof InventoryError) {
        throw error;
      }
      throw new InventoryError(
        'Network error occurred',
        'NETWORK_ERROR',
        500,
        error
      );
    }
  }

  async put<T>(url: string, data: unknown): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof InventoryError) {
        throw error;
      }
      throw new InventoryError(
        'Network error occurred',
        'NETWORK_ERROR',
        500,
        error
      );
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof InventoryError) {
        throw error;
      }
      throw new InventoryError(
        'Network error occurred',
        'NETWORK_ERROR',
        500,
        error
      );
    }
  }
}

export const apiClient = new ApiClientImpl();