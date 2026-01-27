import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { FeedbackModal } from "@/src/components/common/FeedbackModal";
import { ModalBaixaManual } from "@/src/components/entregas/ModalBaixaManual";
import { ModalCancelarEntrega } from "@/src/components/entregas/ModalCancelarEntrega";
import { ModalDetalhesEntrega } from "@/src/components/entregas/ModalDetalhesEntrega";
import Header from "@/src/components/Header";
import { COLORS } from "@/src/constants/theme";
import { useAuthContext } from "@/src/context/AuthContext";
import { entregaService } from "@/src/services/entregaService";

export default function ListaEntregas() {
  const { condominioAtivo, isMorador, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // LÓGICA DE COLUNAS RESPONSIVAS
  const numColumns = width > 1024 ? 4 : width > 768 ? 3 : 2;

  const [entregas, setEntregas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Filtros
  const [filtroUnidade, setFiltroUnidade] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("recebido");
  const [filtroUrgente, setFiltroUrgente] = useState(false);

  // Modais
  const [modalVisible, setModalVisible] = useState(false);
  const [modalBaixaVisible, setModalBaixaVisible] = useState(false);
  const [modalCancelarVisible, setModalCancelarVisible] = useState(false);
  const [entregaSelecionada, setEntregaSelecionada] = useState<any | null>(
    null,
  );

  const [modalFeedback, setModalFeedback] = useState({
    visible: false,
    type: "success" as any,
    title: "",
    message: "",
  });

  // FUNÇÃO DE CARGA DE DADOS CORRIGIDA
  const carregarDados = useCallback(async () => {
    // Se o Auth ainda está carregando ou não temos condomínio ativo, abortamos
    if (authLoading || !condominioAtivo?.id) {
      setEntregas([]);
      return;
    }

    setCarregando(true);
    try {
      const res = await entregaService.listar({
        pagina: 1,
        limite: 100,
        status: statusFiltro,
        unidade: filtroUnidade,
        bloco: filtroBloco,
        retirada_urgente: filtroUrgente,
        condominio_id: condominioAtivo.id, // ID dinâmico vindo do contexto
      });

      if (res.success) {
        setEntregas(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar lista de entregas:", error);
    } finally {
      setCarregando(false);
    }
  }, [
    condominioAtivo,
    statusFiltro,
    filtroUnidade,
    filtroBloco,
    filtroUrgente,
    authLoading,
  ]);

  // Efeito que reage a qualquer mudança de filtro ou troca de condomínio
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleAbrirBaixaManual = () => {
    setModalVisible(false);
    setTimeout(() => setModalBaixaVisible(true), 300);
  };

  const handleConfirmarBaixa = async (dados: any) => {
    if (!entregaSelecionada) return;
    setCarregando(true);
    const res = await entregaService.registrarSaidaManual(
      entregaSelecionada.id,
      dados,
    );
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
    setCarregando(false);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isPendente = item.status === "recebido";
    const isCancelada = item.status === "cancelada";
    const isUrgente = item.retirada_urgente === true;

    let statusColor = isPendente
      ? "#f39c12"
      : isCancelada
        ? "#95a5a6"
        : COLORS.success;
    const badgeBg = isPendente
      ? "#fef5e7"
      : isCancelada
        ? "#f2f2f2"
        : "#e8f5e9";

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { flex: 1 / numColumns },
          isPendente && { borderColor: statusColor, borderWidth: 0.5 },
          isUrgente &&
            !isCancelada && {
              borderColor: "#e74c3c",
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
            <Ionicons name="flash" size={10} color="#fff" />
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
          style={[
            styles.statusContainer,
            { borderTopColor: isPendente ? "#fdebd0" : "#d4efdf" },
          ]}
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
      {/* O Header fica fora do wrapper para ocupar 100% da largura na Web */}
      <Header
        tituloPagina="Portaria & Encomendas" // Ou "Painel de Controle"
        breadcrumb={["Encomendas", "Lista"]} // Vazio pois é a raiz
        showBack={true} // Na Home não faz sentido ter botão voltar
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
                keyboardType="numeric"
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
                filtroUrgente && { backgroundColor: "#e74c3c" },
              ]}
              onPress={() => setFiltroUrgente(!filtroUrgente)}
            >
              <Text
                style={[
                  styles.filterTextUrgente,
                  filtroUrgente && { color: "#fff" },
                ]}
              >
                🔥 URG.
              </Text>
            </TouchableOpacity>

            {[
              { id: "recebido", label: "PENDENTES", color: "#f39c12" },
              { id: "entregue", label: "ENTREGUES", color: COLORS.success },
              { id: "cancelada", label: "CANCELADAS", color: "#95a5a6" },
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
                    statusFiltro === s.id && { color: "#fff" },
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
            <RefreshControl refreshing={carregando} onRefresh={carregarDados} />
          }
          ListEmptyComponent={
            !carregando ? (
              <View style={styles.emptyBox}>
                <Ionicons name="cube-outline" size={50} color="#ddd" />
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
        loading={carregando}
      />

      <ModalCancelarEntrega
        visible={modalCancelarVisible}
        onClose={() => setModalCancelarVisible(false)}
        onConfirm={carregarDados}
        loading={carregando}
      />

      <FeedbackModal
        {...modalFeedback}
        onClose={() => setModalFeedback({ ...modalFeedback, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#f4f7f6" },
  contentWrapper: {
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    flex: 1,
  },
  filtroWrapper: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 12,
    ...Platform.select({
      web: { shadowOpacity: 0.1, shadowRadius: 10 },
      default: { elevation: 3 },
    }),
  },
  searchRow: { flexDirection: "row", marginBottom: 10 },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    height: 40,
    borderWidth: 1,
    borderColor: "#eee",
  },
  input: { flex: 1, paddingHorizontal: 10, fontSize: 13 },
  filterBar: { flexDirection: "row", justifyContent: "space-between" },
  filterBtn: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  filterBtnUrgente: {
    flex: 0.6,
    marginHorizontal: 2,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  filterText: { fontSize: 8, fontWeight: "bold", color: COLORS.textLight },
  filterTextUrgente: { fontSize: 8, fontWeight: "bold", color: "#e74c3c" },
  list: { padding: 6, paddingBottom: 50 },
  card: {
    backgroundColor: "#fff",
    margin: 6,
    borderRadius: 12,
    padding: 12,
    minHeight: 160,
    ...Platform.select({
      web: { cursor: "pointer", shadowOpacity: 0.05 },
      default: { elevation: 2 },
    }),
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
  tipoEmbalagemCard: { fontSize: 10, color: "#7f8c8d", marginTop: 2 },
  tipoBadge: {
    backgroundColor: "#eef2f7",
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
    backgroundColor: "#e74c3c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  tagUrgenteTexto: {
    color: "#fff",
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
  emptyText: { color: "#999", marginTop: 10 },
});
