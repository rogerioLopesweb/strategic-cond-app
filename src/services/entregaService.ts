import { api } from "./api";

/**
 * Service especializado na gestão de encomendas e logística de portaria.
 * Interface com o backend para operações de CRUD, Baixa Manual e QR Code.
 */
export const entregaService = {
  // ============================================================
  // BLOCO 1: OPERAÇÕES DE CADASTRO E CONSULTA (CRUD)
  // ============================================================

  /**
   * Registra a entrada de uma nova encomenda no sistema.
   * Inclui campos como unidade, bloco, foto e flags de urgência.
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
   * Suporta paginação via meta-dados.
   */
  listar: async (filtros: any = { pagina: 1, limite: 10 }) => {
    try {
      const response = await api.get("/api/entregas", { params: filtros });
      // Retorna data (lista) e meta (paginação) conforme estrutura da API
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
   * Atualiza dados de um cadastro existente.
   * Utilizado para correções de unidade, bloco ou morador vinculado.
   */
  atualizar: async (id: string, dados: any) => {
    try {
      const response = await api.put(`/api/entregas/${id}`, dados);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao atualizar entrega",
      };
    }
  },

  /**
   * Remove um registro de entrega.
   * Nota: A API deve restringir a exclusão apenas para status 'recebido'.
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
   * Ideal para casos onde o morador não possui ou não apresentou o QR Code.
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
   * Fluxo de maior agilidade e segurança para a portaria.
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
