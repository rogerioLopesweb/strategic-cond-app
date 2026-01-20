import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/theme";

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  userData: {
    condominio: string;
    nome: string;
    cpf: string;
    perfil: string;
  };
}

export default function SideMenu({
  visible,
  onClose,
  onLogout,
  userData,
}: SideMenuProps) {
  // Caso os dados ainda não existam (proteção)
  if (!userData) return null;

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

          {/* Informações do Usuário da Sessão */}
          <View style={styles.content}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color={COLORS.primary} />
            </View>

            <Text style={styles.label}>Condomínio</Text>
            <Text style={styles.value}>{userData.condominio}</Text>

            <View style={styles.divider} />

            <Text style={styles.label}>Nome do Usuário</Text>
            <Text style={styles.value}>{userData.nome}</Text>

            <Text style={styles.label}>Documento (CPF)</Text>
            <Text style={styles.value}>{userData.cpf}</Text>

            <Text style={styles.label}>Nível de Acesso</Text>
            <View style={styles.badge}>
              <Text style={styles.perfilText}>{userData.perfil}</Text>
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
    backgroundColor: "rgba(0,0,0,0.6)", // Um pouco mais escuro para foco total no menu
    flexDirection: "row",
  },
  menuContainer: {
    width: "80%",
    backgroundColor: "#fff",
    height: "100%",
    padding: 25,
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
  },
  closeBtn: { padding: 5 },
  content: { flex: 1 },
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
    marginTop: 18,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#ecf0f1",
    marginVertical: 15,
  },
  badge: {
    backgroundColor: COLORS.primary, // Usando a cor primária para o badge
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 8,
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
    paddingTop: 20,
    marginBottom: 20,
  },
  logoutText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
