import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { api } from "./api";

export const notificationService = {
  registerForPushNotifications: async () => {
    // 1. Verificação de Dispositivo Real
    if (!Device.isDevice) {
      console.log("Push Notifications só funcionam em dispositivos físicos.");
      return null;
    }

    // 2. Captura do Project ID (Obrigatório para EAS)
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.error("❌ Erro: Project ID não encontrado no app.json.");
      return null;
    }

    // 3. Verificação de Permissões
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("⚠️ Permissão negada.");
      return null;
    }

    try {
      // AJUSTE DOCUMENTAÇÃO: Chamada direta simplificada
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      const token = tokenData.data;

      // 4. Configuração do Canal Android (Essencial para builds nativas aparecerem)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Portaria - StrategicCond",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          description: "Notificações de encomendas recebidas",
        });
      }

      console.log("🎫 Token Gerado no APK:", token);
      return token;
    } catch (e) {
      console.error("❌ Erro ao buscar token no APK:", e);
      return null;
    }
  },

  updateServerToken: async (token: string) => {
    try {
      await api.put("/api/usuarios/push-token", { token });
      console.log("✅ Token sincronizado com o servidor StrategicFlow.");
    } catch (error) {
      console.error("❌ Erro no updateServerToken:", error);
    }
  },
};
