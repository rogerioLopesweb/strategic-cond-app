// T é o tipo do objeto (IUsuario, IEntrega, etc)
export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[]; // Padronizado com o backend
  meta: {
    total: number;
    pagina: number;
    limite: number;
    total_pages: number;
  };
}
