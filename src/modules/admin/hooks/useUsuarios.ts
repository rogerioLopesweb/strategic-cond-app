import { useCallback, useState } from "react";
import { unidadeService } from "../../common/services/unidadeService";

export type {
  IUsuarioCadastroPayload,
  IUsuarioEdicaoPayload,
  IUsuarioListagem,
} from "../services/usuarioService";

import {
  IUsuarioCadastroPayload,
  IUsuarioEdicaoPayload,
  IUsuarioListagem,
  usuarioService,
} from "../services/usuarioService";

export const useUsuarios = () => {
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<IUsuarioListagem[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  /**
   * 1. BUSCA DETALHADA: Carrega o Raio-X do usuário (Dados + Unidades Ativas)
   */
  const getUsuarioDetalhado = async (
    usuario_id: string,
    condominio_id: string,
  ) => {
    setLoading(true);
    try {
      const res = await usuarioService.getDetalhes(usuario_id, condominio_id);
      return res.usuario;
    } catch (error) {
      console.error("StrategicCond - Erro ao buscar detalhes:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2. ATUALIZAR PERFIL: Salva dados pessoais e cargo (ex: Síndico/Morador)
   */
  const atualizarPerfil = async (data: IUsuarioEdicaoPayload) => {
    setLoading(true);
    try {
      const res = await usuarioService.atualizar(data);
      return res;
    } catch (error) {
      console.error("StrategicCond - Erro ao atualizar perfil:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 3. GESTÃO DE VÍNCULO: Registra saída ou reativa moradia (Histórico)
   */
  const atualizarVinculoUnidade = async (
    usuario_id: string,
    unidade_id: string,
    status: boolean,
  ) => {
    setLoading(true);
    try {
      // Chama o serviço de unidade, pois a regra de negócio de imóvel mora lá
      const res = await unidadeService.atualizarVinculo(
        usuario_id,
        unidade_id,
        status,
      );
      return res;
    } catch (error) {
      console.error("StrategicCond - Erro ao atualizar vínculo:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 4. VINCULAR NOVA UNIDADE: Adiciona imóvel via Bloco/Número na edição
   */
  const vincularNovaUnidade = async (data: any) => {
    setLoading(true);
    try {
      const res = await unidadeService.vincularPorBloco(data);
      return res;
    } catch (error) {
      console.error("StrategicCond - Erro ao vincular nova unidade:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 5. LISTAGEM GERAL: Busca usuários para a tela de gestão principal
   */
  const getUsuariosCondominio = useCallback(
    async (condominio_id: string, params?: any) => {
      setLoading(true);
      try {
        const res = await usuarioService.listar(condominio_id, params);
        setUsuarios(res.usuarios || []);
        if (res.pagination) setPagination(res.pagination);
      } catch (error) {
        console.error("StrategicCond - Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * 6. CADASTRO MESTRE: Criação inicial completa
   */
  const cadastrarUsuarioCompleto = async (data: IUsuarioCadastroPayload) => {
    setLoading(true);
    try {
      const res = await usuarioService.cadastrar(data);
      return res;
    } catch (error) {
      console.error("StrategicCond - Erro no cadastro mestre:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 7. STATUS DE ACESSO: Ativa/Inativa conta do usuário no condomínio
   */
  const atualizarStatus = async (
    usuario_id: string,
    condominio_id: string,
    novoStatus: boolean,
  ) => {
    setLoading(true);
    try {
      const res = await usuarioService.mudarStatusAcesso(
        usuario_id,
        condominio_id,
        novoStatus,
      );
      return res;
    } catch (error) {
      console.error("StrategicCond - Erro ao mudar status:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 8. OPTIMISTIC UPDATE: Atualização visual imediata da listagem
   */
  const atualizarUsuarioNaLista = (usuarioId: string, novoStatus: boolean) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioId ? { ...u, ativo: novoStatus } : u)),
    );
  };

  const handleAtualizarFoto = async (
    usuario_id: string,
    condominio_id: string,
    foto_base64: string,
  ) => {
    setLoading(true);
    try {
      const res = await usuarioService.atualizarFoto({
        usuario_id,
        condominio_id,
        foto_base64,
      });
      return res;
    } catch (error) {
      console.error("StrategicCond - Erro ao subir foto:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    usuarios,
    pagination,
    getUsuariosCondominio,
    getUsuarioDetalhado,
    atualizarVinculoUnidade,
    vincularNovaUnidade,
    cadastrarUsuarioCompleto,
    atualizarPerfil,
    atualizarStatus,
    atualizarUsuarioNaLista,
    handleAtualizarFoto,
  };
};
