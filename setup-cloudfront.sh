#!/bin/bash

# Script para configurar CloudFront Distribution
# Execute após criar o bucket S3

set -e

BUCKET_NAME="admin.arenaticket.gdse.ao"
DOMAIN_NAME="admin.arenaticket.gdse.ao"
CERTIFICATE_ARN="arn:aws:acm:us-east-1:903630464832:certificate/bdefee14-7d93-4385-9c60-09970d2586c0"

echo "🌐 Criando CloudFront Distribution..."

# Criar arquivo de configuração da distribuição
cat > /tmp/cloudfront-config.json <<EOF
{
    "CallerReference": "$(date +%s)",
    "Comment": "ArenaTicket Admin - ${DOMAIN_NAME}",
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-${BUCKET_NAME}",
                "DomainName": "${BUCKET_NAME}.s3-website-us-east-1.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-${BUCKET_NAME}",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "Compress": true,
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "Aliases": {
        "Quantity": 1,
        "Items": ["${DOMAIN_NAME}"]
    },
    "ViewerCertificate": {
        "ACMCertificateArn": "${CERTIFICATE_ARN}",
        "SSLSupportMethod": "sni-only",
        "MinimumProtocolVersion": "TLSv1.2_2021"
    }
}
EOF

if [ -z "$CERTIFICATE_ARN" ]; then
    echo "❌ CERTIFICATE_ARN não configurado!"
    echo "Crie um certificado SSL no AWS Certificate Manager (ACM) para ${DOMAIN_NAME}"
    echo "Região: us-east-1 (obrigatório para CloudFront)"
    echo "Depois adicione o ARN neste script e execute novamente."
    exit 1
fi

# Criar distribuição
DISTRIBUTION=$(aws cloudfront create-distribution \
    --distribution-config file:///tmp/cloudfront-config.json \
    --output json)

DISTRIBUTION_ID=$(echo $DISTRIBUTION | jq -r '.Distribution.Id')
DISTRIBUTION_DOMAIN=$(echo $DISTRIBUTION | jq -r '.Distribution.DomainName')

echo "✅ CloudFront Distribution criada!"
echo "📋 Distribution ID: ${DISTRIBUTION_ID}"
echo "🌐 CloudFront Domain: ${DISTRIBUTION_DOMAIN}"
echo ""
echo "📝 Próximos passos:"
echo "   1. Adicione o DISTRIBUTION_ID no arquivo deploy.sh"
echo "   2. Configure o DNS (Route 53):"
echo "      Tipo: CNAME"
echo "      Nome: admin.arenaticket.gdse.ao"
echo "      Valor: ${DISTRIBUTION_DOMAIN}"
echo "   3. Aguarde a propagação do CloudFront (~15-20 minutos)"
