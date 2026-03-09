import axios from "axios";
import * as SecureStore from "expo-secure-store";

// --- CẤU HÌNH BASE URL ---
// Nếu dùng máy ảo Android (Emulator) gọi về Spring Boot ở máy tính (localhost:8080)
// Bạn PHẢI dùng IP 10.0.2.2 thay vì localhost.
// Nếu dùng điện thoại thật, bạn phải dùng IP LAN của máy tính (VD: 192.168.1.X:8080)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api";

// Khởi tạo một instance của Axios
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Timeout sau 10 giây nếu server không phản hồi
  headers: {
    "Content-Type": "application/json",
  },
});

// --- INTERCEPTOR: REQUEST (Trước khi gửi API đi) ---
// Tự động đính kèm Token (JWT) vào mọi request nếu người dùng đã đăng nhập
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Lấy token từ bộ nhớ an toàn của điện thoại
      const token = await SecureStore.getItemAsync("userToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Lỗi khi lấy token từ SecureStore", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- INTERCEPTOR: RESPONSE (Khi nhận kết quả từ Server về) ---
// Xử lý chung các lỗi trả về từ Spring Boot (VD: Hết hạn Token)
apiClient.interceptors.response.use(
  (response) => {
    // Nếu thành công, chỉ lấy phần data để code ở UI gọn hơn
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Xử lý lỗi 401 Unauthorized (Token sai hoặc hết hạn)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      console.log("Token hết hạn hoặc không hợp lệ. Thực hiện đăng xuất...");
      // Xóa token cũ
      await SecureStore.deleteItemAsync("userToken");

      // Tùy chọn: Ở đây bạn có thể dùng một event hoặc callback để ép App đá người dùng về màn Login
      // (Vì hàm này nằm ngoài Component nên không gọi trực tiếp useRouter được)
    }

    return Promise.reject(error);
  },
);
