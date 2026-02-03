/**
 * 🧹 Converte qualquer formato de data (ISO ou BR) para DD/MM/YYYY
 */
export const formatarDataParaExibicao = (data: string | null | undefined) => {
  if (!data) return "";

  // Se a data vier do banco (ISO: 1988-05-15T...)
  if (data.includes("-")) {
    const [ano, mes, diaFull] = data.split("-");
    const dia = diaFull.substring(0, 2);
    return `${dia}/${mes}/${ano}`;
  }

  // Se for apenas números (ex: 15051988)
  const apenasNumeros = data.replace(/\D/g, "");
  if (apenasNumeros.length === 8) {
    return apenasNumeros.replace(/(\={2})(\={2})(\={4})/, "$1/$2/$3");
  }

  return data;
};
