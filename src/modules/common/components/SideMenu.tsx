import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

// ✅ Importações modulares
import { COLORS, SHADOWS } from "../constants/theme";
import { IAuthSessao } from "../context/AuthContext";

interface ISideMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  authSessao: IAuthSessao | null; // ✅ Recebendo a sessão agregada
}

export const SideMenu = ({
  visible,
  onClose,
  onLogout,
  authSessao,
}: ISideMenuProps) => {
  const router = useRouter();

  // Se não houver sessão ativa, o menu nem deve processar
  if (!authSessao) return null;

  const { usuario, condominio, isMorador } = authSessao;

  // Verifica se o usuário tem mais de um condomínio para mostrar o botão de troca
  const possuiVariosCondominios =
    usuario.condominios && usuario.condominios.length > 1;

  const handleTrocarCondominio = () => {
    onClose();
    router.push("/selecao-condominio");
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.menuContainer}>
          <View style={styles.headerMenu}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={30} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color={COLORS.primary} />
            </View>

            <Text style={styles.label}>Condomínio</Text>
            <Text style={styles.value}>{condominio.nome}</Text>

            {possuiVariosCondominios && (
              <TouchableOpacity
                style={styles.changeCondoBtn}
                onPress={handleTrocarCondominio}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={16}
                  color={COLORS.secondary}
                />
                <Text style={styles.changeCondoText}>Trocar Condomínio</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider} />

            <Text style={styles.label}>Nome do Usuário</Text>
            <Text style={styles.value}>{usuario.nome}</Text>

            <Text style={styles.label}>Documento (CPF)</Text>
            <Text style={styles.value}>{usuario.cpf}</Text>

            <Text style={styles.label}>Nível de Acesso</Text>
            <View style={styles.badge}>
              <Text style={styles.perfilText}>
                {/* Prioriza o perfil vinculado ao condomínio, senão o cargo geral */}
                {condominio.perfil ||
                  usuario.cargo ||
                  (isMorador ? "Morador" : "Colaborador")}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.footer} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
            <Text style={styles.logoutText}>Sair do Aplicativo</Text>
          </TouchableOpacity>
        </SafeAreaView>

        <TouchableOpacity style={styles.outside} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
  },
  menuContainer: {
    width: "80%",
    maxWidth: 320,
    backgroundColor: COLORS.white,
    height: "100%",
    padding: 30,
    paddingLeft: 40,
    ...SHADOWS.medium,
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
    backgroundColor: COLORS.grey100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "bold",
    marginTop: 22,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 18,
    color: COLORS.textMain,
    fontWeight: "600",
    marginTop: 4,
  },
  changeCondoBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 5,
  },
  changeCondoText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
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
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 25,
    marginBottom: Platform.OS === "web" ? 30 : 20,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
