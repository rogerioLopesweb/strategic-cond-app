export interface ICondominio {
  id?: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  perfil?: string;
  conta_id?: string; // 👈 Obrigatório para o Multi-tenant
  ativo?: boolean;
}

// 🛡️ Interface "Híbrida" - Suporta tanto Listas quanto Objetos Únicos
export interface ICondominioResponse {
  success: boolean;
  message?: string;
  data?: any; // A API retorna os dados envelopados em 'data' e 'props'
  pagination?: {
    // 👈 Adicione isso se for usar paginação
    total: number;
    page: number;
    total_pages: number;
  };
}
export interface ICondominiosFilter {
  cidade?: string;
  estado?: string;
  nome_fantasia?: string;
  cnpj?: string;
  page?: number;
  limit?: number;
}
