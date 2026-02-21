import { api } from "../../common/services/api";

export interface IEnviarMensagemDTO {
  mensagem: string;
  condominio_id: string;
}

export interface IMensagemResposta {
  remetente: "usuario" | "otto" | "sistema" | string;
  texto: string;
  data_hora: string;
}

export const assistenteService = {
  /**
   * 🤖 Envia uma mensagem para o Otto e aguarda a resposta
   */
  async enviarMensagem(dados: IEnviarMensagemDTO): Promise<IMensagemResposta> {
    const response = await api.post("/api/assistente/chat", dados);
    return response.data;
  },
};
