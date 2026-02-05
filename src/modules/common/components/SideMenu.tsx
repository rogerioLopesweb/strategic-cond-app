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

// ✅ Importações modulares seguindo seu padrão
import { COLORS, SHADOWS } from "../constants/theme";
import { IAuthSessao, useAuthContext } from "../context/AuthContext";
import { maskCPF } from "../utils/mask.utils";

interface ISideMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  authSessao: IAuthSessao | null;
}

export const SideMenu = ({
  visible,
  onClose,
  onLogout,
  authSessao,
}: ISideMenuProps) => {
  const router = useRouter();
  const { authLimparCondominio } = useAuthContext();

  // 🛡️ Segurança: Retorna nulo se não houver dados
  if (!authSessao || !authSessao.usuario) return null;

  const { usuario, condominio, isMasterConta } = authSessao;

  // 🚀 Lógica de Troca de Condomínio Diferenciada
  const handleTrocarCondominio = () => {
    onClose();
    if (isMasterConta) {
      // 👑 Master volta para a lista técnica de gestão (image_94d284.png)
      router.push("/admin/condominio/lista" as any);
    } else {
      authLimparCondominio();
      // 👥 Demais usuários vão para a seleção visual (image_9400a4.png)
      router.push("/selecao-condominio");
    }
  };

  const handleSairDoPredio = async () => {
    onClose();
    await authLimparCondominio(); // Master volta ao Hub Global (image_9400a4.png)
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.menuContainer}>
          {/* BOTÃO FECHAR */}
          <View style={styles.headerMenu}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={32} color="#2c3e50" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* 👤 PERFIL DO USUÁRIO (RESTAURADO - image_a52bb9.png) */}
            <View style={styles.profileSection}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={45} color={COLORS.primary} />
              </View>
              <Text style={styles.userName}>{usuario.nome}</Text>
              <Text style={styles.userDoc}>{maskCPF(usuario.cpf)}</Text>
              <Text style={styles.userID}>ID:{usuario.id}</Text>

              {/* BADGE DE NÍVEL (image_a52bb9.png) */}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isMasterConta ? "#4a90e2" : COLORS.primary,
                  },
                ]}
              >
                <Text style={styles.perfilText}>
                  {isMasterConta
                    ? "MASTER CONTA"
                    : condominio?.perfil?.toUpperCase() || "USUÁRIO"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* 📍 CONTEXTO ATUAL (image_a52bb9.png) */}
            <Text style={styles.label}>CONTEXTO ATUAL</Text>
            <View style={styles.contextBox}>
              <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
              <Text style={styles.contextValue} numberOfLines={2}>
                {condominio?.nome_fantasia ?? "Visão Geral (Administrador)"}
              </Text>
            </View>

            {/* 🔄 AÇÕES DE NAVEGAÇÃO */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleTrocarCondominio}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.actionText}>Trocar Condomínio</Text>
              </TouchableOpacity>

              {isMasterConta && condominio && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={handleSairDoPredio}
                >
                  <Ionicons
                    name="apps-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.actionText}>Voltar à Gestão Global</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 🚪 RODAPÉ: SAIR DA CONTA (RESTAURADO - image_a52bb9.png) */}
          <TouchableOpacity style={styles.footer} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={26} color="#e74c3c" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </SafeAreaView>

        <TouchableOpacity
          style={styles.outside}
          activeOpacity={1}
          onPress={onClose}
        />
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
    width: "85%",
    maxWidth: 320,
    backgroundColor: COLORS.white,
    height: "100%",
    padding: 25,
    ...SHADOWS.medium,
  },
  outside: { flex: 1 },
  headerMenu: { alignItems: "flex-end", marginBottom: 5 },
  closeBtn: { padding: 5 },
  content: { flex: 1 },

  /* ESTILOS PERFIL (Fiel à image_a52bb9.png) */
  profileSection: { alignItems: "center", marginTop: 10 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
  },
  userDoc: { fontSize: 13, color: "#95a5a6", marginTop: 4, letterSpacing: 1 },
  userID: { fontSize: 9, color: "#bdc3c7", marginTop: 2, letterSpacing: 1 },
  badge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 12,
  },
  perfilText: { color: COLORS.white, fontSize: 11, fontWeight: "900" },

  divider: { height: 1, backgroundColor: "#f1f3f5", marginVertical: 30 },

  label: {
    fontSize: 10,
    color: "#bdc3c7",
    fontWeight: "900",
    letterSpacing: 1,
  },
  contextBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    gap: 12,
  },
  contextValue: { fontSize: 15, color: "#2c3e50", fontWeight: "700", flex: 1 },

  actionsContainer: { marginTop: 25, gap: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 15,
    paddingLeft: 20,
  },
  actionText: { color: "#34495e", fontSize: 16, fontWeight: "600" },

  /* ESTILO FOOTER (Fiel à image_a52bb9.png) */
  footer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#f1f3f5",
    paddingTop: 20,
    marginBottom: Platform.OS === "ios" ? 30 : 15,
    gap: 12,
  },
  logoutText: { color: "#e74c3c", fontSize: 18, fontWeight: "bold" },
});
