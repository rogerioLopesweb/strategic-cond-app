import { api } from "../../common/services/api";
import { IConta } from "../types/contaTypes";

export const contaService = {
  /**
   * ✅ Lista todas as contas (PJs) vinculadas ao usuário logado
   * Útil para a tela de "Selecionar Empresa" após o login.
   */
  getMinhasContas: async (): Promise<IConta[]> => {
    try {
      const { data } = await api.get<IConta[]>("/contas");
      return data;
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
      throw error;
    }
  },

  /**
   * ✅ Busca detalhes de uma conta específica
   */
  getContaById: async (id: string): Promise<IConta> => {
    const { data } = await api.get<IConta>(`/contas/${id}`);
    return data;
  },

  /**
   * ✅ Cria a "Casca PJ" (Fricção Zero)
   * No início pode ser apenas o nome fantasia/razão social.
   */
  criarConta: async (payload: Partial<IConta>): Promise<IConta> => {
    try {
      const { data } = await api.post<IConta>("/contas", payload);
      return data;
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      throw error;
    }
  },

  /**
   * ✅ Atualiza os dados fiscais (CNPJ, Inscrição Municipal, etc.)
   * Chamado no momento da configuração de pagamento/checkout.
   */
  atualizarDadosFiscais: async (
    id: string,
    payload: Partial<IConta>,
  ): Promise<IConta> => {
    try {
      const { data } = await api.patch<IConta>(`/contas/${id}`, payload);
      return data;
    } catch (error) {
      console.error("Erro ao atualizar dados fiscais:", error);
      throw error;
    }
  },
};
