import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // ✅ Importado para navegação
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { FeedbackBox } from "../../common/components/FeedbackBox"; // ✅ Importado
import { COLORS, SHADOWS } from "../../common/constants/theme";
import { IUsuarioListagem } from "../hooks/useUsuarios";

interface IModalInfoUsuarioProps {
  visible: boolean;
  onClose: () => void;
  user: IUsuarioListagem | null;
  onToggleStatus: (userId: string, currentStatus: boolean) => Promise<void>;
}

export const ModalInfoUsuario = ({
  visible,
  onClose,
  user,
  onToggleStatus,
}: IModalInfoUsuarioProps) => {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState(false);
  const [fb, setFb] = useState({
    visible: false,
    type: "success" as any,
    message: "",
  });

  if (!user) return null;

  const handleToggle = async () => {
    setLoadingAction(true);
    try {
      await onToggleStatus(user.id, user.ativo);
      setFb({
        visible: true,
        type: "success",
        message: `Status alterado para ${!user.ativo ? "Ativo" : "Inativo"}.`,
      });
    } catch (error) {
      setFb({
        visible: true,
        type: "error",
        message: "Erro ao atualizar status na VPS.",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon: any;
  }) => (
    <View style={styles.infoRow}>
      <Ionicons
        name={icon}
        size={20}
        color={COLORS.primary}
        style={styles.icon}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text
          style={[
            styles.value,
            label === "Status" && {
              color: user.ativo ? "#2ecc71" : COLORS.error,
            },
          ]}
        >
          {value || "Não informado"}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Ficha do Usuário</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* ✅ Feedback inline estilo Bootstrap */}
            <FeedbackBox
              visible={fb.visible}
              type={fb.type}
              message={fb.message}
              onClose={() => setFb({ ...fb, visible: false })}
            />

            <View style={styles.avatarSection}>
              {user.foto_perfil ? (
                <Image
                  source={{ uri: user.foto_perfil }}
                  style={styles.avatarLarge}
                />
              ) : (
                <View
                  style={[
                    styles.avatarCircle,
                    !user.ativo && { backgroundColor: COLORS.grey300 },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {user.nome_completo.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text
                style={[
                  styles.userName,
                  !user.ativo && { color: COLORS.grey300 },
                ]}
              >
                {user.nome_completo}
              </Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: user.ativo ? "#E3F2FD" : COLORS.border },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: user.ativo ? COLORS.primary : COLORS.textSecondary,
                    },
                  ]}
                >
                  {user.perfil.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <InfoRow label="E-mail" value={user.email} icon="mail-outline" />
            <InfoRow
              label="WhatsApp"
              value={user.telefone}
              icon="logo-whatsapp"
            />
            <InfoRow label="CPF" value={user.cpf} icon="card-outline" />

            {/* ✅ Novos campos fundamentais */}
            <InfoRow
              label="Nascimento"
              value={user.data_nascimento || "---"}
              icon="calendar-outline"
            />
            <InfoRow
              label="Contato Emergência"
              value={user.contato_emergencia || "---"}
              icon="alert-circle-outline"
            />

            <InfoRow
              label="Unidades"
              value={user.unidades}
              icon="home-outline"
            />
            <InfoRow
              label="Status"
              value={user.ativo ? "Ativo" : "Inativo"}
              icon="shield-checkmark-outline"
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btnAction, styles.btnEdit]}
              onPress={() => {
                onClose(); // Primeiro fecha o modal

                // ✅ Navegação tipada e segura
                router.push({
                  pathname: "/admin/usuarios/editar/[id]" as any,
                  params: { id: user.id },
                });
              }}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.white} />
              <Text style={styles.btnText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btnAction,
                user.ativo ? styles.btnDisable : styles.btnEnable,
              ]}
              onPress={handleToggle}
              disabled={loadingAction}
            >
              {loadingAction ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name={
                      user.ativo ? "ban-outline" : "checkmark-circle-outline"
                    }
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.btnText}>
                    {user.ativo ? "Desativar" : "Ativar"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 550,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textMain },
  content: { padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 10 },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { color: COLORS.white, fontSize: 28, fontWeight: "bold" },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textMain,
    textAlign: "center",
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  icon: { marginRight: 15, width: 24 },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.textMain,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  badgeText: { fontSize: 10, fontWeight: "900" },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  btnAction: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  btnEdit: { backgroundColor: COLORS.primary },
  btnDisable: { backgroundColor: COLORS.error },
  btnEnable: { backgroundColor: "#2ecc71" },
  btnText: { color: COLORS.white, fontWeight: "bold", fontSize: 15 },
});
