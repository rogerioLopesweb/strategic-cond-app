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
  condominio_id?: string; // Usado em cadastros
  condominios?: ICondominio[]; // Usado em listagens
  condominio?: ICondominio; // 👈 NOVO: Usado em buscarPorId (resolve o erro TS)
  pagination?: {
    // 👈 Adicione isso se for usar paginação
    total: number;
    page: number;
    total_pages: number;
  };
}
