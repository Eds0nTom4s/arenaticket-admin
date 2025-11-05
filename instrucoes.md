# 🧭 PROMPT — CRIAÇÃO DO PROJETO "ArenaTicket Admin Panel"

## 🎯 Objetivo
Iniciar um novo projeto frontend do zero, dedicado exclusivamente ao painel administrativo do sistema **ArenaTicket**, mantendo:
- Mesma base tecnológica (Vue.js 3 + Vite + Tailwind CSS + Pinia + Vue Router)
- Design minimalista e limpo, inspirado em dashboards modernos como Vercel e Linear
- Organização modular e escalável, com foco em clareza e performance
- Documentação central em `README.md` na raiz do projeto (sem criar múltiplos arquivos dispersos)

O projeto será autônomo, separado do frontend público (arenaticket-frontend).
O backend é o mesmo: **ArenaTicket API**.

---

## ⚙️ PILARES DO PROJETO

| Área | Diretriz |
|------|-----------|
| Nome do Projeto | `arenaticket-admin` |
| Framework | Vue.js 3 (Composition API + TypeScript) |
| Build Tool | Vite |
| Estilos | Tailwind CSS (tema escuro por padrão) |
| Gerenciamento de Estado | Pinia |
| Roteamento | Vue Router |
| UI Library | Nenhuma — todos os componentes devem ser nativos e minimalistas |
| Backend | Mesma API pública e administrativa do sistema principal |
| Design Base | Flat, minimalista, sem sombras pesadas |
| Tema | Azul-escuro (`#0D1B2A`) e cinza-claro (`#F8FAFC`) com acentos ciano (`#00B4D8`) |

---

## 📁 ESTRUTURA INICIAL DE PASTAS

arenaticket-admin/
│
├── public/
│ └── favicon.svg
│
├── src/
│ ├── assets/
│ ├── components/
│ ├── layouts/
│ ├── pages/
│ ├── router/
│ ├── store/
│ ├── styles/
│ ├── utils/
│ └── main.ts
│
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md ← (único arquivo de documentação)


---

## 🧱 FUNCIONALIDADES DA PRIMEIRA ENTREGA

### 1️⃣ Autenticação Simples (Mock)
- Tela de login minimalista com logo “ArenaTicket Admin”
- Campos: email e senha
- Sem integração real ainda (mock local)
- Após login → redireciona para `/dashboard`

### 2️⃣ Layout Base
- Barra lateral fixa (menu de navegação)
- Cabeçalho superior com nome do usuário e botão de logout
- Corpo do conteúdo com fundo claro, margens uniformes
- Responsivo (colapsa sidebar em telas menores)

### 3️⃣ Dashboard Inicial
- Exibir métricas básicas mockadas:
  - Total de eventos ativos
  - Total de bilhetes vendidos
  - Vendas em Kz
  - Próximos eventos
- Cada métrica em card minimalista
- Layout em grid 2x2 com responsividade

### 4️⃣ Roteamento Base
Rotas obrigatórias (inicialmente mockadas):
| Rota | Componente | Descrição |
|------|-------------|-----------|
| `/login` | `LoginPage.vue` | Tela inicial de acesso |
| `/dashboard` | `DashboardPage.vue` | Painel principal |
| `/eventos` | `EventosPage.vue` | Gestão de eventos |
| `/lotes` | `LotesPage.vue` | Gestão de lotes |
| `/pedidos` | `PedidosPage.vue` | Consultar pedidos e pagamentos |
| `/auditoria` | `AuditoriaPage.vue` | Logs e atividades do sistema |

---

## 🧩 IDENTIDADE VISUAL E DESIGN

### 🎨 Cores Base
| Papel | Cor | Hex |
|-------|------|------|
| Primária | Azul-profundo | `#0D1B2A` |
| Secundária | Ciano vibrante | `#00B4D8` |
| Fundo | Cinza claro | `#F8FAFC` |
| Texto primário | `#1E293B` |
| Texto secundário | `#64748B` |
| Sucesso | `#10B981` |
| Erro | `#EF4444` |

### ✨ Tipografia
- Fonte: `Inter, sans-serif`
- Tamanhos:
  - Título: `text-xl font-semibold`
  - Subtítulo: `text-base text-gray-500`
  - Corpo: `text-sm text-gray-700`

### 🧭 Estilo geral
- Flat, limpo e elegante.
- Sem gradientes.
- Cards com borda leve (`border border-gray-200 rounded-xl`).
- Animações suaves (`transition-all duration-200`).

---

## 🔐 ACESSO E SEGURANÇA

Nesta fase inicial:
- Não implementar autenticação real (usar mock no estado global).
- Rotas protegidas por verificação simples (`store.authenticated === true`).
- Logout apenas limpa o estado local.

---

## 📦 INSTALAÇÃO E EXECUÇÃO

O projeto deve rodar em modo dev com:
```bash
npm install
npm run dev


Ambiente local:
http://localhost:5173

📘 DOCUMENTAÇÃO OBRIGATÓRIA

Gerar um único arquivo README.md na raiz com:

Estrutura obrigatória:
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
(Descrever brevemente a hierarquia principal conforme o padrão do projeto)

## 🚀 Como Executar
```bash
npm install
npm run dev

🧱 Funcionalidades Iniciais

Login mock

Layout com sidebar e cabeçalho

Dashboard com cards de métricas

Rotas base configuradas

🧭 Identidade Visual

Tema escuro minimalista com acentos ciano.

🔜 Próximas Etapas

Integração com API real

Autenticação JWT

CRUD de eventos e lotes


---

## ✅ CRITÉRIOS DE ACEITAÇÃO
- Estrutura mínima criada conforme especificação.
- Projeto roda com `npm run dev` sem erros.
- Layout responsivo e limpo.
- Documentação única em `README.md` na raiz.
- Nenhum código legado ou dependência desnecessária.
- Mock de autenticação funcional.
- Rotas e layout principal renderizam corretamente.

---

## 🚀 PRÓXIMA ETAPA
**ETAPA 2 — Integração Real com API ArenaTicket**
> Implementar autenticação real via backend, CRUD de eventos, e painel de gestão de lotes.
