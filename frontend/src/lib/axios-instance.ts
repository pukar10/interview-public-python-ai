import client from '@kubb/plugin-client/clients/axios';
import type { RequestConfig as KubbRequestConfig, ResponseConfig as KubbResponseConfig, ResponseErrorConfig as KubbResponseErrorConfig } from '@kubb/plugin-client/clients/axios';

// Set the base URL for all requests
client.setConfig({
  baseURL: 'http://localhost:8000',
});

export type RequestConfig<TData = any> = KubbRequestConfig<TData>;
export type ResponseConfig<TData = any> = KubbResponseConfig<TData>;
export type ResponseErrorConfig<TData = any> = KubbResponseErrorConfig<TData>;

export default client;