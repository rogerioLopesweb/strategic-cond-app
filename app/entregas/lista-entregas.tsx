import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Importação de Componentes Customizados
import { FeedbackModal } from "../../src/components/common/FeedbackModal";
import { ModalBaixaManual } from "../../src/components/entregas/ModalBaixaManual";
import { ModalDetalhesEntrega } from "../../src/components/entregas/ModalDetalhesEntrega";
import Header from "../../src/components/Header";

// Constantes e Serviços
import { COLORS } from "../../src/constants/theme";
import { entregaService } from "../../src/services/entregaService";

interface Entrega {
  id: string;
  codigo_rastreio: string;
  unidade: string;
  bloco: string;
  status: "recebido" | "entregue" | "devolvida";
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
  quem_retirou?: string;
  documento_retirou?: string;
  data_retirada?: string;
}

export default function ListaEntregas() {
  const router = useRouter();

  // Estados de Dados e Filtros
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroUnidade, setFiltroUnidade] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("recebido");
  const [filtroUrgente, setFiltroUrgente] = useState(false);

  // Estados de Modais
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

  // Dentro do componente ListaEntregas

  const handleAbrirBaixaManual = () => {
    // PASSO 1: Fecha o modal de detalhes primeiro
    setModalVisible(false);

    // PASSO 2: Pequeno delay (opcional) para o modal de detalhes sair da tela
    // e o de baixa entrar suavemente sem conflito de animação
    setTimeout(() => {
      setModalBaixaVisible(true);
    }, 300);
  };
  // Ações de Negócio
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

  const handleExcluir = async () => {
    if (!entregaSelecionada) return;
    setCarregando(true);
    const res = await entregaService.deletar(entregaSelecionada.id);
    if (res.success) {
      setModalVisible(false);
      setModalFeedback({
        visible: true,
        type: "success",
        title: "Removido",
        message: "Registro excluído com sucesso.",
      });
      carregarDados();
    } else {
      setModalFeedback({
        visible: true,
        type: "error",
        title: "Erro",
        message: res.error,
      });
    }
    setCarregando(false);
  };

  // Renderizador de cada Card (Grid)
  const renderItem = ({ item }: { item: Entrega }) => {
    const isPendente = item.status === "recebido";
    const isUrgente = item.retirada_urgente === true;
    const statusColor = isPendente ? "#f39c12" : COLORS.success;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isPendente && { borderColor: statusColor, borderWidth: 0.5 },
          isUrgente && {
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
        {isUrgente && (
          <View style={styles.tagUrgente}>
            <Ionicons name="flash" size={10} color="#fff" />
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
            {isPendente ? "PENDENTE" : "ENTREGUE"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.safeContainer}>
      <Header
        titulo="Encomendas"
        subtitulo="Gestão de Portaria"
        showBack={true}
      />

      {/* Seção de Filtros */}
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
            onPress={() => {
              // Diferente de antes, não vamos resetar o statusFiltro aqui
              setFiltroUrgente(!filtroUrgente);
            }}
          >
            <Text
              style={[
                styles.filterTextUrgente,
                filtroUrgente && { color: "#fff" },
              ]}
            >
              🔥 URGENTES
            </Text>
          </TouchableOpacity>

          {["recebido", "entregue"].map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.filterBtn,
                statusFiltro === s && {
                  backgroundColor:
                    s === "recebido" ? "#f39c12" : COLORS.success,
                },
              ]}
              onPress={() => setStatusFiltro(s)}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFiltro === s && { color: "#fff" },
                ]}
              >
                {s === "recebido" ? "PENDENTES" : "ENTREGUES"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista Principal */}
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
              <Text style={styles.emptyText}>Nenhuma encomenda por aqui.</Text>
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

      {/* Modais Componentizados */}
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
          Alert.alert("Excluir", "Deseja remover este registro?", [
            { text: "Não" },
            { text: "Sim", onPress: handleExcluir, style: "destructive" },
          ]);
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
    flex: 0.8,
    marginHorizontal: 2,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  filterText: { fontSize: 10, fontWeight: "bold", color: COLORS.textLight },
  filterTextUrgente: { fontSize: 10, fontWeight: "bold", color: "#e74c3c" },
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
