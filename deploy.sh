#!/bin/bash

# Script de Deploy para AWS S3 + CloudFront
# Domínio: admin.arenaticket.gdse.ao

set -e

echo "🚀 Iniciando deploy do ArenaTicket Admin..."

# Configurações
BUCKET_NAME="admin.arenaticket.gdse.ao"
REGION="us-east-1"
CLOUDFRONT_DISTRIBUTION_ID="EHBD3TO31AV5M"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Build do projeto
echo -e "${BLUE}📦 Fazendo build do projeto...${NC}"
npm run build

# 2. Verificar se o bucket existe, caso contrário criar
echo -e "${BLUE}🪣 Verificando bucket S3...${NC}"
if aws s3 ls "s3://${BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${YELLOW}Bucket não existe. Criando...${NC}"
    aws s3 mb "s3://${BUCKET_NAME}" --region "${REGION}"
    
    # Configurar bucket para site estático
    aws s3 website "s3://${BUCKET_NAME}" \
        --index-document index.html \
        --error-document index.html
    
    echo -e "${GREEN}✅ Bucket criado com sucesso!${NC}"
else
    echo -e "${GREEN}✅ Bucket já existe${NC}"
fi

# 3. Configurar política do bucket para acesso público via CloudFront
echo -e "${BLUE}🔐 Configurando políticas do bucket...${NC}"

# Desabilitar Block Public Access (se necessário)
aws s3api put-public-access-block \
    --bucket "${BUCKET_NAME}" \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" 2>/dev/null || true

# Aguardar um pouco para a configuração propagar
sleep 2

cat > /tmp/bucket-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket "${BUCKET_NAME}" \
    --policy file:///tmp/bucket-policy.json 2>/dev/null || echo -e "${YELLOW}⚠️  Aviso: Não foi possível configurar política pública. CloudFront pode ser configurado com OAI.${NC}"

# 4. Sincronizar arquivos com S3
echo -e "${BLUE}☁️  Fazendo upload dos arquivos para S3...${NC}"
aws s3 sync dist/ "s3://${BUCKET_NAME}/" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "*.html"

# Upload do index.html sem cache
aws s3 cp dist/index.html "s3://${BUCKET_NAME}/index.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

echo -e "${GREEN}✅ Upload concluído!${NC}"

# 5. Invalidar cache do CloudFront (se CLOUDFRONT_DISTRIBUTION_ID estiver definido)
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${BLUE}🔄 Invalidando cache do CloudFront...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
        --paths "/*"
    echo -e "${GREEN}✅ Cache invalidado!${NC}"
else
    echo -e "${YELLOW}⚠️  CLOUDFRONT_DISTRIBUTION_ID não configurado. Pule a invalidação de cache.${NC}"
fi

echo -e "${GREEN}✨ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}🌐 URL do bucket: http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com${NC}"
echo -e "${BLUE}📝 Próximos passos:${NC}"
echo -e "   1. Configure o CloudFront apontando para o bucket S3"
echo -e "   2. Configure o certificado SSL no ACM para admin.arenaticket.gdse.ao"
echo -e "   3. Adicione o CLOUDFRONT_DISTRIBUTION_ID neste script"
echo -e "   4. Configure o DNS (Route 53) apontando admin.arenaticket.gdse.ao para o CloudFront"
