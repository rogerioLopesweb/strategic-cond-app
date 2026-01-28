import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// ✅ Imports modulares e tema
import { COLORS, SHADOWS } from "../../common/constants/theme";
import { useAuthContext } from "../../common/context/AuthContext";

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
  const { authSessao } = useAuthContext();
  const [verFotoFull, setVerFotoFull] = useState(false);

  if (!entrega || !authSessao) return null;

  const { isMorador } = authSessao;
  const isPendente = entrega.status === "recebido";
  const isEntregue = entrega.status === "entregue";
  const isCancelada = entrega.status === "cancelada";

  const formatarDataFrase = (data: string | Date) => {
    if (!data) return "Data não disponível";
    const d = new Date(data);
    return (
      d.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }) +
      ` às ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}h`
    );
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Cabeçalho */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTitle}>
                  <Text style={styles.modalTitle}>
                    {isCancelada
                      ? "Registro Anulado"
                      : isMorador
                        ? "Minha Encomenda"
                        : "Detalhes da Entrega"}
                  </Text>
                  {/* ✅ DESTAQUE DE URGÊNCIA NO TOPO */}
                  {entrega.retirada_urgente ? (
                    <View style={styles.badgeUrgenteTopo}>
                      <Ionicons name="flash" size={12} color={COLORS.white} />
                      <Text style={styles.badgeUrgenteText}>URGENTE</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.modalSub}>
                  {entrega.bloco} — Unidade {entrega.unidade}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons
                  name="close-circle"
                  size={32}
                  color={COLORS.grey300}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Banner de Cancelamento */}
              {isCancelada ? (
                <View style={styles.bannerCancelado}>
                  <Ionicons name="ban" size={20} color={COLORS.error} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.bannerCanceladoTexto}>
                      ESTE LANÇAMENTO FOI ANULADO
                    </Text>
                    {entrega.motivo_cancelamento ? (
                      <Text style={styles.motivoText}>
                        Motivo: {entrega.motivo_cancelamento}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {/* ✅ FOTO DA ETIQUETA COM CLIQUE PARA AMPLIAR */}
              {entrega.url_foto_etiqueta ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setVerFotoFull(true)}
                  style={styles.fotoWrapper}
                >
                  <Image
                    source={{ uri: entrega.url_foto_etiqueta }}
                    style={[
                      styles.fotoEtiqueta,
                      (isCancelada || isEntregue) && { opacity: 0.5 },
                    ]}
                    resizeMode="cover"
                  />
                  <View style={styles.zoomHint}>
                    <Ionicons
                      name="search-outline"
                      size={16}
                      color={COLORS.white}
                    />
                    <Text style={styles.zoomText}>CLIQUE PARA AMPLIAR</Text>
                  </View>
                </TouchableOpacity>
              ) : null}

              {/* Informações Básicas */}
              <View style={styles.infoSection}>
                <View style={styles.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>DESTINATÁRIO</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        (isCancelada || isEntregue) && {
                          color: COLORS.grey300,
                        },
                      ]}
                    >
                      {entrega.morador_nome}
                    </Text>
                  </View>
                </View>

                <View style={styles.gridRow}>
                  <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>EMBALAGEM</Text>
                    <Text style={styles.gridValue}>
                      {entrega.tipo_embalagem || "Pacote"}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.detailLabel}>ORIGEM / MARKETPLACE</Text>
                    <Text style={styles.gridValue}>
                      {entrega.marketplace || "Não informado"}
                    </Text>
                  </View>
                </View>

                {entrega.codigo_rastreio ? (
                  <View style={styles.rastreioBox}>
                    <Text style={styles.detailLabel}>CÓDIGO DE RASTREIO</Text>
                    <Text style={styles.rastreioText}>
                      {entrega.codigo_rastreio}
                    </Text>
                  </View>
                ) : null}

                {/* Observações */}
                {entrega.observacoes && entrega.observacoes.trim() !== "" ? (
                  <View style={styles.obsBox}>
                    <View style={styles.obsHeader}>
                      <Ionicons
                        name="document-text-outline"
                        size={14}
                        color={COLORS.primary}
                      />
                      <Text style={styles.obsLabel}>
                        OBSERVAÇÕES DO RECEBIMENTO
                      </Text>
                    </View>
                    <Text style={styles.obsText}>{entrega.observacoes}</Text>
                  </View>
                ) : null}
              </View>

              {/* Auditoria */}
              <View style={styles.auditCard}>
                <Text style={styles.auditHeader}>HISTÓRICO DE AUDITORIA</Text>
                <View style={styles.timelineItem}>
                  <View
                    style={[styles.dot, { backgroundColor: COLORS.secondary }]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.auditLabel}>
                      RECEBIMENTO NA PORTARIA
                    </Text>
                    <Text style={styles.auditValue}>
                      {formatarDataFrase(entrega.data_recebimento)}
                    </Text>
                    <Text style={styles.auditOperator}>
                      Responsável:{" "}
                      <Text style={styles.bold}>
                        {entrega.operador_entrada_nome || "Sistema"}
                      </Text>
                    </Text>
                  </View>
                </View>

                {isEntregue ? (
                  <View style={[styles.timelineItem, { marginTop: 20 }]}>
                    <View
                      style={[styles.dot, { backgroundColor: COLORS.success }]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.auditLabel}>
                        BAIXA DE SAÍDA REALIZADA
                      </Text>
                      <Text style={styles.auditValue}>
                        {formatarDataFrase(entrega.data_entrega)}
                      </Text>
                      <Text style={styles.auditOperator}>
                        Liberado por:{" "}
                        <Text style={styles.bold}>
                          {entrega.operador_saida_nome || "N/I"}
                        </Text>
                      </Text>
                      <View style={styles.retiradaInfoBox}>
                        <Text style={styles.retiradoPor}>
                          Retirado por:{" "}
                          <Text style={styles.bold}>
                            {entrega.documento_retirou || "O próprio"}
                          </Text>
                        </Text>
                        <Text style={styles.metodoTexto}>
                          Método: {entrega.quem_retirou}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>

              {/* Ações */}
              {!isMorador && isPendente ? (
                <View style={styles.actionGroup}>
                  <TouchableOpacity
                    style={[
                      styles.btnPrimary,
                      { backgroundColor: COLORS.success },
                    ]}
                    onPress={onBaixa}
                  >
                    <Ionicons
                      name="checkmark-done-circle"
                      size={20}
                      color={COLORS.white}
                    />
                    <Text style={styles.btnText}>CONFIRMAR RETIRADA</Text>
                  </TouchableOpacity>

                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      style={[
                        styles.btnSecondary,
                        { flex: 1, marginRight: 10 },
                      ]}
                      onPress={onEditar}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={COLORS.primary}
                      />
                      <Text style={[styles.btnText, { color: COLORS.primary }]}>
                        EDITAR
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.btnSecondary,
                        { borderColor: COLORS.error },
                      ]}
                      onPress={onExcluir}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={COLORS.error}
                      />
                      <Text style={[styles.btnText, { color: COLORS.error }]}>
                        ANULAR
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ✅ MODAL SECUNDÁRIA PARA VER FOTO EM TELA CHEIA */}
      <Modal visible={verFotoFull} transparent={true} animationType="fade">
        <View style={styles.fullImageOverlay}>
          <TouchableOpacity
            style={styles.closeFullImage}
            onPress={() => setVerFotoFull(false)}
          >
            <Ionicons name="close-circle" size={40} color={COLORS.white} />
          </TouchableOpacity>
          <Image
            source={{ uri: entrega.url_foto_etiqueta }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 15,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 20,
    maxHeight: "92%",
    width: "100%",
    maxWidth: 850,
    alignSelf: "center",
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  rowTitle: { flexDirection: "row", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "900", color: COLORS.textMain },
  modalSub: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "600" },
  closeBtn: { padding: 5 },

  // ✅ Banner de Urgência
  badgeUrgenteTopo: {
    backgroundColor: COLORS.error,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  badgeUrgenteText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 4,
  },

  bannerCancelado: {
    backgroundColor: "#fee",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#fcc",
  },
  bannerCanceladoTexto: {
    color: COLORS.error,
    fontWeight: "800",
    fontSize: 11,
  },
  motivoText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontStyle: "italic",
  },

  // ✅ Foto com Hint de Zoom
  fotoWrapper: { position: "relative", marginBottom: 20 },
  fotoEtiqueta: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    backgroundColor: COLORS.grey100,
  },
  zoomHint: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  zoomText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "bold",
    marginLeft: 5,
  },

  // ✅ Full Image Modal Styles
  fullImageOverlay: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  closeFullImage: { position: "absolute", top: 40, right: 20, zIndex: 10 },
  fullImage: { width: "100%", height: "80%" },

  infoSection: { marginBottom: 15 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.textLight,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  detailValue: { fontSize: 18, fontWeight: "bold", color: COLORS.textMain },
  gridRow: {
    flexDirection: "row",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginBottom: 10,
  },
  gridItem: { flex: 1 },
  gridValue: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  rastreioBox: {
    marginTop: 5,
    backgroundColor: COLORS.grey100,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  rastreioText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  obsBox: {
    backgroundColor: "#FFF9C4",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FBC02D",
    marginTop: 10,
  },
  obsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  obsLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.primary,
    marginLeft: 5,
  },
  obsText: {
    fontSize: 13,
    color: COLORS.textMain,
    fontStyle: "italic",
    lineHeight: 18,
  },
  auditCard: {
    backgroundColor: COLORS.grey100,
    padding: 18,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  auditHeader: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.textLight,
    marginBottom: 15,
    letterSpacing: 1,
  },
  timelineItem: { flexDirection: "row", alignItems: "flex-start" },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, marginRight: 12 },
  auditLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  auditValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMain,
    marginTop: 2,
  },
  auditOperator: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  retiradaInfoBox: {
    marginTop: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.success,
  },
  retiradoPor: { fontSize: 12, color: COLORS.textMain },
  metodoTexto: {
    fontSize: 11,
    color: COLORS.textLight,
    fontStyle: "italic",
    marginTop: 2,
  },
  bold: { fontWeight: "800", color: COLORS.textMain },
  actionGroup: { marginTop: 10 },
  btnPrimary: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    ...SHADOWS.light,
  },
  rowActions: { flexDirection: "row" },
  btnSecondary: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  btnText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 13,
    marginLeft: 8,
  },
});
