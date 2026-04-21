import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import notifee, { AndroidImportance, AndroidCategory, EventType } from '@notifee/react-native';
import { socketService } from '@/websockets/socketService';
import { useRouter } from 'expo-router';

export const BackgroundNotificationHandler = () => {
  const appState = useRef(AppState.currentState);
  const router = useRouter();

  useEffect(() => {
    // 1. Xin quyền Notification của HĐH (Android 13+ / iOS)
    async function requestPermissions() {
      await notifee.requestPermission();
    }
    requestPermissions();

    // 2. Định nghĩa các Kênh thông báo trên Android (Bắt buộc)
    async function createChannels() {
      // Kênh Chat thường
      await notifee.createChannel({
        id: 'chat_messages',
        name: 'Tin nhắn mới',
        importance: AndroidImportance.HIGH,
      });

      // Kênh Cuộc gọi (Vượt qua Màn hình khóa, Đổ chuông to)
      await notifee.createChannel({
        id: 'incoming_calls',
        name: 'Cuộc gọi đến',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });
    }
    if (Platform.OS === 'android') {
      createChannels();
    }

    // 3. Lắng nghe trạng thái của App (Mở / Ẩn nền)
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
    });

    // 4. Hook vào Socket.io lắng nghe TIN NHẮN (hiện thông báo)
    const onReceiveMessage = async (msg: any) => {
      // Chỉ báo Noti khi người dùng đang không mở App
      if (appState.current.match(/inactive|background/)) {
        await notifee.displayNotification({
          title: `💬 Tin nhắn từ ${msg.senderName || 'Ai đó'}`,
          body: msg.content || 'Đã gửi một ảnh tĩnh.',
          android: {
            channelId: 'chat_messages',
            smallIcon: 'ic_launcher', // Yêu cầu icon mặc định
            pressAction: {
              id: 'default',
            },
          },
        });
      }
    };

    // 5. Hook vào Socket.io lắng nghe CUỘC GỌI TOÀN MÀN HÌNH (Zalo-style)
    const onIncomingCall = async (callData: any) => {
      if (appState.current.match(/inactive|background/)) {
        await notifee.displayNotification({
          title: '📞 Cuộc gọi Video đến',
          body: `${callData.callerName || 'Chưa rõ'} đang gọi cho bạn...`,
          android: {
            channelId: 'incoming_calls',
            smallIcon: 'ic_launcher',
            category: AndroidCategory.CALL,
            // Cài đặt Full-Screen Intent đánh thức màn hình sáng lên
            fullScreenAction: {
              id: 'default',
              mainComponent: 'PingMe', 
            },
            pressAction: {
              id: 'default',
            },
            actions: [
              {
                title: '❌ TỪ CHỐI',
                pressAction: { id: 'reject_call' },
              },
              {
                title: '✅ NGHE MÁY',
                pressAction: { id: 'accept_call' },
              },
            ],
          },
        });
      }
    };

    socketService.on("receive_message", onReceiveMessage);
    socketService.on("incoming_call", onIncomingCall);

    return () => {
      subscription.remove();
      socketService.off("receive_message", onReceiveMessage);
      socketService.off("incoming_call", onIncomingCall);
    };
  }, []);

  // Lắng nghe thao tác Bấm vào Noti khi app đang ở Nền (Mở phòng Call)
  useEffect(() => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.ACTION_PRESS:
          if (detail.pressAction?.id === 'accept_call') {
            console.log("Chap nhan cuoc goi tu Notifee");
            // Routing tới chức năng cuộc gọi tương lai
          } else if (detail.pressAction?.id === 'reject_call') {
            // Huy cuoc goi
          }
          break;
        case EventType.PRESS:
          // Bấm vào tin nhắn
          router.push("/(main)/chat" as any);
          break;
      }
    });
  }, []);

  return null;
};
