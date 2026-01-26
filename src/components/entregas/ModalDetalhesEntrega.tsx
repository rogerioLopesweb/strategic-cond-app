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
import QRCode from "react-native-qrcode-svg"; // Importação do QR Code
import { COLORS } from "../../constants/theme";
import { useAuthContext } from "../../context/AuthContext"; // Importe seu hook de Auth

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
  const { isMorador, user } = useAuthContext(); // Captura o usuário logado
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

    return `${diasSemana[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} às ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}h`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isCancelada
                ? "Registro Cancelado"
                : isMorador
                  ? "Minha Encomenda"
                  : "Detalhes da Encomenda"}
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

            {/* Foto da Etiqueta */}
            {entrega.url_foto_etiqueta && (
              <Image
                source={{ uri: entrega.url_foto_etiqueta }}
                style={[styles.fotoEtiqueta, isCancelada && { opacity: 0.6 }]}
                resizeMode="cover"
              />
            )}

            {/* SEÇÃO QR CODE - EXCLUSIVA PARA MORADOR (Se disponível) */}
            {isMorador && entrega.status === "recebido" && (
              <View style={styles.qrContainer}>
                <Text style={styles.qrTitle}>QR CODE DE RETIRADA</Text>
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={entrega.id} // UUID da entrega para o porteiro ler
                    size={180}
                    color={COLORS.primary}
                    backgroundColor="white"
                  />
                </View>
                <Text style={styles.qrSub}>
                  Apresente este código na portaria
                </Text>
              </View>
            )}

            {/* Dados do Destinatário */}
            <View style={styles.sectionCard}>
              <Text style={styles.detailLabel}>DESTINATÁRIO</Text>
              <Text
                style={[styles.detailValue, isCancelada && { color: "#888" }]}
              >
                {entrega.morador_nome}
              </Text>
              {!isMorador && (
                <Text style={styles.subDetail}>
                  {entrega.morador_tipo} • {entrega.morador_telefone}
                </Text>
              )}
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

            {/* CÓDIGO DE RASTREIO */}
            <View style={styles.sectionCard}>
              <View style={styles.obsHeader}>
                <Ionicons
                  name="barcode-outline"
                  size={14}
                  color={COLORS.textLight}
                />
                <Text style={styles.detailLabel}> CÓDIGO DE RASTREIO</Text>
              </View>
              <Text
                style={[
                  styles.detailValue,
                  {
                    fontSize: 14,
                    color: entrega.codigo_rastreio
                      ? COLORS.textMain
                      : COLORS.textLight,
                  },
                ]}
              >
                {entrega.codigo_rastreio &&
                entrega.codigo_rastreio.trim() !== ""
                  ? entrega.codigo_rastreio
                  : "Não informado"}
              </Text>
            </View>

            {/* Auditoria (Simplificada para Morador) */}
            <View
              style={[
                styles.auditContainer,
                isCancelada && styles.auditContainerCancelado,
              ]}
            >
              <Text
                style={[styles.auditTitle, isCancelada && { color: "#666" }]}
              >
                STATUS E LOGÍSTICA
              </Text>
              <View style={styles.timelineItem}>
                <Ionicons
                  name="log-in"
                  size={18}
                  color={isCancelada ? "#999" : COLORS.primary}
                />
                <View style={styles.timelineContent}>
                  <Text style={styles.auditLabel}>RECEBIDO EM:</Text>
                  <Text style={styles.auditFrase}>
                    {formatarDataFrase(entrega.data_recebimento)}
                  </Text>
                </View>
              </View>

              {entrega.status === "entregue" && (
                <View style={[styles.timelineItem, { marginTop: 10 }]}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.success}
                  />
                  <View style={styles.timelineContent}>
                    <Text style={styles.auditLabel}>RETIRADO EM:</Text>
                    <Text style={styles.auditFrase}>
                      {formatarDataFrase(entrega.data_entrega)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Ações do Modal */}
            <View style={styles.modalActions}>
              {/* Só mostra ações de gestão se NÃO for morador e estiver pendente */}
              {!isMorador && entrega.status === "recebido" && (
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
  qrContainer: {
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 15,
    letterSpacing: 1,
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrSub: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 10,
    fontStyle: "italic",
  },
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
