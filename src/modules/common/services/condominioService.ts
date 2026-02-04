import { api } from "../../common/services/api";
import { ICondominio, ICondominioResponse } from "../types/condominioTypes";

export const condominioService = {
  /**
   * Busca condomínios de uma conta específica (Visão Master)
   * Rota validada via Swagger: /api/condominios/por-conta
   */
  listarPorConta: async (conta_id: string): Promise<ICondominioResponse> => {
    const { data } = await api.get<ICondominioResponse>(
      `/api/condominios/por-conta`,
      {
        // ✅ Usar 'params' é mais seguro que concatenar strings na URL
        params: { conta_id },
      },
    );
    return data;
  },

  /**
   * Realiza o cadastro de um novo condomínio
   */
  cadastrar: async (dados: Partial<ICondominio>) => {
    // Mantendo o padrão plural 'condominios' conforme sua API
    const { data } = await api.post(`/api/condominios`, dados);
    return data;
  },
};
