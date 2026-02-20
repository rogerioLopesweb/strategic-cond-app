import { api } from "../../common/services/api";
import {
  IListVisitasParamsDTO,
  IListVisitasResponseDTO,
  IRegistrarEntradaDataDTO,
} from "../types/IVisita";

export const visitantesService = {
  /**
   * 🔍 Lista as visitas com filtros e paginação
   */
  async listar(
    params: IListVisitasParamsDTO,
  ): Promise<IListVisitasResponseDTO> {
    const { data } = await api.get<IListVisitasResponseDTO>("/api/visitantes", {
      params,
    });
    return data;
  },

  /**
   * 🚪 Registra a entrada de um visitante
   */
  async registrarEntrada(
    payload: IRegistrarEntradaDataDTO,
  ): Promise<{ success: boolean; id: string }> {
    const { data } = await api.post("/api/visitantes/entrada", payload);
    return data;
  },

  /**
   * 🚶 Registra a saída de um visitante
   */
  async registrarSaida(visitaId: string): Promise<{ success: boolean }> {
    const { data } = await api.patch(`/api/visitantes/saida/${visitaId}`);
    return data;
  },

  /**
   * 🔍 Busca um visitante pelo CPF para auto-preenchimento
   */
  async buscarPorCpf(cpf: string, condominioId: string): Promise<any> {
    // A rota pode variar conforme o seu backend, ajuste se necessário!
    const response = await api.get(`/api/visitantes/cpf/${cpf}`, {
      headers: { "x-condominio-id": condominioId },
    });
    return response.data;
  },
};
