import axios from "axios";
import { router } from "expo-router";
import { tokenStorage } from "./storage";
import { API_ENDPOINTS } from "./endpoints";

// Get base URL from environment variables
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT token if present
apiClient.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global response behaviors (e.g. 401 unauthorized handling)
apiClient.interceptors.response.use(
  (response) => {
    console.log("Response data:", response.data)
    return response
  },
  async (error) => {
    const originalRequest = error.config;
    console.log("Response error:", error)
    // Determine if the request was an auth check (like login or verify) to avoid loop or premature signout
    const isAuthRoute =
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REGISTER) ||
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.VERIFY) ||
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.RESET_PASSWORD);

    // If unauthorized (401) and not a direct credentials check, clear the token and force sign-out
    if (error.response?.status === 401 && !isAuthRoute) {
      console.warn("Session expired or invalid token. Redirecting to login...");
      await tokenStorage.removeToken();

      // Attempt to redirect the user to the login screen
      try {
        router.replace("/auth/login");
      } catch (routingError) {
        console.error("Failed to redirect to login screen in API interceptor:", routingError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
