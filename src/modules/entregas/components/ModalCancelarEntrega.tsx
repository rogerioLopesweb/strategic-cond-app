import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Importando do tema centralizado
import { COLORS, SHADOWS, SIZES } from "../../common/constants/theme";

interface ModalCancelarEntregaProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  loading: boolean;
  erroApi?: string | null;
}

export const ModalCancelarEntrega = ({
  visible,
  onClose,
  onConfirm,
  loading,
  erroApi,
}: ModalCancelarEntregaProps) => {
  const [motivo, setMotivo] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  const frasesProntas = [
    "Treinamento/Teste",
    "Unidade incorreta",
    "Destinatário incorreto",
    "Cadastro duplicado",
  ];

  useEffect(() => {
    if (visible) {
      setMotivo("");
      setConfirmando(false);
    }
  }, [visible]);

  const handlePressBtnPrincipal = () => {
    if (!confirmando) {
      setConfirmando(true);
    } else {
      onConfirm(motivo.trim());
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Anular Lançamento</Text>
              <Text style={styles.subtitle}>Ação de Auditoria Interna</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Ionicons
                name="close-circle"
                size={28}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>

          {/* BOX DE ERRO DA API */}
          {!!erroApi && (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.errorAlertText}>{erroApi}</Text>
            </View>
          )}

          <View style={styles.warningBox}>
            <Ionicons name="warning" size={16} color={COLORS.warning} />
            <Text style={styles.warningText}>
              Uma vez cancelado, os dados ficarão em modo somente leitura para
              auditoria.
            </Text>
          </View>

          <View style={styles.chipsRow}>
            {frasesProntas.map((frase) => (
              <TouchableOpacity
                key={frase}
                style={[
                  styles.chip,
                  motivo === frase && {
                    backgroundColor: COLORS.error,
                    borderColor: COLORS.error,
                  },
                ]}
                onPress={() => {
                  setMotivo(frase);
                  setConfirmando(false);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    motivo === frase && {
                      color: COLORS.white,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {frase}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="Descreva o motivo detalhadamente..."
            placeholderTextColor={COLORS.textLight}
            multiline
            value={motivo}
            onChangeText={(txt) => {
              setMotivo(txt);
              setConfirmando(false);
            }}
            textAlignVertical="top"
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              styles.btnConfirmar,
              confirmando && { backgroundColor: "#c0392b" },
              (motivo.length < 5 || loading) && styles.btnDisabled,
            ]}
            onPress={handlePressBtnPrincipal}
            disabled={loading || motivo.length < 5}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <View style={styles.btnContent}>
                <Ionicons
                  name={confirmando ? "alert-circle" : "trash"}
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.btnText}>
                  {confirmando
                    ? "CLIQUE NOVAMENTE PARA CONFIRMAR"
                    : "ANULAR LANÇAMENTO"}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {confirmando && !loading && (
            <TouchableOpacity
              style={styles.btnCancelarAcao}
              onPress={() => setConfirmando(false)}
            >
              <Text style={styles.btnCancelarAcaoTexto}>
                Desistir do cancelamento
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 24,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "900", color: COLORS.textMain },
  subtitle: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
    textTransform: "uppercase",
  },
  errorAlert: {
    backgroundColor: "#fdecea",
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  errorAlertText: {
    color: COLORS.error,
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "bold",
    flex: 1,
  },
  warningBox: {
    backgroundColor: "#fff8ec",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fbe5c6",
  },
  warningText: {
    color: COLORS.warning,
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    fontWeight: "500",
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  chip: {
    backgroundColor: COLORS.grey100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: { fontSize: 12, color: COLORS.textMain, fontWeight: "600" },
  textArea: {
    backgroundColor: COLORS.grey100,
    borderRadius: 12,
    padding: 15,
    height: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
    color: COLORS.textMain,
  },
  btnConfirmar: {
    backgroundColor: COLORS.error,
    padding: 18,
    borderRadius: SIZES.radius,
    marginTop: 20,
    ...SHADOWS.light,
  },
  btnContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: COLORS.grey300 },
  btnText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 10,
  },
  btnCancelarAcao: { marginTop: 15, alignItems: "center", paddingVertical: 10 },
  btnCancelarAcaoTexto: {
    color: COLORS.textLight,
    textDecorationLine: "underline",
    fontSize: 13,
  },
});
