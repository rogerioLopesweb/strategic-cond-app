import { api } from "../../common/services/api";
import {
  IGerarLotePayload,
  IListarUnidadesResponse,
  IMoradorUnidade,
  IVincularMoradorPayload,
} from "../types/unidadeTypes";

export const unidadeService = {
  // 1. Listagem (Ajustada para receber objeto de params como o Hook envia)
  listar: async (
    condominio_id: string,
    params?: {
      bloco?: string;
      unidade?: string;
      page?: number;
      limit?: number;
    },
  ) => {
    const response = await api.get<IListarUnidadesResponse>("/api/unidades", {
      params: { condominio_id, ...params },
    });
    console.log("Resposta da API de Unidades:", response.data); // Debug
    return response.data;
  },

  // 2. Geração em Massa
  gerarEmMassa: async (payload: IGerarLotePayload) => {
    const response = await api.post("/api/unidades/gerar-unidades", payload);
    return response.data;
  },

  // 3. Vínculo por Texto ou ID (Consolidado conforme a interface IVincularMoradorPayload)
  vincularMorador: async (payload: IVincularMoradorPayload) => {
    // Se tiver unidade_id, vai para a rota de ID, senão vai para a de Bloco
    const rota = payload.unidade_id
      ? "/api/unidades/vincular-morador"
      : "/api/unidades/vincular-morador-bloco";
    const response = await api.post(rota, payload);
    return response.data;
  },

  // 4. Gestão de Status (SAÍDA/ENTRADA) - Nome padronizado para bater com o Hook
  atualizarVinculo: async (data: {
    usuario_id: string;
    unidade_id: string;
    status: boolean;
  }) => {
    const response = await api.put("/api/unidades/atualizar-vinculo", data);
    return response.data;
  },

  // 5. Busca de Moradores
  buscarMoradores: async (
    condominio_id: string,
    bloco: string,
    unidade: string,
  ) => {
    const response = await api.get<{
      success: boolean;
      data: IMoradorUnidade[];
    }>("/api/unidades/moradores-vinculados", {
      params: { condominio_id, bloco, unidade },
    });
    return response.data;
  },
};
