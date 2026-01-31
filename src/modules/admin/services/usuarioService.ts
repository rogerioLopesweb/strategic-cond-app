import { api } from "../../common/services/api";

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

// --- O Serviço ---
export const usuarioService = {
  /**
   * 1. BUSCA DETALHADA: Carrega o Raio-X do usuário para edição
   */
  async getDetalhes(usuario_id: string, condominio_id: string) {
    const response = await api.get<{
      success: boolean;
      usuario: IUsuarioListagem;
    }>("/api/usuarios/detalhes", { params: { id: usuario_id, condominio_id } });
    return response.data;
  },

  /**
   * 2. LISTAGEM: Busca moradores e funcionários do condomínio
   */
  async listar(condominio_id: string, params?: any) {
    const response = await api.get<IListagemUsuariosResponse>(
      "/api/usuarios/condominio",
      { params: { condominio_id, ...params } },
    );
    return response.data;
  },

  /**
   * 3. CADASTRO MESTRE: Criação inicial completa
   */
  async cadastrar(data: IUsuarioCadastroPayload) {
    const response = await api.post("/api/usuarios/cadastrar", data);
    return response.data;
  },

  /**
   * 4. ATUALIZAÇÃO: Salva dados pessoais e alteração de perfil (ex: Morador -> Síndico)
   */
  async atualizar(data: IUsuarioEdicaoPayload) {
    const response = await api.put("/api/usuarios/perfil", data);
    return response.data;
  },

  /**
   * 5. STATUS DA CONTA: Ativa/Desativa o acesso do usuário ao condomínio
   */
  async mudarStatusAcesso(
    usuario_id: string,
    condominio_id: string,
    ativo: boolean,
  ) {
    const response = await api.post("/api/usuarios/atualiza_status", {
      usuario_id,
      condominio_id,
      ativo,
    });
    return response.data;
  },

  /**
   * ATUALIZAR FOTO: Envio individual de Base64 para a VPS
   */
  async atualizarFoto(data: {
    usuario_id: string;
    condominio_id: string;
    foto_base64: string;
  }) {
    const response = await api.post("/api/usuarios/atualizar-foto", data);
    return response.data; // Retorna { success: true, url_foto: "..." }
  },
};
