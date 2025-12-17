<script setup lang="ts">
import type { BilheteVendaPresencial } from '@/types/evento'

interface Props {
  bilhetes: BilheteVendaPresencial[]
}

defineProps<Props>()

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Luanda'
  }).format(date)
}
</script>

<template>
  <div class="bilhetes-impressao">
    <!-- Cada bilhete em uma página separada -->
    <div 
      v-for="(bilhete, index) in bilhetes" 
      :key="bilhete.id"
      class="bilhete-page"
      :class="{ 'page-break': index < bilhetes.length - 1 }"
    >
      <div class="bilhete-container">
        <!-- Cabeçalho -->
        <div class="bilhete-header">
          <div class="logo-area">
            <h1 class="brand">ArenaTicket</h1>
            <p class="tagline">Seu Bilhete para a Diversão</p>
          </div>
        </div>

        <!-- Código do Bilhete (destaque) -->
        <div class="codigo-principal">
          <div class="codigo-label">CÓDIGO DO BILHETE</div>
          <div class="codigo-valor">{{ bilhete.codigoTicket }}</div>
        </div>

        <!-- QR Code -->
        <div class="qr-code-area">
          <img :src="bilhete.codigoQR" alt="QR Code" class="qr-code-img" />
          <p class="qr-instrucao">Apresente este QR Code na entrada</p>
        </div>

        <!-- Informações do Evento -->
        <div class="evento-info">
          <div class="info-section">
            <h2 class="evento-titulo">{{ bilhete.evento }}</h2>
          </div>

          <div class="info-row">
            <div class="info-item">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <div class="info-label">Data e Hora</div>
                <div class="info-value">{{ formatDate(bilhete.dataEvento) }}</div>
              </div>
            </div>
          </div>

          <div class="info-row">
            <div class="info-item">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div class="info-label">Local</div>
                <div class="info-value">{{ bilhete.evento }}</div>
              </div>
            </div>
          </div>

          <div class="info-row">
            <div class="info-item">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <div>
                <div class="info-label">Lote</div>
                <div class="info-value">{{ bilhete.lote }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Informações do Comprador -->
        <div class="comprador-info">
          <div class="info-row">
            <div class="info-item">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <div class="info-label">Comprador</div>
                <div class="info-value">{{ bilhete.compradorNome }}</div>
              </div>
            </div>
          </div>

          <div class="info-row">
            <div class="info-item preco-destaque">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <div class="info-label">Valor</div>
                <div class="info-value preco">{{ formatCurrency(bilhete.preco) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rodapé -->
        <div class="bilhete-footer">
          <div class="footer-item">
            <span class="footer-label">Bilhete #:</span>
            <span class="footer-value">{{ index + 1 }} de {{ bilhetes.length }}</span>
          </div>
          <div class="footer-divider">•</div>
          <div class="footer-item">
            <span class="footer-label">ID:</span>
            <span class="footer-value">{{ bilhete.id.substring(0, 8) }}</span>
          </div>
        </div>

        <!-- Aviso Legal -->
        <div class="aviso-legal">
          <p><strong>IMPORTANTE:</strong> Este bilhete é válido apenas para o evento especificado.</p>
          <p>Não é permitida a entrada após o horário de início do evento.</p>
          <p>Bilhete não reembolsável. Válido para uma única entrada.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para Visualização em Tela */
.bilhetes-impressao {
  width: 100%;
  max-width: 80mm; /* Largura de papel térmico padrão */
  margin: 0 auto;
  background: white;
}

.bilhete-page {
  background: white;
  padding: 10mm;
  margin-bottom: 5mm;
}

.bilhete-container {
  width: 100%;
}

/* Cabeçalho */
.bilhete-header {
  text-align: center;
  border-bottom: 2px dashed #e5e7eb;
  padding-bottom: 3mm;
  margin-bottom: 3mm;
}

.brand {
  font-size: 24px;
  font-weight: 800;
  color: #1e40af;
  margin: 0;
  letter-spacing: -0.5px;
}

.tagline {
  font-size: 11px;
  color: #6b7280;
  margin: 2px 0 0 0;
}

/* Código Principal */
.codigo-principal {
  background: #f3f4f6;
  border-radius: 6px;
  padding: 3mm;
  text-align: center;
  margin-bottom: 3mm;
}

.codigo-label {
  font-size: 10px;
  color: #6b7280;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 1mm;
}

.codigo-valor {
  font-size: 20px;
  font-weight: 700;
  color: #1e40af;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

/* QR Code */
.qr-code-area {
  text-align: center;
  margin: 3mm 0;
  padding: 3mm;
  background: #f9fafb;
  border-radius: 6px;
}

.qr-code-img {
  width: 40mm;
  height: 40mm;
  display: block;
  margin: 0 auto;
  border: 2px solid #e5e7eb;
  border-radius: 4px;
  background: white;
}

.qr-instrucao {
  font-size: 10px;
  color: #6b7280;
  margin: 2mm 0 0 0;
  font-weight: 500;
}

/* Informações do Evento */
.evento-info {
  margin: 3mm 0;
  border-top: 2px dashed #e5e7eb;
  padding-top: 3mm;
}

.evento-titulo {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 3mm 0;
  text-align: center;
  line-height: 1.3;
}

.info-row {
  margin-bottom: 2mm;
}

.info-item {
  display: flex;
  gap: 2mm;
  align-items: flex-start;
  padding: 2mm;
  background: #f9fafb;
  border-radius: 4px;
}

.info-icon {
  width: 18px;
  height: 18px;
  color: #3b82f6;
  flex-shrink: 0;
}

.info-label {
  font-size: 9px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 1px;
}

.info-value {
  font-size: 13px;
  color: #111827;
  font-weight: 600;
}

.preco-destaque {
  background: #dbeafe;
  border: 1px solid #93c5fd;
}

.preco {
  font-size: 16px;
  color: #1e40af;
  font-weight: 700;
}

/* Comprador */
.comprador-info {
  margin: 3mm 0;
  border-top: 2px dashed #e5e7eb;
  padding-top: 3mm;
}

/* Rodapé */
.bilhete-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2mm;
  margin: 3mm 0;
  padding: 2mm;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 9px;
}

.footer-item {
  display: flex;
  gap: 1mm;
}

.footer-label {
  color: #6b7280;
  font-weight: 500;
}

.footer-value {
  color: #111827;
  font-weight: 600;
}

.footer-divider {
  color: #d1d5db;
}

/* Aviso Legal */
.aviso-legal {
  font-size: 8px;
  color: #6b7280;
  line-height: 1.4;
  margin-top: 3mm;
  padding-top: 3mm;
  border-top: 1px dashed #e5e7eb;
  text-align: center;
}

.aviso-legal p {
  margin: 1mm 0;
}

/* Estilos para Impressão */
@media print {
  body {
    margin: 0;
    padding: 0;
  }

  .bilhetes-impressao {
    max-width: 80mm;
    width: 80mm;
  }

  .bilhete-page {
    margin: 0;
    padding: 0;
    page-break-inside: avoid;
  }

  .page-break {
    page-break-after: always;
  }

  /* Ocultar elementos desnecessários na impressão */
  @page {
    size: 80mm auto;
    margin: 0;
  }

  /* Garantir que QR code seja impresso em alta qualidade */
  .qr-code-img {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Garantir que cores sejam impressas */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

@media screen and (max-width: 480px) {
  .bilhetes-impressao {
    max-width: 100%;
  }
}
</style>
