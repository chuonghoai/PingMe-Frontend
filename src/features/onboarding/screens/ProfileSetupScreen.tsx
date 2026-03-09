import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { useUser } from "../../../store/UserContext";

// Nạp Styles và Bảng màu từ file bên ngoài vào
import { COLORS, styles } from "./ProfileSetupScreen.styles";

export const ProfileSetupScreen = () => {
  const router = useRouter();

  // Lấy hàm cập nhật từ Context
  const { updateUserProfile } = useUser();

  // Tách fullName thành firstName và lastName để khớp với UML và Database
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  const handleNext = () => {
    // Đẩy dữ liệu vào kho lưu trữ (Context) trước khi chuyển trang
    updateUserProfile({
      firstName: firstName || "Người dùng",
      lastName: lastName || "Mới",
      phone: phone || "Chưa cập nhật",
      // Dù UserContext hiện tại không hiển thị gender/dob,
      // ta vẫn lưu tạm để sau này gọi API authApi.addProfile
    });

    router.push("/(onboarding)/location-permission");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Khối Logo GoGo đồng bộ */}
      <View style={styles.logoContainer}>
        <View style={styles.logoRow}>
          <Text style={styles.logoTextMain}>Go</Text>
          <Text style={styles.logoTextSecondary}>Go</Text>
        </View>
      </View>

      <Text style={styles.title}>Cập nhật thông tin</Text>
      <Text style={styles.subtitle}>Hãy cho chúng tôi biết thêm về bạn</Text>

      <Input
        label="Họ (Last Name)"
        placeholder="VD: Phạm"
        value={lastName}
        onChangeText={setLastName}
      />
      <Input
        label="Tên (First Name)"
        placeholder="VD: Hoài Nam"
        value={firstName}
        onChangeText={setFirstName}
      />
      <Input
        label="Số điện thoại"
        placeholder="Nhập số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Input
        label="Giới tính"
        placeholder="Nam / Nữ / Khác"
        value={gender}
        onChangeText={setGender}
      />
      <Input
        label="Ngày sinh"
        placeholder="DD/MM/YYYY"
        value={dob}
        onChangeText={setDob}
      />

      {/* Đổi màu nền nút bấm sang Vàng Hổ Phách */}
      <Button
        title="Tiếp tục"
        onPress={handleNext}
        style={{ marginTop: 30, backgroundColor: COLORS.amberGold }}
      />
    </ScrollView>
  );
};
