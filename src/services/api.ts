import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const api = axios.create({
  baseURL: "https://cases-node-strategic-cond.c7hjrs.easypanel.host",
  timeout: 15000,
});

// ... Interceptor de Request que já fizemos (mantém igual) ...

// NOVO: Interceptor de Resposta para forçar Logoff
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Se o erro for 401 (Não autorizado), o token expirou ou é inválido
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Token expirado ou inválido. Forçando logout...");

      try {
        // Limpa todas as variáveis locais do StrategicCond
        await AsyncStorage.multiRemove([
          "@StrategicCond:user",
          "@StrategicCond:token",
        ]);

        // Aqui, o estado 'signed' no seu AuthContext vai mudar para false
        // e o Expo Router vai te jogar para a tela de login automaticamente
        // se você estiver usando um redirecionamento baseado no 'user'.
      } catch (e) {
        console.error("Erro ao limpar storage no logout forçado", e);
      }
    }
    return Promise.reject(error);
  },
);
