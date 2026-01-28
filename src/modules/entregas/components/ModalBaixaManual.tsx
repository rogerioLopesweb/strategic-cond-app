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

// ✅ Importando do tema centralizado
import { COLORS, SHADOWS, SIZES } from "../../common/constants/theme";

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

  // ✅ Reset do estado ao fechar o modal
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
    "Afirma não ter recebido",
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
                    quemRetirou === frase && styles.chipActive,
                  ]}
                  onPress={() => setQuemRetirou(frase)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      quemRetirou === frase && styles.chipTextActive,
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
                placeholderTextColor={COLORS.textLight}
                editable={!loading}
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
              placeholderTextColor={COLORS.textLight}
              editable={!loading}
            />

            <TouchableOpacity
              style={[
                styles.btnConfirmar,
                (!quemRetirou.trim() || loading) && styles.btnDisabled,
              ]}
              onPress={handleConfirmar}
              disabled={loading || !quemRetirou.trim()}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <View style={styles.btnRow}>
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.btnConfirmarTexto}>
                    FINALIZAR E ENTREGAR
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
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
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: "85%",
    ...SHADOWS.medium,
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
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
    marginTop: 15,
    letterSpacing: 1,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  chip: {
    backgroundColor: COLORS.grey100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: { fontSize: 12, color: COLORS.textMain, fontWeight: "600" },
  chipTextActive: { color: COLORS.white },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    backgroundColor: COLORS.grey100,
    marginBottom: 10,
    color: COLORS.textMain,
  },
  clearButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 10,
  },
  btnConfirmar: {
    backgroundColor: COLORS.success,
    padding: 18,
    borderRadius: SIZES.radius,
    alignItems: "center",
    marginTop: 20,
    ...SHADOWS.light,
  },
  btnDisabled: {
    backgroundColor: COLORS.grey300,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnConfirmarTexto: {
    color: COLORS.white,
    fontWeight: "bold",
    letterSpacing: 1,
    marginLeft: 10,
    fontSize: 16,
  },
});
