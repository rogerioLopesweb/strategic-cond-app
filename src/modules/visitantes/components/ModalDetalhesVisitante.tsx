import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FeedbackBox } from "@/src/modules/common/components/FeedbackBox";
import { COLORS, SHADOWS } from "@/src/modules/common/constants/theme";
import { IVisitaDTO } from "../types/IVisita";

interface Props {
  visible: boolean;
  visita: IVisitaDTO | null;
  onClose: () => void;
  onRegistrarSaida: (visitaId: string) => Promise<void>;
  loading?: boolean;
}

export const ModalDetalhesVisitante = ({
  visible,
  visita,
  onClose,
  onRegistrarSaida,
  loading,
}: Props) => {
  // ✅ Estado do FeedbackBox declarado ANTES do return null
  const [fb, setFb] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning";
    message: string;
  }>({
    visible: false,
    type: "success",
    message: "",
  });

  if (!visita) return null;

  const isAberta = visita.status === "aberta";

  // ✅ 1. Lógica isolada para dar a baixa e exibir o feedback
  const executarSaida = async () => {
    try {
      console.log("Registrando saída para visita ID:", visita.visita_id); // Log para depuração
      await onRegistrarSaida(visita.visita_id);

      // Exibe sucesso
      setFb({
        visible: true,
        type: "success",
        message: "Baixa de saída registrada com sucesso!",
      });

      // Aguarda 2 segundos para leitura antes de fechar o modal
      setTimeout(() => {
        setFb((prev) => ({ ...prev, visible: false }));
        onClose();
      }, 2000);
    } catch (error: any) {
      // Exibe erro
      setFb({
        visible: true,
        type: "error",
        message: error.response?.data?.message || "Erro ao registrar a saída.",
      });
    }
  };

  // ✅ 2. Função compatível com Web e Mobile
  const handleSaida = () => {
    const mensagem = `Deseja realmente registrar a saída de ${visita.nome_visitante}?`;
    executarSaida();
    if (Platform.OS === "web") {
      const confirmou = window.confirm(mensagem);
      if (confirmou) {
        executarSaida();
      }
    } else {
      Alert.alert("Confirmar Saída", mensagem, [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", style: "destructive", onPress: executarSaida },
      ]);
    }
  };

  // ✅ Função para formatar a data igualzinho ao layout "dom., 8 de fev. às 12:54h"
  const formatarDataAuditoria = (dataIso?: string | null) => {
    if (!dataIso) return "N/I";
    const data = new Date(dataIso);
    const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    const meses = [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez",
    ];

    const diaSemana = dias[data.getDay()];
    const dia = data.getDate();
    const mes = meses[data.getMonth()];
    const horas = data.getHours().toString().padStart(2, "0");
    const min = data.getMinutes().toString().padStart(2, "0");

    return `${diaSemana}., ${dia} de ${mes}. às ${horas}:${min}h`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Detalhes da Visita</Text>
            <TouchableOpacity onPress={onClose} style={styles.btnFechar}>
              <Ionicons name="close" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          {/* ✅ FeedbackBox renderizado aqui no topo do modal */}
          <FeedbackBox
            visible={fb.visible}
            type={fb.type}
            message={fb.message}
            onClose={() => setFb({ ...fb, visible: false })}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* FOTO E IDENTIFICAÇÃO BÁSICA */}
            <View style={styles.perfilContainer}>
              {visita.foto_url ? (
                <Image source={{ uri: visita.foto_url }} style={styles.foto} />
              ) : (
                <View style={styles.fotoPlaceholder}>
                  <Ionicons name="person" size={40} color={COLORS.grey300} />
                </View>
              )}
              <Text style={styles.nome}>{visita.nome_visitante}</Text>
              <Text style={styles.documento}>CPF: {visita.cpf_visitante}</Text>
              <View style={styles.badgeTipo}>
                <Text style={styles.badgeTexto}>
                  {visita.tipo.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* DESTINATÁRIO */}
            <View style={styles.blocoDados}>
              <Text style={styles.labelSection}>
                AUTORIZADO POR / DESTINATÁRIO
              </Text>
              <Text style={styles.valorDestaque}>
                {visita.morador_nome || "N/I"}
                {visita.unidade
                  ? ` (Bloco ${visita.bloco} - Apto ${visita.unidade})`
                  : " (Administração)"}
              </Text>
            </View>

            <View style={styles.rowInfo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelSection}>VEÍCULO</Text>
                <Text style={styles.valor}>
                  {visita.placa_veiculo || "A pé"}
                </Text>
              </View>
              {visita.empresa_prestadora && (
                <View style={{ flex: 1 }}>
                  <Text style={styles.labelSection}>EMPRESA PRESTADORA</Text>
                  <Text style={styles.valor}>{visita.empresa_prestadora}</Text>
                </View>
              )}
            </View>

            {visita.observacoes && (
              <View style={styles.blocoDados}>
                <Text style={styles.labelSection}>OBSERVAÇÕES</Text>
                <Text style={styles.valor}>{visita.observacoes}</Text>
              </View>
            )}

            {/* 🛡️ HISTÓRICO DE AUDITORIA */}
            <View style={styles.auditContainer}>
              <Text style={styles.auditHeaderTitle}>
                HISTÓRICO DE AUDITORIA
              </Text>

              {/* ENTRADA */}
              <View style={styles.auditRow}>
                <View style={styles.auditTimeline}>
                  <View
                    style={[
                      styles.auditDot,
                      { backgroundColor: COLORS.primary },
                    ]}
                  />
                  {/* Renderiza a linha conectora se houver data de saída */}
                  {visita.data_saida && <View style={styles.auditLine} />}
                </View>
                <View style={styles.auditContent}>
                  <Text style={styles.auditAction}>ENTRADA</Text>
                  <Text style={styles.auditDate}>
                    {formatarDataAuditoria(visita.data_entrada)}
                  </Text>
                  <Text style={styles.auditOperator}>
                    Portaria:{" "}
                    <Text style={styles.auditOperatorBold}>
                      {visita.operador_entrada_nome || "Sistema"}
                    </Text>
                  </Text>
                </View>
              </View>

              {/* SAÍDA */}
              {visita.data_saida ? (
                <View style={styles.auditRow}>
                  <View style={styles.auditTimeline}>
                    <View
                      style={[
                        styles.auditDot,
                        { backgroundColor: COLORS.success },
                      ]}
                    />
                  </View>
                  <View style={styles.auditContent}>
                    <Text style={styles.auditAction}>BAIXA DE SAÍDA</Text>
                    <Text style={styles.auditDate}>
                      {formatarDataAuditoria(visita.data_saida)}
                    </Text>
                    <Text style={styles.auditOperator}>
                      Saída por:{" "}
                      <Text style={styles.auditOperatorBold}>
                        {visita.operador_saida_nome || "Sistema"}
                      </Text>
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.auditRow}>
                  <View style={styles.auditTimeline}>
                    <View
                      style={[
                        styles.auditDot,
                        { backgroundColor: COLORS.grey300 },
                      ]}
                    />
                  </View>
                  <View style={styles.auditContent}>
                    <Text
                      style={[styles.auditAction, { color: COLORS.grey300 }]}
                    >
                      AGUARDANDO SAÍDA
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {isAberta && (
            <TouchableOpacity
              style={[styles.btnSaida, loading && { opacity: 0.7 }]}
              onPress={handleSaida}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="exit-outline"
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.btnSaidaTexto}>REGISTRAR SAÍDA</Text>
                </>
              )}
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: "100%", // ✅ Largura total base
    maxWidth: 900, // ✅ Limitador para telas grandes (Tablet/Web)
    maxHeight: "90%",
    alignSelf: "center", // ✅ Centraliza o container no meio da tela no Web
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titulo: { fontSize: 20, fontWeight: "900", color: COLORS.textMain },
  btnFechar: { padding: 5, backgroundColor: COLORS.grey100, borderRadius: 20 },
  perfilContainer: { alignItems: "center", marginBottom: 20 },
  foto: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  fotoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.grey100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  nome: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textMain,
    textAlign: "center",
  },
  documento: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  badgeTipo: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeTexto: { fontSize: 11, fontWeight: "bold", color: COLORS.primary },

  blocoDados: { marginBottom: 15 },
  rowInfo: { flexDirection: "row", marginBottom: 15 },
  labelSection: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 4,
  },
  valorDestaque: { fontSize: 18, fontWeight: "bold", color: COLORS.textMain },
  valor: { fontSize: 14, color: COLORS.textMain, fontWeight: "500" },

  // 🛡️ ESTILOS DA AUDITORIA
  auditContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  auditHeaderTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 15,
  },
  auditRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  auditTimeline: {
    alignItems: "center",
    width: 20,
    marginRight: 10,
  },
  auditDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 2,
  },
  auditLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.grey200,
    marginVertical: 4,
    minHeight: 25,
  },
  auditContent: {
    flex: 1,
    paddingBottom: 15,
  },
  auditAction: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 2,
  },
  auditDate: {
    fontSize: 12,
    color: COLORS.textMain,
    fontWeight: "600",
  },
  auditOperator: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  auditOperatorBold: {
    color: COLORS.textMain,
    fontWeight: "bold",
  },

  btnSaida: {
    backgroundColor: COLORS.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 15,
  },
  btnSaidaTexto: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});
