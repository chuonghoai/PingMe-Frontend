import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";
import { getAccessToken } from "../utils/tokenStorage";
import { socketService } from "../websockets/socketService";

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
  firstName: "Nguoi dung",
  lastName: "Moi",
  email: "chua_cap_nhat@email.com",
  avatarUrl: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  bio: "Chua co tieu su",
};

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getAccessToken();

        if (token) {
          const response: any = await apiClient.get("/users/me");
          if (response.success) {
            setUserProfile({
              userId: response.data.id,
              email: response.data.email,
              firstName: response.data.fullname,
              lastName: "",
              avatarUrl: response.data.avatarUrl || DEFAULT_PROFILE.avatarUrl,
              bio: response.data.bio || DEFAULT_PROFILE.bio,
            });
          }
        }
      } catch (error) {
        console.log("Phien dang nhap het han hoac loi", error);
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
