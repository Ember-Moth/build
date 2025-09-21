import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { toast } from 'qwik-sonner';
import { API_URL, SITE_URL } from '~/constant';
import { tokenManager } from './token';

// Get the base URL from environment variables
const BASE_URL = API_URL || SITE_URL;

// Create an axios instance
const request = axios.create({
  baseURL: BASE_URL,
  // timeout: 30000,
  // headers: {
  //   "Content-Type": "application/json",
  // },
  // withCredentials: true,
});

// Request interceptor
request.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig & {
      Authorization?: string;
      skipErrorHandler?: boolean;
    },
  ) => {
    // Add authorization header if available
    const Authorization = tokenManager.getAuthorization(config.Authorization);
    if (Authorization) config.headers['x-api-key'] = Authorization;
    return config;
  },
  (error: Error) => {
    // Handle request configuration errors
    console.error('Request config error:', error);
    return Promise.reject(error);
  },
);

/**
 * Process API response error
 * @param response Error response object
 */
function processResponseError(response: AxiosResponse): never {
  // @ts-expect-error - skipErrorHandler is not defined in AxiosResponse
  if (response.config.skipErrorHandler) throw response;
  toast.error(response.data.msg || 'An error occurred while processing the request.');
  throw response;
}

// Response interceptor
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle non-0 API response codes
    if (response.data?.code !== 0) {
      return processResponseError(response);
    }
    // Return only the data part from response
    return response;
  },
  (error: AxiosError<{ msg: string }>) => {
    toast.error(error.response?.data.msg || 'An error occurred while processing the request.');
    // Continue to reject the promise
    return Promise.reject(error);
  },
);

export default request;

export const apiPrefix = '/api';
