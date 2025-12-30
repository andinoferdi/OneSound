import Axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import { authService } from '@/services/auth';

const axios = Axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`,
  timeout: 10000
});

let tokenGetter: (() => string | null) | null = null;
let refreshTokenGetter: (() => string | null) | null = null;
let logoutCallback: (() => void) | null = null;
let updateTokenCallback: ((token: string, refreshToken: string) => void) | null = null;

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: Error) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setTokenGetter = (getter: () => string | null) => {
  tokenGetter = getter;
};

export const setRefreshTokenGetter = (getter: () => string | null) => {
  refreshTokenGetter = getter;
};

export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

export const setUpdateTokenCallback = (callback: (token: string, refreshToken: string) => void) => {
  updateTokenCallback = callback;
};

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = tokenGetter ? tokenGetter() : null;

      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      if (config.headers) {
        config.headers['Accept'] = 'application/json';
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const isNetworkError = !error.response && error.request;
    const isServerError = error.response?.status && [500, 502, 503, 504].includes(error.response.status);
    const isConnectionError = error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.message?.includes('Network Error');

    const isLoginEndpoint = originalRequest?.url?.includes('/auth/login');
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
    const hasToken = tokenGetter && tokenGetter();

    if ((isNetworkError || isServerError || isConnectionError) && !isLoginEndpoint && !isAuthEndpoint && hasToken && logoutCallback) {
      if (isServerError) {
        return Promise.reject(error);
      }
      if (isNetworkError || isConnectionError) {
      const authErrorEvent = new CustomEvent('auth:backend-unavailable');
      window.dispatchEvent(authErrorEvent);
      return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isLoginEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = refreshTokenGetter ? refreshTokenGetter() : null;
      if (!refreshToken) {
        processQueue(new Error('No refresh token'));
        isRefreshing = false;
        if (logoutCallback && hasToken) {
          logoutCallback();
          const authErrorEvent = new CustomEvent('auth:unauthorized');
          window.dispatchEvent(authErrorEvent);
        }
        return Promise.reject(error);
      }

      try {
        const { token: newToken, refreshToken: newRefreshToken } = await authService.refreshToken(refreshToken);

        if (updateTokenCallback) {
          updateTokenCallback(newToken, newRefreshToken);
        }

        processQueue(null, newToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        isRefreshing = false;
        if (logoutCallback) {
          logoutCallback();
        }
        const authErrorEvent = new CustomEvent('auth:unauthorized');
        window.dispatchEvent(authErrorEvent);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
