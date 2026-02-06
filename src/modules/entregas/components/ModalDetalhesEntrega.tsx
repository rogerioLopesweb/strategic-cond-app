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
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

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
                {/* ✅ EXIBIÇÃO DO ID PARA AUDITORIA MANUAL */}
                <Text style={styles.idLabel}>ID: {entrega.id}</Text>

                <View style={styles.rowTitle}>
                  <Text style={styles.modalTitle}>
                    {isCancelada
                      ? "Registro Anulado"
                      : isMorador
                        ? "Minha Encomenda"
                        : "Detalhes da Entrega"}
                  </Text>
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

              {/* ✅ SEÇÃO MEDIA: FOTO E QR CODE LADO A LADO */}
              <View style={styles.mediaRow}>
                {/* Coluna 1: Foto da Etiqueta */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    entrega.url_foto_etiqueta && setVerFotoFull(true)
                  }
                  style={styles.mediaColumn}
                >
                  {entrega.url_foto_etiqueta ? (
                    <>
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
                          size={12}
                          color={COLORS.white}
                        />
                        <Text style={styles.zoomText}>VER FOTO</Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.placeholderMedia}>
                      <Ionicons
                        name="image-outline"
                        size={30}
                        color={COLORS.grey300}
                      />
                      <Text style={styles.placeholderText}>SEM FOTO</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Coluna 2: QR Code Baseado no ID */}
                <View style={[styles.mediaColumn, styles.qrColumn]}>
                  {isPendente ? (
                    <>
                      <View style={styles.qrWrapper}>
                        <QRCode
                          value={JSON.stringify({
                            id: entrega.id,
                            condominio_id: authSessao.condominio?.id,
                          })}
                          size={100}
                          color="#000000"
                          backgroundColor="white"
                        />
                      </View>
                      <Text style={styles.qrLabel}>SCAN PARA BAIXA</Text>
                    </>
                  ) : (
                    <View style={styles.statusStatic}>
                      <Ionicons
                        name={isEntregue ? "checkmark-circle" : "close-circle"}
                        size={40}
                        color={isEntregue ? COLORS.success : COLORS.grey300}
                      />
                      <Text style={styles.statusStaticText}>
                        {isEntregue ? "BAIXA OK" : "ANULADO"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Informações da Encomenda */}
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

              {/* Histórico de Auditoria */}
              <View style={styles.auditCard}>
                <Text style={styles.auditHeader}>HISTÓRICO DE AUDITORIA</Text>

                <View style={styles.timelineItem}>
                  <View
                    style={[styles.dot, { backgroundColor: COLORS.secondary }]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.auditLabel}>RECEBIMENTO</Text>
                    <Text style={styles.auditValue}>
                      {formatarDataFrase(entrega.data_recebimento)}
                    </Text>
                    <Text style={styles.auditOperator}>
                      Portaria:{" "}
                      <Text style={styles.bold}>
                        {entrega.operador_entrada_nome || "Sistema"}
                      </Text>
                    </Text>
                  </View>
                </View>

                {isEntregue ? (
                  <View style={[styles.timelineItem, { marginTop: 15 }]}>
                    <View
                      style={[styles.dot, { backgroundColor: COLORS.success }]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.auditLabel}>BAIXA DE SAÍDA</Text>
                      <Text style={styles.auditValue}>
                        {formatarDataFrase(entrega.data_entrega)}
                      </Text>
                      <Text style={styles.auditOperator}>
                        Saída por:{" "}
                        <Text style={styles.bold}>
                          {entrega.operador_saida_nome || "N/I"}
                        </Text>
                      </Text>
                      <Text style={styles.auditOperator}>
                        Levado por:{" "}
                        <Text style={styles.bold}>
                          {entrega.documento_retirou || "O próprio"}
                        </Text>
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>

              {/* Botões Administrativos */}
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

      {/* Modal Visualização Foto */}
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
  idLabel: {
    fontSize: 9,
    color: COLORS.textLight,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 2,
  },
  rowTitle: { flexDirection: "row", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "900", color: COLORS.textMain },
  modalSub: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "600" },
  closeBtn: { padding: 5 },
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

  // ✅ Estilo das Duas Colunas
  mediaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  mediaColumn: {
    flex: 1,
    height: 160,
    borderRadius: 15,
    backgroundColor: COLORS.grey100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fotoEtiqueta: { width: "100%", height: "100%" },
  zoomHint: {
    position: "absolute",
    bottom: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  zoomText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "bold",
    marginLeft: 4,
  },

  qrColumn: { backgroundColor: COLORS.white },
  qrWrapper: { padding: 8, backgroundColor: COLORS.white },
  qrLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.primary,
    marginTop: 5,
  },

  placeholderMedia: { alignItems: "center" },
  placeholderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.grey300,
    marginTop: 5,
  },
  statusStatic: { alignItems: "center" },
  statusStaticText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginTop: 5,
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
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  auditHeader: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.textLight,
    marginBottom: 10,
  },
  timelineItem: { flexDirection: "row", alignItems: "flex-start" },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, marginRight: 12 },
  auditLabel: { fontSize: 8, fontWeight: "900", color: COLORS.textSecondary },
  auditValue: { fontSize: 12, fontWeight: "700", color: COLORS.textMain },
  auditOperator: { fontSize: 11, color: COLORS.textSecondary },
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
