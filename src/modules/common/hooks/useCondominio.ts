import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { condominioService } from "../services/condominioService";
import { ICondominio, ICondominioResponse } from "../types/condominioTypes";

export const useCondominio = () => {
  const { authUser } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const cadastrarNovoCondominio = async (
    dados: Omit<ICondominio, "conta_id">,
  ): Promise<ICondominioResponse> => {
    // 🛡️ Garante que temos a conta antes de tentar salvar
    if (!authUser?.conta_id) {
      throw new Error("Conta da administradora não identificada na sessão.");
    }

    try {
      setLoading(true);

      const payload: ICondominio = {
        ...dados,
        conta_id: authUser.conta_id, // ✅ Injeção automática e segura
      };

      // 🕵️ Log de Auditoria para conferência no Metro
      console.log("🚀 Payload de Cadastro:", JSON.stringify(payload, null, 2));

      return await condominioService.cadastrar(payload);
    } finally {
      setLoading(false);
    }
  };

  return { cadastrarNovoCondominio, loading };
};
