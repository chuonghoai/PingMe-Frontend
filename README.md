<div align="center">

# 📱 PingMe App

**Ứng dụng di động Nhắn tin, Gọi điện & Chia sẻ vị trí theo thời gian thực**

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=for-the-badge&logo=react&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)

> Ứng dụng di động đa nền tảng (Android / iOS) được xây dựng trên nền tảng **Expo & React Native**, cung cấp trải nghiệm nhắn tin thời gian thực, gọi Audio/Video P2P, và hệ thống khám phá bản đồ tương tác độc đáo.

</div>

---

## 🌟 1. Tính năng chính

Ứng dụng được thiết kế theo kiến trúc **Feature-based**, tách biệt rõ ràng giữa UI, logic và dịch vụ:

### 🔐 Xác thực & Tài khoản (Auth)

- Đăng ký, đăng nhập bằng email và mật khẩu.
- Quản lý phiên làm việc bằng **JWT** (Access Token & Refresh Token) lưu trữ an toàn với **Expo Secure Store**.
- Xác thực OTP qua Email khi đăng ký và quên mật khẩu.

### 💬 Nhắn tin thời gian thực (Chat)

- **Real-time Messaging** qua **Socket.IO**: nhắn tin 1-1, hiển thị trạng thái "đang nhập", "đã xem".
- Gửi ảnh, video trực tiếp trong cuộc trò chuyện.
- Danh sách cuộc trò chuyện cập nhật tức thì khi có tin nhắn mới.

### 📞 Gọi Audio & Video (WebRTC)

- Thiết lập cuộc gọi **Audio/Video P2P** trực tiếp giữa hai thiết bị thông qua giao thức **WebRTC**.
- Hiển thị giao diện cuộc gọi đến/đi với điều khiển: tắt mic, bật/tắt camera, gác máy.
- Tích hợp **InCall Manager** để xử lý loa ngoài và các hành vi âm thanh hệ thống.

### 🗺️ Khám phá & Thử thách Bản đồ (Map Challenges)

- Hiển thị bản đồ tương tác với **React Native Maps** và theo dõi vị trí GPS người dùng, bạn bè.
- Theo dõi vị trí **dưới nền (Background Location)** với **Expo Task Manager**.
- Tham gia sự kiện, thử thách tại các địa điểm thực tế để nhận **Vật phẩm** phần thưởng.

### 📸 Khoảnh khắc (Moments)

- Chụp ảnh, quay video và đăng tải lên **Cloudinary** trực tiếp từ ứng dụng.
- Duyệt, thích và báo cáo bài đăng của bạn bè trong feed cộng đồng.

### 🔔 Thông báo đẩy (Push Notifications)

- Nhận thông báo thời gian thực khi có tin nhắn mới, cuộc gọi đến, hoặc sự kiện mới.
- Tích hợp **Expo Notifications** và **Notifee** để hiển thị thông báo phong phú ngay cả khi ứng dụng đang chạy nền.

### 👤 Hồ sơ & Kho đồ (Profile & Inventory)

- Xem và chỉnh sửa thông tin cá nhân, ảnh đại diện.
- Quản lý Vật phẩm đã thu thập từ các thử thách bản đồ.

---

## 🛠️ 2. Công nghệ sử dụng

| Hạng mục | Công nghệ |
|---|---|
| **Core Framework** | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (~54) |
| **Ngôn ngữ** | TypeScript |
| **Điều hướng** | Expo Router (file-based) + React Navigation |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **HTTP Client** | Axios |
| **Real-time** | Socket.IO Client |
| **Gọi Video/Audio** | react-native-webrtc + react-native-incall-manager |
| **Bản đồ** | React Native Maps + Expo Location |
| **Thông báo** | Expo Notifications + @notifee/react-native |
| **Camera & Media** | Expo Camera, Expo Image Picker, Expo AV |
| **Lưu trữ bảo mật** | Expo Secure Store + AsyncStorage |
| **Animation** | React Native Reanimated + Gesture Handler |
| **Icons** | Expo Vector Icons + Lucide React Native |

---

## 🚀 3. Cách cài đặt và chạy Project

### 📋 Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) phiên bản **v18+**
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- **Android Studio** (để chạy trên Emulator) hoặc thiết bị Android thật
- Máy chủ [PingMe Backend](https://github.com/chuonghoai/PingMe-Backend.git) đang chạy và có thể truy cập được

### 💻 Các bước thực hiện

**Bước 1: Clone project về máy**

```bash
git clone https://github.com/chuonghoai/PingMe-Frontend.git
cd PingMe-Frontend
```

**Bước 2: Cài đặt dependencies**

```bash
npm install
```

**Bước 3: Cấu hình biến môi trường**

Tạo file `.env` ở thư mục gốc (xem hướng dẫn chi tiết ở mục 4).

**Bước 4: Khởi chạy ứng dụng**

```bash
# Chạy trực tiếp trên thiết bị/emulator Android
npx expo run:android

# Chạy trực tiếp trên iOS Simulator (macOS)
npx expo run:ios

# Nếu đã chạy 1 trong 2 lệnh trên, lần sau chỉ cần chạy:
npx expo start
```

**Bước 5: Mở ứng dụng**

Sau khi server khởi động, quét **QR Code** bằng ứng dụng **Expo Go** (nếu dùng Expo Go) hoặc ứng dụng sẽ tự động cài lên thiết bị/emulator đã kết nối.

---

## ⚙️ 4. Cấu hình Environment

Tạo file `.env` ở thư mục gốc của project (ngang hàng với `package.json`) với nội dung sau:

```env
# ==========================================
# API Server URLs
# ==========================================

# URL khi chạy trên web (localhost) hoặc iOS Simulator
EXPO_PUBLIC_API_URL_WEB=http://localhost:3000

# URL khi chạy trên thiết bị Android thật (dùng IP LAN của máy host)
EXPO_PUBLIC_API_URL_ANDROID=http://192.168.x.x:3000
```

> **Lưu ý:** Thay `192.168.x.x` bằng địa chỉ IP LAN thực tế của máy tính đang chạy Backend. Xem IP bằng lệnh `ipconfig` (Windows) hoặc `ifconfig` (macOS/Linux). Đảm bảo thiết bị Android và máy tính đang kết nối **cùng một mạng Wi-Fi**.

---

## 🤝 5. Đóng góp (Contributing)

Mọi đóng góp để phát triển dự án luôn được trân trọng!

1. 🍴 **Fork** dự án
2. 🌿 Tạo nhánh tính năng: `git checkout -b feature/AwesomeFeature`
3. 💾 **Commit** thay đổi: `git commit -m 'Thêm tính năng AwesomeFeature'`
4. 🚀 **Push** lên nhánh: `git push origin feature/AwesomeFeature`
5. 📬 Mở **Pull Request** và mô tả chi tiết thay đổi của bạn

---

## 👨‍💻 6. Credits / Author

- **Dự án:** Ứng dụng PingMe (Nhắn tin & Chia sẻ vị trí)
- **Phát triển bởi:**
  * **Trương Hoài Chương**
  * **Phạm Hoài Nam**
- **Môn học:** Lập trình di động nâng cao
- **Trường:** Đại học Công nghệ Kỹ thuật TP.HCM (HCMUTE)

---

<div align="center">
<i>Dự án này là mã nguồn mở và được tạo ra với mục đích học tập.</i>
</div>
