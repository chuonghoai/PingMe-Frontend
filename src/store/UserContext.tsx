import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { getAccessToken } from "@/utils/tokenStorage";
import { socketService } from "@/websockets/socketService";

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  fullname: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  level: number;
  currentExp: number;
  address: string;
  pingCoins: number;
  joinAt: string;
  isHideMyLocation: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  userId: "",
  firstName: "Nguoi dung",
  lastName: "Moi",
  fullname: "",
  username: "",
  email: "chua_cap_nhat@email.com",
  avatarUrl: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  bio: "Chưa có tiểu sử",
  level: 1,
  currentExp: 0,
  address: "Chưa cập nhật",
  pingCoins: 0,
  joinAt: "",
  isHideMyLocation: false,
};

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const hydrateSession = async () => {
      const { getAccessToken } = await import("@/utils/tokenStorage");
      const token = await getAccessToken();
      if (token) {
        try {
          // Attempt to hydrate profile via backend
          const res: any = await apiClient.get('/users/me');
          if (res && res.data) {
            setUserProfile({
              ...DEFAULT_PROFILE,
              ...res.data,
              userId: res.data.id || res.data.userId || "",
            });
          }

        } catch (e) {
          console.log("[UserProvider] Failed to hydrate session:", e);
        }
      }
    };
    hydrateSession();
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
