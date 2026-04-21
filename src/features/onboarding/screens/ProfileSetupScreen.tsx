import { authApi } from "@/services/authApi";
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
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { styles } from "./ProfileSetupScreen.styles";
import { setTokens } from "@/utils/tokenStorage";
import { useUser } from "@/store/UserContext";

export const ProfileSetupScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userEmail = (params?.email as string) || "alice@gmail.com";
  const { updateUserProfile } = useUser();

  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("MALE");
  const [dob, setDob] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const genderOptions = [
    { label: "Nam", value: "MALE" },
    { label: "Nu", value: "FEMALE" },
  ];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Android: dialog tự đóng sau khi chọn hoặc dismiss
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    // Chỉ cập nhật nếu user thực sự chọn ngày (không phải dismiss)
    if (event?.type === "dismissed") return;
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!fullname.trim() || !phone.trim()) {
      showMessage("Loi", "Vui long nhap day du ho ten va so dien thoai.");
      return;
    }

    try {
      setIsLoading(true);
      const dobString = dob.toISOString().split("T")[0];

      const response: any = await authApi.addProfile({
        email: userEmail,
        fullname: fullname.trim(),
        phone: phone.trim(),
        gender,
        dob: dobString,
      });

      if (response.success) {
        // Tự động đăng nhập
        if (response.data && response.data.accessToken) {
          await setTokens(response.data.accessToken, response.data.refreshToken);
          
          updateUserProfile({
            userId: response.data.user.userId,
            email: response.data.user.email,
          });
        }
        
        router.replace("/(onboarding)/location-permission");
      }
    } catch (error: any) {
      showMessage("Cap nhat ho so that bai", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const displayGender =
    genderOptions.find((item) => item.value === gender)?.label ||
    "Chon gioi tinh";
  const displayDob = `${dob.getDate().toString().padStart(2, "0")}/${(
    dob.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${dob.getFullYear()}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoan thien ho so</Text>
      <Text style={styles.subtitle}>
        Cung cap them thong tin de trai nghiem PingMe tot nhat
      </Text>

      <Input
        label="Ho va ten"
        placeholder="Nhap ho va ten cua ban"
        value={fullname}
        onChangeText={setFullname}
      />

      <Input
        label="So dien thoai"
        placeholder="Nhap so dien thoai"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Gioi tinh</Text>
      <TouchableOpacity
        style={styles.selectorBox}
        onPress={() => setShowGenderPicker(true)}
      >
        <Text style={styles.selectorText}>{displayGender}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Ngay sinh</Text>
      <TouchableOpacity
        style={styles.selectorBox}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.selectorText}>{displayDob}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {showDatePicker && Platform.OS === "ios" && (
        <Button
          title="Xac nhan ngay sinh"
          onPress={() => setShowDatePicker(false)}
          style={{ marginBottom: 15 }}
        />
      )}

      <Modal visible={showGenderPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chon gioi tinh</Text>
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
          title={isLoading ? "Dang cap nhat..." : "Tiep tuc"}
          onPress={handleSubmit}
          disabled={isLoading}
        />
      </View>
    </View>
  );
};
