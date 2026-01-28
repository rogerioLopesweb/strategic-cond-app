import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, SIZES } from "../constants/theme";

interface FeedbackModalProps {
  visible: boolean;
  type: "success" | "error" | "warning" | "confirm";
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void; // Apenas para o tipo 'confirm'
}

export const FeedbackModal = ({
  visible,
  type,
  title,
  message,
  onClose,
  onConfirm,
}: FeedbackModalProps) => {
  const getConfig = () => {
    switch (type) {
      case "success":
        return { icon: "checkmark-circle", color: "#27ae60", btnText: "OK" };
      case "error":
        return { icon: "close-circle", color: "#e74c3c", btnText: "FECHAR" };
      case "warning":
        return { icon: "alert-circle", color: "#f39c12", btnText: "ENTENDI" };
      case "confirm":
        return {
          icon: "help-circle",
          color: COLORS.secondary,
          btnText: "SIM, CONFIRMAR",
        };
    }
  };

  const config = getConfig();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: config.color + "20" },
            ]}
          >
            <Ionicons
              name={config.icon as any}
              size={50}
              color={config.color}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.footer}>
            {type === "confirm" && (
              <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                <Text style={styles.btnCancelText}>CANCELAR</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: config.color }]}
              onPress={onConfirm || onClose}
            >
              <Text style={styles.btnActionText}>{config.btnText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 25,
    width: "100%", // Ocupa tudo em celulares
    maxWidth: 650, // ✅ Trava em 650px em telas grandes (Admin/Tablet)
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  footer: { flexDirection: "row", width: "100%", justifyContent: "center" },
  btnAction: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnActionText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 10,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  btnCancelText: { color: "#7f8c8d", fontWeight: "bold" },
});
