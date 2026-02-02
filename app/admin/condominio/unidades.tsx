import { FeedbackModal } from "@/src/modules/common/components/FeedbackModal";
import { Header } from "@/src/modules/common/components/Header";
import { COLORS, SHADOWS } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";
import { useUnidades } from "@/src/modules/common/hooks/useUnidades";
import {
  IMoradorUnidade,
  IUnidade,
} from "@/src/modules/common/types/unidadeTypes";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// --- Funções Auxiliares de Estilo ---
const getTipoColor = (tipo: string) => {
  switch (tipo?.toLowerCase()) {
    case "proprietario":
      return "#EBF8FF";
    case "inquilino":
      return "#FEFCBF";
    case "residente":
      return "#F0FFF4";
    default:
      return "#F7FAFC";
  }
};

const getTipoTextColor = (tipo: string) => {
  switch (tipo?.toLowerCase()) {
    case "proprietario":
      return "#2B6CB0";
    case "inquilino":
      return "#975A16";
    case "residente":
      return "#276749";
    default:
      return COLORS.textSecondary;
  }
};

export default function GestaoUnidades() {
  const { authSessao } = useAuthContext();
  const {
    unidades,
    pagination,
    loading,
    carregarUnidades,
    getMoradoresUnidade,
    handleGerarLote,
    registrarSaidaMorador, // ✅ Hook que já criamos
  } = useUnidades();

  const [filtroBloco, setFiltroBloco] = useState("");
  const [filtroUnidade, setFiltroUnidade] = useState("");
  const [modalLote, setModalLote] = useState(false);
  const [modalDetalhe, setModalDetalhe] = useState(false);
  const [unidadeFoco, setUnidadeFoco] = useState<IUnidade | null>(null);
  const [moradoresFoco, setMoradoresFoco] = useState<IMoradorUnidade[]>([]);

  const [loteBloco, setLoteBloco] = useState("");
  const [loteInicio, setLoteInicio] = useState("");
  const [loteFim, setLoteFim] = useState("");

  const [fb, setFb] = useState({
    visible: false,
    type: "success" as any,
    title: "",
    message: "",
  });

  const condominioId = authSessao?.condominio?.id;

  const buscar = useCallback(
    (page = 1) => {
      if (condominioId) {
        carregarUnidades(condominioId, filtroBloco, filtroUnidade, page);
      }
    },
    [condominioId, filtroBloco, filtroUnidade, carregarUnidades],
  );

  useEffect(() => {
    buscar();
  }, [condominioId]);

  // --- Ações ---

  const abrirDetalhes = async (unidade: IUnidade) => {
    setUnidadeFoco(unidade);
    setModalDetalhe(true);
    await atualizarListaMoradores(unidade.bloco, unidade.numero_unidade);
  };

  const atualizarListaMoradores = async (bloco: string, num: string) => {
    if (condominioId) {
      const moradores = await getMoradoresUnidade(condominioId, bloco, num);
      setMoradoresFoco(moradores || []);
    }
  };

  const confirmarSaida = (morador: IMoradorUnidade) => {
    Alert.alert(
      "Confirmar Saída",
      `Deseja registrar a saída de ${morador.Nome}? Esta ação moverá o morador para o histórico da unidade.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar Saída",
          style: "destructive",
          onPress: async () => {
            if (unidadeFoco) {
              const res = await registrarSaidaMorador(
                morador.usuario_id,
                unidadeFoco.id,
              );
              if (res.success) {
                // Atualiza a lista do modal após a saída
                await atualizarListaMoradores(
                  unidadeFoco.bloco,
                  unidadeFoco.numero_unidade,
                );
              }
            }
          },
        },
      ],
    );
  };

  const executarGeracaoLote = async () => {
    if (!loteBloco || !loteInicio || !loteFim || !condominioId) return;
    const res = await handleGerarLote({
      condominio_id: condominioId,
      blocos: [loteBloco],
      inicio: parseInt(loteInicio),
      fim: parseInt(loteFim),
    });
    if (res.success) {
      setModalLote(false);
      setFb({
        visible: true,
        type: "success",
        title: "Sucesso",
        message: res.message,
      });
      buscar();
    }
  };

  return (
    <View style={styles.container}>
      <Header
        tituloPagina="Gestão de Unidades"
        breadcrumb={["Admin", "Unidades"]}
        showBack
      />

      <View style={styles.contentWrapper}>
        {/* 🔍 BARRA DE FILTROS */}
        <View style={styles.filterSection}>
          <TextInput
            style={[styles.input, { flex: 1.5 }]}
            placeholder="Bloco"
            value={filtroBloco}
            onChangeText={setFiltroBloco}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Unidade"
            value={filtroUnidade}
            onChangeText={setFiltroUnidade}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.btnSearch} onPress={() => buscar(1)}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 📋 LISTAGEM PRINCIPAL (UNIDADES) */}
        {loading && unidades.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={unidades}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 15, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cardUnidade}
                onPress={() => abrirDetalhes(item)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>
                    {item.bloco} - Unidade {item.numero_unidade}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={COLORS.grey300}
                  />
                </View>
                <View style={styles.cardBody}>
                  <Ionicons
                    name="person-circle-outline"
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text style={styles.cardProprietario}>
                    {item.nome_proprietario || "Sem proprietário vinculado"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhuma unidade encontrada.</Text>
            }
          />
        )}

        {/* 🔢 PAGINAÇÃO */}
        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={pagination.page === 1}
            onPress={() => buscar(pagination.page - 1)}
            style={[styles.pageBtn, pagination.page === 1 && { opacity: 0.3 }]}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.pageText}>
            Página {pagination.page} de {pagination.total_pages}
          </Text>
          <TouchableOpacity
            disabled={pagination.page >= pagination.total_pages}
            onPress={() => buscar(pagination.page + 1)}
            style={[
              styles.pageBtn,
              pagination.page >= pagination.total_pages && { opacity: 0.3 },
            ]}
          >
            <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ➕ FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => setModalLote(true)}>
          <Ionicons name="add" size={30} color="#fff" />
          <Text style={styles.fabText}>GERAR LOTE</Text>
        </TouchableOpacity>

        {/* 🏗️ MODAL GERAÇÃO EM LOTE */}
        <Modal visible={modalLote} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalLoteContent}>
              <Text style={styles.modalTitle}>Gerar Unidades</Text>
              <Text style={styles.label}>IDENTIFICADOR DO BLOCO</Text>
              <TextInput
                style={styles.inputModal}
                placeholder="Ex: Bloco A"
                value={loteBloco}
                onChangeText={setLoteBloco}
              />
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Nº INÍCIO</Text>
                  <TextInput
                    style={styles.inputModal}
                    placeholder="101"
                    keyboardType="numeric"
                    value={loteInicio}
                    onChangeText={setLoteInicio}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.label}>Nº FIM</Text>
                  <TextInput
                    style={styles.inputModal}
                    placeholder="110"
                    keyboardType="numeric"
                    value={loteFim}
                    onChangeText={setLoteFim}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.btnConfirmLote}
                onPress={executarGeracaoLote}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnConfirmText}>GERAR AGORA</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalLote(false)}
              >
                <Text style={styles.btnCancelText}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 🔎 MODAL DETALHES COM LISTA DE MORADORES E BOTÃO SAÍDA */}
        <Modal visible={modalDetalhe} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalDetailContent}>
              <View style={styles.detailHeader}>
                <View>
                  <Text style={styles.detailTitle}>
                    {unidadeFoco?.bloco} - {unidadeFoco?.numero_unidade}
                  </Text>
                  <Text style={styles.detailSubtitle}>Dossiê da Unidade</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalDetalhe(false)}
                  style={styles.btnCloseHeader}
                >
                  <Ionicons name="close" size={24} color={COLORS.textMain} />
                </TouchableOpacity>
              </View>

              <View style={styles.ownerHighlight}>
                <Text style={styles.labelSmall}>PROPRIETÁRIO ATUAL</Text>
                <Text style={styles.ownerNameBig}>
                  {unidadeFoco?.nome_proprietario || "Não cadastrado"}
                </Text>
              </View>

              <Text style={styles.sectionLabel}>Moradores e Vínculos</Text>
              <FlatList
                data={moradoresFoco}
                keyExtractor={(item) =>
                  item.usuario_id + (item.data_entrada || "")
                }
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.moradorItem,
                      !item.status && styles.moradorInativo,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={styles.row}>
                        <Text
                          style={[
                            styles.moradorNome,
                            !item.status && { color: COLORS.grey300 },
                          ]}
                        >
                          {item.Nome || "Desconhecido"}
                        </Text>
                        <View
                          style={[
                            styles.badgeTipo,
                            { backgroundColor: getTipoColor(item.Tipo) },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeTipoText,
                              { color: getTipoTextColor(item.Tipo) },
                            ]}
                          >
                            {item.Tipo?.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.rowDates}>
                        <Ionicons
                          name="calendar-outline"
                          size={12}
                          color={COLORS.grey300}
                        />
                        <Text style={styles.dateText}>
                          {item.data_entrada
                            ? ` Entrou: ${item.data_entrada}`
                            : " Sem data"}
                          {item.data_saida
                            ? ` • Saiu: ${item.data_saida}`
                            : " • Atual"}
                        </Text>
                      </View>
                    </View>
                    {item.status && (
                      <TouchableOpacity
                        style={styles.btnStatusAcao}
                        onPress={() => confirmarSaida(item)}
                      >
                        <Text style={styles.btnStatusAcaoText}>SAÍDA</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Sem moradores vinculados.
                  </Text>
                }
              />
            </View>
          </View>
        </Modal>

        <FeedbackModal
          visible={fb.visible}
          type={fb.type}
          title={fb.title}
          message={fb.message}
          onClose={() => setFb({ ...fb, visible: false })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  filterSection: {
    flexDirection: "row",
    padding: 15,
    gap: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  input: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
  },
  btnSearch: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  cardUnidade: {
    backgroundColor: "#fff",
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.light,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.textMain },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 5,
  },
  cardProprietario: { fontSize: 13, color: COLORS.textSecondary },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    gap: 20,
  },
  pageBtn: { padding: 10 },
  pageText: { fontSize: 14, color: COLORS.textSecondary },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...SHADOWS.medium,
  },
  fabText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalLoteContent: { backgroundColor: "#fff", padding: 25, borderRadius: 20 },
  modalDetailContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 24,
    maxHeight: "85%",
    width: "95%",
    maxWidth: 600,
    alignSelf: "center",
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.primary,
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.grey300,
    marginBottom: 5,
    marginTop: 15,
  },
  inputModal: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 10,
  },
  row: { flexDirection: "row", alignItems: "center" },
  btnConfirmLote: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  btnConfirmText: { color: "#fff", fontWeight: "bold" },
  btnCancel: { padding: 15, alignItems: "center" },
  btnCancelText: { color: COLORS.grey300 },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailTitle: { fontSize: 22, fontWeight: "bold", color: COLORS.textMain },
  detailSubtitle: { fontSize: 13, color: COLORS.grey300, marginTop: -2 },
  btnCloseHeader: { padding: 5, backgroundColor: "#F1F5F9", borderRadius: 20 },
  ownerHighlight: {
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 12,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.grey300,
    marginBottom: 4,
  },
  ownerNameBig: { fontSize: 16, fontWeight: "bold", color: COLORS.primary },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
    marginTop: 5,
  },
  moradorItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  moradorInativo: { opacity: 0.6 },
  moradorNome: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textMain,
    marginRight: 8,
  },
  btnStatusAcao: {
    backgroundColor: "#FFF5F5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FED7D7",
    marginLeft: 10,
  },
  btnStatusAcaoText: { color: "#C53030", fontSize: 11, fontWeight: "800" },
  badgeTipo: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeTipoText: { fontSize: 9, fontWeight: "bold" },
  rowDates: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  dateText: { fontSize: 11, color: COLORS.grey300 },
  badgeStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 20, color: COLORS.grey300 },
});
