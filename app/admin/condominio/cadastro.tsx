import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Componentes e Hooks da Convenção
import { Header } from "@/src/modules/common/components/Header";
import { COLORS, SHADOWS, SIZES } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";
import { api } from "@/src/modules/common/services/api";

export default function ListaCondominiosAdmin() {
  const router = useRouter();
  const { authUser, authSelecionarCondominio } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [condominios, setCondominios] = useState([]);
  const [search, setSearch] = useState("");

  // 🔍 Busca os condomínios vinculados à Conta PJ
  const fetchCondominios = async () => {
    try {
      setLoading(true);
      // Usamos o conta_id que veio no login do usuário Master
      const response = await api.get(
        `/condominios?conta_id=${authUser?.conta_id}`,
      );
      if (response.data.success) {
        setCondominios(response.data.condominios);
      }
    } catch (error) {
      console.error("Erro ao carregar condomínios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCondominios();
  }, []);

  // ✅ Ação ao selecionar um condomínio
  const handleSelect = async (id: string) => {
    await authSelecionarCondominio(id);
    // Após selecionar, voltamos para o Dashboard que agora estará "liberado"
    router.replace("/admin/dashboard");
  };

  const filteredData = condominios.filter((item: any) =>
    item.nome_fantasia.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelect(item.id)}
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
        breadcrumb={["Admin", "Condomínios"]}
        showBack={true}
      />

      <View style={styles.content}>
        {/* BARRA DE BUSCA E NOVO CADASTRO */}
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
            onPress={() => router.push("/admin/condominio/cadastro")}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando sua carteira...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="business-outline"
                  size={64}
                  color={COLORS.grey200}
                />
                <Text style={styles.emptyText}>
                  Nenhum condomínio encontrado.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 20 },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 6,
  },
  cnpjBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.grey100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cnpjText: {
    fontSize: 11,
    color: COLORS.grey300,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: COLORS.textLight },
  emptyState: { alignItems: "center", marginTop: 100 },
  emptyText: { color: COLORS.textLight, marginTop: 10, fontSize: 16 },
});
