# 🚀 Deploy do ArenaTicket Admin - Checklist

## ✅ Configuração Concluída

### 1. Ambiente de Produção
- ✅ Variável de ambiente configurada: `VITE_API_BASE_URL=https://api.arenaticket.gdse.ao/api/v1`
- ✅ Vite configurado para build otimizado
- ✅ AWS CLI instalado e configurado (Conta: 903630464832)

### 2. Scripts de Deploy Criados
- ✅ `deploy.sh` - Deploy automático para S3 + invalidação CloudFront
- ✅ `setup-cloudfront.sh` - Configuração inicial do CloudFront
- ✅ `quick-deploy.sh` - Menu interativo para todas as operações
- ✅ Todos os scripts com permissão de execução

### 3. Documentação
- ✅ `DEPLOY.md` - Guia completo de deploy
- ✅ `README.md` - Atualizado com instruções de produção
- ✅ `.env.production` - Configuração de produção

## 📋 Próximos Passos para Deploy

### Passo 1: Criar Certificado SSL (ACM)
**Obrigatório antes do primeiro deploy!**

```bash
# No AWS Console:
# 1. Acesse: Certificate Manager (Região: us-east-1)
# 2. Request Certificate → Public certificate
# 3. Domain names: admin.arenaticket.gdse.ao
# 4. Validation method: DNS validation
# 5. Copie os registros CNAME para adicionar no Route 53
# 6. Aguarde validação (~5-10 minutos)
# 7. Copie o ARN do certificado
```

### Passo 2: Executar Deploy Inicial

**Opção A: Menu Interativo (Recomendado)**
```bash
./quick-deploy.sh
# Escolha: 1) Deploy Inicial
```

**Opção B: Manual**
```bash
# Deploy do S3
./deploy.sh

# Configurar CloudFront (cole o ARN do certificado quando solicitado)
./setup-cloudfront.sh
```

### Passo 3: Configurar DNS (Route 53)

Após criar a distribuição CloudFront, configure o DNS:

```bash
# No AWS Console > Route 53:
# 1. Selecione a hosted zone: gdse.ao
# 2. Create Record:
#    - Record name: admin.arenaticket
#    - Record type: A (Alias)
#    - Alias to: CloudFront distribution
#    - Selecione a distribuição criada
# 3. Create records
```

### Passo 4: Aguardar Propagação
- CloudFront: ~15-20 minutos
- DNS: ~5-30 minutos

### Passo 5: Verificar Deploy
```bash
# Verificar status
./quick-deploy.sh
# Escolha: 4) Status da Infraestrutura

# Acessar o site
curl -I https://admin.arenaticket.gdse.ao
```

## 🔄 Deploy de Atualizações (após setup inicial)

Simples! Execute apenas:
```bash
./deploy.sh
# ou
npm run deploy
```

O script irá:
1. ✅ Build do projeto
2. ✅ Upload para S3
3. ✅ Invalidar cache do CloudFront
4. ✅ Deploy em ~2-3 minutos

## 🛠️ Comandos Úteis

### Build local
```bash
npm run build
```

### Testar build localmente
```bash
npm run preview
# Acesse: http://localhost:4173
```

### Status da infraestrutura
```bash
./quick-deploy.sh
# Escolha: 4) Status da Infraestrutura
```

### Verificar S3
```bash
aws s3 ls s3://admin.arenaticket.gdse.ao/
```

### Invalidar cache manualmente
```bash
# Após obter o DISTRIBUTION_ID
aws cloudfront create-invalidation \
  --distribution-id E1234EXAMPLE \
  --paths "/*"
```

## 🔐 Segurança

- ✅ HTTPS obrigatório (redirect)
- ✅ TLS 1.2+ mínimo
- ✅ CORS configurado
- ✅ index.html sem cache (sempre versão mais recente)
- ✅ Assets com cache de 1 ano (arquivos versionados)

## 💰 Custos Estimados AWS

- **S3**: ~$0.023 per GB/mês (armazenamento)
- **CloudFront**: ~$0.085 per GB transferido
- **Route 53**: ~$0.50 por hosted zone/mês
- **Total estimado**: ~$5-10/mês (tráfego baixo/médio)

## 📞 Troubleshooting

### Erro: "Bucket already exists"
```bash
# O bucket já existe, apenas faça o deploy
./deploy.sh
```

### Erro: "Certificate not found"
```bash
# Verifique se o certificado está na região us-east-1
aws acm list-certificates --region us-east-1
```

### Site não atualiza
```bash
# Invalide o cache do CloudFront
./deploy.sh  # Já faz isso automaticamente
```

### Erro CORS na API
```bash
# Verifique se o backend permite origem:
# https://admin.arenaticket.gdse.ao
```

## 📚 Documentação Completa

- **Deploy detalhado**: [`DEPLOY.md`](./DEPLOY.md)
- **Desenvolvimento**: [`README.md`](./README.md)
- **API**: [`FRONTEND_INTEGRATION.md`](./FRONTEND_INTEGRATION.md)

---

**Status**: ✅ Pronto para deploy  
**Domínio**: admin.arenaticket.gdse.ao  
**API**: api.arenaticket.gdse.ao  
**Conta AWS**: 903630464832
