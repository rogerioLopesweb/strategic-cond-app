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
import { FeedbackModal } from "@/src/modules/common/components/FeedbackModal";
import { Header } from "@/src/modules/common/components/Header";
import { Pagination } from "@/src/modules/common/components/Pagination";
import { COLORS, SHADOWS, SIZES } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";
import { ModalDetalhesVisitante } from "@/src/modules/visitantes/components/ModalDetalhesVisitante";
import { useVisitantes } from "@/src/modules/visitantes/hooks/useVisitantes";
import { IVisitaDTO } from "@/src/modules/visitantes/types/IVisita";

export default function ListaVisitantes() {
  const { authSessao, authLoading } = useAuthContext();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // 🪝 Usando o Hook que criamos
  const {
    visitas,
    loading,
    pagination: paginationHook,
    fetchVisitas,
    registrarSaida,
  } = useVisitantes();

  // 🎯 CÁLCULO DE LARGURA PRECISO PARA O GRID
  const effectiveWidth = Math.min(width, 1350);
  const numColumns = effectiveWidth > 1024 ? 4 : effectiveWidth > 768 ? 3 : 2;
  const cardMargin = 6;
  const horizontalPadding = 20;
  const cardWidth =
    (effectiveWidth - horizontalPadding * 2) / numColumns - cardMargin * 2;

  // 📝 Filtros Cumulativos
  const [filtroUnidade, setFiltroUnidade] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [filtroCpf, setFiltroCpf] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("aberta");

  // 🪟 Estados dos Modais
  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false); // ✅ Nome arrumado
  const [visitaSelecionada, setVisitaSelecionada] = useState<IVisitaDTO | null>(
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
      // ✅ Barreira de segurança: Se não tiver ID do condomínio, nem tenta buscar
      if (authLoading || !authSessao?.condominio?.id) return;

      await fetchVisitas({
        condominio_id: authSessao.condominio.id,
        page: page,
        limit: 12,
        status: statusFiltro === "todas" ? undefined : statusFiltro,
        unidade: filtroUnidade,
        bloco: filtroBloco,
        cpf: filtroCpf,
      });
    },
    [
      authSessao?.condominio?.id,
      statusFiltro,
      filtroUnidade,
      filtroBloco,
      filtroCpf,
      authLoading,
      fetchVisitas,
    ],
  );

  // Debounce para os filtros
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => carregarDados(1), 400);
    return () => clearTimeout(delayDebounceFn);
  }, [filtroUnidade, filtroBloco, filtroCpf, statusFiltro, carregarDados]);

  const renderItem = ({ item }: { item: IVisitaDTO }) => {
    const isAberta = item.status === "aberta";
    let statusColor = isAberta ? COLORS.success : COLORS.textLight;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { width: cardWidth },
          isAberta && { borderColor: statusColor, borderWidth: 0.5 },
        ]}
        onPress={() => {
          // ✅ Apenas abre o modal, independente do status
          setVisitaSelecionada(item);
          setModalDetalhesVisible(true);
        }}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.unidadeBadge,
              { backgroundColor: isAberta ? "#e8f5e9" : "#f1f5f9" },
            ]}
          >
            <Text style={[styles.unidadeTextoDestaque, { color: statusColor }]}>
              {item.unidade ? `${item.bloco}/${item.unidade}` : "ADM"}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.nomeMoradorCard} numberOfLines={1}>
            {item.nome_visitante}
          </Text>
          <Text style={styles.tipoEmbalagemCard}>
            {item.tipo.toUpperCase()}
          </Text>
          {item.cpf_visitante && (
            <Text style={styles.documentoText}>CPF: {item.cpf_visitante}</Text>
          )}
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {isAberta ? "DENTRO DO CONDOMÍNIO" : "FINALIZADA"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.safeContainer}>
      <Header
        tituloPagina="Portaria & Visitantes"
        breadcrumb={["Visitantes", "Lista"]}
        showBack
      />

      <View style={styles.contentWrapper}>
        <View style={styles.filtroWrapper}>
          <View style={styles.searchRow}>
            {/* Bloco */}
            <View
              style={[styles.inputContainer, { flex: 0.4, marginRight: 10 }]}
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

            {/* Unidade */}
            <View
              style={[styles.inputContainer, { flex: 0.5, marginRight: 10 }]}
            >
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

            {/* CPF */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={16}
                color={COLORS.textLight}
                style={{ marginLeft: 10 }}
              />
              <TextInput
                placeholder="CPF (apenas números)"
                style={styles.input}
                value={filtroCpf}
                onChangeText={setFiltroCpf}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Botões de Status */}
          <View style={styles.filterBar}>
            {[
              {
                id: "aberta",
                label: "ABERTAS (DENTRO)",
                color: COLORS.success,
              },
              {
                id: "finalizada",
                label: "FINALIZADAS",
                color: COLORS.textLight,
              },
              { id: "todas", label: "TODAS", color: COLORS.primary },
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
          {loading && visitas.length === 0 ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginTop: 50 }}
            />
          ) : (
            <FlatList
              key={numColumns}
              data={visitas}
              renderItem={renderItem}
              keyExtractor={(item) => item.visita_id}
              numColumns={numColumns}
              style={styles.flatList}
              columnWrapperStyle={
                numColumns > 1 ? { justifyContent: "flex-start" } : null
              }
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={() => carregarDados(1)}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Ionicons
                    name="walk-outline"
                    size={50}
                    color={COLORS.grey200}
                  />
                  <Text style={styles.emptyText}>
                    Nenhum visitante encontrado.
                  </Text>
                </View>
              }
            />
          )}

          <View style={styles.paginationFixed}>
            <Pagination
              currentPage={paginationHook.page}
              totalPages={paginationHook.totalPages}
              onPageChange={(p) => carregarDados(p)}
              loading={loading}
            />
          </View>
        </View>
      </View>

      {/* ✅ Modal de Detalhes da Visita (Bug da variável corrigido) */}
      <ModalDetalhesVisitante
        visible={modalDetalhesVisible}
        visita={visitaSelecionada}
        loading={loading}
        onClose={() => setModalDetalhesVisible(false)}
        onRegistrarSaida={async (visitaId) => {
          // ✅ Correção: statusFiltro é a variável que controla a aba atual
          await registrarSaida(visitaId, statusFiltro);

          // 🔄 Faz o Reload da lista direto do banco para garantir paginação
          fetchVisitas({
            condominio_id: authSessao?.condominio?.id!,
            page: paginationHook.page, // Mantém o usuário na página que ele estava!
            status: statusFiltro === "todas" ? undefined : statusFiltro,
          });
        }}
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
    marginHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterText: { fontSize: 10, fontWeight: "bold", color: COLORS.textLight },

  listWrapper: {
    flex: 1,
    justifyContent: "space-between",
    overflow: "hidden",
    minHeight: 0,
  },
  flatList: { flex: 1 },
  list: { paddingVertical: 10, paddingBottom: 20 },
  paginationFixed: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 5,
  },

  card: {
    backgroundColor: COLORS.white,
    margin: 6,
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
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textMain,
    textAlign: "center",
  },
  tipoEmbalagemCard: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 4,
  },
  documentoText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
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
