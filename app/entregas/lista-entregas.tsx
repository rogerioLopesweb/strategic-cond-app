import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
interface Entrega {
  id: string;
  codigo_rastreio: string;
  unidade: string;
  bloco: string;
  status: "recebido" | "entregue" | "devolvida" | "cancelada"; // Adicionado cancelada
  marketplace?: string;
  data_recebimento: string;
  url_foto_etiqueta?: string | null;
  observacoes?: string;
  morador_nome: string;
  morador_tipo: string;
  morador_telefone: string;
  retirada_urgente: boolean;
  tipo_embalagem: string;
  operador_entrada_nome?: string;
  operador_saida_nome?: string;
  operador_saida_perfil?: string;
  operador_cancelamento_nome?: string;
  operador_cancelamento_perfil?: string;
  motivo_cancelamento?: string;
  data_cancelamento?: string;
  quem_retirou?: string;
  documento_retirou?: string;
  data_retirada?: string;
}

export default function ListaEntregas() {
  // 1. Consumir isMorador para controle de visibilidade
  const { user, logout, isMorador } = useAuthContext();
  const router = useRouter();

  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroUnidade, setFiltroUnidade] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("recebido");
  const [filtroUrgente, setFiltroUrgente] = useState(false);
  const [modalCancelarVisible, setModalCancelarVisible] = useState(false);
  const [entregaSelecionada, setEntregaSelecionada] = useState<Entrega | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalBaixaVisible, setModalBaixaVisible] = useState(false);
  const [modalFeedback, setModalFeedback] = useState({
    visible: false,
    type: "success" as "success" | "error" | "warning" | "confirm",
    title: "",
    message: "",
  });

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const res = await entregaService.listar({
        pagina: 1,
        limite: 50,
        status: statusFiltro,
        unidade: filtroUnidade,
        bloco: filtroBloco,
        retirada_urgente: filtroUrgente,
      });

      if (res.success) {
        setEntregas(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar lista:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [statusFiltro, filtroUnidade, filtroBloco, filtroUrgente]);

  const handleAbrirBaixaManual = () => {
    setModalVisible(false);
    setTimeout(() => {
      setModalBaixaVisible(true);
    }, 300);
  };

  const handleConfirmarBaixa = async (dados: {
    quem_retirou: string;
    documento_retirou: string;
  }) => {
    if (!entregaSelecionada) return;
    setCarregando(true);
    const res = await entregaService.registrarSaidaManual(
      entregaSelecionada.id,
      dados,
    );

    if (res.success) {
      setModalBaixaVisible(false);
      setModalVisible(false);
      setModalFeedback({
        visible: true,
        type: "success",
        title: "Retirada Concluída!",
        message: "O status da encomenda foi atualizado com sucesso.",
      });
      carregarDados();
    } else {
      setModalFeedback({
        visible: true,
        type: "error",
        title: "Erro na Baixa",
        message: res.error,
      });
    }
    setCarregando(false);
  };

  // Estados necessários
  const [erroCancelamento, setErroCancelamento] = useState<string | null>(null);

  const handleConfirmarCancelamento = async (motivo: string) => {
    setCarregando(true);
    setErroCancelamento(null); // Limpa erro anterior

    const res = await entregaService.cancelar(entregaSelecionada.id, motivo);

    if (res.success) {
      // 1. FECHA o modal de cancelamento
      setModalCancelarVisible(false);

      // 2. ABRE o modal de sucesso (FeedbackModal)
      setTimeout(() => {
        setModalFeedback({
          visible: true,
          type: "success",
          title: "Anulação Concluída",
          message: "O registro foi invalidado com sucesso para auditoria.",
        });
        carregarDados(); // Recarrega a lista
      }, 400); // Pequeno delay para a animação de saída/entrada ficar fluida
    } else {
      // 3. MANTÉM o modal aberto e exibe o erro interno
      setErroCancelamento(res.error);
    }
    setCarregando(false);
  };

  const renderItem = ({ item }: { item: Entrega }) => {
    const isPendente = item.status === "recebido";
    const isCancelada = item.status === "cancelada";
    const isUrgente = item.retirada_urgente === true;

    // Lógica de cores dinâmica
    let statusColor = COLORS.success;
    if (isPendente) statusColor = "#f39c12";
    if (isCancelada) statusColor = "#95a5a6"; // Cinza para neutro/desativado

    const badgeBg = isPendente
      ? "#fef5e7"
      : isCancelada
        ? "#f2f2f2"
        : "#e8f5e9";

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isPendente && { borderColor: statusColor, borderWidth: 0.5 },
          isCancelada && {
            borderColor: "#ddd",
            backgroundColor: "#fafafa",
            opacity: 0.8,
          },
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
          <Text
            style={[styles.nomeMoradorCard, isCancelada && { color: "#999" }]}
            numberOfLines={1}
          >
            {item.morador_nome || "N/I"}
          </Text>
          <Text style={styles.tipoEmbalagemCard}>
            {item.tipo_embalagem || "Pacote"}
          </Text>
          <View
            style={[
              styles.tipoBadge,
              isCancelada && { backgroundColor: "#eee" },
            ]}
          >
            <Text
              style={[styles.tipoTextoCard, isCancelada && { color: "#888" }]}
            >
              {item.morador_tipo?.toUpperCase() || "MORADOR"}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusContainer,
            {
              borderTopColor: isCancelada
                ? "#eee"
                : isPendente
                  ? "#fdebd0"
                  : "#d4efdf",
            },
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
      <Header
        titulo="StrategicCond"
        subtitulo={
          user?.condominio ||
          (isMorador ? "Minha Residência" : "Dashboard Portaria")
        }
      />

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
          <View style={[styles.inputContainer, { flex: 0.5, marginLeft: 10 }]}>
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
          {/* Botão Urgentes */}
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

          {/* Botões de Status Dinâmicos */}
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
        data={entregas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
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
        onConfirm={handleConfirmarCancelamento}
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
  filtroWrapper: {
    backgroundColor: "#fff",
    padding: 12,
    margin: 10,
    borderRadius: 12,
    elevation: 3,
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
    flex: 1 / 3,
    backgroundColor: "#fff",
    margin: 4,
    borderRadius: 12,
    padding: 8,
    minHeight: 150,
    elevation: 2,
    justifyContent: "space-between",
  },
  cardHeader: { marginBottom: 5 },
  unidadeBadge: { borderRadius: 6, paddingVertical: 4, alignItems: "center" },
  unidadeTextoDestaque: { fontSize: 14, fontWeight: "900" },
  infoBox: { alignItems: "center" },
  nomeMoradorCard: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.textMain,
    textAlign: "center",
  },
  tipoEmbalagemCard: { fontSize: 9, color: "#7f8c8d", marginTop: 2 },
  tipoBadge: {
    backgroundColor: "#eef2f7",
    borderRadius: 4,
    padding: 2,
    marginTop: 4,
  },
  tipoTextoCard: { fontSize: 7, color: COLORS.primary, fontWeight: "800" },
  tagUrgente: {
    position: "absolute",
    top: -8,
    right: 0,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  tagUrgenteTexto: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "bold",
    marginLeft: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 6,
    justifyContent: "center",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusLabel: { fontSize: 8, fontWeight: "800" },
  emptyBox: { alignItems: "center", marginTop: 80 },
  emptyText: { color: "#999", marginTop: 10 },
});
