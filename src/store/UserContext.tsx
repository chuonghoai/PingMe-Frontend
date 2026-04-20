import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { getAccessToken } from "@/utils/tokenStorage";
import { socketService } from "@/websockets/socketService";

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  level: number;
  currentExp: number;
  address: string;
}

const DEFAULT_PROFILE: UserProfile = {
  userId: "",
  firstName: "Nguoi dung",
  lastName: "Moi",
  email: "chua_cap_nhat@email.com",
  avatarUrl: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  bio: "Chưa có tiểu sử",
  level: 1,
  currentExp: 0,
  address: "Chưa cập nhật",
};

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    // Unconditionally wipe tokens on app launch to force manual login
    const wipeSession = async () => {
      const { clearTokens } = await import("@/utils/tokenStorage");
      await clearTokens();
      setUserProfile(DEFAULT_PROFILE);
    };
    wipeSession();
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
    socketService.disconnect(); // Explicitly disconnect → backend marks user offline
    setUserProfile(DEFAULT_PROFILE);
  };

  return (
    <UserContext.Provider value={{ userProfile, updateUserProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
