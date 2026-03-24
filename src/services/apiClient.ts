import axios from "axios";
import { router } from "expo-router";
import { Platform } from "react-native";
import { clearTokens, getAccessToken } from "../utils/tokenStorage";

const getBaseUrl = () => {
  if (Platform.OS === "web") {
    return process.env.EXPO_PUBLIC_API_URL_WEB;
  }

  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_API_URL_ANDROID;
  }

  return process.env.EXPO_PUBLIC_API_URL_ANDROID;
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

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;
      console.log("Token het han hoac khong hop le. Thuc hien xoa token...");

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
