import { useCallback, useState } from "react";
import {
    IPaginationData,
    IUnidade,
    IVincularMoradorPayload,
    unidadeService,
} from "../services/unidadeService";

export const useUnidades = () => {
  const [loading, setLoading] = useState(false);
  const [unidades, setUnidades] = useState<IUnidade[]>([]);
  const [pagination, setPagination] = useState<IPaginationData | null>(null);

  /**
   * 1. LISTAGEM: Busca unidades com suporte a filtros e paginação
   */
  const getUnidades = useCallback(
    async (condominio_id: string, params?: any) => {
      setLoading(true);
      try {
        const res = await unidadeService.listar(condominio_id, params);
        if (res.success) {
          setUnidades(res.data);
          setPagination(res.pagination);
        }
      } catch (error) {
        console.error("StrategicCond - Erro ao buscar unidades:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * 2. VÍNCULO DINÂMICO: Decide se vincula por ID ou por Bloco/Número
   */
  const vincularMorador = async (payload: IVincularMoradorPayload) => {
    setLoading(true);
    try {
      // Se houver unidade_id, usa a rota direta. Se não, usa a busca por bloco.
      const res = payload.unidade_id
        ? await unidadeService.vincularPorId(payload)
        : await unidadeService.vincularPorBloco(payload);
      return res;
    } catch (error) {
      console.error("StrategicCond - Erro ao vincular morador:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 3. GESTÃO DE SAÍDA: Encerra o vínculo registrando a data no histórico
   */
  const registrarSaidaMorador = async (
    usuario_id: string,
    unidade_id: string,
  ) => {
    setLoading(true);
    try {
      // Status 'false' ativa a lógica de data_saida no backend
      const res = await unidadeService.atualizarVinculo(
        usuario_id,
        unidade_id,
        false,
      );
      return res;
    } catch (error) {
      console.error("StrategicCond - Erro ao registrar saída:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 4. GERAÇÃO EM MASSA: Para o setup inicial do condomínio
   */
  const gerarUnidadesMassa = async (payload: any) => {
    setLoading(true);
    try {
      const res = await unidadeService.gerarEmMassa(payload);
      return res;
    } catch (error) {
      console.error("StrategicCond - Erro na geração em massa:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    unidades,
    pagination,
    getUnidades,
    vincularMorador,
    registrarSaidaMorador,
    gerarUnidadesMassa,
  };
};
