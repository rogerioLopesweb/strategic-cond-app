import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/theme";

interface ModalBaixaManualProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dados: {
    quem_retirou: string;
    documento_retirou: string;
  }) => void;
  loading?: boolean;
}

export const ModalBaixaManual = ({
  visible,
  onClose,
  onConfirm,
  loading,
}: ModalBaixaManualProps) => {
  const [quemRetirou, setQuemRetirou] = useState("");
  const [documento, setDocumento] = useState("");

  // AJUSTE: Reset do estado sempre que a visibilidade mudar
  useEffect(() => {
    if (!visible) {
      setQuemRetirou("");
      setDocumento("");
    }
  }, [visible]);

  const frasesProntas = [
    "Próprio destinatário",
    "Familiar do morador",
    "Empregada doméstica",
    "Sem acesso ao QR Code",
    "Afirma não ter recebido o QR Code",
  ];

  const handleConfirmar = () => {
    if (!quemRetirou.trim()) return;
    onConfirm({
      quem_retirou: quemRetirou.trim(),
      documento_retirou: documento.trim(),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Baixa Manual</Text>
              <Text style={styles.subtitle}>
                Registre a retirada sem QR Code
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Ionicons
                name="close-circle"
                size={30}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>QUEM ESTÁ RETIRANDO?</Text>

            <View style={styles.chipsContainer}>
              {frasesProntas.map((frase) => (
                <TouchableOpacity
                  key={frase}
                  style={[
                    styles.chip,
                    quemRetirou.includes(frase) && styles.chipActive,
                  ]}
                  onPress={() => setQuemRetirou(frase)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      quemRetirou.includes(frase) && styles.chipTextActive,
                    ]}
                  >
                    {frase}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ex: Próprio destinatário (Pedro)..."
                value={quemRetirou}
                onChangeText={setQuemRetirou}
                placeholderTextColor="#999"
              />
              {quemRetirou.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setQuemRetirou("")}
                >
                  <Ionicons
                    name="backspace-outline"
                    size={20}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>DOCUMENTO / NOME COMPLETO</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o CPF ou nome de quem levou"
              value={documento}
              onChangeText={setDocumento}
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={[
                styles.btnConfirmar,
                (!quemRetirou.trim() || loading) && {
                  backgroundColor: "#bdc3c7",
                },
              ]}
              onPress={handleConfirmar}
              disabled={loading || !quemRetirou.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnRow}>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                  <Text style={styles.btnConfirmarTexto}>
                    FINALIZAR E ENTREGAR
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "900", color: COLORS.textMain },
  subtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
    marginTop: 15,
    letterSpacing: 0.5,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  chip: {
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e1e4e8",
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: { fontSize: 12, color: COLORS.textMain, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e4e8",
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    backgroundColor: "#f8f9fa",
    marginBottom: 10,
    color: COLORS.textMain,
  },
  clearButton: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  btnConfirmar: {
    backgroundColor: COLORS.success,
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnConfirmarTexto: {
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 1,
    marginLeft: 10,
    fontSize: 16,
  },
});
