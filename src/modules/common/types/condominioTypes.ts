export interface ICondominio {
  id: string;
  nome_fantasia: string;
  razao_social?: string;
  cnpj: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep?: string;
  conta_id: string; // ✅ Campo essencial para o Multi-tenant
  criado_em?: string;
}

export interface ICondominioResponse {
  success: boolean;
  condominios: ICondominio[];
  pagination?: {
    total: number;
    page: number;
    total_pages: number;
  };
}
