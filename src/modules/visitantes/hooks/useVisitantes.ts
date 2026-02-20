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
  const fetchVisitas = useCallback(async (filtros: IListVisitasParamsDTO) => {
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
  const registrarEntrada = useCallback(
    async (dados: IRegistrarEntradaDataDTO) => {
      setLoading(true);
      setError(null);
      try {
        const res = await visitantesService.registrarEntrada(dados);

        // ✅ Passando o condominio_id obrigatoriamente
        await fetchVisitas({
          page: 1,
          condominio_id: dados.condominio_id,
        });

        return res;
      } catch (err: any) {
        const mensagem =
          err.response?.data?.message || "Erro ao registrar entrada.";
        setError(mensagem);
        throw err; // Lança para o componente exibir um Alert/Toast
      } finally {
        setLoading(false);
      }
    },
    [fetchVisitas], // ✅ Adicionado como dependência para evitar recriação
  );

  /**
   * 🚪 Registra a saída e atualiza a interface instantaneamente
   */
  const registrarSaida = useCallback(
    async (visitaId: string, abaAtual?: string) => {
      setLoading(true);
      setError(null);
      try {
        await visitantesService.registrarSaida(visitaId);

        // ✅ MÁGICA DE UX MELHORADA:
        setVisitas((prevVisitas) => {
          // Se o porteiro estiver na aba "Abertas", faz o card sumir na hora!
          if (abaAtual === "aberta") {
            return prevVisitas.filter(
              (visita) => visita.visita_id !== visitaId,
            );
          }
          // Se estiver na aba "Todas", apenas atualiza o status para ficar cinza
          return prevVisitas.map((visita) =>
            visita.visita_id === visitaId
              ? {
                  ...visita,
                  status: "finalizada",
                  data_saida: new Date().toISOString(),
                }
              : visita,
          );
        });
      } catch (err: any) {
        const mensagem =
          err.response?.data?.message || "Erro ao registrar saída.";
        setError(mensagem);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * 🔍 Busca os dados do visitante para preencher o formulário
   */
  const buscarVisitantePorCpf = async (cpf: string, condominioId: string) => {
    try {
      const dados = await visitantesService.buscarPorCpf(cpf, condominioId);
      console.log("Dados encontrados para CPF:", cpf, dados); // Log para depuração
      return dados; // Retorna o visitante se encontrar
    } catch (err) {
      return null; // Retorna nulo silenciosamente se não encontrar (é um visitante novo)
    }
  };

  // 👇 Lembre-se de exportar a função aqui embaixo no return!
  return {
    visitas,
    loading,
    error,
    pagination,
    fetchVisitas,
    registrarEntrada,
    registrarSaida,
    buscarVisitantePorCpf, // ✅ Nova função exportada
  };
}
