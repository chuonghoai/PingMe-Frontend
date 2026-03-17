import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { apiClient } from "../services/apiClient";
import { socketService } from "../websockets/socketService";

// Cập nhật cấu trúc khớp với ProfileResponse từ Backend
export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  bio: string;
}

const DEFAULT_PROFILE: UserProfile = {
  userId: "",
  firstName: "Người dùng",
  lastName: "Mới",
  email: "chua_cap_nhat@email.com",
  avatarUrl: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  bio: "Chưa có tiểu sử",
};

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        let token = null;
        if (Platform.OS === "web") {
          token = localStorage.getItem("accessToken");
        } else {
          token = await SecureStore.getItemAsync("accessToken");
        }

        // Nếu có token lưu trong máy, gọi API lấy thông tin Profile
        if (token) {
          const response: any = await apiClient.get("/users/me");
          if (response.success) {
            setUserProfile({
              userId: response.data.id, // TypeORM lưu là id
              email: response.data.email,
              firstName: response.data.fullname,
              lastName: "",
              avatarUrl: response.data.avatarUrl || DEFAULT_PROFILE.avatarUrl,
              bio: response.data.bio || DEFAULT_PROFILE.bio,
            });
          }
        }
      } catch (error) {
        console.log("Phiên đăng nhập hết hạn hoặc lỗi", error);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (userProfile.userId) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [userProfile.userId]);

  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...data }));
  };

  const logout = () => {
    setUserProfile(DEFAULT_PROFILE);
  };

  return (
    <UserContext.Provider value={{ userProfile, updateUserProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
