import { useCallback, useState } from "react";
import {
  assistenteService,
  IMensagemResposta,
} from "../services/assistenteService";

// Estendemos a interface para adicionar um ID único para a FlatList do React Native
export interface IMensagemChat extends IMensagemResposta {
  id: string;
}

export function useAssistente() {
  const [mensagens, setMensagens] = useState<IMensagemChat[]>([]);
  const [loading, setLoading] = useState(false);

  const enviarMensagem = useCallback(
    async (texto: string, condominioId: string) => {
      if (!texto.trim()) return;

      // 1. Cria a mensagem do usuário e já joga na tela na hora (Optimistic UI)
      const msgUsuario: IMensagemChat = {
        id: Date.now().toString() + "-user",
        remetente: "usuario",
        texto: texto.trim(),
        data_hora: new Date().toISOString(),
      };

      setMensagens((prev) => [...prev, msgUsuario]);
      setLoading(true);

      try {
        // 2. Bate lá no nosso backend (no Controller do Otto que acabamos de criar)
        const resposta = await assistenteService.enviarMensagem({
          mensagem: texto.trim(),
          condominio_id: condominioId,
        });

        // 3. Pega a resposta do Otto e adiciona na tela
        const msgOtto: IMensagemChat = {
          id: Date.now().toString() + "-otto",
          remetente: resposta.remetente,
          texto: resposta.texto,
          data_hora: resposta.data_hora,
        };

        setMensagens((prev) => [...prev, msgOtto]);
      } catch (error: any) {
        // Se der erro de internet ou no servidor, o Otto avisa
        const msgErro: IMensagemChat = {
          id: Date.now().toString() + "-erro",
          remetente: "sistema",
          texto:
            "Desculpe, minha conexão falhou. Tente novamente em instantes. 🔌",
          data_hora: new Date().toISOString(),
        };
        setMensagens((prev) => [...prev, msgErro]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Função útil para limpar o chat se o usuário quiser
  const limparHistorico = () => setMensagens([]);

  return {
    mensagens,
    loading,
    enviarMensagem,
    limparHistorico,
  };
}
