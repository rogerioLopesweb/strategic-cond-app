import { useState } from "react";
import { entregaService } from "../services/entregaService";
import {
  IEntregaAtualizacaoDTO,
  IEntregaCancelamentoDTO,
  IEntregaFiltrosDTO,
  IEntregaRegistroDTO,
  ISaidaManualDTO,
} from "../types/IEntrega";

/**
 * Hook Gerenciador do Módulo de Entregas
 * Centraliza o estado de loading e o tratamento de erros globais.
 * ✅ Convenção: Prefixo 'entregas' aplicado nas exportações.
 */
export function useEntregas() {
  const [entregasLoading, setEntregasLoading] = useState(false);

  // Helper para execução de chamadas assíncronas com tratamento de erro
  const execute = async (action: () => Promise<any>, errorMessage: string) => {
    setEntregasLoading(true);
    try {
      const result = await action();
      return result;
    } catch (err: any) {
      if (err.response?.status === 401) {
        return {
          success: false,
          error: "Sessão expirada. Faça login novamente.",
          isAuthError: true,
        };
      }
      const message = err.response?.data?.message || errorMessage;
      return { success: false, error: message };
    } finally {
      setEntregasLoading(false);
    }
  };

  return {
    // ✅ Convenção aplicada: Nome semântico para evitar conflitos
    entregasLoading,

    registrarEntrega: (dados: IEntregaRegistroDTO) =>
      execute(
        () => entregaService.registrar(dados),
        "Erro ao registrar encomenda",
      ),

    atualizarEntrega: (dados: IEntregaAtualizacaoDTO) =>
      execute(
        () => entregaService.atualizar(dados),
        "Erro ao atualizar encomenda",
      ),

    cancelarEntrega: (dados: IEntregaCancelamentoDTO) =>
      execute(() => entregaService.cancelar(dados), "Erro ao cancelar entrega"),

    baixarEntregaManual: (dados: ISaidaManualDTO) =>
      execute(
        () => entregaService.registrarSaidaManual(dados),
        "Erro na baixa manual",
      ),

    // ✅ Padronizado conforme discutido
    baixarEntregaQRCode: (codigoQR: string) =>
      execute(
        () => entregaService.registrarSaidaQRCode(codigoQR),
        "Erro na baixa via QR Code",
      ),

    listarEntregas: (filtros: IEntregaFiltrosDTO) =>
      execute(() => entregaService.listar(filtros), "Erro ao listar entregas"),
  };
}
