import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// ✅ Imports Modulares
import { FeedbackModal } from "../../src/modules/common/components/FeedbackModal";
import { Header } from "../../src/modules/common/components/Header";
import { Pagination } from "../../src/modules/common/components/Pagination";
import {
  COLORS,
  SHADOWS,
  SIZES,
} from "../../src/modules/common/constants/theme";
import { useAuthContext } from "../../src/modules/common/context/AuthContext";
import { useEntregas } from "../../src/modules/entregas";
import { ModalBaixaManual } from "../../src/modules/entregas/components/ModalBaixaManual";
import { ModalCancelarEntrega } from "../../src/modules/entregas/components/ModalCancelarEntrega";
import { ModalDetalhesEntrega } from "../../src/modules/entregas/components/ModalDetalhesEntrega";

export default function ListaEntregas() {
  const { authSessao, authLoading } = useAuthContext();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const {
    listarEntregas,
    baixarEntregaManual,
    cancelarEntrega,
    entregasLoading,
  } = useEntregas();

  // 🎯 CÁLCULO DE LARGURA PRECISO PARA O GRID
  // Respeita o maxWidth de 1350px para não cortar no lado direito em telas grandes
  const effectiveWidth = Math.min(width, 1350);
  const numColumns = effectiveWidth > 1024 ? 4 : effectiveWidth > 768 ? 3 : 2;
  const cardMargin = 6;
  const horizontalPadding = 20; // Padding do contentWrapper
  const cardWidth =
    (effectiveWidth - horizontalPadding * 2) / numColumns - cardMargin * 2;

  const [entregas, setEntregas] = useState<any[]>([]);
  const [carregandoLocal, setCarregandoLocal] = useState(false);
  const [paginacao, setPaginacao] = useState({ pagina: 1, total_paginas: 1 });

  // 📝 Filtros Cumulativos
  const [filtroUnidade, setFiltroUnidade] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("recebido");
  const [filtroUrgente, setFiltroUrgente] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalBaixaVisible, setModalBaixaVisible] = useState(false);
  const [modalCancelarVisible, setModalCancelarVisible] = useState(false);
  const [erroCancelamento, setErroCancelamento] = useState<string | null>(null);
  const [entregaSelecionada, setEntregaSelecionada] = useState<any | null>(
    null,
  );
  const [modalFeedback, setModalFeedback] = useState({
    visible: false,
    type: "success" as any,
    title: "",
    message: "",
  });

  const carregarDados = useCallback(
    async (page = 1) => {
      if (authLoading || !authSessao?.condominio?.id) return;

      setCarregandoLocal(true);
      const res = await listarEntregas({
        pagina: page,
        limite: 12,
        status: statusFiltro,
        unidade: filtroUnidade,
        bloco: filtroBloco,
        retirada_urgente: filtroUrgente, // 🎯 Filtro cumulativo enviado ao backend
        condominio_id: authSessao.condominio.id,
      });

      if (res.success) {
        setEntregas(Array.isArray(res.data) ? res.data : []);
        if (res.pagination) {
          setPaginacao({
            pagina: res.pagination.page,
            total_paginas: res.pagination.total_pages,
          });
        }
      }
      setCarregandoLocal(false);
    },
    [
      authSessao?.condominio?.id,
      statusFiltro,
      filtroUnidade,
      filtroBloco,
      filtroUrgente,
      authLoading,
    ],
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => carregarDados(1), 400);
    return () => clearTimeout(delayDebounceFn);
  }, [filtroUnidade, filtroBloco, statusFiltro, filtroUrgente]);

  // --- Handlers de Ação ---
  const handleConfirmarBaixa = async (dados: any) => {
    if (!entregaSelecionada) return;
    const res = await baixarEntregaManual({
      id: entregaSelecionada.id,
      ...dados,
    });
    if (res.success) {
      setModalBaixaVisible(false);
      setModalFeedback({
        visible: true,
        type: "success",
        title: "Sucesso",
        message: "Encomenda entregue!",
      });
      carregarDados(paginacao.pagina);
    }
  };

  const handleConfirmarCancelamento = async (motivo: string) => {
    if (!entregaSelecionada || !authSessao?.condominio?.id) return;
    const res = await cancelarEntrega({
      id: entregaSelecionada.id,
      motivo,
      condominio_id: authSessao.condominio.id,
    });
    if (res.success) {
      setModalCancelarVisible(false);
      setModalFeedback({
        visible: true,
        type: "success",
        title: "Cancelada",
        message: "Lançamento anulado.",
      });
      carregarDados(paginacao.pagina);
    } else {
      setErroCancelamento(res.error || "Erro ao cancelar.");
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isPendente = item.status === "recebido";
    const isCancelada = item.status === "cancelada";
    const isUrgente = item.retirada_urgente === true;
    let statusColor = isPendente
      ? COLORS.warning
      : isCancelada
        ? COLORS.textLight
        : COLORS.success;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { width: cardWidth }, // 🎯 Aplicando a largura calculada correta
          isPendente && { borderColor: statusColor, borderWidth: 0.5 },
          isUrgente &&
            !isCancelada && {
              borderColor: COLORS.error,
              borderWidth: 1.5,
              backgroundColor: "#fffafa",
            },
        ]}
        onPress={() => {
          setEntregaSelecionada(item);
          setModalVisible(true);
        }}
      >
        {isUrgente && !isCancelada && (
          <View style={styles.tagUrgente}>
            <Ionicons name="flash" size={10} color={COLORS.white} />
            <Text style={styles.tagUrgenteTexto}>URGENTE</Text>
          </View>
        )}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.unidadeBadge,
              { backgroundColor: isPendente ? "#fef5e7" : "#e8f5e9" },
            ]}
          >
            <Text style={[styles.unidadeTextoDestaque, { color: statusColor }]}>
              {item.bloco}/{item.unidade}
            </Text>
          </View>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.nomeMoradorCard} numberOfLines={1}>
            {item.morador_nome || "N/I"}
          </Text>
          <Text style={styles.tipoEmbalagemCard}>
            {item.tipo_embalagem || "Pacote"}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {isCancelada ? "CANCELADA" : isPendente ? "PENDENTE" : "ENTREGUE"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.safeContainer}>
      <Header
        tituloPagina="Portaria & Encomendas"
        breadcrumb={["Encomendas", "Lista"]}
        showBack
      />

      <View style={styles.contentWrapper}>
        <View style={styles.filtroWrapper}>
          <View style={styles.searchRow}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="home-outline"
                size={16}
                color={COLORS.textLight}
                style={{ marginLeft: 10 }}
              />
              <TextInput
                placeholder="Unidade"
                style={styles.input}
                value={filtroUnidade}
                onChangeText={setFiltroUnidade}
              />
            </View>
            <View
              style={[styles.inputContainer, { flex: 0.5, marginLeft: 10 }]}
            >
              <Ionicons
                name="business-outline"
                size={16}
                color={COLORS.textLight}
                style={{ marginLeft: 10 }}
              />
              <TextInput
                placeholder="Bloco"
                style={styles.input}
                value={filtroBloco}
                onChangeText={setFiltroBloco}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.filterBar}>
            <TouchableOpacity
              style={[
                styles.filterBtnUrgente,
                filtroUrgente && {
                  backgroundColor: COLORS.error,
                  borderColor: COLORS.error,
                },
              ]}
              onPress={() => setFiltroUrgente(!filtroUrgente)}
            >
              <Text
                style={[
                  styles.filterTextUrgente,
                  filtroUrgente && { color: COLORS.white },
                ]}
              >
                🔥 URG.
              </Text>
            </TouchableOpacity>

            {[
              { id: "recebido", label: "PENDENTES", color: COLORS.warning },
              { id: "entregue", label: "ENTREGUES", color: COLORS.success },
              { id: "cancelada", label: "CANCELADAS", color: COLORS.textLight },
            ].map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.filterBtn,
                  statusFiltro === s.id && {
                    backgroundColor: s.color,
                    borderColor: s.color,
                  },
                ]}
                onPress={() => setStatusFiltro(s.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    statusFiltro === s.id && { color: COLORS.white },
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.listWrapper}>
          <FlatList
            key={numColumns}
            data={entregas}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            columnWrapperStyle={
              numColumns > 1 ? { justifyContent: "flex-start" } : null
            }
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={entregasLoading || carregandoLocal}
                onRefresh={() => carregarDados(1)}
              />
            }
            ListEmptyComponent={
              !(entregasLoading || carregandoLocal) ? (
                <View style={styles.emptyBox}>
                  <Ionicons
                    name="cube-outline"
                    size={50}
                    color={COLORS.grey200}
                  />
                  <Text style={styles.emptyText}>
                    Nenhuma encomenda encontrada.
                  </Text>
                </View>
              ) : (
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                  style={{ marginTop: 50 }}
                />
              )
            }
          />

          <View style={styles.paginationFixed}>
            <Pagination
              currentPage={paginacao.pagina}
              totalPages={paginacao.total_paginas}
              onPageChange={(p) => carregarDados(p)}
              loading={entregasLoading || carregandoLocal}
            />
          </View>
        </View>
      </View>

      <ModalDetalhesEntrega
        visible={modalVisible}
        entrega={entregaSelecionada}
        onClose={() => setModalVisible(false)}
        onBaixa={() => {
          setModalVisible(false);
          setTimeout(() => setModalBaixaVisible(true), 300);
        }}
        onEditar={() => {
          setModalVisible(false);
          router.push({
            pathname: "/entregas/cadastro",
            params: { ...entregaSelecionada, editar: "true" },
          });
        }}
        onExcluir={() => {
          setModalVisible(false);
          setErroCancelamento(null);
          setTimeout(() => setModalCancelarVisible(true), 300);
        }}
      />

      <ModalBaixaManual
        visible={modalBaixaVisible}
        onClose={() => {
          setModalBaixaVisible(false);
          setModalVisible(true);
        }}
        onConfirm={handleConfirmarBaixa}
        loading={entregasLoading}
      />
      <ModalCancelarEntrega
        visible={modalCancelarVisible}
        onClose={() => setModalCancelarVisible(false)}
        onConfirm={handleConfirmarCancelamento}
        loading={entregasLoading}
        erroApi={erroCancelamento}
      />
      <FeedbackModal
        {...modalFeedback}
        onClose={() => setModalFeedback({ ...modalFeedback, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.background },
  contentWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  filtroWrapper: {
    backgroundColor: COLORS.white,
    padding: 12,
    marginTop: 10,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
    zIndex: 10,
  },
  searchRow: { flexDirection: "row", marginBottom: 10 },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.grey100,
    borderRadius: 8,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 13,
    color: COLORS.textMain,
  },
  filterBar: { flexDirection: "row", justifyContent: "space-between" },
  filterBtn: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnUrgente: {
    flex: 0.6,
    marginHorizontal: 2,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  filterText: { fontSize: 8, fontWeight: "bold", color: COLORS.textLight },
  filterTextUrgente: { fontSize: 8, fontWeight: "bold", color: COLORS.error },

  listWrapper: { flex: 1, justifyContent: "space-between" },
  list: { paddingVertical: 10, paddingBottom: 20 },
  paginationFixed: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 5,
  },

  card: {
    backgroundColor: COLORS.white,
    margin: 6, // Margem fixa usada no cálculo (cardMargin)
    borderRadius: SIZES.radius,
    padding: 12,
    minHeight: 150,
    ...SHADOWS.light,
    justifyContent: "space-between",
  },
  cardHeader: { marginBottom: 5 },
  unidadeBadge: { borderRadius: 6, paddingVertical: 4, alignItems: "center" },
  unidadeTextoDestaque: { fontSize: 16, fontWeight: "900" },
  infoBox: { alignItems: "center", marginVertical: 5 },
  nomeMoradorCard: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textMain,
    textAlign: "center",
  },
  tipoEmbalagemCard: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tagUrgente: {
    position: "absolute",
    top: -8,
    right: 10,
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  tagUrgenteTexto: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "bold",
    marginLeft: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    justifyContent: "center",
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusLabel: { fontSize: 10, fontWeight: "800" },
  emptyBox: { alignItems: "center", marginTop: 80 },
  emptyText: { color: COLORS.textLight, marginTop: 10 },
});
