/**
 * 📍 Utilitário para busca de endereço via CEP
 */

export interface IViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const buscarEnderecoViaCEP = async (
  cep: string,
): Promise<IViaCEPResponse | null> => {
  const cleanCep = cep.replace(/\D/g, "");

  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) return null;

    return data as IViaCEPResponse;
  } catch (error) {
    console.error("Erro na requisição ViaCEP:", error);
    return null;
  }
};
