import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export const Button: React.FC<ButtonProps> = ({
  title,
  loading,
  variant = "primary",
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[`${variant}Button`], style]}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#007AFF" : "#fff"} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  primaryButton: { backgroundColor: "#007AFF" },
  secondaryButton: { backgroundColor: "#34C759" },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  text: { fontSize: 16, fontWeight: "bold" },
  primaryText: { color: "#fff" },
  secondaryText: { color: "#fff" },
  outlineText: { color: "#007AFF" },
});
