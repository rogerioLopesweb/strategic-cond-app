import { api } from "./api";

export const authService = {
  login: async (login: string, senha: string) => {
    // O axios já faz o JSON.stringify automaticamente
    const { data } = await api.post("/api/auth/login", { login, senha });
    console.log("Resposta do login:", data); // Verifique o que está vindo do backend
    return data; // Retorna o objeto com token e usuário
  },
};
