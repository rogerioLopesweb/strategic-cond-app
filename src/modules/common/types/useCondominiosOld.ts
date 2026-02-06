import { useCallback, useEffect, useState } from "react";
import { condominioService } from "../services/condominioService";
import { ICondominio } from "../types/condominioTypes";

export const useCondominios = (conta_id?: string) => {
  const [condominios, setCondominios] = useState<ICondominio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarCondominios = useCallback(async () => {
    if (!conta_id) return;

    try {
      setLoading(true);
      setError(null);
      const res = await condominioService.listarPorConta(conta_id);
      if (res.success) {
        setCondominios(res.condominios ?? []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao carregar condomínios");
    } finally {
      setLoading(false);
    }
  }, [conta_id]);

  useEffect(() => {
    carregarCondominios();
  }, [carregarCondominios]);

  return { condominios, loading, error, refresh: carregarCondominios };
};
