import { api } from "../../common/services/api";
import {
  IEntregaAtualizacaoDTO,
  IEntregaCancelamentoDTO,
  IEntregaRegistroDTO,
  ISaidaManualDTO,
  ISaidaQRCodeDTO,
} from "../types/IEntrega";

export const entregaService = {
  registrar: async (dados: IEntregaRegistroDTO) => {
    const response = await api.post("/api/entregas", dados);
    return response.data;
  },

  listar: async (filtros: any) => {
    const response = await api.get("/api/entregas", { params: filtros });
    const { success, data, pagination } = response.data;

    // 2. Retornamos o objeto mapeado para a interface de resposta paginada padrão.
    return {
      success,
      data: data || [],
      pagination: pagination, // A API deve sempre retornar o objeto de metadados para esta rota.
    };
  },

  atualizar: async (dados: IEntregaAtualizacaoDTO) => {
    const { id, ...payload } = dados; // Separa o ID para a URL e o resto para o corpo
    const response = await api.put(`/api/entregas/${id}`, payload);
    return response.data;
  },

  cancelar: async (dados: IEntregaCancelamentoDTO) => {
    const { id, ...payload } = dados;
    const response = await api.patch(`/api/entregas/${id}/cancelar`, {
      condominio_id: payload.condominio_id,
      motivo_cancelamento: payload.motivo,
    });
    return response.data;
  },

  registrarSaidaManual: async (dados: ISaidaManualDTO) => {
    const { id, ...payload } = dados;
    const response = await api.patch(
      `/api/entregas/${id}/saida-manual`,
      payload,
    );
    return response.data;
  },

  registrarSaidaQRCode: async (dados: ISaidaQRCodeDTO) => {
    const { id, condominio_id } = dados;
    const response = await api.patch(`/api/entregas/${id}/saida-qrcode`, {
      condominio_id,
    });
    return response.data;
  },
};
