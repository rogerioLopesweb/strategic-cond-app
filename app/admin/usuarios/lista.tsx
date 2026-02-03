import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Imports Modulares
import { ModalInfoUsuario } from "@/src/modules/admin/components/ModalInfoUsuario";
import { useUsuarios } from "@/src/modules/admin/hooks/useUsuarios";
import { IUsuarioListagem } from "@/src/modules/admin/types/usuarioTypes";
import { FeedbackBox } from "@/src/modules/common/components/FeedbackBox";
import { Header } from "@/src/modules/common/components/Header";
import { COLORS, SHADOWS } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";

export default function ListaUsuarios() {
  const router = useRouter();
  const { authSessao } = useAuthContext();
  const {
    usuarios,
    usuarioFoco, // ✅ Extraído do Hook
    getUsuarioDetalhado, // ✅ Extraído do Hook
    loading,
    getUsuariosCondominio,
    atualizarStatus,
    atualizarUsuarioNaLista,
  } = useUsuarios();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUsuarioListagem | null>(
    null,
  );
  const [filtroNome, setFiltroNome] = useState("");

  const [fb, setFb] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    message: string;
  }>({
    visible: false,
    type: "info",
    message: "",
  });

  const condominioId = authSessao?.condominio?.id;

  // ✅ Busca inicial e sempre que o condomínio mudar
  useEffect(() => {
    if (condominioId) getUsuariosCondominio(condominioId);
  }, [condominioId]);

  // ✅ NOVA FUNÇÃO: Dispara a busca detalhada ao clicar no card
  const handleAbrirUsuario = async (item: IUsuarioListagem) => {
    setSelectedUser(item); // Seta o básico imediatamente para abrir o modal
    setModalVisible(true);

    if (condominioId) {
      // ✅ Busca Nascimento e Emergência na VPS
      await getUsuarioDetalhado(item.id, condominioId);
    }
  };

  const showFeedback = (
    type: "success" | "error" | "warning" | "info",
    message: string,
  ) => {
    setFb({ visible: true, type, message });
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!condominioId) return;
    const novoStatus = !currentStatus;

    try {
      // 1. Update Otimista (UI responde na hora)
      setSelectedUser((prev) => (prev ? { ...prev, ativo: novoStatus } : null));
      atualizarUsuarioNaLista(userId, novoStatus);

      // 2. API
      await atualizarStatus(userId, condominioId, novoStatus);

      showFeedback(
        "success",
        `Usuário ${novoStatus ? "ativado" : "desativado"} com sucesso.`,
      );
    } catch (error) {
      // 3. Rollback (Volta ao estado anterior se a VPS falhar)
      setSelectedUser((prev) =>
        prev ? { ...prev, ativo: currentStatus } : null,
      );
      atualizarUsuarioNaLista(userId, currentStatus);
      showFeedback("error", "Erro ao sincronizar com a VPS. Tente novamente.");
    }
  };

  const handleSearch = (text: string) => {
    setFiltroNome(text);
    if (condominioId) {
      // Opcional: Adicionar um debounce aqui se a lista for muito grande
      getUsuariosCondominio(condominioId, { nome: text });
    }
  };

  const getBadgeStyle = (perfil: string) => {
    switch (perfil) {
      case "sindico":
        return { bg: "#E8F5E9", text: "#2E7D32" };
      case "administracao":
        return { bg: "#E3F2FD", text: "#1565C0" };
      case "portaria":
        return { bg: "#FFF3E0", text: "#E65100" };
      case "zelador":
        return { bg: "#F3E5F5", text: "#7B1FA2" };
      default:
        return { bg: "#F5F5F5", text: "#616161" };
    }
  };

  const renderItem = ({ item }: { item: IUsuarioListagem }) => {
    const badge = getBadgeStyle(item.perfil);
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleAbrirUsuario(item)}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            {item.foto_perfil ? (
              <Image source={{ uri: item.foto_perfil }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color={COLORS.grey300} />
              </View>
            )}
            {!item.ativo && <View style={styles.statusInativoDot} />}
          </View>

          <View style={styles.infoBasica}>
            <View style={styles.rowBetween}>
              <Text style={styles.nome} numberOfLines={1}>
                {item.nome_completo}
              </Text>
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.text }]}>
                  {item.perfil?.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.subtitulo}>{item.email}</Text>
          </View>
        </View>

        {item.unidades && (
          <View style={styles.unidadeContainer}>
            <Ionicons name="home" size={12} color={COLORS.primary} />
            <Text style={styles.unidadeValor} numberOfLines={1}>
              {" "}
              {item.unidades}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        tituloPagina="Usuários"
        breadcrumb={["Admin", "Lista"]}
        showBack
      />

      <View style={styles.contentWrapper}>
        <FeedbackBox
          visible={fb.visible}
          type={fb.type}
          message={fb.message}
          onClose={() => setFb({ ...fb, visible: false })}
        />

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={18}
              color={COLORS.grey300}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.inputBusca}
              placeholder="Buscar por nome..."
              value={filtroNome}
              onChangeText={handleSearch}
              placeholderTextColor={COLORS.textLight}
            />
          </View>
          <TouchableOpacity
            style={styles.btnAdd}
            onPress={() => router.push("/admin/usuarios/cadastro")}
          >
            <Ionicons name="add" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {loading && !usuarios.length ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={usuarios}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={() =>
              condominioId && getUsuariosCondominio(condominioId)
            }
            refreshing={loading}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="people-outline"
                  size={48}
                  color={COLORS.grey300}
                />
                <Text style={styles.emptyText}>Nenhum usuário encontrado.</Text>
              </View>
            }
          />
        )}
      </View>

      <ModalInfoUsuario
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        // ✅ Prioriza o 'usuarioFoco' (detalhado) se ele existir, senão usa o básico
        user={usuarioFoco || selectedUser}
        onToggleStatus={handleToggleStatus}
      />
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
    paddingHorizontal: 20,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    ...SHADOWS.light,
  },
  inputBusca: { flex: 1, color: COLORS.textMain, fontSize: 15 },
  btnAdd: {
    backgroundColor: COLORS.primary,
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.medium,
  },
  listContent: { paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    ...SHADOWS.light,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardContent: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { position: "relative", marginRight: 15 },
  avatar: { width: 45, height: 45, borderRadius: 22.5 },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  statusInativoDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  infoBasica: { flex: 1 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nome: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textMain,
    flex: 1,
    marginRight: 5,
  },
  subtitulo: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: "900" },
  unidadeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  unidadeValor: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: {
    textAlign: "center",
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 15,
  },
});
