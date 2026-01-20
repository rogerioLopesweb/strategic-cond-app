import { useState } from "react";
import { entregaService } from "../services/entregaService";

export function useEntregas() {
  const [loading, setLoading] = useState(false);

  // No seu hook useEntregas.ts
  const salvar = async (payload: any) => {
    setLoading(true);
    try {
      const data = await entregaService.registrar(payload);
      return { success: true, data };
    } catch (err: any) {
      if (err.response?.status === 401) {
        return {
          success: false,
          error: "Sessão expirada. Faça login novamente.",
          isAuthError: true,
        };
      }
      const message =
        err.response?.data?.message || "Erro ao registrar encomenda";
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { salvar, loading };
}
