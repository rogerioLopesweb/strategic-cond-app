// T é o tipo do objeto (IUsuario, IEntrega, etc)
export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[]; // Padronizado com o backend
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
