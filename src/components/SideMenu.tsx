import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/theme";

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  userData: {
    user: any;
    condominioAtivo: any;
  };
}

export default function SideMenu({
  visible,
  onClose,
  onLogout,
  userData,
}: SideMenuProps) {
  // Verificação de segurança para não quebrar se os dados demorarem a carregar
  if (!userData || !userData.user) return null;

  const { user, condominioAtivo } = userData;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.menuContainer}>
          {/* Botão Fechar (X) */}
          <View style={styles.headerMenu}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={30} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Informações do Usuário */}
          <View style={styles.content}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color={COLORS.primary} />
            </View>

            <Text style={styles.label}>Condomínio</Text>
            <Text style={styles.value}>
              {condominioAtivo?.nome || "Não selecionado"}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.label}>Nome do Usuário</Text>
            <Text style={styles.value}>
              {user?.nome || user?.nome_completo || "Usuário"}
            </Text>

            <Text style={styles.label}>Documento (CPF)</Text>
            <Text style={styles.value}>{user?.cpf || "---"}</Text>

            <Text style={styles.label}>Nível de Acesso</Text>
            <View style={styles.badge}>
              <Text style={styles.perfilText}>
                {condominioAtivo?.perfil || user?.cargo || "Colaborador"}
              </Text>
            </View>
          </View>

          {/* Rodapé / Sair */}
          <TouchableOpacity style={styles.footer} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
            <Text style={styles.logoutText}>Sair do Aplicativo</Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Área clicável fora para fechar */}
        <TouchableOpacity style={styles.outside} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
  },
  menuContainer: {
    width: "80%",
    maxWidth: Platform.OS === "web" ? 400 : 320,
    backgroundColor: "#fff",
    height: "100%",
    padding: 30,
    paddingLeft: 50,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  outside: { flex: 1 },
  headerMenu: {
    alignItems: "flex-end",
    marginBottom: 10,
    marginTop: Platform.OS === "web" ? 10 : 0,
  },
  closeBtn: { padding: 5 },
  content: {
    flex: 1,
    paddingHorizontal: 5,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f2f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  label: {
    fontSize: 11,
    color: "#95a5a6",
    fontWeight: "bold",
    marginTop: 22,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#ecf0f1",
    marginVertical: 20,
  },
  badge: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 10,
  },
  perfilText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ecf0f1",
    paddingTop: 25,
    marginBottom: Platform.OS === "web" ? 30 : 20,
  },
  logoutText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
