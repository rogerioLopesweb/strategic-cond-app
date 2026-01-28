import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // 1. Importar o router
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
import { COLORS } from "../src/constants/theme";
import { useAuthContext } from "../src/context/AuthContext";

export default function SelecaoCondominio() {
  const { user, selecionarCondominio } = useAuthContext();
  const router = useRouter(); // 2. Inicializar o router

  const primeiroNome = user?.nome.split(" ")[0] || "Usuário";

  // 3. Criar uma função para lidar com o clique
  const handleSelect = async (id: string) => {
    try {
      await selecionarCondominio(id); // Atualiza o estado global
      router.replace("/home"); // Força a ida para a home
    } catch (error) {
      console.error("Erro ao selecionar condomínio:", error);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelect(item.id)} // 4. Usar a nova função
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

        <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
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
          data={user?.condominios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
    backgroundColor: "#F4F7F6",
  },
  innerContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 600, // Centraliza e limita largura na Web
    alignSelf: "center",
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: Platform.OS === "web" ? 50 : 30,
    paddingBottom: 20,
    alignItems: "center",
  },
  avatarMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  saudacao: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
  },
  instrucao: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 15,
    padding: 18,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "transform 0.2s ease",
      },
      default: {
        elevation: 4,
      },
    }),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#F0F7FF",
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
    color: "#2C3E50",
  },
  perfilBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EBEDEF",
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
    color: "#BDC3C7",
    fontWeight: "500",
  },
});
