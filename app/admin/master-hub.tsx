import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Imports Modulares
import { Header } from "@/src/modules/common/components/Header";
import { SideMenu } from "@/src/modules/common/components/SideMenu";
import { COLORS, SHADOWS, SIZES } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";

// Componente de Estatística (KPI)
const StatCard = ({ title, value, icon, color }: any) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  </View>
);

// Componente de Item de Menu (Refinado)
const MenuItem = ({
  title,
  icon,
  onPress,
  color = COLORS.primary,
  disabled = false,
}: any) => (
  <TouchableOpacity
    style={[styles.menuItem, disabled && { opacity: 0.4 }]}
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
        size={20}
        color={disabled ? COLORS.grey300 : color}
      />
    </View>
    <Text style={[styles.menuItemText, disabled && { color: COLORS.grey300 }]}>
      {title}
    </Text>
    {!disabled ? (
      <Ionicons name="chevron-forward" size={14} color={COLORS.grey300} />
    ) : (
      <Ionicons name="lock-closed" size={12} color={COLORS.grey300} />
    )}
  </TouchableOpacity>
);

export default function MasterHub() {
  const router = useRouter();
  const { authSessao, authUser, authLogout } = useAuthContext();
  const [menuVisible, setMenuVisible] = useState(false);

  if (!authUser) return null;

  return (
    <View style={styles.container}>
      <Header
        tituloPagina="Gestão Master"
        breadcrumb={["Home", "Administradora"]}
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* 📊 KPIs GLOBAIS DA CONTA PJ */}
          <View style={styles.statsRow}>
            <StatCard
              title="Condomínios"
              value="12"
              icon="business"
              color={COLORS.primary}
            />
            <StatCard
              title="Total Usuários"
              value="1.240"
              icon="people"
              color={COLORS.secondary}
            />
            <StatCard
              title="Entregas/Mês"
              value="850"
              icon="cube"
              color={COLORS.success}
            />
          </View>

          {/* 🏢 CARD ÚNICO: ADMINISTRADORA */}
          <View style={[styles.sectionCard, { width: "100%" }]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="briefcase-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.cardTitle}>
                Gerenciamento da Administradora
              </Text>
            </View>
            <View style={styles.cardBody}>
              <MenuItem
                title="Meus Condomínios"
                icon="list"
                onPress={() => router.push("/admin/condominio/lista" as any)}
              />
              <MenuItem
                title="Cadastrar Novo Prédio"
                icon="add-circle"
                onPress={() => router.push("/admin/condominio/cadastro" as any)}
              />
              <MenuItem
                title="Relatórios Financeiros"
                icon="bar-chart-outline"
                color={COLORS.secondary}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLogout={authLogout}
        authSessao={authSessao}
      />
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statsRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.light,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statValue: { fontSize: 20, fontWeight: "bold", color: COLORS.textMain },
  statLabel: { fontSize: 12, color: COLORS.textLight },
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
  activeCondoBanner: {
    width: "100%",
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 10,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  activeCondoText: { color: COLORS.white, fontWeight: "bold", fontSize: 13 },
  alertIconBg: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: COLORS.secondary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  alertTitle: { fontSize: 15, fontWeight: "bold", color: COLORS.textMain },
  alertMessage: { fontSize: 12, color: COLORS.textLight, lineHeight: 16 },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 20,
    marginBottom: 20,
    width: Platform.OS === "web" ? "48%" : "100%",
    minWidth: 320,
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
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginLeft: 12,
  },
  cardBody: { gap: 5 },
  subSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.grey300,
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 1,
  },
  smallDivider: {
    height: 1,
    backgroundColor: COLORS.grey100,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: COLORS.grey100,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.textMain,
    fontWeight: "500",
  },
});
