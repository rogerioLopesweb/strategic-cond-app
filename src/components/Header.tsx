import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthContext } from "../../src/context/AuthContext"; // 1. Importando o contexto real
import { COLORS } from "../constants/theme";
import SideMenu from "./SideMenu";

interface HeaderProps {
  titulo: string;
  subtitulo?: string;
  showBack?: boolean;
}

export default function Header({
  titulo,
  subtitulo,
  showBack = false,
}: HeaderProps) {
  const router = useRouter();

  // 2. Consumindo os dados da sessão (João Silva, etc) e a função de logout
  const { user, logout } = useAuthContext();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // 3. Preparando os dados para o SideMenu (usando dados da sessão)
  const userData = {
    user_id: user?.user_id || "",
    condominio: user?.condominio || "Condomínio não identificado",
    nome: user?.nome || "Usuário",
    cpf: user?.cpf || "000.000.000-00",
    perfil: user?.perfil || "Visitante",
  };

  const handleSignOut = async () => {
    setIsMenuVisible(false);
    await logout(); // Limpa AsyncStorage e memória
    router.replace("/"); // Volta para o Login
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        {/* Lado Esquerdo: Voltar OU Abrir Menu Lateral */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconButton}
            >
              <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setIsMenuVisible(true)}
              style={styles.iconButton}
            >
              <Ionicons name="menu-outline" size={28} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Centro: Títulos (Dinâmicos) */}
        <View style={styles.textContainer}>
          <Text style={styles.titulo} numberOfLines={1}>
            {titulo}
          </Text>
          {/* Exibe o nome do condomínio da sessão como subtítulo se nenhum outro for passado */}
          <Text style={styles.subtitulo} numberOfLines={1}>
            {subtitulo || userData.condominio}
          </Text>
        </View>

        {/* Lado Direito: Perfil do Usuário Logado */}
        <View style={styles.rightSection}>
          <View style={styles.userInfo}>
            <Text style={styles.userText}>{userData.perfil}</Text>
          </View>
        </View>
      </View>

      {/* Menu Lateral que recebe os dados reais da sessão */}
      <SideMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onLogout={handleSignOut}
        userData={userData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    width: 40,
    justifyContent: "center",
  },
  rightSection: {
    minWidth: 80,
    alignItems: "flex-end",
  },
  iconButton: {
    padding: 5,
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  subtitulo: {
    fontSize: 11,
    color: "#bdc3c7",
    marginTop: 2,
  },
  userInfo: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  userText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
