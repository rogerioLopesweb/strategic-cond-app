import { useCallback, useState } from "react";
import { visitantesService } from "../services/visitantesService";
import {
  IListVisitasParamsDTO,
  IRegistrarEntradaDataDTO,
  IVisitaDTO,
} from "../types/IVisita";

export function useVisitantes() {
  const [visitas, setVisitas] = useState<IVisitaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para guardar a paginação atual
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  /**
   * 🔍 Busca a lista de visitas (aceita filtros dinâmicos)
   */
  const fetchVisitas = useCallback(async (filtros?: IListVisitasParamsDTO) => {
    setLoading(true);
    setError(null);
    try {
      const response = await visitantesService.listar(filtros);
      setVisitas(response.data);
      setPagination({
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.total_pages,
      });
    } catch (err: any) {
      const mensagem =
        err.response?.data?.message || "Erro ao carregar visitantes.";
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🚪 Registra uma nova entrada e atualiza a lista
   */
  const registrarEntrada = async (dados: IRegistrarEntradaDataDTO) => {
    setLoading(true);
    setError(null);
    try {
      const res = await visitantesService.registrarEntrada(dados);
      // Recarrega a lista para mostrar o novo visitante (pode focar na pág 1)
      await fetchVisitas({ page: 1 });
      return res;
    } catch (err: any) {
      const mensagem =
        err.response?.data?.message || "Erro ao registrar entrada.";
      setError(mensagem);
      throw err; // Lança para o componente exibir um Alert/Toast
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🚶 Registra a saída e atualiza o status na lista localmente (mais rápido)
   */
  const registrarSaida = async (visitaId: string) => {
    setLoading(true);
    setError(null);
    try {
      await visitantesService.registrarSaida(visitaId);

      // Atualiza o estado local para "finalizada" sem precisar bater na API de novo
      setVisitas((prev) =>
        prev.map((v) =>
          v.visita_id === visitaId
            ? {
                ...v,
                status: "finalizada",
                data_saida: new Date().toISOString(),
              }
            : v,
        ),
      );

      return true;
    } catch (err: any) {
      const mensagem =
        err.response?.data?.message || "Erro ao registrar saída.";
      setError(mensagem);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    visitas,
    loading,
    error,
    pagination,
    fetchVisitas,
    registrarEntrada,
    registrarSaida,
  };
}
