# Contexto do Projeto Mobile: StrategicCond

## 🎯 Objetivo

Aplicativo mobile multi-tenant para gestão de condomínios (Moradores e Operadores), focado em performance, agilidade no registro de entregas e facilidade de uso em campo.

## 🛠️ Tech Stack

- **Framework:** React Native com Expo (Managed Workflow).
- **Roteamento:** Expo Router (Diretório `/app`).
- **Linguagem:** TypeScript (Strict Mode).
- **Gerenciamento de Estado/Dados:** Hooks customizados e Services isolados.
- **Estilização:** StyleSheet nativo ou biblioteca de UI definida no projeto.

## 🏗️ Estratégia de Arquitetura (Modular por Domínio)

O projeto segue uma estrutura modular para facilitar a escalabilidade de novos módulos (ex: Vistorias, Assembleias).

### 1. Roteamento (`/app`)

- Segue a convenção do Expo Router.
- Pastas principais: `admin/` e `entregas/`.
- Arquivos `_layout.tsx` controlam o fluxo de navegação de cada módulo.

### 2. Lógica de Negócio (`/src/modules`)

Cada funcionalidade deve ser isolada em seu respectivo módulo:

- **components:** Componentes visuais específicos daquele módulo.
- **hooks:** Toda a lógica de estado e efeitos (ex: `useEntregas.ts`).
- **services:** Chamadas à API (ex: `entregaService.ts`).
- **types:** Definições de interfaces TypeScript para o domínio.

## 👮 Regras de Desenvolvimento para o Agente

- **Lógica fora da View:** Sempre prefira mover a lógica de tratamento de dados e chamadas de API para **Hooks** ou **Services**. A View (`app/`) deve ser o mais limpa possível.
- **Tipagem Forte:** Proibido o uso de `any`. Use as interfaces definidas em `src/modules/[modulo]/types`.
- **Navegação:** Use o componente `Link` ou o hook `useRouter` do Expo Router para transições.
- **Tratamento de Erros:** Todas as chamadas em Services devem usar `try/catch` e reportar erros de forma amigável ao usuário via UI.

## 📝 Padrões de Código

- Nomeação de arquivos em `kebab-case` ou `camelCase` conforme o padrão atual.
- Componentes funcionais com `React.FC`.
- Exportações nomeadas em vez de `export default` (exceto em arquivos de rota do `/app`).
