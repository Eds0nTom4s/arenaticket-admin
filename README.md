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
  - `pages/`: páginas do app (Login, Dashboard, Eventos, Lotes, Pedidos, Auditoria, Check-In, VisualizarBilhete, Porteiro)
  - `router/`: configuração de rotas
  - `store/`: estado global (Pinia) - auth, eventos, lotes, pedidos
  - `styles/`: estilos globais (Tailwind)
  - `types/`: tipos TypeScript (Evento, Lote, Pedido, Bilhete)
  - `utils/`: utilitários (api.ts, upload.ts)
  - `main.ts`: bootstrap da aplicação
- Arquivos de configuração: `vite.config.ts`, `tailwind.config.js`, `tsconfig*.json`, `postcss.config.js`

## 🚀 Como Executar

### Desenvolvimento Local

#### 1. Instalar dependências
```bash
npm install
```

#### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` para desenvolvimento:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

#### 3. Rodar em modo desenvolvimento
```bash
npm run dev
```

A aplicação inicia em: **http://localhost:3000**

### Deploy em Produção (AWS)

#### 🌐 Domínio
- **Frontend**: https://admin.arenaticket.gdse.ao
- **API**: https://api.arenaticket.gdse.ao

#### 📋 Pré-requisitos
- AWS CLI instalado e configurado
- Certificado SSL no ACM (us-east-1) para `admin.arenaticket.gdse.ao`
- Acesso ao Route 53 para configurar DNS

#### 🚀 Deploy Rápido

**Opção 1: Script Interativo (Recomendado)**
```bash
./quick-deploy.sh
```

**Opção 2: Deploy Manual**
```bash
# 1. Deploy inicial (primeira vez)
./deploy.sh

# 2. Configurar CloudFront
./setup-cloudfront.sh

# 3. Deploys subsequentes
npm run deploy
```

**Documentação completa de deploy**: Consulte [`DEPLOY.md`](./DEPLOY.md) para instruções detalhadas.

#### 📦 Build para produção
```bash
npm run build
```

## 🔑 Autenticação

O login utiliza **telefone** e **senha**:
- Endpoint: `POST /auth/login`
- Credenciais de teste (configurar no backend):
  - Telefone: `923000001`
  - Password: `senha123`

### Perfis de Usuário

O sistema suporta diferentes perfis com controle de acesso:

#### ADMIN (Administrador)
- Acesso completo ao sistema
- Páginas disponíveis: Dashboard, Eventos, Lotes, Pedidos, Check-In, Porteiro, Bilhetes, Auditoria
- Pode gerenciar eventos, lotes, pedidos e visualizar logs de auditoria

#### PORTEIRO
- Acesso restrito às funcionalidades de validação de bilhetes
- Páginas disponíveis: Check-In, Porteiro, Bilhetes
- Interface otimizada para validação rápida na entrada do evento
- Scanner de QR Code integrado para leitura automática

**Redirecionamento Automático**: Usuários são automaticamente direcionados para páginas apropriadas ao seu perfil após login.

## 🧱 Funcionalidades

### ✅ Implementadas
- **Login**: Autenticação via `/auth/login` com JWT (telefone + senha)
- **Controle de Acesso por Perfil**: Sistema de roles (ADMIN, PORTEIRO) com proteção de rotas
- **Layout**: Sidebar dinâmica baseada em permissões e cabeçalho com logout
- **Dashboard**: Cards com métricas mockadas (apenas ADMIN)
- **Eventos**: CRUD completo (apenas ADMIN)
  - Campos: título, descrição, local, dataEvento, duracaoMinutos, bannerUrl, abertoParaVenda
  - Upload de banner (multipart/form-data)
- **Lotes**: CRUD completo com experiência fluida (apenas ADMIN)
  - Seleção visual de eventos por cards
  - Formulário com formato europeu dd/MM/yyyy e hora HH:mm
  - Conversão automática para ISO 8601 com timezone +01:00
  - Máscara automática nos campos de data
  - Validação de data fim posterior ao início
  - Tabela com status dinâmico (Aguardando/Ativo/Esgotado/Encerrado)
  - Navegação intuitiva com breadcrumb
- **Pedidos**: Listagem com filtro por status e paginação (apenas ADMIN)
- **Check-In**: Validação e confirmação de entrada de bilhetes (ADMIN e PORTEIRO)
- **Porteiro**: Interface otimizada com scanner QR integrado (ADMIN e PORTEIRO)
  - Scanner de QR Code com html5-qrcode
  - Validação e confirmação rápida
  - Histórico de últimos check-ins
- **Visualizar Bilhete**: Consulta de bilhetes por código (ADMIN e PORTEIRO)
- **Auditoria**: Logs do sistema com filtros (apenas ADMIN)

### 🔜 Próximas Etapas
- Relatório de vendas
- Dashboard com métricas reais da API
- Integração completa com backend para métricas agregadas
- Melhorias no scanner QR (auto-foco, múltiplas câmeras)

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
- `Pedido`: status, valorTotal, método de pagamento, bilhetes gerados
- `Bilhete`: codigoTicket, codigoTicketCompact, codigoQR (Base64), status, timestamps

## 🛠️ Scripts disponíveis

```bash
npm run dev            # Servidor de desenvolvimento (porta 3000)
npm run build          # Build para produção
npm run preview        # Preview do build de produção
npm run typecheck      # Verificar tipos TypeScript
npm run deploy         # Deploy para AWS (produção)
npm run deploy:setup   # Configurar CloudFront (primeira vez)
```

Também disponíveis:
```bash
./quick-deploy.sh      # Menu interativo de deploy
./deploy.sh            # Deploy direto para S3/CloudFront
./setup-cloudfront.sh  # Criar distribuição CloudFront
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
**Versão:** 1.2.0  
**Data:** 23/11/2025

### 🔄 Novidades v1.2.0
- Scanner de QR Code integrado na página Porteiro usando `html5-qrcode`.
- Sistema de controle de acesso por perfil (ADMIN, PORTEIRO).
- Proteção de rotas baseada em roles com redirecionamento automático.
- Sidebar dinâmica que exibe apenas opções permitidas para cada perfil.
- Indicador visual de perfil no cabeçalho.

### 🔄 Novidades v1.1.0
- Página `VisualizarBilhete` para consulta direta por código.
- Página `Porteiro` otimizada para validação e confirmação rápida de entrada.
- Extensão da store de check-in com método `buscarBilhetePorCodigo` sem efeitos colaterais.
