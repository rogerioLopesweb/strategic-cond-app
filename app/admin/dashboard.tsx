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
import { Header } from "@/src/modules/common/components/Header";
import { COLORS, SHADOWS, SIZES } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";

// Componente de Item de Menu Interno com lógica de bloqueio
const MenuItem = ({
  title,
  icon,
  onPress,
  color = COLORS.primary,
  disabled = false,
}: any) => (
  <TouchableOpacity
    style={[styles.menuItem, disabled && { opacity: 0.5 }]}
    onPress={disabled ? undefined : onPress}
    activeOpacity={disabled ? 1 : 0.7}
  >
    <View
      style={[
        styles.iconCircle,
        { backgroundColor: color + (disabled ? "05" : "15") },
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={disabled ? COLORS.grey300 : color}
      />
    </View>
    <Text style={[styles.menuItemText, disabled && { color: COLORS.grey300 }]}>
      {title}
    </Text>
    {!disabled && (
      <Ionicons name="chevron-forward" size={16} color={COLORS.grey300} />
    )}
  </TouchableOpacity>
);

export default function Dashboard() {
  const router = useRouter();
  const { authSessao, authUser } = useAuthContext();

  if (!authUser || (!authUser.isMaster && !authSessao)) {
    return null;
  }

  const hasCondo = !!authSessao;

  return (
    <View style={styles.container}>
      <Header
        tituloPagina={hasCondo ? authSessao.condominio.nome : "Gestão Master"}
        breadcrumb={["Home", "Painel"]}
        showBack={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* 🚩 BANNER DE AVISO (Aparece apenas se não houver condomínio selecionado) */}
          {!hasCondo && (
            <View style={styles.alertBanner}>
              <View style={styles.alertIconBg}>
                <Ionicons
                  name="alert-circle"
                  size={24}
                  color={COLORS.secondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>Seleção Necessária</Text>
                <Text style={styles.alertMessage}>
                  Para gerenciar unidades, moradores e portaria, primeiro
                  escolha um condomínio em **"Meus Condomínios"**.
                </Text>
              </View>
            </View>
          )}

          {/* SEÇÃO 1: CONDOMÍNIO E ESTRUTURA (AGORA EM PRIMEIRO) */}
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
                disabled={!hasCondo}
                onPress={() => router.push("/admin/condominio/unidades")}
              />
            </View>
          </View>

          {/* SEÇÃO 2: USUÁRIOS */}
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
                disabled={!hasCondo}
                onPress={() => router.push("/admin/usuarios/lista")}
              />
              <MenuItem
                title="Cadastrar Novo"
                icon="person-add-outline"
                disabled={!hasCondo}
                onPress={() => router.push("/admin/usuarios/cadastro")}
              />
              <MenuItem
                title="Importação (Excel/CSV)"
                icon="cloud-upload-outline"
                color={COLORS.success}
                disabled={!hasCondo}
                onPress={() => router.push("/admin/usuarios/importacao")}
              />
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
                disabled={!hasCondo}
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
  /* ESTILOS DO BANNER DE ALERTA */
  alertBanner: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 25,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: COLORS.secondary,
    ...SHADOWS.medium,
  },
  alertIconBg: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: COLORS.secondary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  /* ESTILOS DOS CARDS */
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
  cardBody: { gap: 10 },
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
});
