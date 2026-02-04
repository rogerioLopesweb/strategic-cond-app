import { useCallback, useState } from "react";
import { contaService } from "../services/contaService";
import { IConta } from "../types/contaTypes";

export const useContas = () => {
  const [contas, setContas] = useState<IConta[]>([]);
  const [contaFoco, setContaFoco] = useState<IConta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ✅ Busca todas as contas vinculadas ao CPF do usuário logado.
   * Usado na tela de seleção logo após o login.
   */
  const getMinhasContas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contaService.getMinhasContas();
      setContas(data);
      return data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Erro ao carregar suas empresas.";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ✅ Cria uma nova Conta (PJ) - Fluxo de Onboarding
   * Aqui o usuário pode começar apenas com o Nome da Empresa.
   */
  const criarNovaConta = useCallback(async (payload: Partial<IConta>) => {
    setLoading(true);
    setError(null);
    try {
      const novaConta = await contaService.criarConta(payload);
      setContas((prev) => [...prev, novaConta]);
      return { success: true, data: novaConta };
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao criar empresa.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ✅ Atualiza os dados fiscais da conta (Checkout/Financeiro)
   */
  const atualizarDadosConta = useCallback(
    async (id: string, payload: Partial<IConta>) => {
      setLoading(true);
      try {
        const contaAtualizada = await contaService.atualizarDadosFiscais(
          id,
          payload,
        );
        setContas((prev) =>
          prev.map((c) => (c.id === id ? contaAtualizada : c)),
        );
        if (contaFoco?.id === id) setContaFoco(contaAtualizada);
        return { success: true };
      } catch (err: any) {
        setError("Erro ao atualizar dados fiscais.");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [contaFoco],
  );

  return {
    contas,
    contaFoco,
    setContaFoco,
    loading,
    error,
    getMinhasContas,
    criarNovaConta,
    atualizarDadosConta,
  };
};
