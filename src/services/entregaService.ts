import { api } from "./api";

/**
 * Service especializado na gestão de encomendas e logística de portaria.
 */
export const entregaService = {
  // ============================================================
  // BLOCO 1: OPERAÇÕES DE CADASTRO E CONSULTA (CRUD)
  // ============================================================

  registrar: async (dados: {
    condominio_id: string; // ✅ Já estava OK
    unidade: string;
    bloco: string;
    morador_id?: string;
    tipo_embalagem: string;
    marketplace?: string;
    codigo_rastreio?: string;
    retirada_urgente?: boolean;
    observacoes?: string;
  }) => {
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

  listar: async (filtros: {
    condominio_id: string; // ✅ Já estava OK
    pagina?: number;
    limite?: number;
    status?: string;
    unidade?: string;
    bloco?: string;
    retirada_urgente?: boolean;
  }) => {
    try {
      const response = await api.get("/api/entregas", {
        params: filtros,
      });
      return {
        success: true,
        data: response.data.data || [],
        meta: response.data.meta,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao listar entregas",
      };
    }
  },

  atualizar: async (
    id: string,
    dados: {
      condominio_id: string; // ✅ Já estava OK
      tipo_embalagem?: string;
      marketplace?: string;
      retirada_urgente?: boolean;
      observacoes?: string;
      codigo_rastreio?: string;
    },
  ) => {
    try {
      const response = await api.put(`/api/entregas/${id}`, dados);
      return { success: true, data: response.data.entrega };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao atualizar encomenda",
      };
    }
  },

  /**
   * CANCELAMENTO LOGÍSTICO (Auditoria)
   * INCLUÍDO: condominio_id para segurança
   */
  cancelar: async (id: string, condominio_id: string, motivo: string) => {
    try {
      const response = await api.patch(`/api/entregas/${id}/cancelar`, {
        condominio_id, // ✅ Adicionado
        motivo_cancelamento: motivo,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao cancelar entrega",
      };
    }
  },

  // ============================================================
  // BLOCO 2: LOGÍSTICA DE SAÍDA E BAIXAS
  // ============================================================

  /**
   * Registra a retirada física da encomenda.
   * INCLUÍDO: condominio_id para evitar baixa em condomínio errado
   */
  registrarSaidaManual: async (
    id: string,
    condominio_id: string, // ✅ Adicionado
    dados: { quem_retirou: string; documento_retirou: string },
  ) => {
    try {
      const response = await api.patch(`/api/entregas/${id}/saida-manual`, {
        ...dados,
        condominio_id, // ✅ Adicionado no corpo da requisição
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao registrar saída",
      };
    }
  },

  /**
   * Realiza a baixa automatizada via QR Code.
   * INCLUÍDO: condominio_id como parâmetro de validação
   */
  registrarSaidaQRCode: async (id: string, condominio_id: string) => {
    try {
      const response = await api.patch(`/api/entregas/${id}/saida-qrcode`, {
        condominio_id, // ✅ Adicionado para o backend validar se o QR pertence ao prédio
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao validar QR Code",
      };
    }
  },
};
