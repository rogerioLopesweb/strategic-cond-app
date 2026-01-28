import { api } from "../../common/services/api";
export const unidadeService = {
  /**
   * Busca moradores vinculados a uma unidade.
   * Tratamento especial para 404 (unidade não encontrada) para evitar logs de erro durante a digitação.
   */
  listarMoradoresPorUnidade: async (
    condominioId: string,
    bloco: string,
    unidade: string,
  ) => {
    // LOG DE SAÍDA PARA DEBUG
    console.log("📡 [unidadeService] Iniciando requisição...");
    console.log(`📦 Params:`, { condominio_id: condominioId, bloco, unidade });

    try {
      const { data } = await api.get("/api/unidades/moradores-vinculados", {
        params: {
          condominio_id: condominioId,
          bloco: bloco,
          unidade: unidade,
        },
      });

      console.log(
        "✅ [unidadeService] Sucesso! Moradores retornados:",
        data.length,
      );
      return { success: true, data };
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message;

      // TRATAMENTO SILENCIOSO PARA 404 (Unidade ainda não existe ou incompleta)
      if (status === 404) {
        console.log(
          "ℹ️ [unidadeService] 404: Unidade não encontrada (comum durante a digitação).",
        );
        return { success: true, data: [] };
      }

      // LOG DE ERRO PARA OUTROS STATUS (401, 500, etc)
      console.error(`❌ [unidadeService] Erro ${status}:`, msg);

      return {
        success: false,
        error: status === 401 ? "401" : msg,
      };
    }
  },
};
