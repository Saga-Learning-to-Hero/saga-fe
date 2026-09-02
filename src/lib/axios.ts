import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let cachedCsrfToken: string | null = null;
let csrfPromise: Promise<string | null> | null = null;

export async function fetchFreshCsrfToken(): Promise<string | null> {
  try {
    const res = await axios.get<{ parameterName: string; token: string; headerName: string }>(
      `${API_BASE_URL}/api/auth/csrf`,
      { withCredentials: true }
    );
    cachedCsrfToken = res.data.token;
    return res.data.token;
  } catch {
    return null;
  }
}

export async function ensureCsrfToken(forceRefresh = false): Promise<string | null> {
  if (forceRefresh) {
    cachedCsrfToken = null;
    return fetchFreshCsrfToken();
  }

  const existingCookie = getCookie("XSRF-TOKEN");
  if (existingCookie) {
    cachedCsrfToken = existingCookie;
    return existingCookie;
  }

  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }

  if (!csrfPromise) {
    csrfPromise = fetchFreshCsrfToken().finally(() => {
      csrfPromise = null;
    });
  }

  return csrfPromise;
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase();
    const isMutatingMethod = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";

    if (isMutatingMethod && typeof window !== "undefined") {
      let token = getCookie("XSRF-TOKEN") || cachedCsrfToken;
      if (!token && !config.url?.includes("/api/auth/csrf")) {
        token = await ensureCsrfToken();
      }
      if (token && config.headers) {
        config.headers["X-XSRF-TOKEN"] = token;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const errorData = error.response?.data;
    const code = errorData?.code || (status === 403 ? "ACCESS_DENIED" : status === 401 ? "UNAUTHORIZED" : "UNEXPECTED_ERROR");

    if (status === 401 && typeof window !== "undefined") {
      const isAuthEndpoint =
        originalRequest?.url?.includes("/api/auth/login") ||
        originalRequest?.url?.includes("/api/auth/register") ||
        originalRequest?.url?.includes("/api/auth/csrf");

      if (!isAuthEndpoint) {
        window.dispatchEvent(
          new CustomEvent("saga:unauthorized", {
            detail: {
              url: originalRequest?.url,
              pathname: window.location.pathname,
            },
          })
        );
      }
    }

    if (status === 403 && code === "PASSWORD_SETUP_REQUIRED" && typeof window !== "undefined") {
      if (!window.location.pathname.startsWith("/auth/setup-password")) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/auth/setup-password";
      }
    }

    const method = originalRequest?.method?.toUpperCase();
    const isMutatingMethod = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";

    if (
      status === 403 &&
      isMutatingMethod &&
      code !== "PASSWORD_SETUP_REQUIRED" &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/csrf")
    ) {
      originalRequest._retry = true;
      const freshToken = await ensureCsrfToken(true);
      if (freshToken) {
        originalRequest.headers["X-XSRF-TOKEN"] = freshToken;
        return apiClient(originalRequest);
      }
    }

    const message =
      errorData?.message ||
      (status === 403
        ? "Yêu cầu bị từ chối truy cập (403 ACCESS_DENIED). Vui lòng kiểm tra lại quyền hạn hoặc phiên làm việc."
        : status === 401
          ? "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
          : error.message || "Đã có lỗi xảy ra trong quá trình kết nối đến máy chủ SAGA.");

    const customError = new Error(message) as Error & { code?: string; status?: number; data?: unknown };
    customError.code = code;
    customError.status = status;
    customError.data = errorData;

    return Promise.reject(customError);
  }
);

export default apiClient;

