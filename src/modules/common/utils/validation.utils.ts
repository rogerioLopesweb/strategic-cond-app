/**
 * ⚖️ Validadores de Regra de Negócio
 */

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasInvalidChars = /[/\\()|<>]/.test(email);
  return regex.test(email) && !hasInvalidChars;
};

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) return false;

  const calc = (slice: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++)
      sum += parseInt(slice[i]) * (factor - i);
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };

  const digit1 = calc(cleanCPF.substring(0, 9), 10);
  const digit2 = calc(cleanCPF.substring(0, 10), 11);

  return digit1 === parseInt(cleanCPF[9]) && digit2 === parseInt(cleanCPF[10]);
};

export const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, "");

  if (cleanCNPJ.length !== 14) return false;

  // Bloqueia sequências repetidas (000..., 111..., 999...)
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

  // Algoritmo de validação de dígitos (Mod 11)
  const calc = (slice: string, weights: number[]) => {
    const sum = slice
      .split("")
      .reduce((acc, digit, i) => acc + parseInt(digit) * weights[i], 0);
    const result = sum % 11;
    return result < 2 ? 0 : 11 - result;
  };

  const digit1 = calc(
    cleanCNPJ.substring(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const digit2 = calc(
    cleanCNPJ.substring(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return (
    digit1 === parseInt(cleanCNPJ[12]) && digit2 === parseInt(cleanCNPJ[13])
  );
};
