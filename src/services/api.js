import axios from "axios";
import {
  getToken,
  setAuthData,
  clearAuthData,
  isTokenExpiringSoon,
  getLastActivityAt,
  markActivity,
} from "@/services/token.service";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const IDLE_LIMIT_MS = 4 * 60 * 60 * 1000; // 4 jam
const REFRESH_BEFORE_MS = 5 * 60 * 1000; // refresh 5 menit sebelum expired

function processQueue(error, token = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
}

function forceLogout() {
  clearAuthData();

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export async function refreshAccessToken() {
  const token = getToken();

  if (!token) {
    throw new Error("Token tidak ditemukan");
  }

  const response = await refreshClient.post(
    "/auth/refresh",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  setAuthData(response.data);

  const newToken =
    response.data?.data?.access_token || response.data?.access_token;

  if (!newToken) {
    throw new Error("Refresh token gagal");
  }

  return newToken;
}

api.interceptors.request.use(
  async (config) => {
    const token = getToken();

    if (!token) return config;

    const idleDuration = Date.now() - getLastActivityAt();

    if (idleDuration > IDLE_LIMIT_MS) {
      forceLogout();
      return Promise.reject(new Error("Session idle terlalu lama"));
    }

    const isAuthEndpoint =
      config.url?.includes("/login") ||
      config.url?.includes("/auth/refresh") ||
      config.url?.includes("/logout");

    if (!isAuthEndpoint && isTokenExpiringSoon(REFRESH_BEFORE_MS)) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          processQueue(null, newToken);
        } catch (error) {
          processQueue(error, null);
          forceLogout();
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      } else {
        const newToken = await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });

        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      }
    }

    const finalToken = getToken();

    if (finalToken) {
      config.headers.Authorization = `Bearer ${finalToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    markActivity();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    const isAuthEndpoint =
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/logout");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        try {
          const newToken = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (queueError) {
          return Promise.reject(queueError);
        }
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
