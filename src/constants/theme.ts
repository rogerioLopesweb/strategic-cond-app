export const COLORS = {
  // Cores de Identidade
  primary: "#34495e", // Azul Marinho Corporativo
  secondary: "#2980b9", // Azul Ativo/Links
  accent: "#3498db", // Azul Destaque

  // Cores de Interface
  background: "#F5F7FA", // Cinza suave para fundo das telas
  card: "#ffffff", // Branco para áreas de conteúdo (cards/inputs)
  white: "#ffffff",
  border: "#E1E8EE", // Bordas mais sutis para o padrão mobile

  // Feedback de Status (Semânticas)
  success: "#27ae60", // Verde para 'Entregue' ou 'Sucesso'
  warning: "#f1c40f", // Amarelo para 'Pendente' ou 'Atenção'
  error: "#e74c3c", // Vermelho para 'Urgente' ou 'Erro'
  info: "#3498db", // Azul para informações neutras

  // Tipografia
  textMain: "#2c3e50", // Texto principal (títulos)
  textSecondary: "#576574", // Texto de apoio
  textLight: "#95a5a6", // Texto desativado ou placeholders

  // Específicas do Fluxo de Entregas
  statusRecebido: "#2980b9",
  statusEntregue: "#27ae60",
  statusDevolvido: "#e67e22",
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 20,
};

export const SHADOWS = {
  light: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
};
