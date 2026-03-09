import React, { createContext, useContext, useState } from "react";

// 1. Chuyển toàn bộ dữ liệu giả lập (Mock Data) vào đây
const INITIAL_CHAT_LIST = [
  {
    id: "1",
    name: "Hoài Chương",
    lastMessage: "game k br?",
    time: "5 giờ",
    unread: 1,
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
  {
    id: "2",
    name: "Nhóm lập trình di động",
    lastMessage: "Bạn: @Pham Hoai Nam nộp bài cho cô chưa",
    time: "12 giờ",
    unread: 0,
    avatar: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
  },
];

// Cấu trúc: { 'id_người_chat': [mảng tin nhắn] }
const INITIAL_MESSAGES: Record<string, any[]> = {
  "1": [
    { id: "msg1", text: "Tối nay rảnh không?", sender: "them", time: "19:00" },
    { id: "msg2", text: "game k br?", sender: "them", time: "5 giờ" },
  ],
  "2": [
    { id: "msg3", text: "Cô dặn thứ 2 nộp nhé", sender: "them", time: "10:00" },
    {
      id: "msg4",
      text: "@Pham Hoai Nam nộp bài cho cô chưa",
      sender: "me",
      time: "12 giờ",
    },
  ],
};

// 2. Tạo Context
const ChatContext = createContext<any>(null);

// 3. Tạo Provider để bọc ứng dụng
export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatList, setChatList] = useState(INITIAL_CHAT_LIST);
  const [messagesStore, setMessagesStore] = useState(INITIAL_MESSAGES);

  // Hàm gửi tin nhắn toàn cục
  const sendMessage = (chatId: string, text: string) => {
    const newMessage = {
      id: Date.now().toString(),
      text: text,
      sender: "me",
      time: "Bây giờ",
    };

    // Cập nhật tin nhắn trong phòng chat
    setMessagesStore((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));

    // Cập nhật "Tin nhắn cuối" ở màn hình Danh sách chat
    setChatList((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: `Bạn: ${text}`,
              time: "Vừa xong",
              unread: 0,
            }
          : chat,
      ),
    );
  };

  return (
    <ChatContext.Provider value={{ chatList, messagesStore, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook để gọi dữ liệu cho lẹ
export const useChat = () => useContext(ChatContext);
