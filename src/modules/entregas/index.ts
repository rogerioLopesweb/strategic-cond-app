// 1. Exporta o Service (Lógica de API)
export * from "./services/entregaService";

// 2. Exporta o Hook (O "Gerente" de Estado e Loading)
// ✅ Adicionado: Sem isso você teria que importar o hook pelo caminho longo
export * from "./hooks/useEntregas";

// 3. Exporta as Interfaces de Contrato do Módulo (DTOs)
export * from "./types/IEntrega";

