import React, { createContext, useContext, useState } from "react";

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
