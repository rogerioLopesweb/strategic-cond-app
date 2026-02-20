import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { Pagination } from "@/src/modules/common/components/Pagination";
import { COLORS, SHADOWS } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";

export default function ListaUsuarios() {
  const router = useRouter();
  const { authSessao } = useAuthContext();
  const {
    usuarios,
    pagination,
    usuarioFoco,
    getUsuarioDetalhado,
    loading,
    getUsuariosCondominio,
    atualizarStatus,
    atualizarUsuarioNaLista,
  } = useUsuarios();

  const flatListRef = useRef<FlatList>(null);

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

  // ✅ Busca com Debounce (Garante busca inicial e filtragem eficiente)
  useEffect(() => {
    if (!condominioId) return;

    // Define um timer para disparar a busca após 600ms de inatividade na digitação
    const handler = setTimeout(() => {
      getUsuariosCondominio(condominioId, { nome: filtroNome, page: 1 });
    }, 600);

    // Limpa o timer anterior se o usuário digitar novamente antes do tempo acabar
    return () => clearTimeout(handler);
  }, [condominioId, filtroNome]);

  // ✅ Rolar para o topo quando a página mudar
  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [pagination.page]);

  // ✅ Troca de Página
  const handlePageChange = (newPage: number) => {
    if (condominioId) {
      getUsuariosCondominio(condominioId, { nome: filtroNome, page: newPage });
    }
  };

  const handleAbrirUsuario = async (item: IUsuarioListagem) => {
    setSelectedUser(item);
    setModalVisible(true);
    if (condominioId) {
      await getUsuarioDetalhado(item.id, condominioId);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!condominioId) return;
    const novoStatus = !currentStatus;
    try {
      setSelectedUser((prev) => (prev ? { ...prev, ativo: novoStatus } : null));
      atualizarUsuarioNaLista(userId, novoStatus);
      await atualizarStatus(userId, condominioId, novoStatus);
      setFb({
        visible: true,
        type: "success",
        message: `Usuário ${novoStatus ? "ativado" : "desativado"} com sucesso.`,
      });
    } catch (error) {
      setSelectedUser((prev) =>
        prev ? { ...prev, ativo: currentStatus } : null,
      );
      atualizarUsuarioNaLista(userId, currentStatus);
      setFb({
        visible: true,
        type: "error",
        message: "Erro ao sincronizar. Tente novamente.",
      });
    }
  };

  const handleSearch = (text: string) => {
    setFiltroNome(text);
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
            <Text style={styles.unidadeValor}> {item.unidades}</Text>
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

        {/* 🎯 ÁREA DA LISTA TRAVADA */}
        <View style={styles.listWrapper}>
          {loading && !usuarios.length ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={usuarios}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                style={styles.flatList}
                removeClippedSubviews={true}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      name="people-outline"
                      size={48}
                      color={COLORS.grey300}
                    />
                    <Text style={styles.emptyText}>
                      Nenhum usuário encontrado.
                    </Text>
                  </View>
                }
              />

              {/* 🔢 PAGINAÇÃO FIXA NO RODAPÉ */}
              <View style={styles.paginationContainer}>
                <Pagination
                  currentPage={pagination?.page || 1}
                  totalPages={pagination?.total_pages || 1}
                  onPageChange={handlePageChange}
                  loading={loading} // Mantém os botões desativados durante o fetch
                />
              </View>
            </>
          )}
        </View>
      </View>

      <ModalInfoUsuario
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
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
    marginVertical: 15,
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

  // 🎯 Estilos de Travamento de Scroll
  listWrapper: {
    flex: 1,
    overflow: "hidden", // Garante que no Web o scroll não "vaze"
    minHeight: 0, // Fix para flexbox em containers aninhados
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  paginationContainer: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 5,
    paddingVertical: 10,
  },

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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
