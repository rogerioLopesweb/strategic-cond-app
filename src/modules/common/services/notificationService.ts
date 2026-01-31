import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { api } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  registerForPushNotifications: async () => {
    let token;

    // ✅ Removido o modo Simulação Web para o Build de Produção (APK)

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Notificações de Encomendas",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Permissão de Push negada!");
        return null;
      }

      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          "15dbadf6-f1c0-439a-9ae1-77c46e8c13ec";

        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log("🚀 Token Real Gerado:", token);
      } catch (e) {
        console.error("Erro ao gerar token real:", e);
      }
    }

    return token;
  },

  updateServerToken: async (pushToken: string) => {
    try {
      // ✅ Enviando a chave 'token' conforme o contrato do seu Servidor Node
      const response = await api.put("/api/usuarios/push-token", {
        token: pushToken,
      });

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Erro no PUT do token:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
};
