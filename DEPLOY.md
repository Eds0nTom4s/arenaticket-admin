# Guia de Deploy - ArenaTicket Admin

## 🌐 Domínio
- **Frontend**: https://admin.arenaticket.gdse.ao
- **API**: https://api.arenaticket.gdse.ao

## 📋 Pré-requisitos

1. **AWS CLI** instalado e configurado
   ```bash
   aws configure
   ```

2. **Certificado SSL** no AWS Certificate Manager (ACM)
   - Região: **us-east-1** (obrigatório para CloudFront)
   - Domínio: `admin.arenaticket.gdse.ao` ou `*.arenaticket.gdse.ao`
   - Validação: DNS ou Email

3. **Node.js** e **npm** instalados

## 🚀 Deploy Inicial (Primeira vez)

### Passo 1: Criar Certificado SSL
```bash
# No AWS Console, vá para Certificate Manager (us-east-1)
# Solicite um certificado para: admin.arenaticket.gdse.ao
# Valide via DNS (adicione os registros CNAME no Route 53)
# Copie o ARN do certificado
```

### Passo 2: Executar Deploy Inicial
```bash
# Dar permissão de execução aos scripts
chmod +x deploy.sh setup-cloudfront.sh

# Executar deploy do S3
./deploy.sh
```

### Passo 3: Configurar CloudFront
```bash
# Edite setup-cloudfront.sh e adicione o CERTIFICATE_ARN
nano setup-cloudfront.sh

# Execute o script
./setup-cloudfront.sh
```

### Passo 4: Atualizar deploy.sh com Distribution ID
```bash
# Copie o DISTRIBUTION_ID do output do passo anterior
# Edite deploy.sh e cole o ID
nano deploy.sh
```

### Passo 5: Configurar DNS (Route 53)
```bash
# No AWS Route 53, crie um registro:
# Tipo: A (Alias)
# Nome: admin.arenaticket.gdse.ao
# Alias Target: Selecione a distribuição CloudFront criada
# Routing Policy: Simple
```

## 🔄 Deploy de Atualizações

Após o setup inicial, para fazer deploy de novas versões:

```bash
./deploy.sh
```

Este script irá:
1. ✅ Fazer build do projeto (`npm run build`)
2. ✅ Sincronizar arquivos com S3
3. ✅ Invalidar cache do CloudFront
4. ✅ Deploy em ~2-3 minutos

## 📦 Estrutura de Arquivos

```
dist/                   # Build de produção
  ├── index.html       # SPA entry point (sem cache)
  ├── assets/          # JS, CSS (cache de 1 ano)
  └── ...
```

## 🔧 Configuração de Cache

- **index.html**: `no-cache` (sempre busca versão mais recente)
- **assets/ (JS/CSS)**: `max-age=31536000` (1 ano - arquivos com hash)

## 🛠️ Comandos Úteis

### Verificar bucket S3
```bash
aws s3 ls s3://admin.arenaticket.gdse.ao/
```

### Listar distribuições CloudFront
```bash
aws cloudfront list-distributions --query "DistributionList.Items[*].[Id,DomainName,Aliases.Items[0]]" --output table
```

### Invalidar cache manualmente
```bash
aws cloudfront create-invalidation \
  --distribution-id E1234EXAMPLE \
  --paths "/*"
```

### Verificar status da invalidação
```bash
aws cloudfront get-invalidation \
  --distribution-id E1234EXAMPLE \
  --id I1234EXAMPLE
```

## 🔐 Segurança

- ✅ HTTPS obrigatório (redirect-to-https)
- ✅ TLS 1.2+ mínimo
- ✅ CORS configurado para API
- ✅ Headers de segurança

## 📊 Monitoramento

- **CloudFront Metrics**: AWS Console > CloudFront > Monitoring
- **S3 Metrics**: AWS Console > S3 > Metrics
- **Custos**: AWS Cost Explorer

## 🐛 Troubleshooting

### Erro 403 Forbidden
- Verifique a política do bucket S3
- Verifique se os arquivos foram enviados corretamente

### Página não atualiza
- Execute invalidação do CloudFront: `./deploy.sh`
- Limpe o cache do navegador (Ctrl+Shift+R)

### Erro CORS na API
- Verifique se `VITE_API_BASE_URL` está correto em `.env.production`
- Verifique configuração CORS no backend (api.arenaticket.gdse.ao)

### Certificado SSL não funciona
- Certificado DEVE estar na região **us-east-1**
- Verifique se o domínio do certificado corresponde ao alias do CloudFront

## 💰 Custos Estimados (AWS)

- **S3**: ~$0.023 por GB/mês (armazenamento)
- **CloudFront**: ~$0.085 por GB transferido
- **Route 53**: ~$0.50 por hosted zone/mês

**Estimativa**: ~$5-10/mês para tráfego baixo/médio

## 📞 Suporte

Para problemas com deploy, verifique:
1. AWS CLI configurado: `aws sts get-caller-identity`
2. Permissões IAM adequadas (S3, CloudFront, Route 53)
3. Logs do CloudFront no S3 (se habilitado)
