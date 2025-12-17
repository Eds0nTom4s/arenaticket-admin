#!/bin/bash

# Quick Deploy Guide - ArenaTicket Admin
# Domain: admin.arenaticket.gdse.ao

echo "🚀 ArenaTicket Admin - Quick Deploy Guide"
echo "=========================================="
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não instalado!"
    echo "Instale: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI não configurado!"
    echo "Execute: aws configure"
    exit 1
fi

echo "✅ AWS CLI configurado"
echo ""

# Show current AWS identity
echo "📋 Conta AWS atual:"
aws sts get-caller-identity --query "[Account,Arn]" --output table
echo ""

# Menu
echo "Escolha uma opção:"
echo "1) 🆕 Deploy Inicial (primeira vez)"
echo "2) 🔄 Deploy de Atualização"
echo "3) 🌐 Configurar CloudFront"
echo "4) 📊 Status da Infraestrutura"
echo "5) 🗑️  Deletar Infraestrutura"
echo "0) ❌ Sair"
echo ""
read -p "Opção: " choice

case $choice in
    1)
        echo ""
        echo "🆕 DEPLOY INICIAL"
        echo "================"
        echo ""
        echo "Pré-requisitos:"
        echo "✅ Certificado SSL criado no ACM (us-east-1) para admin.arenaticket.gdse.ao"
        echo "✅ DNS (Route 53) acessível"
        echo ""
        read -p "Continuar? (y/n): " confirm
        if [ "$confirm" == "y" ]; then
            ./deploy.sh
            echo ""
            echo "📝 Próximo passo: Execute './quick-deploy.sh' e escolha opção 3 para configurar CloudFront"
        fi
        ;;
    2)
        echo ""
        echo "🔄 DEPLOY DE ATUALIZAÇÃO"
        echo "======================="
        ./deploy.sh
        ;;
    3)
        echo ""
        echo "🌐 CONFIGURAR CLOUDFRONT"
        echo "======================="
        echo ""
        read -p "Você já tem o ARN do certificado SSL? (y/n): " has_cert
        if [ "$has_cert" == "y" ]; then
            read -p "Cole o ARN do certificado: " cert_arn
            sed -i "s|CERTIFICATE_ARN=\"\"|CERTIFICATE_ARN=\"$cert_arn\"|" setup-cloudfront.sh
            ./setup-cloudfront.sh
        else
            echo ""
            echo "❌ Você precisa criar um certificado SSL primeiro!"
            echo "1. Acesse: AWS Console > Certificate Manager (us-east-1)"
            echo "2. Request Certificate > Public certificate"
            echo "3. Domain: admin.arenaticket.gdse.ao"
            echo "4. Validation: DNS (adicione os registros CNAME no Route 53)"
            echo "5. Copie o ARN e execute este script novamente"
        fi
        ;;
    4)
        echo ""
        echo "📊 STATUS DA INFRAESTRUTURA"
        echo "==========================="
        echo ""
        
        # Check S3 Bucket
        echo "🪣 S3 Bucket:"
        if aws s3 ls s3://admin.arenaticket.gdse.ao 2>/dev/null; then
            BUCKET_SIZE=$(aws s3 ls s3://admin.arenaticket.gdse.ao --recursive --summarize | grep "Total Size" | awk '{print $3}')
            echo "   ✅ Existe ($(numfmt --to=iec-i --suffix=B $BUCKET_SIZE))"
        else
            echo "   ❌ Não existe"
        fi
        echo ""
        
        # Check CloudFront
        echo "🌐 CloudFront Distributions:"
        aws cloudfront list-distributions \
            --query "DistributionList.Items[?Aliases.Items[?contains(@, 'admin.arenaticket.gdse.ao')]].{ID:Id,Status:Status,Domain:DomainName}" \
            --output table 2>/dev/null || echo "   ❌ Nenhuma distribuição encontrada"
        echo ""
        
        # Check Route 53
        echo "🌍 DNS Records (Route 53):"
        HOSTED_ZONE=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='gdse.ao.'].Id" --output text 2>/dev/null)
        if [ -n "$HOSTED_ZONE" ]; then
            aws route53 list-resource-record-sets \
                --hosted-zone-id "$HOSTED_ZONE" \
                --query "ResourceRecordSets[?Name=='admin.arenaticket.gdse.ao.'].[Name,Type,AliasTarget.DNSName]" \
                --output table 2>/dev/null || echo "   ❌ Registro não encontrado"
        else
            echo "   ❌ Hosted Zone 'gdse.ao' não encontrada"
        fi
        ;;
    5)
        echo ""
        echo "🗑️  DELETAR INFRAESTRUTURA"
        echo "========================="
        echo ""
        echo "⚠️  ATENÇÃO: Isso irá deletar TODOS os recursos!"
        read -p "Digite 'DELETE' para confirmar: " confirm
        if [ "$confirm" == "DELETE" ]; then
            echo "Deletando recursos..."
            
            # Delete CloudFront (precisa do ID)
            read -p "Distribution ID do CloudFront: " dist_id
            if [ -n "$dist_id" ]; then
                echo "Desabilitando distribuição..."
                aws cloudfront get-distribution-config --id "$dist_id" > /tmp/cf-config.json
                # TODO: Desabilitar e deletar CloudFront (processo complexo)
                echo "⚠️  CloudFront requer desabilitação manual antes de deletar"
            fi
            
            # Delete S3 Bucket
            echo "Deletando bucket S3..."
            aws s3 rb s3://admin.arenaticket.gdse.ao --force
            
            echo "✅ Recursos deletados!"
        else
            echo "❌ Operação cancelada"
        fi
        ;;
    0)
        echo "👋 Até logo!"
        exit 0
        ;;
    *)
        echo "❌ Opção inválida!"
        exit 1
        ;;
esac
