 
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const getBaseUrl = () => {
  // if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return "http://localhost:3000";
};

export const BASE_URL = getBaseUrl();

// Khởi tạo một instance của Axios
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- HÀM HỖ TRỢ LẤY/XÓA TOKEN ĐA NỀN TẢNG ---
const getToken = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem("accessToken");
  }
  return await SecureStore.getItemAsync("accessToken");
};

const removeToken = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } else {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
  }
};

// --- INTERCEPTOR: REQUEST ---
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Lỗi khi lấy token", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- INTERCEPTOR: RESPONSE ---
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
      console.log("Token hết hạn hoặc không hợp lệ. Thực hiện xóa token...");

      await removeToken();
      router.replace("/(auth)/login");
    }
    const errMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      "Có lỗi xảy ra, vui lòng thử lại";

    return Promise.reject(errMessage);
  },
);
