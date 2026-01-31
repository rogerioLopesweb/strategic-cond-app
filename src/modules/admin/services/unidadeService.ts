import { api } from "../../common/services/api";

// --- INTERFACES DE DADOS ---

export interface IUnidade {
  id: string;
  bloco: string;
  numero_unidade: string;
}

export interface IPaginationData {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface IListarUnidadesResponse {
  success: boolean;
  data: IUnidade[];
  pagination: IPaginationData;
}

export interface IVincularMoradorPayload {
  usuario_id: string;
  condominio_id: string;
  unidade_id?: string; // Opcional se for vincular por bloco
  identificador_bloco?: string;
  numero?: string;
  tipo_vinculo: "proprietario" | "inquilino" | "residente";
}

// --- SERVIÇO DE UNIDADES ---

export const unidadeService = {
  /**
   * 1. LISTAGEM: Busca unidades com filtros e paginação
   */
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
    return response.data;
  },

  /**
   * 2. GERAÇÃO EM MASSA: Cria lotes de apartamentos de uma vez
   */
  gerarEmMassa: async (payload: {
    condominio_id: string;
    blocos: string[];
    inicio: number;
    fim: number;
  }) => {
    const response = await api.post("/api/unidades/gerar-unidades", payload);
    return response.data;
  },

  /**
   * 3. VÍNCULO POR TEXTO (BLOCO/NÚMERO): Usado no Form de Edição de Usuário
   */
  vincularPorBloco: async (payload: IVincularMoradorPayload) => {
    // Rota: /api/unidades/vincular-morador-bloco
    const response = await api.post(
      "/api/unidades/vincular-morador-bloco",
      payload,
    );
    return response.data;
  },

  /**
   * 4. VÍNCULO POR ID: Usado quando você já tem o ID da unidade selecionado
   */
  vincularPorId: async (payload: IVincularMoradorPayload) => {
    // Rota: /api/unidades/vincular-morador
    const response = await api.post("/api/unidades/vincular-morador", payload);
    return response.data;
  },

  /**
   * 5. GESTÃO DE HISTÓRICO (SAÍDA/ENTRADA): Atualiza o status booleano
   */
  atualizarVinculo: async (
    usuario_id: string,
    unidade_id: string,
    status: boolean,
  ) => {
    // Rota: /api/unidades/atualizar-vinculo
    const response = await api.put("/api/unidades/atualizar-vinculo", {
      usuario_id,
      unidade_id,
      status, // false para registrar saída (Soft Delete)
    });
    return response.data;
  },

  /**
   * 6. MORADORES DA UNIDADE: Busca quem vive no imóvel (Ativos)
   */
  buscarMoradores: async (
    condominio_id: string,
    bloco: string,
    unidade: string,
  ) => {
    const response = await api.get("/api/unidades/moradores-vinculados", {
      params: { condominio_id, bloco, unidade },
    });
    return response.data; // Retorna array de moradores
  },
};
