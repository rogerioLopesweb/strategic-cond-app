/**
 * Interfaces Globais e Utilitários de Tipagem (Common)
 * Seguindo o padrão de nomenclatura I Prefix (C# Style)
 */

/**
 * Contrato padrão para respostas da API.
 * Onde T é o tipo do dado esperado (ex: IEntregaRegistroDTO ou IUsuario).
 */
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: IApiMeta; // Para paginação
}

/**
 * Interface para metadados de paginação vindo do backend.
 */
export interface IApiMeta {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

/**
 * Interface base para entidades que possuem ID e Datas de Auditoria.
 */
export interface IBaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Tipo para representar erros de validação vindos do backend.
 */
export interface IValidationError {
  field: string;
  message: string;
}
