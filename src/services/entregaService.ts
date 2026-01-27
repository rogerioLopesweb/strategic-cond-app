import { api } from "./api";

/**
 * Service especializado na gestão de encomendas e logística de portaria.
 * Interface com o backend para operações de CRUD, Baixa Manual, QR Code e Auditoria.
 */
export const entregaService = {
  // ============================================================
  // BLOCO 1: OPERAÇÕES DE CADASTRO E CONSULTA (CRUD)
  // ============================================================

  /**
   * Registra a entrada de uma nova encomenda no sistema.
   * Agora exige o condominio_id para garantir a integridade Multi-Tenant.
   */
  registrar: async (dados: {
    condominio_id: string; // Obrigatório na nova arquitetura
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

  /**
   * Lista entregas filtradas.
   * O condominio_id é crucial para separar os dados no SaaS.
   */
  listar: async (filtros: {
    condominio_id: string; // Filtro mestre
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

      // Mapeia a estrutura de dados vinda do backend (Paginada)
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

  /**
   * Atualiza dados de um volume existente (Auditoria 360).
   */
  atualizar: async (
    id: string,
    dados: {
      tipo_embalagem?: string;
      marketplace?: string;
      retirada_urgente?: boolean;
      observacoes?: string;
      codigo_rastreio?: string;
    },
  ) => {
    try {
      const response = await api.put(`/api/entregas/${id}`, dados);
      return {
        success: true,
        data: response.data.entrega,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao atualizar encomenda",
      };
    }
  },

  /**
   * CANCELAMENTO LOGÍSTICO (Auditoria)
   */
  cancelar: async (id: string, motivo: string) => {
    try {
      const response = await api.patch(`/api/entregas/${id}/cancelar`, {
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
   */
  registrarSaidaManual: async (
    id: string,
    dados: { quem_retirou: string; documento_retirou: string },
  ) => {
    try {
      const response = await api.patch(
        `/api/entregas/${id}/saida-manual`,
        dados,
      );
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
   */
  registrarSaidaQRCode: async (id: string) => {
    try {
      const response = await api.patch(`/api/entregas/${id}/saida-qrcode`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao validar QR Code",
      };
    }
  },
};
