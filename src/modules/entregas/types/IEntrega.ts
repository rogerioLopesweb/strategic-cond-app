/**
 * Interfaces de Contrato para o Módulo de Entregas (StrategicCond)
 * Seguindo o padrão de nomenclatura C# (I Prefix)
 */

import { IUserData } from "../../common/context/AuthContext";

export interface IEntregaRegistroDTO {
  condominio_id: string;
  unidade: string;
  bloco: string;
  morador_id?: string;
  tipo_embalagem: string;
  marketplace?: string;
  codigo_rastreio?: string;
  retirada_urgente?: boolean;
  observacoes?: string;
}

export interface IEntregaFiltrosDTO {
  condominio_id: string;
  pagina?: number;
  limite?: number;
  status?: string;
  unidade?: string;
  bloco?: string;
  retirada_urgente?: boolean;
  usuario?: IUserData;
}

export interface IEntregaAtualizacaoDTO {
  id: string;
  condominio_id: string;
  tipo_embalagem?: string;
  marketplace?: string;
  retirada_urgente?: boolean;
  observacoes?: string;
  codigo_rastreio?: string;
}

export interface IEntregaCancelamentoDTO {
  id: string;
  condominio_id: string;
  motivo: string;
}

export interface ISaidaManualDTO {
  id: string;
  condominio_id: string;
  quem_retirou: string;
  documento_retirou: string;
}

export interface ISaidaQRCodeDTO {
  id: string;
  condominio_id: string;
}

export interface IEntregaFiltrosDTO {
  condominio_id: string; // Obrigatório para Multi-Tenant
  unidade?: string; // Filtro por unidade específica
  bloco?: string; // Filtro por bloco
  status?: string; // Ex: 'pendente', 'entregue', 'cancelado'
  data_inicio?: string; // Para filtros de data (ISO String)
  data_fim?: string; // Para filtros de data (ISO String)
  marketplace?: string; // Ex: Amazon, ML
  retirada_urgente?: boolean; // Filtro de prioridade
  pagina?: number; // Controle de paginação
  limite?: number; // Itens por página
}
