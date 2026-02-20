import { IPaginatedResponse } from "../../common/types/types";

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
  perfil: TPerfilAcesso;
  ativo: boolean;
  unidades: string; // String formatada vinda da View ou Controller
  unidades_vinculadas?: any[]; // Array completo para o formulário de edição
}

/**
 * Interface detalhada para o "Raio-X" do usuário.
 * Utilizada no modal de informações e na busca por ID.
 */
export interface IUsuarioDetalhes {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  cpf: string;
  foto_perfil: string | null;
  data_nascimento: string | null;
  contato_emergencia: string | null;
  perfil: TPerfilAcesso;
  ativo: boolean;
  unidades_vinculadas: Array<{
    unidade_id: string;
    bloco: string;
    numero_unidade: string;
    tipo_vinculo: TTipoVinculo;
    data_entrada: string;
    data_saida: string | null;
    status: boolean;
  }>;
}

export type IListagemUsuariosResponse = IPaginatedResponse<IUsuarioListagem>;

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
