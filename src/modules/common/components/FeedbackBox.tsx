import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Animated, StyleSheet, Text } from "react-native";

interface FeedbackBoxProps {
  visible: boolean;
  type: "success" | "error" | "warning" | "info"; // ✅ Adicionado 'info'
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
}

export const FeedbackBox = ({
  visible,
  type,
  message,
  onClose,
  autoClose = true,
}: FeedbackBoxProps) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (autoClose && onClose) {
        const timer = setTimeout(onClose, 4000); // Info pode ficar um pouco mais
        return () => clearTimeout(timer);
      }
    } else {
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  // ✅ Tabela de Cores Estratégicas
  const config = {
    success: {
      bg: "#d4edda",
      border: "#c3e6cb",
      text: "#155724",
      icon: "checkmark-circle",
    },
    error: {
      bg: "#f8d7da",
      border: "#f5c6cb",
      text: "#721c24",
      icon: "alert-circle",
    },
    warning: {
      bg: "#fff3cd",
      border: "#ffeeba",
      text: "#856404",
      icon: "warning",
    },
    info: {
      bg: "#d1ecf1",
      border: "#bee5eb",
      text: "#0c5460",
      icon: "information-circle",
    }, // ✅ Estilo Info
  };

  const style = config[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: style.bg, borderColor: style.border, opacity },
      ]}
    >
      <Ionicons name={style.icon as any} size={20} color={style.text} />
      <Text style={[styles.message, { color: style.text }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 15,
    width: "100%",
  },
  message: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 10,
    flex: 1,
  },
});
