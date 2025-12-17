# Comandos AWS Úteis - ArenaTicket Admin

## 📋 Informações da Conta

```bash
# Ver informações da conta AWS atual
aws sts get-caller-identity

# Listar regiões disponíveis
aws ec2 describe-regions --output table
```

## 🪣 S3 Bucket

```bash
# Criar bucket
aws s3 mb s3://admin.arenaticket.gdse.ao --region us-east-1

# Listar arquivos no bucket
aws s3 ls s3://admin.arenaticket.gdse.ao/

# Listar com tamanhos
aws s3 ls s3://admin.arenaticket.gdse.ao/ --recursive --human-readable --summarize

# Sincronizar pasta local com S3
aws s3 sync dist/ s3://admin.arenaticket.gdse.ao/ --delete

# Configurar site estático
aws s3 website s3://admin.arenaticket.gdse.ao \
  --index-document index.html \
  --error-document index.html

# Deletar bucket (deve estar vazio)
aws s3 rb s3://admin.arenaticket.gdse.ao --force
```

## 🔐 ACM (Certificate Manager)

```bash
# Listar certificados (us-east-1 obrigatório para CloudFront)
aws acm list-certificates --region us-east-1 --output table

# Descrever certificado específico
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/xxx \
  --region us-east-1

# Solicitar novo certificado
aws acm request-certificate \
  --domain-name admin.arenaticket.gdse.ao \
  --validation-method DNS \
  --region us-east-1

# Ver opções de validação DNS
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/xxx \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions'
```

## 🌐 CloudFront

```bash
# Listar distribuições
aws cloudfront list-distributions \
  --query "DistributionList.Items[*].[Id,DomainName,Status,Aliases.Items[0]]" \
  --output table

# Descrever distribuição específica
aws cloudfront get-distribution --id E1234EXAMPLE

# Criar invalidação de cache
aws cloudfront create-invalidation \
  --distribution-id E1234EXAMPLE \
  --paths "/*"

# Listar invalidações
aws cloudfront list-invalidations --distribution-id E1234EXAMPLE

# Ver status de invalidação
aws cloudfront get-invalidation \
  --distribution-id E1234EXAMPLE \
  --id I1234EXAMPLE

# Desabilitar distribuição (antes de deletar)
aws cloudfront get-distribution-config --id E1234EXAMPLE > config.json
# Edite config.json e mude "Enabled": false
aws cloudfront update-distribution \
  --id E1234EXAMPLE \
  --if-match ETAG_VALUE \
  --distribution-config file://config.json

# Deletar distribuição (deve estar desabilitada primeiro)
aws cloudfront delete-distribution \
  --id E1234EXAMPLE \
  --if-match ETAG_VALUE
```

## 🌍 Route 53 (DNS)

```bash
# Listar hosted zones
aws route53 list-hosted-zones --output table

# Listar registros DNS de uma zona
aws route53 list-resource-record-sets \
  --hosted-zone-id Z1234EXAMPLE \
  --output table

# Criar registro A (Alias para CloudFront)
cat > change-batch.json <<EOF
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "admin.arenaticket.gdse.ao",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "d111111abcdef8.cloudfront.net",
        "EvaluateTargetHealth": false
      }
    }
  }]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234EXAMPLE \
  --change-batch file://change-batch.json

# Deletar registro
cat > delete-batch.json <<EOF
{
  "Changes": [{
    "Action": "DELETE",
    "ResourceRecordSet": {
      "Name": "admin.arenaticket.gdse.ao",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "d111111abcdef8.cloudfront.net",
        "EvaluateTargetHealth": false
      }
    }
  }]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234EXAMPLE \
  --change-batch file://delete-batch.json
```

## 🔍 Logs e Debug

```bash
# Habilitar logs do CloudFront no S3
# (Requer configuração na console ou via API)

# Ver logs do S3
aws s3 ls s3://your-logs-bucket/cloudfront/

# Download de logs
aws s3 cp s3://your-logs-bucket/cloudfront/ ./logs/ --recursive

# Analisar logs (exemplo com grep)
zcat logs/*.gz | grep "admin.arenaticket.gdse.ao" | head -20
```

## 💰 Custos

```bash
# Ver custos do mês atual (requer Cost Explorer habilitado)
aws ce get-cost-and-usage \
  --time-period Start=2025-11-01,End=2025-11-30 \
  --granularity MONTHLY \
  --metrics "BlendedCost" "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE

# Ver custos por serviço
aws ce get-cost-and-usage \
  --time-period Start=2025-11-01,End=2025-11-30 \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE \
  --output table
```

## 🔐 IAM (Permissões)

```bash
# Ver usuário atual
aws sts get-caller-identity

# Listar policies do usuário
aws iam list-attached-user-policies --user-name username

# Ver permissões de uma policy
aws iam get-policy-version \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess \
  --version-id v1
```

## 🧹 Limpeza (Deletar Recursos)

```bash
# 1. Deletar distribuição CloudFront (desabilitar primeiro)
# Ver comando acima em "CloudFront"

# 2. Deletar registros DNS
# Ver comando acima em "Route 53"

# 3. Deletar certificado SSL
aws acm delete-certificate \
  --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/xxx \
  --region us-east-1

# 4. Esvaziar e deletar bucket S3
aws s3 rm s3://admin.arenaticket.gdse.ao --recursive
aws s3 rb s3://admin.arenaticket.gdse.ao
```

## 🔄 Workflow Completo de Deploy

```bash
# 1. Build local
npm run build

# 2. Sync para S3
aws s3 sync dist/ s3://admin.arenaticket.gdse.ao/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# 3. Upload index.html sem cache
aws s3 cp dist/index.html s3://admin.arenaticket.gdse.ao/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

# 4. Invalidar CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234EXAMPLE \
  --paths "/*"

# 5. Verificar
curl -I https://admin.arenaticket.gdse.ao
```

## 🎯 Troubleshooting

```bash
# Verificar se bucket existe
aws s3 ls s3://admin.arenaticket.gdse.ao 2>&1

# Testar acesso público ao bucket
curl -I http://admin.arenaticket.gdse.ao.s3-website-us-east-1.amazonaws.com

# Verificar status do CloudFront
aws cloudfront get-distribution --id E1234EXAMPLE \
  --query 'Distribution.Status'

# Verificar DNS
nslookup admin.arenaticket.gdse.ao
dig admin.arenaticket.gdse.ao

# Testar SSL
openssl s_client -connect admin.arenaticket.gdse.ao:443 -servername admin.arenaticket.gdse.ao
```

## 📊 Monitoramento

```bash
# Métricas do CloudFront (últimas 24h)
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=E1234EXAMPLE \
  --statistics Sum \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600

# Ver erros 4xx e 5xx
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name 4xxErrorRate \
  --dimensions Name=DistributionId,Value=E1234EXAMPLE \
  --statistics Average \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300
```

---

**Dica**: Salve estes comandos em um arquivo local para referência rápida!
