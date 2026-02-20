// 📦 O que o backend nos devolve na listagem
export interface IVisitaDTO {
  visita_id: string;
  data_entrada: string;
  data_saida?: string | null;
  status: "aberta" | "finalizada" | "cancelada" | string;
  placa_veiculo?: string | null;
  nome_visitante: string;
  cpf_visitante: string;
  foto_url?: string | null;
  tipo: "visitante" | "prestador" | "corretor" | string;
  bloco?: string | null;
  unidade?: string | null;
}

// 🎛️ Filtros que podemos enviar para a API
export interface IListVisitasParamsDTO {
  page?: number;
  limit?: number;
  status?: string;
  bloco?: string;
  unidade?: string;
  cpf?: string;
}

// 📑 Estrutura da Resposta Paginada
export interface IListVisitasResponseDTO {
  data: IVisitaDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// 📝 Dados para registrar uma nova entrada
export interface IRegistrarEntradaDataDTO {
  nome_completo: string;
  cpf: string;
  rg?: string;
  tipo_padrao: "visitante" | "prestador" | "corretor";
  unidade_id?: string; // Opcional, pode ir na ADM
  placa_veiculo?: string;
  observacoes?: string;
}
