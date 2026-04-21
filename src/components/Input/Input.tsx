import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { PINGME_COLORS } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, isPassword, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={PINGME_COLORS.textSecondary}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsSecure(!isSecure)}
            activeOpacity={0.7}
          >
            {isSecure ? (
              <EyeOff size={20} color={PINGME_COLORS.textSecondary} />
            ) : (
              <Eye size={20} color={PINGME_COLORS.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { 
    marginBottom: 6, 
    fontSize: 14, 
    fontWeight: "700", 
    color: '#0F172A',
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: "hidden",
  },
  inputContainerFocused: {
    borderColor: PINGME_COLORS.primary,
    backgroundColor: PINGME_COLORS.white,
    shadowColor: PINGME_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainerError: { 
    borderColor: PINGME_COLORS.danger,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: PINGME_COLORS.textPrimary,
  },
  eyeIcon: {
    padding: 12,
  },
  errorText: { 
    color: PINGME_COLORS.danger, 
    fontSize: 12, 
    marginTop: 6,
    fontWeight: '600',
  },
});
