import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Importações modulares e Tipos unificados
import { COLORS, SHADOWS } from "../src/modules/common/constants/theme";
import { useAuthContext } from "../src/modules/common/context/AuthContext";
import { ICondominio } from "../src/modules/common/types/condominioTypes";

export default function SelecaoCondominio() {
  const { authUser, authSelecionarCondominio, authLogout } = useAuthContext();
  const router = useRouter();

  const primeiroNome = authUser?.nome?.split(" ")[0] || "Usuário";

  // 🚀 Lógica de Direcionamento Pós-Seleção
  const handleSelect = async (condo: ICondominio) => {
    // 🔍 DEBUG: Isso vai abrir uma janelinha com os dados reais
    alert(
      `DEBUG CONDO:\nID: ${condo.id}\nPerfil: "${condo.perfil}"\nNome: ${condo.nome_fantasia}`,
    );

    try {
      const perfilAtivo = condo.perfil?.toLowerCase().trim() || "";
      console.log("Perfil detectado:", perfilAtivo); // Também sai no terminal

      await authSelecionarCondominio(condo);

      // Verifique se a string bate exatamente com o que apareceu no alert
      const isOperacional = [
        "sindico",
        "sindica",
        "zelador",
        "administrador",
      ].includes(perfilAtivo);

      if (isOperacional) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/home");
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const renderItem = ({ item }: { item: ICondominio }) => {
    const isAdmin = ["sindico", "sindica", "zelador", "administrador"].includes(
      item?.perfil?.toLowerCase() || "",
    );

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isAdmin
                  ? COLORS.primary + "10"
                  : COLORS.secondary + "10",
              },
            ]}
          >
            <Ionicons
              name={isAdmin ? "shield-checkmark" : "home"}
              size={24}
              color={isAdmin ? COLORS.primary : COLORS.secondary}
            />
          </View>

          <View style={styles.textInfo}>
            <Text style={styles.condoNome} numberOfLines={1}>
              {item.nome_fantasia}
            </Text>
            <View
              style={[
                styles.perfilBadge,
                {
                  backgroundColor: isAdmin ? COLORS.primary : COLORS.secondary,
                },
              ]}
            >
              <Text style={styles.perfilTexto}>
                {item.perfil?.toUpperCase()}
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color={COLORS.grey300} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.innerContainer}>
        {/* Header Superior */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.logoutBtn} onPress={authLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>

          <View style={styles.avatarMini}>
            <Ionicons name="person" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.saudacao}>Olá, {primeiroNome}!</Text>
          <Text style={styles.instrucao}>
            Identificamos múltiplos vínculos na sua conta. Escolha qual unidade
            deseja gerenciar ou acessar agora:
          </Text>
        </View>

        <FlatList
          data={authUser?.condominios}
          keyExtractor={(item, index) =>
            item.id?.toString() ?? index.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color={COLORS.grey200}
              />
              <Text style={styles.emptyText}>Nenhum vínculo encontrado.</Text>
            </View>
          }
        />

        <View style={styles.footer}>
          <Text style={styles.footerTexto}>
            StrategicCond • Gestão Inteligente
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  innerContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: Platform.OS === "web" ? 40 : 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  logoutBtn: {
    position: "absolute",
    right: 20,
    top: Platform.OS === "web" ? 20 : 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  logoutText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.error,
  },
  avatarMini: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    ...SHADOWS.light,
  },
  saudacao: {
    fontSize: 26,
    fontWeight: "900",
    color: "#2c3e50",
    textAlign: "center",
  },
  instrucao: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 30,
  },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 15,
    padding: 20,
    ...SHADOWS.medium,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
  },
  cardContent: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textInfo: { flex: 1, marginLeft: 15 },
  condoNome: { fontSize: 18, fontWeight: "bold", color: "#2c3e50" },
  perfilBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  perfilTexto: { fontSize: 10, fontWeight: "900", color: COLORS.white },
  footer: { padding: 20, alignItems: "center" },
  footerTexto: {
    fontSize: 12,
    color: COLORS.grey300,
    fontWeight: "bold",
    opacity: 0.5,
  },
  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: {
    textAlign: "center",
    marginTop: 10,
    color: COLORS.grey300,
    fontSize: 16,
  },
});
