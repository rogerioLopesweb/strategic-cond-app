import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { condominioService } from "../services/condominioService";
import {
  ICondominio,
  ICondominioResponse,
  ICondominiosFilter,
} from "../types/condominioTypes";

export const useCondominio = () => {
  const { authUser } = useAuthContext();
  const [loading, setLoading] = useState(false);

  /**
   * 1. CADASTRO: Cria um novo condomínio injetando a conta do Master
   */
  const cadastrarNovoCondominio = async (
    dados: Omit<ICondominio, "id" | "conta_id" | "perfil">,
  ): Promise<ICondominioResponse> => {
    if (!authUser?.conta_id) {
      throw new Error("Conta da administradora não identificada na sessão.");
    }

    try {
      setLoading(true);
      const payload: ICondominio = {
        ...dados,
        conta_id: authUser.conta_id,
      };

      console.log("🚀 Enviando Cadastro:", JSON.stringify(payload, null, 2));
      return await condominioService.cadastrar(payload);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2. ATUALIZAÇÃO: Edita dados de um condomínio existente
   */
  const atualizarDadosCondominio = async (
    id: string,
    dados: Partial<ICondominio>,
  ): Promise<ICondominioResponse> => {
    try {
      setLoading(true);

      // 🕵️ Log para debug no Metro Bundler
      console.log(
        `📝 Atualizando Condomínio [${id}]:`,
        JSON.stringify(dados, null, 2),
      );

      const response = await condominioService.atualizar(id, dados);
      return response;
    } catch (error) {
      console.error("❌ Erro ao atualizar no Hook:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 3. BUSCA POR ID: Recupera os dados de um condomínio específico
   */
  const buscarCondominioPorId = async (
    id: string,
  ): Promise<ICondominioResponse> => {
    try {
      setLoading(true);
      return await condominioService.buscarPorId(id);
    } catch (error) {
      console.error("❌ Erro ao buscar condomínio no Hook:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Lista condomínios por conta (Visão Master) - Opcional, mas útil para o Dashboard
  const listarCondominiosPorConta = async (
    filtros?: ICondominiosFilter,
  ): Promise<ICondominioResponse> => {
    try {
      setLoading(true);
      return await condominioService.listarPorConta(filtros);
    } catch (error) {
      console.error("❌ Erro ao listar condomínios no Hook:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    listarCondominiosPorConta,
    cadastrarNovoCondominio,
    atualizarDadosCondominio,
    buscarCondominioPorId,
    loading,
  };
};
