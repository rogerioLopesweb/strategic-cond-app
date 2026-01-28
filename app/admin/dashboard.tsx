import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Imports Modulares e Convenção
import { Header } from "../../src/modules/common/components/Header";
import {
  COLORS,
  SHADOWS,
  SIZES,
} from "../../src/modules/common/constants/theme";
import { useAuthContext } from "../../src/modules/common/context/AuthContext";

// Componente de Item de Menu Interno (Botão menor dentro do Card)
const MenuItem = ({ title, icon, onPress, color = COLORS.primary }: any) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconCircle, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.menuItemText}>{title}</Text>
    <Ionicons name="chevron-forward" size={16} color={COLORS.grey300} />
  </TouchableOpacity>
);

export default function Dashboard() {
  const router = useRouter();

  // ✅ Consumindo a Sessão Agregada conforme convenção
  const { authSessao } = useAuthContext();

  // Se por algum motivo a sessão não estiver pronta, não renderiza conteúdo sensível
  if (!authSessao) return null;

  return (
    <View style={styles.container}>
      <Header
        tituloPagina="Painel Administrativo"
        breadcrumb={["Home", "Painel"]}
        showBack={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* SEÇÃO 1: USUÁRIOS */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="people-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.cardTitle}>Gerenciamento de Usuários</Text>
            </View>
            <View style={styles.cardBody}>
              <MenuItem
                title="Lista de Usuários"
                icon="list-outline"
                onPress={() => router.push("/admin/usuarios/lista")}
              />
              <MenuItem
                title="Cadastrar Novo"
                icon="person-add-outline"
                onPress={() => router.push("/admin/usuarios/cadastro")}
              />
              <MenuItem
                title="Importação (Excel/CSV)"
                icon="cloud-upload-outline"
                color={COLORS.success}
                onPress={() => router.push("/admin/usuarios/importacao")}
              />
            </View>
          </View>

          {/* SEÇÃO 2: CONDOMÍNIO E ESTRUTURA */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="business-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.cardTitle}>Gerenciamento Condomínio</Text>
            </View>
            <View style={styles.cardBody}>
              <MenuItem
                title="Meus Condomínios"
                icon="business-outline"
                onPress={() => router.push("/admin/condominio/lista")}
              />
              <MenuItem
                title="Gestão de Unidades"
                icon="grid-outline"
                onPress={() => router.push("/admin/condominio/unidades")}
              />
              <Text style={styles.hintText}>
                * Dica: Vincule moradores diretamente na gestão de unidades.
              </Text>
            </View>
          </View>

          {/* SEÇÃO 3: CONFIGURAÇÕES E PORTARIA */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.cardTitle}>Segurança e Portaria</Text>
            </View>
            <View style={styles.cardBody}>
              <MenuItem
                title="Equipe de Portaria"
                icon="id-card-outline"
                onPress={() => router.push("/admin/portaria/equipe")}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  contentWrapper: {
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    padding: 20,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 20,
    marginBottom: 20,
    width: Platform.OS === "web" ? "48%" : "100%",
    minWidth: 350,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginLeft: 12,
  },
  cardBody: {
    gap: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: COLORS.grey100,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 15,
    color: COLORS.textMain,
    fontWeight: "500",
  },
  hintText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: "italic",
    marginTop: 10,
    textAlign: "center",
  },
});
