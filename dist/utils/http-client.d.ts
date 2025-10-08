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
export declare class HttpClient {
    private config;
    constructor(config?: HttpClientConfig);
    private request;
    get<T = any>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<HttpResponse<T>>;
    post<T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<HttpResponse<T>>;
    put<T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<HttpResponse<T>>;
    delete<T = any>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<HttpResponse<T>>;
    patch<T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<HttpResponse<T>>;
    setHeader(key: string, value: string): void;
    setAuthToken(token: string): void;
}
export declare const httpClient: HttpClient;
