import { useState } from "react";
import { authService } from "../services/authService";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (cpfParaLogar: string, senhaParaLogar: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login(cpfParaLogar, senhaParaLogar);

      // Se chegou aqui, o axios já validou o status 200/201
      return data;
    } catch (err: any) {
      // O axios coloca a mensagem de erro do back-end em err.response.data
      const message = err.response?.data?.message || "Credenciais inválidas";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
