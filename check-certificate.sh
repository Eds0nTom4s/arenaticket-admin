#!/bin/bash

# Script para verificar status do certificado SSL

CERT_ARN="arn:aws:acm:us-east-1:903630464832:certificate/bdefee14-7d93-4385-9c60-09970d2586c0"

echo "🔍 Verificando status do certificado SSL..."
echo ""

STATUS=$(aws acm describe-certificate \
  --certificate-arn "$CERT_ARN" \
  --region us-east-1 \
  --query "Certificate.Status" \
  --output text)

echo "Status atual: $STATUS"
echo ""

if [ "$STATUS" == "ISSUED" ]; then
    echo "✅ Certificado validado e emitido!"
    echo ""
    echo "🚀 Próximo passo: Configurar CloudFront"
    echo "   $ ./setup-cloudfront.sh"
elif [ "$STATUS" == "PENDING_VALIDATION" ]; then
    echo "⏳ Certificado aguardando validação DNS"
    echo ""
    echo "📋 Registros DNS necessários:"
    aws acm describe-certificate \
      --certificate-arn "$CERT_ARN" \
      --region us-east-1 \
      --query "Certificate.DomainValidationOptions[*].[DomainName,ResourceRecord.Name,ResourceRecord.Type,ResourceRecord.Value]" \
      --output table
    echo ""
    echo "💡 Adicione o registro CNAME acima no seu DNS"
    echo "   Aguarde 5-30 minutos após adicionar"
    echo ""
    echo "🔄 Verificar novamente: ./check-certificate.sh"
else
    echo "❌ Status: $STATUS"
    echo ""
    echo "Detalhes completos:"
    aws acm describe-certificate \
      --certificate-arn "$CERT_ARN" \
      --region us-east-1 \
      --output table
fi
