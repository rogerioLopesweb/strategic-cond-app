export interface ICondominio {
  id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  perfil: string;
  conta_id: string; // 👈 Obrigatório para o Multi-tenant
  ativo?: boolean;
}

export interface ICondominioResponse {
  success: boolean;
  message?: string;
  condominio_id?: string;
  condominios?: ICondominio[];
}
