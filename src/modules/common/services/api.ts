import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const api = axios.create({
  baseURL: "https://cases-node-strategic-cond.c7hjrs.easypanel.host",
  timeout: 15000,
});

/**
 * INTERCEPTOR DE REQUEST
 * Garante que o Token seja enviado em todas as chamadas
 */
api.interceptors.request.use(
  async (config) => {
    try {
      // Importante: A chave deve ser a mesma usada no seu AuthContext
      const token = await AsyncStorage.getItem("@StrategicCond:token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * INTERCEPTOR DE RESPOSTA
 * Detecta se o servidor rejeitou o token e limpa o app
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Se o servidor retornar 401, significa que o Token não foi aceito
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Token expirado ou inválido. Forçando logout...");

      try {
        // Limpa o armazenamento local
        await AsyncStorage.multiRemove([
          "@StrategicCond:user",
          "@StrategicCond:token",
        ]);

        // Nota: O redirecionamento acontece porque o estado do seu AuthContext
        // mudará ao detectar que o token sumiu.
      } catch (e) {
        console.error("Erro ao limpar storage no logout forçado", e);
      }
    }
    return Promise.reject(error);
  },
);
