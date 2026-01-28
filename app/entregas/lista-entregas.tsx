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

  // ✅ Hook de Entregas
  const { listarEntregas, baixarEntregaManual, entregasLoading } =
    useEntregas();

  const numColumns = width > 1024 ? 4 : width > 768 ? 3 : 2;

  const [entregas, setEntregas] = useState<any[]>([]);
  const [carregandoLocal, setCarregandoLocal] = useState(false);

  // Filtros
  const [filtroUnidade, setFiltroUnidade] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("recebido");
  const [filtroUrgente, setFiltroUrgente] = useState(false);

  // Modais e Seleção
  const [modalVisible, setModalVisible] = useState(false);
  const [modalBaixaVisible, setModalBaixaVisible] = useState(false);
  const [modalCancelarVisible, setModalCancelarVisible] = useState(false);
  const [entregaSelecionada, setEntregaSelecionada] = useState<any | null>(
    null,
  );

  const [modalFeedback, setModalFeedback] = useState({
    visible: false,
    type: "success" as "success" | "error" | "warning" | "confirm",
    title: "",
    message: "",
  });

  // ✅ 1. Função de carga memorizada (Estabilizada)
  const carregarDados = useCallback(async () => {
    if (authLoading || !authSessao?.condominio?.id) return;

    setCarregandoLocal(true);
    const res = await listarEntregas({
      pagina: 1,
      limite: 100,
      status: statusFiltro,
      unidade: filtroUnidade,
      bloco: filtroBloco,
      retirada_urgente: filtroUrgente,
      condominio_id: authSessao.condominio.id,
    });

    // ✅ LOG 1: Veja aqui o que o servidor está enviando no array
    console.log(
      "📡 [API RESPONSE] Lista de Entregas:",
      JSON.stringify(res.data, null, 2),
    );

    if (res.success) {
      setEntregas(Array.isArray(res.data) ? res.data : []);
    }
    setCarregandoLocal(false);
  }, [
    authSessao?.condominio?.id,
    statusFiltro,
    filtroUnidade,
    filtroBloco,
    filtroUrgente,
    authLoading,
    // listarEntregas removido daqui para evitar o loop de identidade do hook
  ]);

  // ✅ 2. useEffect com Debounce (A solução do Loop)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      carregarDados();
    }, 400); // Aguarda 400ms antes de disparar a busca

    return () => clearTimeout(delayDebounceFn);
  }, [carregarDados]);

  const handleAbrirBaixaManual = () => {
    setModalVisible(false);
    setTimeout(() => setModalBaixaVisible(true), 300);
  };

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
        title: "Retirada Concluída!",
        message: "O status da encomenda foi atualizado.",
      });
      carregarDados();
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
    const badgeBg = isPendente
      ? "#fef5e7"
      : isCancelada
        ? COLORS.grey100
        : "#e8f5e9";

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { flex: 1 / numColumns },
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
          <View style={[styles.unidadeBadge, { backgroundColor: badgeBg }]}>
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
          <View style={styles.tipoBadge}>
            <Text style={styles.tipoTextoCard}>
              {item.morador_tipo?.toUpperCase() || "MORADOR"}
            </Text>
          </View>
        </View>
        <View
          style={[styles.statusContainer, { borderTopColor: COLORS.border }]}
        >
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
        showBack={true}
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
                editable={!entregasLoading}
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
                editable={!entregasLoading}
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
              disabled={entregasLoading}
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
                disabled={entregasLoading}
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

        <FlatList
          key={numColumns}
          data={entregas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={entregasLoading || carregandoLocal}
              onRefresh={carregarDados}
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
      </View>

      <ModalDetalhesEntrega
        visible={modalVisible}
        entrega={entregaSelecionada}
        onClose={() => setModalVisible(false)}
        onBaixa={handleAbrirBaixaManual}
        onEditar={() => {
          setModalVisible(false);
          router.push({
            pathname: "/entregas/cadastro",
            params: { ...entregaSelecionada, editar: "true" },
          });
        }}
        onExcluir={() => {
          setModalVisible(false);
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
        onConfirm={carregarDados}
        loading={entregasLoading}
      />
      <FeedbackModal
        {...modalFeedback}
        onClose={() => setModalFeedback({ ...modalFeedback, visible: false })}
      />
    </View>
  );
}

// ... styles idênticos aos anteriores
const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.background },
  contentWrapper: {
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    flex: 1,
  },
  filtroWrapper: {
    backgroundColor: COLORS.white,
    padding: 12,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
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
  list: { padding: 6, paddingBottom: 50 },
  card: {
    backgroundColor: COLORS.white,
    margin: 6,
    borderRadius: SIZES.radius,
    padding: 12,
    minHeight: 160,
    ...SHADOWS.light,
    justifyContent: "space-between",
  },
  cardHeader: { marginBottom: 5 },
  unidadeBadge: { borderRadius: 6, paddingVertical: 6, alignItems: "center" },
  unidadeTextoDestaque: { fontSize: 16, fontWeight: "900" },
  infoBox: { alignItems: "center", marginVertical: 8 },
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
  tipoBadge: {
    backgroundColor: COLORS.grey100,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  tipoTextoCard: { fontSize: 8, color: COLORS.primary, fontWeight: "800" },
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
    paddingTop: 8,
    justifyContent: "center",
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusLabel: { fontSize: 10, fontWeight: "800" },
  emptyBox: { alignItems: "center", marginTop: 80 },
  emptyText: { color: COLORS.textLight, marginTop: 10 },
});
