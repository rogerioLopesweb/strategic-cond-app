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

  // ✅ NOVOS CAMPOS PARA AUDITORIA
  observacoes?: string | null;
  empresa_prestadora?: string | null;
  morador_nome?: string | null;
  operador_entrada_nome?: string | null;
  operador_saida_nome?: string | null;
}

// 🎛️ Filtros que podemos enviar para a API
export interface IListVisitasParamsDTO {
  condominio_id: string; // ✅ Essencial para filtrar as visitas do condomínio correto
  cpf?: string;
  bloco?: string;
  unidade?: string;
  status?: string;
  page?: number;
  limit?: number;
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
  unidade_id?: string; // ✅ Perfeito! Vai receber o ID do Seletor
  placa_veiculo?: string;
  observacoes?: string;
  condominio_id: string; // ✅ Adicionado para bater com o envio do payload no App e a exigência do Backend
  empresa_prestadora?: string; // ✅ Novo campo para prestadores
  foto_url?: string; // ✅ Campo opcional para foto (pode ser preenchido depois)
  autorizado_por_id?: string; // ✅ ID do morador que autorizou (pode ser preenchido depois)
}
