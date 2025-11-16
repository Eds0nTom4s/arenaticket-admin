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
  - `pages/`: páginas do app (Login, Dashboard, Eventos, Lotes, Pedidos, Auditoria)
  - `router/`: configuração de rotas
  - `store/`: estado global (Pinia) - auth, eventos, lotes, pedidos
  - `styles/`: estilos globais (Tailwind)
  - `types/`: tipos TypeScript (Evento, Lote, Pedido, Bilhete)
  - `utils/`: utilitários (api.ts, upload.ts)
  - `main.ts`: bootstrap da aplicação
- Arquivos de configuração: `vite.config.ts`, `tailwind.config.js`, `tsconfig*.json`, `postcss.config.js`

## 🚀 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie `.env.example` para `.env` e ajuste a URL da API:
```bash
cp .env.example .env
```

Edite `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 3. Rodar em modo desenvolvimento
```bash
npm run dev
```

A aplicação inicia em: **http://localhost:3000**

### 4. Build para produção
```bash
npm run build
```

## 🔑 Autenticação

O login utiliza **telefone** e **senha**:
- Endpoint: `POST /auth/login`
- Credenciais de teste (configurar no backend):
  - Telefone: `923000001`
  - Password: `senha123`

## 🧱 Funcionalidades

### ✅ Implementadas
- **Login**: Autenticação via `/auth/login` com JWT (telefone + senha)
- **Layout**: Sidebar fixa e cabeçalho com logout
- **Dashboard**: Cards com métricas mockadas
- **Eventos**: CRUD completo
  - Campos: título, descrição, local, dataEvento, duracaoMinutos, bannerUrl, abertoParaVenda
  - Upload de banner (multipart/form-data)
- **Lotes**: CRUD completo com experiência fluida
  - Seleção visual de eventos por cards
  - Formulário com formato europeu dd/MM/yyyy e hora HH:mm
  - Conversão automática para ISO 8601 com timezone +01:00
  - Máscara automática nos campos de data
  - Validação de data fim posterior ao início
  - Tabela com status dinâmico (Aguardando/Ativo/Esgotado/Encerrado)
  - Navegação intuitiva com breadcrumb
- **Pedidos**: Listagem com filtro por status e paginação

### 🔜 Próximas Etapas
- Página de Auditoria (logs do sistema)
- Relatório de vendas
- Validação de bilhetes (QR Code scanner)
- Dashboard com métricas reais da API
- Integração completa com backend

## 🧭 Identidade Visual

Tema escuro minimalista com acentos ciano, inspirado em dashboards modernos.

### Cores principais (definidas no Tailwind):
- Primária: `#0D1B2A`
- Ciano: `#00B4D8`
- Fundo: `#F8FAFC`
- Texto primário: `#1E293B`
- Texto secundário: `#64748B`
- Sucesso: `#10B981`
- Erro: `#EF4444`

## 📡 Integração com API

### Endpoints utilizados

#### Autenticação
- `POST /auth/login` - Login com username/password

#### Eventos (Admin)
- `GET /admin/eventos` - Listar todos os eventos
- `POST /admin/eventos` - Criar evento
- `PUT /admin/eventos/{id}` - Atualizar evento
- `DELETE /admin/eventos/{id}` - Remover evento

#### Lotes (Admin)
- `GET /admin/lotes` - Listar todos os lotes
- `POST /admin/lotes` - Criar lote (requer eventoId no body)
- `PUT /admin/lotes/{id}` - Atualizar lote
- `DELETE /admin/lotes/{id}` - Remover lote

#### Pedidos (Admin)
- `GET /admin/pedidos` - Listar pedidos com filtros e paginação

#### Upload
- `POST /admin/upload/banner` - Upload de banner (multipart/form-data)
- `DELETE /admin/upload/banner?url=...` - Deletar banner

### Estrutura de dados

Consulte `src/types/evento.ts` para ver as interfaces TypeScript completas:
- `Evento`: dataEvento, duracaoMinutos, dataFim (calculado), bannerUrl
- `LoteBilhete`: nome, preco, quantidadeTotal, quantidadeDisponivel
- `Pedido`: status (PENDING/PAID/CANCELLED/EXPIRED), total, compradorNome
- `Bilhete`: codigoTicket, codigoQR, status

## 🛠️ Scripts disponíveis

```bash
npm run dev        # Servidor de desenvolvimento (porta 3000)
npm run build      # Build para produção
npm run preview    # Preview do build de produção
npm run typecheck  # Verificar tipos TypeScript
```

## ✅ Critérios de Aceitação
- ✅ Projeto roda com `npm run dev` sem erros
- ✅ Layout responsivo e limpo
- ✅ Autenticação real com JWT
- ✅ CRUD de eventos com upload de banner
- ✅ CRUD de lotes por evento
- ✅ Listagem de pedidos com filtros
- ✅ Rotas e layout principal renderizam corretamente
- ✅ Documentação única neste `README.md`

## 📝 Notas de desenvolvimento

### Persistência de autenticação
O token JWT é salvo no `localStorage` e restaurado automaticamente ao recarregar a página.

### Upload de arquivos
O upload de banner usa `multipart/form-data` e retorna a URL pública do arquivo.

### Tipos TypeScript
Todos os tipos estão centralizados em `src/types/evento.ts` e refletem a documentação da API v1.1.0.

---

**Desenvolvido para:** GDSE - Grémio Desportivo Sagrada Esperança  
**Versão:** 1.0.0  
**Data:** 15/11/2025
