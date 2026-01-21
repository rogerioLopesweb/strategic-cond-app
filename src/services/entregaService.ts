import { api } from "./api";

export const entregaService = {
  registrar: async (dados: any) => {
    try {
      const response = await api.post("/api/entregas/registrar", dados);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao registrar entrega",
      };
    }
  },

  listar: async (filtros: any = { pagina: 1, limite: 10 }) => {
    try {
      // O Swagger mostrou que a rota é /api/entregas com query params
      const response = await api.get("/api/entregas", { params: filtros });

      // Conforme o seu JSON, os dados reais ficam em response.data.data
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao listar entregas",
      };
    }
  },
};
