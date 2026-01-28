import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Imports Modulares e Tema
import { FeedbackModal } from "../../common/components/FeedbackModal";
import { COLORS, SHADOWS, SIZES } from "../../common/constants/theme";
import { useEntregas } from "../../entregas"; // ✅ Usando o Hook Gerente

interface ScannerModalProps {
  visible: boolean;
  onClose: () => void;
  titulo: string;
}

export const ScannerModal = ({
  visible,
  onClose,
  titulo,
}: ScannerModalProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // ✅ Usando o hook de entregas para processar a baixa via QR
  const { baixarEntregaQRCode, entregasLoading } = useEntregas();

  const [modalFeedback, setModalFeedback] = useState({
    visible: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  // Reseta o estado ao abrir/fechar
  useEffect(() => {
    if (visible) {
      setScanned(false);
      if (!permission?.granted) {
        requestPermission();
      }
    }
  }, [visible, permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    // Evita múltiplas leituras simultâneas
    if (scanned || entregasLoading) return;

    setScanned(true);

    // ✅ Chamada limpa via Hook
    const res = await baixarEntregaQRCode(data);

    if (res.success) {
      setModalFeedback({
        visible: true,
        type: "success",
        title: "Baixa Concluída!",
        message: "A encomenda foi entregue com sucesso via QR Code.",
      });
    } else {
      setModalFeedback({
        visible: true,
        type: "error",
        title: "Erro na Leitura",
        message: res.error || "Código inválido ou entrega já realizada.",
      });
    }
  };

  const handleCloseFeedback = () => {
    setModalFeedback((prev) => ({ ...prev, visible: false }));
    if (modalFeedback.type === "success") {
      onClose(); // Fecha o scanner se deu sucesso
    } else {
      setScanned(false); // Permite tentar de novo se deu erro
    }
  };

  // Tela de Permissão de Câmera
  if (!permission?.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={COLORS.primary} />
          <Text style={styles.permissionText}>
            O StrategicCond precisa de acesso à câmera para realizar a baixa
            rápida via QR Code.
          </Text>
          <TouchableOpacity
            style={styles.btnPermissao}
            onPress={requestPermission}
          >
            <Text style={styles.btnPermissaoTexto}>ATIVAR CÂMERA</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 25 }}>
            <Text style={{ color: COLORS.textLight, fontWeight: "bold" }}>
              CANCELAR
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          {/* Overlay do Scanner */}
          <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{titulo.toUpperCase()}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <Ionicons name="close-circle" size={36} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.targetContainer}>
              {/* Cantoneiras Estilizadas */}
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />

              {entregasLoading && (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={COLORS.white} />
                  <Text style={styles.loadingText}>Validando...</Text>
                </View>
              )}
            </View>

            <View style={styles.instructionContainer}>
              <Ionicons name="scan-outline" size={20} color={COLORS.white} />
              <Text style={styles.instruction}>
                Aponte para o QR Code do morador
              </Text>
            </View>
          </View>
        </CameraView>

        <FeedbackModal {...modalFeedback} onClose={handleCloseFeedback} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: COLORS.white,
  },
  permissionText: {
    textAlign: "center",
    fontSize: 16,
    color: COLORS.textMain,
    marginVertical: 24,
    lineHeight: 24,
    fontWeight: "500",
  },
  btnPermissao: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  btnPermissaoTexto: {
    color: COLORS.white,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  closeIcon: { position: "absolute", right: 25 },
  targetContainer: {
    width: 260,
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  loadingText: { color: COLORS.white, marginTop: 10, fontWeight: "bold" },
  instructionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  instruction: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 10,
  },
  corner: {
    position: "absolute",
    width: 45,
    height: 45,
    borderColor: COLORS.secondary,
    borderWidth: 5,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 25,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 25,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 25,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 25,
  },
});
