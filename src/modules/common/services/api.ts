import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
/*
export const api = axios.create({
  baseURL: "https://cases-node-strategic-cond.c7hjrs.easypanel.host",
  timeout: 15000,
});*/

export const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 15000,
});

/**
 * INTERCEPTOR DE REQUEST
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("@StrategicCond:token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error),
);

/**
 * INTERCEPTOR DE RESPOSTA
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 🚨 1. Evita loop infinito: se o erro for no próprio Login, não força Logout
    const isLoginRequest =
      error.config?.url?.includes("/login") ||
      error.config?.url?.includes("/auth");

    if (error.response && error.response.status === 401 && !isLoginRequest) {
      console.warn("⚠️ Sessão expirada no servidor. Limpando credenciais...");

      try {
        await AsyncStorage.multiRemove([
          "@StrategicCond:user",
          "@StrategicCond:token",
        ]);

        // ✅ 2. DICA DE OURO: Para o App "acordar" e voltar para o Login sozinho,
        // o ideal é recarregar o estado global ou emitir um evento.
        // Se você usa o Expo Router, pode tentar um redirecionamento forçado aqui:
        // router.replace("/(auth)/login");
      } catch (e) {
        console.error("Erro ao limpar storage", e);
      }
    }

    // Trata erros de rede/timeout para dar um feedback melhor
    if (error.code === "ECONNABORTED") {
      console.error("A VPS demorou demais para responder.");
    }

    return Promise.reject(error);
  },
);
