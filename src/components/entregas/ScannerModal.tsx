import { COLORS } from "@/src/constants/theme";
import { entregaService } from "@/src/services/entregaService";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FeedbackModal } from "../common/FeedbackModal";

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
  const [loading, setLoading] = useState(false);

  // Estado para feedback após o scan
  const [modalFeedback, setModalFeedback] = useState({
    visible: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  // Solicita permissão ao abrir se ainda não tiver
  React.useEffect(() => {
    if (visible && (!permission || !permission.granted)) {
      requestPermission();
    }
    if (visible) setScanned(false); // Reseta o estado ao abrir
  }, [visible]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      // data deve ser o UUID da entrega contido no QR Code
      const res = await entregaService.registrarSaidaQRCode(data);

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
    } catch (error) {
      setModalFeedback({
        visible: true,
        type: "error",
        title: "Falha Técnica",
        message: "Não foi possível comunicar com o servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseFeedback = () => {
    setModalFeedback({ ...modalFeedback, visible: false });
    if (modalFeedback.type === "success") {
      onClose(); // Se deu certo, fecha o scanner também
    } else {
      setScanned(false); // Se deu erro, permite escanear novamente
    }
  };

  if (!permission?.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={COLORS.primary} />
          <Text style={styles.permissionText}>
            O StrategicCond precisa de acesso à câmera para ler o QR Code de
            saída.
          </Text>
          <TouchableOpacity
            style={styles.btnPermissao}
            onPress={requestPermission}
          >
            <Text style={styles.btnPermissaoTexto}>ATIVAR CÂMERA</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
            <Text style={{ color: COLORS.textLight }}>Cancelar</Text>
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
          {/* OVERLAY DO SCANNER */}
          <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{titulo}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <Ionicons name="close-circle" size={32} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.targetContainer}>
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />

              {loading && <ActivityIndicator size="large" color="#fff" />}
            </View>

            <Text style={styles.instruction}>
              Aponte para o QR Code do morador
            </Text>
          </View>
        </CameraView>

        <FeedbackModal
          visible={modalFeedback.visible}
          type={modalFeedback.type}
          title={modalFeedback.title}
          message={modalFeedback.message}
          onClose={handleCloseFeedback}
        />
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
    backgroundColor: "#fff",
  },
  permissionText: {
    textAlign: "center",
    fontSize: 16,
    color: COLORS.textMain,
    marginVertical: 20,
    lineHeight: 24,
  },
  btnPermissao: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  btnPermissaoTexto: { color: "#fff", fontWeight: "bold" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  closeIcon: { position: "absolute", right: 20 },
  targetContainer: {
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  instruction: {
    color: "#fff",
    fontSize: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  // Cantoneiras do alvo
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: COLORS.success,
    borderWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
});
