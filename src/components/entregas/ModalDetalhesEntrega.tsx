import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/theme";

interface ModalDetalhesEntregaProps {
  visible: boolean;
  onClose: () => void;
  entrega: any;
  onBaixa: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}

export const ModalDetalhesEntrega = ({
  visible,
  onClose,
  entrega,
  onBaixa,
  onEditar,
  onExcluir,
}: ModalDetalhesEntregaProps) => {
  if (!entrega) return null;

  const isCancelada = entrega.status === "cancelada";

  const formatarDataFrase = (data: string | Date) => {
    if (!data) return "Data não disponível";
    const d = new Date(data);
    const diasSemana = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const diaSemana = diasSemana[d.getDay()];
    const diaMes = d.getDate();
    const mes = meses[d.getMonth()];
    const hora = d.getHours().toString().padStart(2, "0");
    const minuto = d.getMinutes().toString().padStart(2, "0");

    return `${diaSemana}, ${diaMes} de ${mes} às ${hora}:${minuto}h`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isCancelada ? "Registro Cancelado" : "Detalhes da Encomenda"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close-circle"
                size={28}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Banner de Cancelamento */}
            {isCancelada && (
              <View style={styles.bannerCancelado}>
                <Ionicons name="ban" size={20} color="#666" />
                <Text style={styles.bannerCanceladoTexto}>
                  ESTE LANÇAMENTO FOI ANULADO
                </Text>
              </View>
            )}

            {entrega.url_foto_etiqueta && (
              <Image
                source={{ uri: entrega.url_foto_etiqueta }}
                style={[styles.fotoEtiqueta, isCancelada && { opacity: 0.6 }]}
                resizeMode="cover"
              />
            )}

            {entrega.retirada_urgente && !isCancelada && (
              <View style={styles.urgenciaAlertaModal}>
                <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                <Text style={styles.urgenciaAlertaTexto}>
                  ESTA ENCOMENDA É URGENTE
                </Text>
              </View>
            )}

            <View style={styles.sectionCard}>
              <Text style={styles.detailLabel}>DESTINATÁRIO</Text>
              <Text
                style={[styles.detailValue, isCancelada && { color: "#888" }]}
              >
                {entrega.morador_nome}
              </Text>
              <Text style={styles.subDetail}>
                {entrega.morador_tipo} • {entrega.morador_telefone}
              </Text>
            </View>

            <View style={styles.detailGrid}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>TIPO EMBALAGEM</Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isCancelada ? "#888" : COLORS.primary },
                  ]}
                >
                  {entrega.tipo_embalagem?.toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>MARKETPLACE</Text>
                <Text style={styles.detailValue}>
                  {entrega.marketplace || "Outros"}
                </Text>
              </View>
            </View>

            {/* OBSERVAÇÕES DE ENTRADA */}
            {entrega.observacoes && (
              <View style={styles.observacaoBox}>
                <View style={styles.obsHeader}>
                  <Ionicons
                    name="document-text-outline"
                    size={14}
                    color={COLORS.textLight}
                  />
                  <Text style={styles.detailLabel}>
                    {" "}
                    OBSERVAÇÕES DE ENTRADA
                  </Text>
                </View>
                <Text style={styles.observacaoTexto}>
                  {entrega.observacoes}
                </Text>
              </View>
            )}

            {/* SEÇÃO DE AUDITORIA COMPLETA */}
            <View
              style={[
                styles.auditContainer,
                isCancelada && styles.auditContainerCancelado,
              ]}
            >
              <Text
                style={[styles.auditTitle, isCancelada && { color: "#666" }]}
              >
                LOGÍSTICA E AUDITORIA
              </Text>

              {/* ENTRADA (Sempre exibe) */}
              <View style={styles.timelineItem}>
                <Ionicons
                  name="log-in"
                  size={18}
                  color={isCancelada ? "#999" : COLORS.primary}
                />
                <View style={styles.timelineContent}>
                  <Text style={styles.auditLabel}>RECEBIDO NA PORTARIA:</Text>
                  <Text style={styles.auditFrase}>
                    {formatarDataFrase(entrega.data_recebimento)}
                  </Text>
                  <Text style={styles.auditOperator}>
                    Operador: {entrega.operador_entrada_nome}
                  </Text>
                </View>
              </View>

              {/* CANCELAMENTO (Se houver) */}
              {isCancelada && (
                <View style={[styles.timelineItem, styles.auditCancelBox]}>
                  <Ionicons name="close-circle" size={18} color="#e74c3c" />
                  <View style={styles.timelineContent}>
                    <Text style={[styles.auditLabel, { color: "#e74c3c" }]}>
                      MOTIVO DO CANCELAMENTO:
                    </Text>
                    <Text style={styles.motivoCancelamentoTexto}>
                      {entrega.motivo_cancelamento}
                    </Text>
                    <Text style={[styles.auditLabel, { marginTop: 8 }]}>
                      DATA DO CANCELAMENTO:
                    </Text>
                    <Text style={styles.auditFrase}>
                      {formatarDataFrase(entrega.data_cancelamento)}
                    </Text>
                    <Text style={styles.auditOperator}>
                      Por: {entrega.operador_cancelamento_nome} (
                      {entrega.operador_cancelamento_perfil})
                    </Text>
                  </View>
                </View>
              )}

              {/* SAÍDA (Se houver) */}
              {entrega.status === "entregue" && (
                <View style={[styles.timelineItem, styles.auditSuccessBox]}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.success}
                  />
                  <View style={styles.timelineContent}>
                    <Text style={styles.auditLabel}>
                      RETIRADO PELO CLIENTE EM:
                    </Text>
                    <Text style={styles.auditFrase}>
                      {formatarDataFrase(entrega.data_entrega)}
                    </Text>
                    <Text style={styles.auditValueText}>
                      {entrega.quem_retirou}
                    </Text>
                    <Text style={styles.auditOperator}>
                      Liberado por: {entrega.operador_saida_nome}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              {/* TRAVA: Só mostra ações se NÃO for cancelada e NÃO for entregue */}
              {entrega.status === "recebido" && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.btnAction,
                      { backgroundColor: COLORS.success },
                    ]}
                    onPress={onBaixa}
                  >
                    <Ionicons
                      name="checkmark-done-circle"
                      size={22}
                      color="#fff"
                    />
                    <Text style={styles.btnActionText}>CONFIRMAR RETIRADA</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnOutline]}
                    onPress={onEditar}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text
                      style={[styles.btnActionText, { color: COLORS.primary }]}
                    >
                      EDITAR CADASTRO
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnExcluir]}
                    onPress={onExcluir}
                  >
                    <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                    <Text style={styles.btnExcluirTexto}>
                      CANCELAR LANÇAMENTO
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={styles.btnFechar} onPress={onClose}>
                <Text style={styles.btnFecharTexto}>VOLTAR</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textMain },
  fotoEtiqueta: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 15,
  },
  bannerCancelado: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "center",
  },
  bannerCanceladoTexto: {
    color: "#666",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 12,
  },
  urgenciaAlertaModal: {
    backgroundColor: "#fff5f5",
    borderColor: "#feb2b2",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  urgenciaAlertaTexto: { color: "#e74c3c", fontWeight: "bold", marginLeft: 8 },
  sectionCard: { marginBottom: 12 },
  detailGrid: {
    flexDirection: "row",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "bold",
    marginBottom: 2,
  },
  detailValue: { fontSize: 16, color: COLORS.textMain, fontWeight: "700" },
  subDetail: { fontSize: 11, color: COLORS.textLight, fontStyle: "italic" },
  observacaoBox: {
    backgroundColor: "#fff9db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ffe066",
  },
  obsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  observacaoTexto: {
    fontSize: 13,
    color: COLORS.textMain,
    fontStyle: "italic",
    lineHeight: 18,
  },
  auditContainer: {
    marginTop: 5,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  auditContainerCancelado: { backgroundColor: "#fcfcfc", borderColor: "#ddd" },
  auditTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 12,
    letterSpacing: 1,
  },
  timelineItem: { flexDirection: "row" },
  timelineContent: { marginLeft: 10, flex: 1 },
  auditLabel: { fontSize: 9, fontWeight: "bold", color: COLORS.textLight },
  auditFrase: {
    fontSize: 13,
    color: COLORS.textMain,
    fontWeight: "600",
    marginVertical: 2,
  },
  auditOperator: { fontSize: 11, color: COLORS.textLight },
  auditCancelBox: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  motivoCancelamentoTexto: {
    fontSize: 14,
    color: "#e74c3c",
    fontWeight: "bold",
    marginVertical: 4,
  },
  auditValueText: { fontSize: 13, color: COLORS.textMain, fontWeight: "bold" },
  auditSuccessBox: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 15,
  },
  modalActions: { marginTop: 15 },
  btnAction: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  btnActionText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
  btnOutline: { borderWidth: 1, borderColor: COLORS.primary },
  btnExcluir: { borderWidth: 1, borderColor: "#e74c3c" },
  btnExcluirTexto: { color: "#e74c3c", fontWeight: "bold", marginLeft: 8 },
  btnFechar: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnFecharTexto: { color: COLORS.textLight, fontWeight: "bold" },
});
