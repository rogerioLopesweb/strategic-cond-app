import { api } from "../../common/services/api";
import {
  ICondominio,
  ICondominioResponse,
  ICondominiosFilter,
} from "../types/condominioTypes";

export const condominioService = {
  /**
   * Busca condomínios de uma conta específica (Visão Master)
   * Rota: /api/condominios/por-conta/:id
   */
  listarPorConta: async (
    filtros?: ICondominiosFilter,
  ): Promise<ICondominioResponse> => {
    const { data } = await api.get<ICondominioResponse>(`/api/condominios`, {
      // Passamos apenas os filtros extras (page, limit, cidade) aqui
      params: filtros,
    });
    console.log("Resposta da API (listarPorConta):", data); // Log para depuração
    return data;
  },
  /**
   * Busca um condomínio pelo seu ID
   */
  buscarPorId: async (id: string): Promise<ICondominioResponse> => {
    const { data } = await api.get<ICondominioResponse>(
      `/api/condominios/${id}`,
    );
    //console.log("Resposta da API (buscarPorId):", data); // Log para depuração
    return data;
  },

  /**
   * Realiza o cadastro de um novo condomínio
   */
  cadastrar: async (
    dados: Partial<ICondominio>,
  ): Promise<ICondominioResponse> => {
    const { data } = await api.post<ICondominioResponse>(
      `/api/condominios`,
      dados,
    );
    return data;
  },

  /**
   * Atualiza os dados de um condomínio existente
   * @param id UUID do condomínio
   * @param dados Dados a serem atualizados (parcial)
   */
  atualizar: async (
    id: string,
    dados: Partial<ICondominio>,
  ): Promise<ICondominioResponse> => {
    // 🚀 Enviamos o ID na URL conforme a rota PUT /api/condominios/:id
    const { data } = await api.put<ICondominioResponse>(
      `/api/condominios/${id}`,
      dados,
    );
    return data;
  },
};
