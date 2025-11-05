# ArenaTicket Admin Panel

## 🧩 Introdução
Painel administrativo do sistema ArenaTicket. Interface web independente para gestão de eventos, lotes, pedidos e auditoria.

## 🧰 Stack Tecnológica
- Vue.js 3 (Composition API + TypeScript)
- Tailwind CSS
- Pinia
- Vue Router
- Vite

## 📁 Estrutura de Pastas
- `public/`: arquivos estáticos (favicon, etc.)
- `src/`: código-fonte
  - `assets/`: imagens e assets em geral
  - `components/`: componentes reutilizáveis
  - `layouts/`: layouts de páginas (ex.: BaseLayout)
  - `pages/`: páginas do app (Login, Dashboard, etc.)
  - `router/`: configuração de rotas
  - `store/`: estado global (Pinia)
  - `styles/`: estilos globais (Tailwind)
  - `utils/`: utilitários
  - `main.ts`: bootstrap da aplicação
- Arquivos de configuração: `vite.config.ts`, `tailwind.config.js`, `tsconfig*.json`, `postcss.config.js`

## 🚀 Como Executar
1. Instale as dependências:
```bash
npm install
```
2. Rode em modo desenvolvimento:
```bash
npm run dev
```
A aplicação inicia em: http://localhost:3000

## 🧱 Funcionalidades Iniciais
- Login mock (sem backend)
- Layout com sidebar e cabeçalho
- Dashboard com cards de métricas
- Rotas base configuradas (login, dashboard, eventos, lotes, pedidos, auditoria)

## 🧭 Identidade Visual
Tema escuro minimalista com acentos ciano, inspirado em dashboards modernos. Cores principais definidas no Tailwind: primária `#0D1B2A`, ciano `#00B4D8`, fundo `#F8FAFC`.

## 🔜 Próximas Etapas
- Integração com API real (ArenaTicket API)
- Autenticação JWT
- CRUD de eventos e lotes

## ✅ Critérios de Aceitação
- Projeto roda com `npm run dev` sem erros
- Layout responsivo e limpo
- Mock de autenticação funcional
- Rotas e layout principal renderizam corretamente
- Documentação única neste `README.md`
