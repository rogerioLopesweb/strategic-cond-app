import { api } from "./api";

export const entregaService = {
  registrar: async (dados: any) => {
    const response = await api.post("/api/entregas/registrar", dados);
    return response.data;
  },
  listar: async (filtros: any) => {
    const response = await api.get("/api/entregas", { params: filtros });
    return response.data;
  },
};
