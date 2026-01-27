import Header from "@/src/components/Header";
import { COLORS } from "@/src/constants/theme";
import { useAuthContext } from "@/src/context/AuthContext";
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

// Componente de Item de Menu (Botão menor dentro do Card)
const MenuItem = ({ title, icon, onPress, color = COLORS.primary }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.menuItemText}>{title}</Text>
    <Ionicons name="chevron-forward" size={16} color="#ccc" />
  </TouchableOpacity>
);

export default function AdminHome() {
  const router = useRouter();
  const { condominioAtivo, user } = useAuthContext();

  return (
    <View style={styles.container}>
      {/* O Header fica fora do wrapper para ocupar 100% da largura na Web */}
      <Header
        tituloPagina="Painel Administrativo" // Ou "Painel de Controle"
        breadcrumb={["Home", "Painel"]} // Vazio pois é a raiz
        showBack={true} // Na Home não faz sentido ter botão voltar
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                color="#2ecc71"
                onPress={() => router.push("/admin/importacao")}
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
    maxWidth: 1350, // Padrão que você definiu e ficou ótimo
    alignSelf: "center",
    padding: 20,
    // Na Web, vamos usar um grid de 2 colunas se a tela for larga
    flexDirection: Platform.OS === "web" ? "row" : "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: Platform.OS === "web" ? "48%" : "100%", // Dois cards por linha na Web
    minWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
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
    backgroundColor: "#fcfcfc",
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
    color: "#34495e",
    fontWeight: "500",
  },
  hintText: {
    fontSize: 12,
    color: "#95a5a6",
    fontStyle: "italic",
    marginTop: 10,
    textAlign: "center",
  },
});
