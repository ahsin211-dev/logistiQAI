import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

class ApiClient {
  private token: string | null = null;

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await SecureStore.setItemAsync('auth_token', token);
    } else {
      await SecureStore.deleteItemAsync('auth_token');
    }
  }

  async loadToken() {
    this.token = await SecureStore.getItemAsync('auth_token');
    return this.token;
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    retries = 3,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const res = await fetch(`${API_URL}${path}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({ message: res.statusText }));
          throw new Error(
            Array.isArray(error.message) ? error.message.join(', ') : error.message,
          );
        }

        return res.json() as Promise<T>;
      } catch (err) {
        if (attempt === retries - 1) throw err;
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }

    throw new Error('Request failed');
  }

  get<T>(path: string) {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body);
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>('PATCH', path, body);
  }
}

export const api = new ApiClient();
