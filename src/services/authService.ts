import { api } from "./api";

export const authService = {
  login: async (cpf: string, senha: string) => {
    // O axios já faz o JSON.stringify automaticamente
    const { data } = await api.post("/api/auth/login", { cpf, senha });
    return data; // Retorna o objeto com token e usuário
  },
};
