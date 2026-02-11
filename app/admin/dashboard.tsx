import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Imports Modulares
import { Header } from "@/src/modules/common/components/Header";
import { COLORS, SHADOWS, SIZES } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";

// --- COMPONENTES INTERNOS ---

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

// Componente de Item de Menu
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

export default function DashboardOperacional() {
  const router = useRouter();
  const { authSessao, authLimparCondominio } = useAuthContext();

  // 🛡️ Segurança: Se não houver condomínio selecionado, não renderiza nada
  if (!authSessao?.condominio) return null;

  return (
    <View style={styles.container}>
      <Header
        tituloPagina={authSessao.condominio.nome_fantasia}
        breadcrumb={["Admin", "Operacional"]}
        showBack={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* 📊 SEÇÃO 1: KPIs DO PRÉDIO */}
          <View style={styles.statsRow}>
            <StatCard
              title="Moradores"
              value="342"
              icon="people"
              color={COLORS.primary}
            />
            <StatCard
              title="Encomendas Hoje"
              value="14"
              icon="cube"
              color={COLORS.success}
            />
            <StatCard
              title="Vagas Livres"
              value="45"
              icon="car"
              color={COLORS.secondary}
            />
          </View>

          {/* 🛠️ SEÇÃO 2: OPERAÇÃO DETALHADA */}
          <View style={[styles.sectionCard, { width: "100%" }]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="construct-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.cardTitle}>Operação do condomínio</Text>
            </View>
            <View>
              <Text style={styles.condominioName}>
                {authSessao.condominio.nome_fantasia}
              </Text>
            </View>

            <View style={styles.cardBody}>
              {/* --- GRUPO: USUÁRIOS --- */}
              <Text style={styles.subSectionTitle}>GERENCIAR USUÁRIOS</Text>
              <MenuItem
                title="Lista de Acessos"
                icon="list"
                onPress={() => router.push("/admin/usuarios/lista" as any)}
              />
              <MenuItem
                title="Cadastrar Morador/Func."
                icon="person-add"
                onPress={() => router.push("/admin/usuarios/cadastro" as any)}
              />

              <View style={styles.smallDivider} />

              {/* --- GRUPO: UNIDADES --- */}
              <Text style={styles.subSectionTitle}>UNIDADES E BLOCOS</Text>
              <MenuItem
                title="Gerar Unidades (Massa)"
                icon="layers-outline"
                onPress={() => router.push("admin/condominio/unidades" as any)}
              />
              <MenuItem
                title="Listar Unidades"
                icon="home-outline"
                onPress={() => router.push("admin/condominio/unidades" as any)}
              />

              <View style={styles.smallDivider} />

              {/* --- GRUPO: ENCOMENDAS --- */}
              <Text style={styles.subSectionTitle}>ENCOMENDAS</Text>
              <MenuItem
                title="Monitorar Fluxo"
                icon="desktop-outline"
                onPress={() => router.push("/entregas/lista-entregas" as any)}
              />
              <MenuItem
                title="Cadastrar Encomenda"
                icon="add-circle-outline"
                onPress={() => router.push("/entregas/cadastro" as any)}
              />
              <MenuItem
                title="Ler QR Code (Entrada)"
                icon="qr-code-outline"
                color={COLORS.success}
                onPress={() => router.push("/entregas/cadastro" as any)}
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
  },

  /* STATS / KPI CARDS */
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    minWidth: 160,
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

  /* CARDS DE SEÇÃO */
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 20,
    marginBottom: 20,
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

  /* SUB-SEÇÕES INTERNAS */
  subSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#888888",
    marginTop: 15,
    marginBottom: 5,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  condominioName: {
    fontSize: 10,
    fontWeight: "800",
    color: "#888888",
    marginTop: 0,
    marginBottom: 0,
    letterSpacing: 1,
    textTransform: "capitalize",
    alignContent: "center",
    textAlign: "center",
  },
  smallDivider: {
    height: 1,
    backgroundColor: COLORS.grey100,
    marginVertical: 10,
  },

  /* MENU ITEMS */
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
