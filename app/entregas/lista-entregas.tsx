import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/theme";
import Header from "../components/Header";

interface Entrega {
  id: string;
  codigo: string;
  unidade: string;
  bloco: string;
  morador: string;
  status: "Recebida" | "Entregue" | "Devolvida";
  urgente: boolean;
  marketplace?: string;
  dataRecebimento: string; // Adicionado para os detalhes
  observacao?: string; // Adicionado para os detalhes
}

const ENTREGAS_MOCK: Entrega[] = [
  {
    id: "1",
    codigo: "AMZ-99821-BR",
    unidade: "103",
    bloco: "1",
    morador: "JULIANA SILVA",
    status: "Recebida",
    urgente: true,
    marketplace: "Amazon",
    dataRecebimento: "15/01/2026 09:30",
    observacao: "Pacote grande, deixado no pallet.",
  },
  {
    id: "2",
    codigo: "MELI-7712-XP",
    unidade: "102",
    bloco: "2",
    morador: "JOSÉ ABELARDO",
    status: "Entregue",
    urgente: false,
    marketplace: "Mercado Livre",
    dataRecebimento: "14/01/2026 15:45",
  },
  {
    id: "3",
    codigo: "SHP-00129-AA",
    unidade: "201",
    bloco: "1",
    morador: "RICARDO OLIVEIRA",
    status: "Recebida",
    urgente: false,
    marketplace: "Shopee",
    dataRecebimento: "15/01/2026 10:10",
  },
];

export default function ListaEntregas() {
  const router = useRouter();
  const [filtroUnidade, setFiltroUnidade] = useState("");
  const [filtroBloco, setFiltroBloco] = useState("");
  const [apenasUrgentes, setApenasUrgentes] = useState(false);

  // Estados para o Modal de Detalhes
  const [entregaSelecionada, setEntregaSelecionada] = useState<Entrega | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const entregasFiltradas = useMemo(() => {
    return ENTREGAS_MOCK.filter((entrega) => {
      const matchUnidade = entrega.unidade.includes(filtroUnidade);
      const matchBloco = entrega.bloco
        .toLowerCase()
        .includes(filtroBloco.toLowerCase());
      const matchUrgente = apenasUrgentes ? entrega.urgente : true;
      return matchUnidade && matchBloco && matchUrgente;
    });
  }, [filtroUnidade, filtroBloco, apenasUrgentes]);

  const handleAbrirDetalhes = (item: Entrega) => {
    setEntregaSelecionada(item);
    setModalVisible(true);
  };

  const EntregaCard = ({ item }: { item: Entrega }) => (
    <TouchableOpacity
      style={[styles.card, item.urgente && styles.cardUrgente]}
      onPress={() => handleAbrirDetalhes(item)}
    >
      {item.urgente && (
        <View style={styles.tagUrgente}>
          <Text style={styles.tagUrgenteTexto}>URGENTE</Text>
        </View>
      )}
      <View style={styles.cardHeader}>
        <Ionicons
          name="cube-outline"
          size={12}
          color={item.urgente ? "#e74c3c" : COLORS.textLight}
        />
        <Text style={styles.codigoText} numberOfLines={1}>
          {item.codigo}
        </Text>
      </View>
      <View style={styles.infoBox}>
        <View style={styles.unidadeBadge}>
          <Text style={styles.unidadeTextoDestaque}>
            {item.bloco}/{item.unidade}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={10} color={COLORS.primary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.morador}
          </Text>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                item.status === "Recebida" ? COLORS.secondary : "#bdc3c7",
            },
          ]}
        />
        <Text
          style={[
            styles.statusLabel,
            item.status === "Recebida" && {
              color: COLORS.secondary,
              fontWeight: "bold",
            },
          ]}
        >
          {item.status === "Recebida" ? "PENDENTE" : item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.safeContainer}>
      <Header
        titulo="Encomendas"
        subtitulo="Gestão de Recebidos"
        showBack={true}
      />

      {/* Seção de Filtros */}
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
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>Protocolo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              apenasUrgentes && {
                backgroundColor: "#ffeaea",
                borderColor: "#e74c3c",
              },
            ]}
            onPress={() => setApenasUrgentes(!apenasUrgentes)}
          >
            <Text
              style={[
                styles.filterText,
                apenasUrgentes && { color: "#e74c3c" },
              ]}
            >
              {apenasUrgentes ? "Ver Todos" : "Só Urgentes"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              {
                backgroundColor: COLORS.secondary,
                borderColor: COLORS.secondary,
              },
            ]}
          >
            <Text style={[styles.filterText, { color: "#fff" }]}>
              Pendentes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={entregasFiltradas}
        renderItem={({ item }) => <EntregaCard item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
      />

      {/* MODAL DE DETALHES COMPLETO */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Entrega</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>

            {entregaSelecionada && (
              <ScrollView>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>CÓDIGO DE RASTREIO</Text>
                  <Text style={styles.detailValue}>
                    {entregaSelecionada.codigo}
                  </Text>
                </View>

                <View style={styles.detailGrid}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>UNIDADE / BLOCO</Text>
                    <Text style={styles.detailValue}>
                      {entregaSelecionada.bloco} / {entregaSelecionada.unidade}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>MARKETPLACE</Text>
                    <Text style={styles.detailValue}>
                      {entregaSelecionada.marketplace || "Não informado"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>DESTINATÁRIO</Text>
                  <Text style={styles.detailValue}>
                    {entregaSelecionada.morador}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>DATA RECEBIMENTO</Text>
                  <Text style={styles.detailValue}>
                    {entregaSelecionada.dataRecebimento}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>OBSERVAÇÕES</Text>
                  <Text style={styles.detailValue}>
                    {entregaSelecionada.observacao ||
                      "Nenhuma observação registrada."}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.btnDarBaixa}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.btnActionText}>DAR BAIXA</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnEditar}
                    onPress={() => {
                      setModalVisible(false);
                      router.push("/entregas/cadastro"); // Simula edição levando ao form
                    }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text
                      style={[styles.btnActionText, { color: COLORS.primary }]}
                    >
                      EDITAR
                    </Text>
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
    marginTop: 5,
    marginBottom: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterText: { fontSize: 10, fontWeight: "bold", color: COLORS.textLight },
  list: { padding: 4, paddingBottom: 20 },
  card: {
    flex: 1 / 3,
    backgroundColor: "#fff",
    margin: 4,
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: "#eee",
    justifyContent: "space-between",
    minHeight: 125,
    elevation: 1,
  },
  cardUrgente: {
    borderColor: "#e74c3c",
    borderWidth: 1.5,
    backgroundColor: "#fffafa",
  },
  tagUrgente: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  tagUrgenteTexto: { color: "#fff", fontSize: 7, fontWeight: "900" },
  unidadeBadge: {
    backgroundColor: "#f0f4f8",
    borderRadius: 4,
    paddingVertical: 3,
    alignItems: "center",
    marginBottom: 6,
  },
  unidadeTextoDestaque: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.primary,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  codigoText: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginLeft: 4,
  },
  infoBox: { marginBottom: 5 },
  infoRow: { flexDirection: "row", alignItems: "center", marginVertical: 1 },
  infoText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.textMain,
    marginLeft: 5,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusLabel: { fontSize: 8, color: COLORS.textLight, fontWeight: "600" },

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textMain },
  detailRow: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },
  detailGrid: {
    flexDirection: "row",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "bold",
    marginBottom: 4,
  },
  detailValue: { fontSize: 14, color: COLORS.textMain, fontWeight: "600" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  btnDarBaixa: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    flexDirection: "row",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  btnEditar: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: "row",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  btnActionText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
});
