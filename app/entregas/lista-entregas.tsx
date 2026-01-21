import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../src/components/Header";
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
}

export default function ListaEntregas() {
  const router = useRouter();

  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroUnidade, setFiltroUnidade] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");

  // DEFAULT: Pendentes (recebido)
  const [statusFiltro, setStatusFiltro] = useState<string>("recebido");
  const [filtroUrgente, setFiltroUrgente] = useState(false);

  const [entregaSelecionada, setEntregaSelecionada] = useState<Entrega | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const res = await entregaService.listar({
        pagina: 1,
        limite: 30,
        status: statusFiltro,
        unidade: filtroUnidade,
        bloco: filtroBloco,
        retirada_urgente: filtroUrgente,
      });

      if (res.success) {
        setEntregas(res.data);
      }
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [statusFiltro, filtroUnidade, filtroBloco, filtroUrgente]);

  const handleAbrirDetalhes = (item: Entrega) => {
    setEntregaSelecionada(item);
    setModalVisible(true);
  };

  const EntregaCard = ({ item }: { item: Entrega }) => {
    const isPendente = item?.status === "recebido";
    const isUrgente = item?.retirada_urgente === true;
    const statusColor = isPendente ? "#f39c12" : COLORS.success;
    const badgeBg = isPendente ? "#fef5e7" : "#e8f5e9";

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
        onPress={() => handleAbrirDetalhes(item)}
      >
        {isUrgente && (
          <View style={styles.tagUrgente}>
            <Ionicons name="alert-circle" size={10} color="#fff" />
            <Text style={styles.tagUrgenteTexto}>URGENTE</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <View style={[styles.unidadeBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.unidadeTextoDestaque, { color: statusColor }]}>
              {item?.bloco}/{item?.unidade}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.nomeMoradorCard} numberOfLines={1}>
            {item?.morador_nome || "NOME NÃO INFORMADO"}
          </Text>
          <Text style={styles.tipoEmbalagemCard}>
            {item?.tipo_embalagem || "Pacote"}
          </Text>
          <View style={styles.tipoBadge}>
            <Text style={styles.tipoTextoCard}>
              {item?.morador_tipo?.toUpperCase() || "VISITANTE"}
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
          <Text
            style={[
              styles.statusLabel,
              { color: statusColor, fontWeight: "bold" },
            ]}
          >
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
        subtitulo="Gestão de Recebidos"
        showBack={true}
      />

      <View style={styles.filtroWrapper}>
        <View style={styles.searchRow}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="home-outline"
              size={18}
              color={COLORS.textLight}
              style={{ marginLeft: 10 }}
            />
            <TextInput
              placeholder="Nº Unidade"
              style={styles.input}
              value={filtroUnidade}
              onChangeText={setFiltroUnidade}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputContainer, { flex: 0.5, marginLeft: 10 }]}>
            <Ionicons
              name="business-outline"
              size={18}
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
          {/* BOTÃO VERMELHO URGENTES */}
          <TouchableOpacity
            style={[
              styles.filterBtnUrgente,
              filtroUrgente && { backgroundColor: "#e74c3c" },
            ]}
            onPress={() => {
              setFiltroUrgente(!filtroUrgente);
              if (!filtroUrgente) setStatusFiltro("recebido");
            }}
          >
            <Ionicons
              name="flash"
              size={12}
              color={filtroUrgente ? "#fff" : "#e74c3c"}
            />
            <Text
              style={[
                styles.filterTextUrgente,
                filtroUrgente && { color: "#fff" },
              ]}
            >
              URGENTES
            </Text>
          </TouchableOpacity>

          {["recebido", "entregue"].map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.filterBtn,
                statusFiltro === s &&
                  !filtroUrgente && {
                    backgroundColor:
                      s === "recebido" ? "#f39c12" : COLORS.success,
                    borderColor: s === "recebido" ? "#f39c12" : COLORS.success,
                  },
              ]}
              onPress={() => {
                setStatusFiltro(s);
                setFiltroUrgente(false);
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFiltro === s && !filtroUrgente && { color: "#fff" },
                ]}
              >
                {s === "recebido" ? "PENDENTES" : "ENTREGUES"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={entregas}
        renderItem={({ item }) => <EntregaCard item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={carregando} onRefresh={carregarDados} />
        }
        ListEmptyComponent={
          !carregando ? (
            <Text style={styles.emptyText}>Nenhuma encomenda encontrada.</Text>
          ) : null
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Encomenda</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            {entregaSelecionada && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* FOTO DA ETIQUETA */}
                {entregaSelecionada?.url_foto_etiqueta && (
                  <Image
                    source={{ uri: entregaSelecionada.url_foto_etiqueta }}
                    style={styles.fotoEtiqueta}
                    resizeMode="cover"
                  />
                )}

                {/* INDICADOR DE URGÊNCIA DENTRO DO MODAL */}
                {entregaSelecionada?.retirada_urgente && (
                  <View
                    style={[
                      styles.detailRow,
                      {
                        backgroundColor: "#fff5f5",
                        borderColor: "#feb2b2",
                        borderWidth: 1,
                        borderRadius: 8,
                        padding: 10,
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                    <Text
                      style={{
                        color: "#e74c3c",
                        fontWeight: "bold",
                        marginLeft: 8,
                      }}
                    >
                      ESTA ENCOMENDA É URGENTE
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>DESTINATÁRIO</Text>
                  <Text style={styles.detailValue}>
                    {entregaSelecionada?.morador_nome}
                  </Text>
                  <Text style={styles.subDetail}>
                    {entregaSelecionada?.morador_tipo} •{" "}
                    {entregaSelecionada?.morador_telefone}
                  </Text>
                </View>

                <View style={styles.detailGrid}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>TIPO EMBALAGEM</Text>
                    <Text
                      style={[styles.detailValue, { color: COLORS.primary }]}
                    >
                      {entregaSelecionada?.tipo_embalagem?.toUpperCase() ||
                        "PACOTE"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>MARKETPLACE</Text>
                    <Text style={styles.detailValue}>
                      {entregaSelecionada?.marketplace || "Outros"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>CÓDIGO DE RASTREIO</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: COLORS.secondary, letterSpacing: 1 },
                    ]}
                  >
                    {entregaSelecionada?.codigo_rastreio || "NÃO INFORMADO"}
                  </Text>
                </View>

                <View style={styles.detailGrid}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>LOCALIZAÇÃO</Text>
                    <Text style={styles.detailValue}>
                      Bloco {entregaSelecionada?.bloco} - Un.{" "}
                      {entregaSelecionada?.unidade}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>DATA RECEBIMENTO</Text>
                    <Text style={styles.detailValue}>
                      {entregaSelecionada?.data_recebimento
                        ? new Date(
                            entregaSelecionada.data_recebimento,
                          ).toLocaleString("pt-BR")
                        : "Data indisponível"}
                    </Text>
                  </View>
                </View>

                {/* CAMPO DE OBSERVAÇÕES CASO EXISTA */}
                {entregaSelecionada?.observacoes && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>OBSERVAÇÕES</Text>
                    <Text style={styles.detailValue}>
                      {entregaSelecionada.observacoes}
                    </Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.btnDarBaixa,
                      { backgroundColor: COLORS.success },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-done-circle"
                      size={22}
                      color="#fff"
                    />
                    <Text style={styles.btnActionText}>CONFIRMAR RETIRADA</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnFechar}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.btnFecharTexto}>VOLTAR</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.background },
  filtroWrapper: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
    marginTop: 10,
  },
  searchRow: { flexDirection: "row", marginBottom: 10 },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 40,
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
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterText: { fontSize: 10, fontWeight: "bold", color: COLORS.textLight },

  // ESTILO BOTÃO URGENTE
  filterBtnUrgente: {
    flex: 0.8,
    marginHorizontal: 2,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  filterTextUrgente: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#e74c3c",
    marginLeft: 4,
  },

  list: { padding: 4, paddingBottom: 20 },
  card: {
    flex: 1 / 3,
    backgroundColor: "#fff",
    margin: 4,
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: "#eee",
    minHeight: 140,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    justifyContent: "center",
  },
  infoBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  unidadeBadge: {
    borderRadius: 4,
    paddingVertical: 3,
    width: "100%",
    alignItems: "center",
    marginBottom: 6,
  },
  unidadeTextoDestaque: { fontSize: 13, fontWeight: "900" },
  nomeMoradorCard: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMain,
    textAlign: "center",
  },
  tipoEmbalagemCard: { fontSize: 8, color: "#95a5a6", marginTop: 2 },
  tipoBadge: {
    backgroundColor: "#E8F0FE",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    alignSelf: "center",
    marginTop: 4,
  },
  tipoTextoCard: { fontSize: 7, color: COLORS.primary, fontWeight: "bold" },
  tagUrgente: {
    position: "absolute",
    top: -8,
    right: 0,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20,
  },
  tagUrgenteTexto: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "900",
    marginLeft: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    borderTopWidth: 1,
    paddingTop: 4,
    justifyContent: "center",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusLabel: { fontSize: 8, fontWeight: "600" },
  emptyText: { textAlign: "center", marginTop: 20, color: COLORS.textLight },
  fotoEtiqueta: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
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
  detailRow: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 6,
  },
  detailGrid: {
    flexDirection: "row",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 6,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "bold",
    marginBottom: 2,
  },
  detailValue: { fontSize: 14, color: COLORS.textMain, fontWeight: "600" },
  subDetail: { fontSize: 11, color: COLORS.textLight, fontStyle: "italic" },
  modalActions: { marginTop: 10 },
  btnDarBaixa: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  btnFechar: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnFecharTexto: { color: COLORS.textLight, fontWeight: "bold" },
  btnActionText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
});
