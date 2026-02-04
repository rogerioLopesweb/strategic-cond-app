export interface IConta {
  id: string;
  dono_id: string;

  // Opcionais para permitir o "Login Fricção Zero"
  cnpj?: string;
  razao_social?: string;
  email_financeiro?: string;

  status: "ativa" | "suspensa" | "aguardando_configuracao";

  // Auditoria
  created_at: string;
  updated_at: string;
}
