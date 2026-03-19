import { authApi } from "@/src/services/authApi";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { styles } from "./ProfileSetupScreen.styles";

export const ProfileSetupScreen = () => {
  const router = useRouter();
  // Lấy email từ params (được truyền sang từ màn hình Register/Login)
  const params = useLocalSearchParams();
  const userEmail = (params?.email as string) || "alice@gmail.com"; // Fallback để test

  // --- STATES ---
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("MALE");
  const [dob, setDob] = useState(new Date(2000, 0, 1)); // Mặc định 01/01/2000

  // UI Control States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- DỮ LIỆU GIỚI TÍNH ---
  const genderOptions = [
    { label: "Nam", value: "MALE" },
    { label: "Nữ", value: "FEMALE" },
  ];

  // --- XỬ LÝ CHỌN NGÀY SINH ---
  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Trên Android, khi chọn xong sẽ tự đóng (event type = set/dismissed)
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate && event.type !== "dismissed") {
      setDob(selectedDate);
    }
  };

  // --- XỬ LÝ GỌI API ---
  const handleSubmit = async () => {
    if (!fullname.trim() || !phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ họ tên và số điện thoại.");
      return;
    }

    try {
      setIsLoading(true);
      // Backend thường yêu cầu ngày sinh format chuẩn YYYY-MM-DD
      const dobString = dob.toISOString().split("T")[0];

      const response: any = await authApi.addProfile({
        email: userEmail,
        fullname: fullname.trim(),
        phone: phone.trim(),
        gender,
        dob: dobString,
      });

      if (response.success) {
        // Cập nhật thành công, sang bước cấp quyền vị trí
        router.replace("/(onboarding)/location-permission");
      }
    } catch (error: any) {
      Alert.alert("Cập nhật hồ sơ thất bại", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  // Helper để hiển thị text
  const displayGender =
    genderOptions.find((g) => g.value === gender)?.label || "Chọn giới tính";
  const displayDob = `${dob.getDate().toString().padStart(2, "0")}/${(dob.getMonth() + 1).toString().padStart(2, "0")}/${dob.getFullYear()}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoàn thiện hồ sơ</Text>
      <Text style={styles.subtitle}>
        Cung cấp thêm thông tin để trải nghiệm PingMe tốt nhất
      </Text>

      <Input
        label="Họ và tên"
        placeholder="Nhập họ và tên của bạn"
        value={fullname}
        onChangeText={setFullname}
      />

      <Input
        label="Số điện thoại"
        placeholder="Nhập số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {/* --- COMBO BOX CHỌN GIỚI TÍNH --- */}
      <Text style={styles.label}>Giới tính</Text>
      <TouchableOpacity
        style={styles.selectorBox}
        onPress={() => setShowGenderPicker(true)}
      >
        <Text style={styles.selectorText}>{displayGender}</Text>
      </TouchableOpacity>

      {/* --- POPUP CHỌN NGÀY SINH --- */}
      <Text style={styles.label}>Ngày sinh</Text>
      <TouchableOpacity
        style={styles.selectorBox}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.selectorText}>{displayDob}</Text>
      </TouchableOpacity>

      {/* Hiển thị DatePicker (Native UI) */}
      {showDatePicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()} // Không cho chọn ngày trong tương lai
        />
      )}

      {/* Nút Done cho iOS Picker (Vì iOS spinner không có nút OK tự động đóng) */}
      {showDatePicker && Platform.OS === "ios" && (
        <Button
          title="Xác nhận ngày sinh"
          onPress={() => setShowDatePicker(false)}
          style={{ marginBottom: 15 }}
        />
      )}

      {/* --- MODAL CHỌN GIỚI TÍNH TỰ TẠO --- */}
      <Modal visible={showGenderPicker} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn giới tính</Text>
            <FlatList
              data={genderOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setGender(item.value);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      gender === item.value && styles.modalItemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={{ marginTop: 20 }}>
        <Button
          title={isLoading ? "Đang cập nhật..." : "Tiếp tục"}
          onPress={handleSubmit}
          disabled={isLoading}
        />
      </View>
    </View>
  );
};
