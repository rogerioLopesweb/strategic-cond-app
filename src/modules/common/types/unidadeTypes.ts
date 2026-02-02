// ✅ 1. Tipos Base e Enums
export type TTipoVinculo = "proprietario" | "inquilino" | "residente";

// ✅ 2. Interfaces de Dados (Models)
export interface IUnidade {
  id: string;
  bloco: string;
  numero_unidade: string;
  nome_proprietario?: string; // Fundamental para a lista "Raio-X"
}

export interface IMoradorUnidade {
  usuario_id: string;
  Nome: string; // Mantido com Maiúscula para bater com o Aliasing do seu SQL
  Tipo: TTipoVinculo; // Usa o tipo definido acima
  status?: boolean;
  data_entrada?: string;
  data_saida?: string | null;
}

// ✅ 3. Paginação e Respostas de API
export interface IPaginationData {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface IListarUnidadesResponse {
  success: boolean;
  data: IUnidade[];
  pagination: IPaginationData;
}

// ✅ 4. Payloads (O que você envia para o Backend)
export interface IGerarLotePayload {
  condominio_id: string;
  blocos: string[];
  inicio: number;
  fim: number;
}

/**
 * Payload Unificado para Vínculo.
 * Pode ser usado tanto para vincular por ID quanto por Texto (Bloco/Número)
 */
export interface IVincularMoradorPayload {
  usuario_id: string;
  condominio_id: string;
  unidade_id?: string; // Usado no vínculo por ID
  identificador_bloco?: string; // Usado no vínculo por Texto
  numero?: string; // Usado no vínculo por Texto
  tipo_vinculo: TTipoVinculo;
}
