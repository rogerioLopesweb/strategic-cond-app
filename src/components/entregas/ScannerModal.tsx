import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/theme";

interface ScannerModalProps {
  visible: boolean;
  onClose: () => void;
  titulo?: string;
}

export default function ScannerModal({
  visible,
  onClose,
  titulo = "Escanear QR Code",
}: ScannerModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header com padding superior manual para compensar o SafeAreaView */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.titulo}>{titulo}</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Área da Câmera Simulada */}
        <View style={styles.cameraPlaceholder}>
          <View style={styles.overlay}>
            <View style={styles.unfocusedContainer} />
            <View style={styles.middleRow}>
              <View style={styles.unfocusedContainer} />
              <View style={styles.focusedContainer}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <View style={styles.unfocusedContainer} />
            </View>
            <View style={styles.unfocusedContainer} />
          </View>

          <Text style={styles.instrucao}>Aponte para o código do morador</Text>
        </View>

        {/* Rodapé com controles */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="flash-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>Lanterna</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="images-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>Galeria</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    // Ajuste para não colidir com o topo do celular
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  closeBtn: { padding: 5 },
  titulo: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
  },
  instrucao: {
    color: "#fff",
    position: "absolute",
    bottom: 50,
    fontSize: 14,
    fontWeight: "500",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  overlay: { flex: 1, width: "100%" },
  unfocusedContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  middleRow: { flexDirection: "row", height: 250 },
  focusedContainer: { width: 250, position: "relative" },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: COLORS.secondary,
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 30,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  actionBtn: { alignItems: "center" },
  actionText: { color: "#fff", fontSize: 12, marginTop: 5 },
});
