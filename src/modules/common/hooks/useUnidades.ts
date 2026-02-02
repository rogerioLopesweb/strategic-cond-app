import { useCallback, useState } from "react";
import {
  IGerarLotePayload,
  IMoradorUnidade,
  IUnidade,
  IVincularMoradorPayload, // ✅ Importação corrigida
} from "../../common/types/unidadeTypes";
import { unidadeService } from "../services/unidadeService";

export const useUnidades = () => {
  const [loading, setLoading] = useState(false);
  const [unidades, setUnidades] = useState<IUnidade[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    total_pages: 1,
  });

  const carregarUnidades = useCallback(
    async (
      condominio_id: string,
      bloco?: string,
      unidade?: string,
      page: number = 1,
    ) => {
      setLoading(true);
      try {
        // ✅ Ajustado para passar o objeto de params correto para a service
        const res = await unidadeService.listar(condominio_id, {
          bloco,
          unidade,
          page,
        });
        if (res.success) {
          setUnidades(res.data);
          setPagination(res.pagination);
        }
      } catch (error) {
        console.error("StrategicCond - Erro ao carregar unidades:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getMoradoresUnidade = async (
    condominio_id: string,
    bloco: string,
    unidade: string,
  ): Promise<IMoradorUnidade[]> => {
    setLoading(true);
    try {
      const res = await unidadeService.buscarMoradores(
        condominio_id,
        bloco,
        unidade,
      );
      return res.data;
    } catch (error) {
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleGerarLote = async (payload: IGerarLotePayload) => {
    setLoading(true);
    try {
      return await unidadeService.gerarEmMassa(payload);
    } finally {
      setLoading(false);
    }
  };

  const vincularMorador = async (payload: IVincularMoradorPayload) => {
    // ✅ Tipo atualizado
    setLoading(true);
    try {
      return await unidadeService.vincularMorador(payload);
    } finally {
      setLoading(false);
    }
  };

  const registrarSaidaMorador = async (
    usuario_id: string,
    unidade_id: string,
  ) => {
    setLoading(true);
    try {
      // ✅ Agora o nome bate com o da Service
      return await unidadeService.atualizarStatusVinculo({
        usuario_id,
        unidade_id,
        status: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    unidades,
    pagination,
    loading,
    carregarUnidades,
    getMoradoresUnidade,
    handleGerarLote,
    vincularMorador,
    registrarSaidaMorador,
  };
};
