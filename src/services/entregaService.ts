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
   */
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

  /**
   * Lista entregas filtradas (unidade, bloco, status, urgência).
   */
  listar: async (filtros: any = { pagina: 1, limite: 10 }) => {
    try {
      // Ajustado para a rota correta definida no backend
      const response = await api.get("/api/entregas", {
        params: filtros,
      });
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

  /**
   * Atualiza dados de um volume existente (Auditoria 360).
   * Restrito a campos logísticos para preservar a identidade do lançamento.
   */
  atualizar: async (
    id: string,
    dados: {
      tipo_embalagem?: string;
      marketplace?: string;
      retirada_urgente?: boolean;
      observacoes?: string;
      codigo_rastreio?: string; // Adicionado para permitir correção de rastreio
    },
  ) => {
    try {
      // O backend agora injeta automaticamente data_atualizacao e operador_atualizacao_id via Token
      const response = await api.put(`/api/entregas/${id}`, dados);

      return {
        success: true,
        data: response.data.entrega, // Retornamos o objeto atualizado vindo do RETURNING do SQL
      };
    } catch (error: any) {
      // Tratamento assertivo de erro (ex: se o porteiro tentar editar uma entrega já entregue)
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Erro ao atualizar cadastro da encomenda",
      };
    }
  },

  /**
   * CANCELAMENTO LOGÍSTICO (Substitui a exclusão física)
   * Envia o motivo do cancelamento para manter a trilha de auditoria.
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

  /**
   * Nota: Deletar físico deve ser evitado para fins de conformidade.
   * Mantido apenas se houver necessidade de limpeza técnica de banco.
   */
  deletar: async (id: string) => {
    try {
      const response = await api.delete(`/api/entregas/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao excluir entrega",
      };
    }
  },

  // ============================================================
  // BLOCO 2: LOGÍSTICA DE SAÍDA E BAIXAS
  // ============================================================

  /**
   * Registra a retirada física da encomenda informando o recebedor.
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
        error:
          error.response?.data?.message || "Erro ao registrar saída manual",
      };
    }
  },

  /**
   * Realiza a baixa automatizada via validação de QR Code.
   */
  registrarSaidaQRCode: async (id: string) => {
    try {
      const response = await api.patch(`/api/entregas/${id}/saida-qrcode`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao validar QR Code",
      };
    }
  },
};
