import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Imports seguindo a convenção modular
import { Header } from "@/src/modules/common/components/Header";
import { COLORS, SHADOWS, SIZES } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";
import { condominioService } from "@/src/modules/common/services/condominioService";
import { ICondominio } from "@/src/modules/common/types/condominioTypes";

export default function ListaCondominiosAdmin() {
  const router = useRouter();
  const { authUser, authSelecionarCondominio } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [condominios, setCondominios] = useState<ICondominio[]>([]);
  const [search, setSearch] = useState("");

  // ✅ Estados para o Modal de Ações
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState<ICondominio | null>(null);

  const fetchCondominios = useCallback(async () => {
    if (!authUser?.conta_id) return;

    try {
      setLoading(true);
      const data = await condominioService.listarPorConta(authUser.conta_id);

      if (data.success) {
        // ✅ O segredo está no "?? []"
        setCondominios(data.condominios ?? []);
      }
    } catch (error) {
      console.error("Erro ao carregar condomínios:", error);
      setCondominios([]); // Garante que o estado não fique "sujo" em caso de erro
    } finally {
      setLoading(false);
    }
  }, [authUser?.conta_id]);

  useEffect(() => {
    fetchCondominios();
  }, [fetchCondominios]);

  // 🚀 Abre as opções para o Master
  const handleOpenActions = (item: ICondominio) => {
    setSelectedCondo(item);
    setModalVisible(true);
  };

  // 🛠️ Ativa o condomínio no Contexto Global e vai para o Dashboard
  const handleGerenciar = async () => {
    if (selectedCondo) {
      setModalVisible(false);
      // Agora o TS entende que o selectedCondo (ICondominio)
      // possui o 'perfil' exigido pela função.
      await authSelecionarCondominio(selectedCondo);
      router.replace("/admin/dashboard" as any);
    }
  };

  const handleEditar = () => {
    if (selectedCondo) {
      setModalVisible(false);
      router.push(`/admin/condominio/editar/${selectedCondo.id}` as any);
    }
  };

  const filteredData = condominios.filter((item) =>
    item.nome_fantasia.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({ item }: { item: ICondominio }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleOpenActions(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardIcon}>
        <Ionicons name="business" size={24} color={COLORS.primary} />
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.nome_fantasia}</Text>
        <Text style={styles.cardSubtitle}>
          {item.cidade} - {item.estado}
        </Text>
        <View style={styles.cnpjBadge}>
          <Text style={styles.cnpjText}>CNPJ: {item.cnpj}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={COLORS.grey300} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        tituloPagina="Meus Condomínios"
        breadcrumb={["Admin", "Lista"]}
        showBack={true}
      />

      <View style={styles.contentWrapper}>
        <View style={styles.content}>
          <View style={styles.actionsRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.grey300} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nome..."
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <TouchableOpacity
              style={styles.btnAdd}
              onPress={() => router.push("/admin/condominio/cadastro" as any)}
            >
              <Ionicons name="add" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={(item, index) =>
                item.id?.toString() ?? index.toString()
              }
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Nenhum condomínio encontrado.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>

      {/* 🛠️ MODAL DE AÇÕES MASTER (O SEGREDO DO UX) */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedCondo?.nome_fantasia}
            </Text>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleGerenciar}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: COLORS.primary + "15" },
                ]}
              >
                <Ionicons
                  name="speedometer-outline"
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <View>
                <Text style={styles.actionBtnTitle}>Gerenciar Operação</Text>
                <Text style={styles.actionBtnSub}>
                  Entrar no painel do condomínio
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleEditar}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: COLORS.secondary + "15" },
                ]}
              >
                <Ionicons
                  name="create-outline"
                  size={24}
                  color={COLORS.secondary}
                />
              </View>
              <View>
                <Text style={styles.actionBtnTitle}>Editar Cadastro</Text>
                <Text style={styles.actionBtnSub}>
                  Alterar dados jurídicos ou endereço
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  content: { flex: 1, padding: 20 },
  actionsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    ...SHADOWS.medium,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.textMain,
  },
  btnAdd: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.medium,
  },
  list: { paddingBottom: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.textMain },
  cardSubtitle: { fontSize: 13, color: COLORS.textLight },
  cnpjBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.grey100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  cnpjText: {
    fontSize: 11,
    color: COLORS.grey300,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  loader: { flex: 1, justifyContent: "center" },
  emptyState: { alignItems: "center", marginTop: 100 },
  emptyText: { color: COLORS.textLight, fontSize: 16 },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 25,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 25,
    textAlign: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: COLORS.grey100,
  },
  actionIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  actionBtnTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.textMain },
  actionBtnSub: { fontSize: 12, color: COLORS.textLight },
  closeBtn: { marginTop: 10, padding: 15, alignItems: "center" },
  closeBtnText: { color: COLORS.error, fontWeight: "bold", letterSpacing: 1 },
});
