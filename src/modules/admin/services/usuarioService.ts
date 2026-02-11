import { api } from "../../common/services/api";
import {
  IListagemUsuariosResponse,
  IUsuarioCadastroPayload,
  IUsuarioEdicaoPayload,
  IUsuarioListagem,
} from "../types/usuarioTypes";

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
  async listar(
    condominio_id: string,
    params?: any,
  ): Promise<IListagemUsuariosResponse> {
    // 1. Chamamos a API, que deve retornar uma resposta paginada.
    const response = await api.get<any>("/api/usuarios/condominio", {
      params: { condominio_id, ...params },
    });

    const { success, data, meta } = response.data;

    // 🕵️ Debug para garantir que os dados chegaram antes do mapeamento
    console.log("Mapeando dados da API para o App:", {
      success,
      total: meta?.total,
    });

    // 2. Retornamos o objeto mapeado para a interface de resposta paginada padrão.
    return {
      success,
      data: data || [],
      meta: meta, // A API deve sempre retornar o objeto de metadados para esta rota.
    };
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
