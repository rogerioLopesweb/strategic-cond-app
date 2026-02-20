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
    params?: IListVisitasParamsDTO,
  ): Promise<IListVisitasResponseDTO> {
    const { data } = await api.get<IListVisitasResponseDTO>("/visitantes", {
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
    const { data } = await api.post("/visitantes/entrada", payload);
    return data;
  },

  /**
   * 🚶 Registra a saída de um visitante
   */
  async registrarSaida(visitaId: string): Promise<{ success: boolean }> {
    const { data } = await api.patch(`/visitantes/saida/${visitaId}`);
    return data;
  },
};
