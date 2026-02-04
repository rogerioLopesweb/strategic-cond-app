/**
 * 🎨 Máscaras para Inputs (UI)
 */

export const maskCPF = (v: string) =>
  v
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .substring(0, 14);

export const maskCNPJ = (v: string) =>
  v
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .substring(0, 18);

export const maskPhone = (v: string) =>
  v
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .substring(0, 15);

export const maskCEP = (v: string) =>
  v
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .substring(0, 9);

export const maskDateInput = (v: string) =>
  v
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .substring(0, 10);

/**
 * 🧹 Formata datas vindas do banco (ISO) para exibição (DD/MM/YYYY)
 */
export const formatDateToBR = (data: string | null | undefined) => {
  if (!data) return "";
  if (data.includes("-")) {
    const [ano, mes, diaFull] = data.split("-");
    return `${diaFull.substring(0, 2)}/${mes}/${ano}`;
  }
  const apenasNumeros = data.replace(/\D/g, "");
  if (apenasNumeros.length === 8) {
    return apenasNumeros.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
  }
  return data;
};
