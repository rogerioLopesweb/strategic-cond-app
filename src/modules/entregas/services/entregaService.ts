import { api } from "../../common/services/api";
import {
  IEntregaAtualizacaoDTO,
  IEntregaCancelamentoDTO,
  IEntregaFiltrosDTO,
  IEntregaRegistroDTO,
  ISaidaManualDTO,
  ISaidaQRCodeDTO,
} from "../types/IEntrega";

export const entregaService = {
  registrar: async (dados: IEntregaRegistroDTO) => {
    const response = await api.post("/api/entregas/registrar", dados);
    return response.data;
  },

  listar: async (filtros: IEntregaFiltrosDTO) => {
    const response = await api.get("/api/entregas", { params: filtros });
    return response.data;
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
