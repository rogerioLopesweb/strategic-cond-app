import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Importações modulares
import { COLORS, SHADOWS, SIZES } from "../src/modules/common/constants/theme";
import {
  ICondominio,
  useAuthContext,
} from "../src/modules/common/context/AuthContext";

export default function SelecaoCondominio() {
  // ✅ Incluído authLogout das ações do contexto
  const { authUser, authSelecionarCondominio, authLogout } = useAuthContext();
  const router = useRouter();

  const primeiroNome = authUser?.nome?.split(" ")[0] || "Usuário";

  const handleSelect = async (id: string) => {
    try {
      await authSelecionarCondominio(id);
      router.replace("/home");
    } catch (error) {
      console.error("Erro ao selecionar condomínio:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await authLogout();
      // O _layout.tsx redirecionará para o login automaticamente ao detectar authSigned: false
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const renderItem = ({ item }: { item: ICondominio }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelect(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconCircle}>
          <Ionicons name="business" size={26} color={COLORS.primary} />
        </View>

        <View style={styles.textInfo}>
          <Text style={styles.condoNome} numberOfLines={1}>
            {item.nome}
          </Text>
          <View style={styles.perfilBadge}>
            <Text style={styles.perfilTexto}>{item.perfil.toUpperCase()}</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={COLORS.grey300} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Header com Botão Sair */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.6}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>

          <View style={styles.avatarMini}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.saudacao}>Olá, {primeiroNome}!</Text>
          <Text style={styles.instrucao}>
            Identificamos múltiplos vínculos. Qual condomínio deseja acessar
            agora?
          </Text>
        </View>

        <FlatList
          data={authUser?.condominios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhum condomínio vinculado a este usuário.
            </Text>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: Platform.OS === "web" ? 30 : 20,
    paddingBottom: 20,
    alignItems: "center",
    position: "relative", // Para o botão de logout
  },
  logoutBtn: {
    position: "absolute",
    right: 20,
    top: Platform.OS === "web" ? 30 : 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  logoutText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.error,
  },
  avatarMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
    ...SHADOWS.light,
  },
  saudacao: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textMain,
    textAlign: "center",
  },
  instrucao: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: COLORS.textLight,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: 15,
    padding: 18,
    ...SHADOWS.medium,
    ...Platform.select({
      web: {
        cursor: "pointer",
      } as any,
    }),
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.grey100,
    justifyContent: "center",
    alignItems: "center",
  },
  textInfo: {
    flex: 1,
    marginLeft: 15,
  },
  condoNome: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  perfilBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.grey200,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  perfilTexto: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primary,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerTexto: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "500",
  },
});
