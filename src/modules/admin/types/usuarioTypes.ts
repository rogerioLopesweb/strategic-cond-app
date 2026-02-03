// --- Types de Domínio ---
export type TPerfilAcesso =
  | "morador"
  | "sindico"
  | "subsindico"
  | "conselheiro"
  | "administracao"
  | "portaria"
  | "zelador"
  | "secretaria";

export type TTipoVinculo = "proprietario" | "inquilino" | "residente";

// --- Interfaces de Resposta e Listagem ---
export interface IUsuarioListagem {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  cpf: string;
  foto_perfil: string | null;
  data_nascimento: string | null;
  contato_emergencia: string | null;
  perfil: string;
  ativo: boolean;
  unidades: string; // String formatada vinda da View ou Controller
  unidades_vinculadas?: any[]; // Array completo para o formulário de edição
}

export interface IListagemUsuariosResponse {
  success: boolean;
  usuarios: IUsuarioListagem[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// --- Payloads (Entrada de Dados) ---

export interface IUnidadeVinculo {
  identificador_bloco: string;
  numero: string;
  tipo_vinculo: TTipoVinculo;
}

export interface IUsuarioCadastroPayload {
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  perfil: TPerfilAcesso;
  condominio_id: string;
  data_nascimento?: string;
  contato_emergencia?: string;
  unidades?: IUnidadeVinculo[];
  foto_base64?: string | null;
}

export interface IUsuarioEdicaoPayload {
  usuario_id: string;
  condominio_id: string;
  nome_completo?: string;
  email?: string;
  telefone?: string;
  perfil?: TPerfilAcesso;
  data_nascimento?: string;
  contato_emergencia?: string;
  foto_base64?: string | null;
}
