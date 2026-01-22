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
import { COLORS } from "../../constants/theme";

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
              {/* CORREÇÃO: Removida a lógica que deixava string vazia solta na View */}
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

          {/* BOX DE ERRO */}
          {!!erroApi && (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={18} color="#721c24" />
              <Text style={styles.errorAlertText}>{erroApi}</Text>
            </View>
          )}

          <View style={styles.warningBox}>
            <Ionicons name="warning" size={16} color="#e67e22" />
            <Text style={styles.warningText}>
              Uma vez cancelado, os dados ficarão em modo somente leitura para
              auditoria.
            </Text>
          </View>

          <View style={styles.chipsRow}>
            {frasesProntas.map((frase) => (
              <TouchableOpacity
                key={frase}
                style={[styles.chip, motivo === frase && styles.chipSelected]}
                onPress={() => {
                  setMotivo(frase);
                  setConfirmando(false);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    motivo === frase && styles.chipTextSelected,
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
            multiline
            value={motivo}
            onChangeText={(txt) => {
              setMotivo(txt);
              setConfirmando(false);
            }}
            textAlignVertical="top"
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
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnContent}>
                <Ionicons
                  name={confirmando ? "alert-circle" : "trash"}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.btnText}>
                  {confirmando
                    ? "CLIQUE NOVAMENTE PARA ANULAR"
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
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  container: { backgroundColor: "#fff", borderRadius: 20, padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#2c3e50" },
  subtitle: { fontSize: 11, color: COLORS.textLight },
  errorAlert: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  errorAlertText: {
    color: "#721c24",
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "bold",
    flex: 1,
  },
  warningBox: {
    backgroundColor: "#fef5e7",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  warningText: { color: "#e67e22", fontSize: 12, marginLeft: 8, flex: 1 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  chip: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  chipSelected: { backgroundColor: "#e74c3c", borderColor: "#e74c3c" },
  chipText: { fontSize: 12, color: COLORS.textMain },
  chipTextSelected: { color: "#fff", fontWeight: "bold" },
  textArea: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    height: 100,
    borderWidth: 1,
    borderColor: "#eee",
    fontSize: 15,
    color: COLORS.textMain,
  },
  btnConfirmar: {
    backgroundColor: "#e74c3c",
    padding: 18,
    borderRadius: 15,
    marginTop: 20,
  },
  btnContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnDisabled: { backgroundColor: "#ecf0f1" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 14, marginLeft: 10 },
  btnCancelarAcao: { marginTop: 15, alignItems: "center" },
  btnCancelarAcaoTexto: {
    color: COLORS.textLight,
    textDecorationLine: "underline",
  },
});
