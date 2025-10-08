import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
}

export class HttpClient {
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DomainHive-Framework/1.0.0'
      },
      ...config
    };
  }

  private async request<T>(url: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    const fullUrl = this.config.baseURL ? new URL(url, this.config.baseURL).toString() : url;
    const parsedUrl = new URL(fullUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const mergedHeaders = {
      ...this.config.headers,
      ...options.headers
    };

    const requestOptions: http.RequestOptions = {
      method: options.method || 'GET',
      headers: mergedHeaders,
      timeout: options.timeout || this.config.timeout
    };

    return new Promise((resolve, reject) => {
      const req = client.request(fullUrl, requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = mergedHeaders['Content-Type']?.includes('application/json') 
              ? JSON.parse(data || '{}')
              : data;

            const response: HttpResponse<T> = {
              status: res.statusCode || 0,
              statusText: res.statusMessage || '',
              headers: res.headers as Record<string, string>,
              data: parsedData
            };

            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject(new Error(`HTTP Error: ${res.statusCode} ${res.statusMessage}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        const bodyString = typeof options.body === 'string' 
          ? options.body 
          : JSON.stringify(options.body);
        req.write(bodyString);
      }

      req.end();
    });
  }

  async get<T = any>(url: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  async put<T = any>(url: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  async delete<T = any>(url: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  async patch<T = any>(url: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  }

  setHeader(key: string, value: string): void {
    this.config.headers = this.config.headers || {};
    this.config.headers[key] = value;
  }

  setAuthToken(token: string): void {
    this.setHeader('Authorization', `Bearer ${token}`);
  }
}

// Default client instance
export const httpClient = new HttpClient();
