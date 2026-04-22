import { clearTokens, getAccessToken } from "@/utils/tokenStorage";
import axios from "axios";
import { router } from "expo-router";
import { Platform } from "react-native";

const getBaseUrl = () => {
  if (Platform.OS === "web") {
    return process.env.EXPO_PUBLIC_API_URL_WEB ?? "http://localhost:3000";
  }
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_API_URL_ANDROID ?? "http://10.0.2.2:3000";
  }
  return process.env.EXPO_PUBLIC_API_URL_DEVICE ?? "http://192.168.1.32:3000";
};

export const BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getToken = async () => {
  return getAccessToken();
};

const removeToken = async () => {
  await clearTokens();
};

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Loi khi lay token", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized = error.response && error.response.status === 401;
    const isUserNotFound = error.response && error.response.status === 404 && originalRequest.url?.includes("/users/me");

    if (
      (isUnauthorized || isUserNotFound) &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;
      console.log("Token hết hạn hoặc user không tồn tại. Thực hiện xóa token...");

      await removeToken();
      router.replace("/(auth)/login");
    }

    const errMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      "Co loi xay ra, vui long thu lai";

    return Promise.reject(errMessage);
  },
);
