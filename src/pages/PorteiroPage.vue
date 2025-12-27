<template>
  <div class="space-y-4 sm:space-y-6">
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold">Interface do Porteiro</h1>
        <p class="text-xs sm:text-sm text-gray-600">Validação rápida de bilhetes na entrada</p>
      </div>
      <button @click="limpar" class="btn-secondary w-full sm:w-auto" v-if="bilhete || error">Limpar</button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
      <!-- Área de validação -->
      <div class="md:col-span-7 space-y-4">
        <div class="card space-y-4">
          <label class="text-xs font-medium text-gray-600">Código do Bilhete</label>
          <input ref="inputRef" v-model="codigo" type="text" placeholder="Escaneie ou digite o código" class="input text-base sm:text-lg font-mono tracking-wide" @keyup.enter="validar" />
          <div class="flex flex-col sm:flex-row gap-3">
            <button @click="validar" :disabled="loading || !codigo" class="btn-primary flex-1">
              <span v-if="!loading">Consultar Bilhete</span>
              <span v-else>Consultando...</span>
            </button>
          </div>
          <div class="text-xs text-gray-500">Formato aceito: código completo ou compacto.</div>

          <!-- Tratamento de erro com destaque para "já utilizado" -->
          <div v-if="error" :class="error.toLowerCase().includes('já utilizado') ? 'bg-yellow-50 border-2 border-yellow-400 text-yellow-800' : 'bg-red-50 text-red-700'" class="p-3 sm:p-4 rounded text-xs sm:text-sm font-medium">
            <div class="flex items-start gap-2">
              <span class="text-lg">{{ error.toLowerCase().includes('já utilizado') ? '⚠️' : '❌' }}</span>
              <div>
                <div class="font-bold mb-1">{{ error.toLowerCase().includes('já utilizado') ? 'Bilhete Já Utilizado' : 'Erro de Validação' }}</div>
                <div>{{ error }}</div>
              </div>
            </div>
          </div>
          
          <div v-if="bilhete && bilhete.status === 'VALID'" class="p-3 rounded bg-green-50 text-green-700 text-xs sm:text-sm font-medium flex items-center gap-2">
            ✅ Bilhete válido - pronto para confirmar.
          </div>
          <div v-if="bilhete && bilhete.status === 'USED'" class="p-3 rounded bg-blue-50 text-blue-700 text-xs sm:text-sm">⚠️ Já utilizado em {{ formatDate(bilhete.utilizadoEm) }}</div>
          <div v-if="bilhete && bilhete.status === 'CANCELLED'" class="p-3 rounded bg-red-100 text-red-700 text-xs sm:text-sm">❌ Cancelado</div>
          <div v-if="bilhete && bilhete.status === 'EXPIRED'" class="p-3 rounded bg-gray-100 text-gray-700 text-xs sm:text-sm">⏱ Expirado</div>
        </div>

        <!-- Scanner de QR Code -->
        <div class="card space-y-3">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 class="text-base sm:text-lg font-semibold">Scanner de QR Code</h2>
            <button @click="toggleScanner" :class="scannerAtivo ? 'btn-danger' : 'btn-primary'" class="w-full sm:w-auto">
              {{ scannerAtivo ? 'Parar Scanner' : 'Iniciar Scanner' }}
            </button>
          </div>
          <div 
            v-show="scannerAtivo" 
            id="qr-reader" 
            class="w-full min-h-[300px] rounded overflow-hidden border-2 border-gray-300 bg-black"
            style="position: relative; width: 100%;"
          ></div>
          <div v-if="scannerError" class="p-3 rounded bg-red-50 text-red-700 text-xs sm:text-sm">
            <strong>⚠️ Erro:</strong> {{ scannerError }}
            <div class="mt-2 text-[10px]">
              Dica: Certifique-se de que permitiu acesso à câmera nas configurações do navegador.
              <br>Chrome: Configurações → Site settings → Câmera → Permitir
            </div>
          </div>
          <div v-if="scannerAtivo" class="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            📷 Aponte a câmera para o QR Code do bilhete. A detecção é automática.
          </div>
        </div>

        <!-- Detalhes -->
        <div v-if="bilhete" class="card space-y-3">
          <h2 class="text-base sm:text-lg font-semibold">Detalhes</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-xs text-gray-500">Código</div>
              <div class="font-mono font-semibold text-xs sm:text-sm">{{ bilhete.codigoTicketCompact }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Status</div>
              <div :class="statusClass(bilhete.status)" class="px-2 py-1 rounded text-xs font-semibold inline-block">{{ statusLabel(bilhete.status) }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Comprador</div>
              <div class="font-medium text-xs sm:text-sm">{{ bilhete.compradorNome }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Telefone</div>
              <div class="text-xs sm:text-sm">{{ bilhete.compradorTelefone }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Vendido Em</div>
              <div class="text-xs sm:text-sm">{{ formatDate(bilhete.vendidoEm) }}</div>
            </div>
            <div v-if="bilhete.utilizadoEm">
              <div class="text-xs text-gray-500">Utilizado Em</div>
              <div class="text-xs sm:text-sm">{{ formatDate(bilhete.utilizadoEm) }}</div>
            </div>
          </div>
        </div>

        <!-- Seção de Check-in -->
        <div v-if="ticketValidado && bilheteValidado && bilheteValidado.status === 'VALID'" class="card space-y-4">
          <h2 class="text-base sm:text-lg font-semibold text-green-700">✅ Check-in</h2>
          <p class="text-sm text-gray-600">Bilhete validado com sucesso. Confirme o check-in para permitir a entrada.</p>
          
          <div class="bg-green-50 rounded p-4 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-green-800">Evento:</span>
              <span class="text-sm text-green-700">{{ bilheteValidado.eventoTitulo || 'Evento' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-green-800">Lote:</span>
              <span class="text-sm text-green-700">{{ bilheteValidado.loteNome || 'N/A' }}</span>
            </div>
          </div>
          
          <button @click="iniciarCheckIn" :disabled="confirmando" class="w-full btn-primary">
            <span v-if="!confirmando">✓ Confirmar Check-in</span>
            <span v-else>Confirmando...</span>
          </button>
        </div>
      </div>

      <!-- Últimos Check-ins -->
      <div class="md:col-span-5 space-y-4">
        <div class="card">
          <h2 class="text-base sm:text-lg font-semibold mb-3">Últimos Check-ins</h2>
          <div v-if="ultimos.length === 0" class="text-xs text-gray-500">Nenhum ainda.</div>
          <div v-else class="space-y-2">
            <div v-for="b in ultimos" :key="b.id" class="border rounded p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm gap-2">
              <div>
                <div class="font-mono text-xs font-semibold">{{ b.codigoTicketCompact }}</div>
                <div class="text-[10px] text-gray-500">{{ formatDate(b.utilizadoEm || b.vendidoEm) }}</div>
              </div>
              <div :class="statusClass(b.status)" class="px-2 py-1 rounded text-[10px] font-semibold">{{ statusLabel(b.status) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalhes do Bilhete -->
    <div v-if="showModalBilhete && bilheteValidado" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" @click.self="fecharModalBilhete">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" :class="statusIconClass(bilheteValidado.status)">
            <svg v-if="bilheteValidado.status === 'VALID'" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="bilheteValidado.status === 'USED'" class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="bilheteValidado.status === 'CANCELLED'" class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Detalhes do Bilhete</h3>
            <div class="bg-gray-50 rounded p-4 space-y-3 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Código:</span>
                <span class="font-mono font-semibold">{{ bilheteValidado.codigoTicketCompact }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Status:</span>
                <span :class="statusClass(bilheteValidado.status)" class="px-2 py-1 rounded text-xs font-semibold">
                  {{ statusText(bilheteValidado.status) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Comprador:</span>
                <span class="font-medium">{{ bilheteValidado.compradorNome || 'N/A' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Telefone:</span>
                <span>{{ bilheteValidado.compradorTelefone || 'N/A' }}</span>
              </div>
              <div v-if="bilheteValidado.eventoTitulo" class="flex justify-between items-center">
                <span class="text-gray-600">Evento:</span>
                <span class="font-medium">{{ bilheteValidado.eventoTitulo }}</span>
              </div>
              <div v-if="bilheteValidado.loteNome" class="flex justify-between items-center">
                <span class="text-gray-600">Lote:</span>
                <span>{{ bilheteValidado.loteNome }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Vendido em:</span>
                <span class="text-xs">{{ formatDate(bilheteValidado.vendidoEm) }}</span>
              </div>
              <div v-if="bilheteValidado.status === 'USED' && bilheteValidado.utilizadoEm" class="flex justify-between items-center">
                <span class="text-red-600 font-medium">Check-in realizado em:</span>
                <span class="text-xs font-semibold text-red-700">{{ formatDate(bilheteValidado.utilizadoEm) }}</span>
              </div>
              <div v-else-if="bilheteValidado.status === 'USED'" class="flex justify-between items-center">
                <span class="text-red-600 font-medium">Status:</span>
                <span class="text-xs font-semibold text-red-700">Bilhete já utilizado</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3">
          <button @click="fecharModalBilhete" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            Fechar
          </button>
          <button 
            v-if="bilheteValidado.status === 'VALID'" 
            @click="confirmarCheckin" 
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            ✅ Confirmar Check-in
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação de Check-In -->
    <div v-if="mostrarModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" @click.self="cancelarCheckIn">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmar Check-In</h3>
            <p class="text-sm text-gray-600 mb-4">Deseja realmente confirmar a entrada deste bilhete?</p>
            
            <div v-if="bilheteValidado" class="bg-gray-50 rounded p-3 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Código:</span>
                <span class="font-mono font-semibold">{{ bilheteValidado.codigoTicketCompact }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Comprador:</span>
                <span class="font-medium">{{ bilheteValidado.compradorNome }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Telefone:</span>
                <span>{{ bilheteValidado.compradorTelefone }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Evento:</span>
                <span class="font-medium">{{ bilheteValidado.eventoTitulo || 'Evento' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <button @click="cancelarCheckIn" :disabled="confirmando" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            Cancelar
          </button>
          <button @click="confirmarCheckIn" :disabled="confirmando" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <span v-if="!confirmando">✓ Confirmar Entrada</span>
            <span v-else>Confirmando...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Sucesso do Check-In -->
    <div v-if="mostrarModalSucesso" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" @click.self="fecharModalSucesso">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">✅ Check-in Realizado!</h3>
            <p class="text-sm text-gray-600 mb-4">{{ mensagemSucesso }}</p>
            
            <div v-if="bilheteCheckIn" class="bg-green-50 rounded p-3 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Código:</span>
                <span class="font-mono font-semibold text-green-800">{{ bilheteCheckIn.codigoTicketCompact }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Comprador:</span>
                <span class="font-medium text-green-800">{{ bilheteCheckIn.compradorNome }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Telefone:</span>
                <span class="text-green-800">{{ bilheteCheckIn.compradorTelefone }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button @click="fecharModalSucesso" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
            Fechar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Erro do Check-In -->
    <div v-if="mostrarModalErro" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" @click.self="fecharModalErro">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
        <div class="flex items-start gap-4">
          <!-- Ícone dinâmico baseado no tipo de erro -->
          <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" :class="getErrorBgClass(errorType)">
            <span class="text-2xl">{{ getErrorIcon(errorType) }}</span>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2" :class="getErrorTextClass(errorType)">
              {{ getErrorTitle(errorType) }}
            </h3>
            <p class="text-sm text-gray-600">{{ mensagemErro }}</p>
            
            <!-- Dicas específicas por tipo de erro -->
            <div v-if="errorType === 'Check-in Fechado'" class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <strong>🔒 Dica:</strong> O check-in ainda não foi aberto. Entre em contato com o administrador do evento.
            </div>
            <div v-else-if="errorType === 'Bilhete Já Utilizado'" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              <strong>ℹ️ Informação:</strong> Este bilhete já passou pelo check-in anteriormente.
            </div>
            <div v-else-if="errorType === 'Bilhete Expirado' || errorType === 'Bilhete Cancelado'" class="mt-3 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
              <strong>⚠️ Atenção:</strong> Direcione o cliente ao suporte ou bilheteria.
            </div>
            <div v-else-if="errorType === 'Evento Incorreto'" class="mt-3 p-3 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
              <strong>🎫 Atenção:</strong> Verifique se o cliente está na entrada correta do evento.
            </div>
            <div v-else-if="errorType === 'Evento Encerrado'" class="mt-3 p-3 bg-gray-100 border border-gray-300 rounded text-xs text-gray-700">
              <strong>⏱️ Evento finalizado:</strong> Não é mais possível realizar check-in.
            </div>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button @click="fecharModalErro" class="px-4 py-2 rounded-lg font-medium" :class="getErrorButtonClass(errorType)">
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useCheckInStore } from '@/store/checkin'
import type { Bilhete } from '@/types/evento'
import { Html5Qrcode } from 'html5-qrcode'

const store = useCheckInStore()
const checkinStore = store // Alias para manter compatibilidade
const codigo = ref('')
const bilhete = ref<Bilhete | null>(null)
const loading = ref(false)
const confirmando = ref(false)
const error = ref<string | null>(null)
const errorType = ref<string | null>(null) // Tipo de erro do backend
const inputRef = ref<HTMLInputElement | null>(null)
const mostrarModal = ref(false)

// Estados para controlar o fluxo validação vs check-in
const bilheteValidado = ref<Bilhete | null>(null)
const ticketValidado = ref(false)

// Novos estados para modais de feedback
const mostrarModalSucesso = ref(false)
const mostrarModalErro = ref(false)
const mostrarModalDetalhes = ref(false)
const mensagemSucesso = ref('')
const mensagemErro = ref('')
const bilheteCheckIn = ref<Bilhete | null>(null)

// Alias para as variáveis dos modais (para manter consistência)
const showModalBilhete = mostrarModalDetalhes
const showModalSucesso = mostrarModalSucesso
const showModalErro = mostrarModalErro
const erroMensagem = mensagemErro

const ultimos = store.ultimosCheckIns

// Scanner QR
const scannerAtivo = ref(false)
const scannerError = ref<string | null>(null)
let html5QrCode: Html5Qrcode | null = null

onMounted(() => {
  inputRef.value?.focus()
})

onBeforeUnmount(() => {
  if (html5QrCode && scannerAtivo.value) {
    html5QrCode.stop().catch(console.error)
  }
})

async function toggleScanner() {
  if (scannerAtivo.value) {
    await pararScanner()
  } else {
    await iniciarScanner()
  }
}

async function iniciarScanner() {
  scannerError.value = null
  try {
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode('qr-reader', {
        verbose: true, // Ativar logs para debug
        formatsToSupport: undefined
      })
    }
    
    // Configuração otimizada para Android com renderização de vídeo
    const config = {
      fps: 10,
      qrbox: function(viewfinderWidth: number, viewfinderHeight: number) {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
        const qrboxSize = Math.floor(minEdge * 0.6)
        return {
          width: qrboxSize,
          height: qrboxSize
        }
      },
      aspectRatio: 1.0,
      disableFlip: false,
      videoConstraints: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }
    
    const onScanSuccess = (decodedText: string) => {
      console.log('QR Code detectado (bruto):', decodedText)
      
      // Extrair código do bilhete da URL ou usar o texto direto
      const codigoExtraido = extrairCodigoDoBilhete(decodedText)
      console.log('Código extraído:', codigoExtraido)
      
      codigo.value = codigoExtraido
      validar()
      pararScanner()
    }
    
    const onScanFailure = (_error: string) => {
      // Silenciar erros de scan (normal quando não há QR no frame)
      // console.log('Scan error:', _error)
    }
    
    // Tentar obter lista de câmeras
    try {
      const devices = await Html5Qrcode.getCameras()
      console.log('Câmeras disponíveis:', devices)
      
      if (devices && devices.length > 0) {
        // Preferir câmera traseira
        const rearCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('traseira') ||
          device.label.toLowerCase().includes('environment')
        )
        
        const cameraId = rearCamera ? rearCamera.id : devices[devices.length - 1]?.id
        
        console.log('Usando câmera:', rearCamera?.label || devices[devices.length - 1]?.label)
        
        // Iniciar com ID específico da câmera
        if (cameraId) {
          await html5QrCode.start(
            cameraId,
            config,
            onScanSuccess,
            onScanFailure
          )
        } else {
          throw new Error('Nenhuma câmera com ID disponível')
        }
      } else {
        // Fallback: usar constraints de facingMode
        console.log('Usando facingMode: environment')
        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          onScanSuccess,
          onScanFailure
        )
      }
    } catch (err) {
      console.warn('Erro ao listar câmeras, tentando facingMode:', err)
      try {
        await html5QrCode.start(
          { facingMode: { exact: 'environment' } },
          config,
          onScanSuccess,
          onScanFailure
        )
      } catch (err2) {
        console.warn('Câmera traseira não disponível, tentando frontal:', err2)
        await html5QrCode.start(
          { facingMode: 'user' },
          config,
          onScanSuccess,
          onScanFailure
        )
      }
    }
    
    scannerAtivo.value = true
    console.log('Scanner iniciado com sucesso')
  } catch (err: any) {
    scannerError.value = 'Erro ao acessar câmera. Verifique as permissões no navegador.'
    console.error('Erro scanner:', err)
    scannerAtivo.value = false
  }
}

async function pararScanner() {
  if (html5QrCode && scannerAtivo.value) {
    try {
      await html5QrCode.stop()
      scannerAtivo.value = false
    } catch (err) {
      console.error('Erro ao parar scanner:', err)
    }
  }
}

/**
 * Extrai o código do bilhete de uma URL ou retorna o texto original
 * Exemplos:
 * - https://arenaticket.gdse.ao/bilhete/GDSE76833507 → GDSE76833507
 * - http://localhost:3000/bilhete/ABC123XYZ → ABC123XYZ
 * - GDSE76833507 → GDSE76833507 (já é código)
 */
function extrairCodigoDoBilhete(texto: string): string {
  const textoTrimmed = texto.trim()
  
  // Tentar extrair de URL
  try {
    // Padrão: /bilhete/CODIGO ou /bilhetes/CODIGO
    const match = textoTrimmed.match(/\/bilhetes?\/([A-Z0-9]+)/i)
    if (match && match[1]) {
      return match[1].toUpperCase()
    }
    
    // Tentar parsear como URL completa
    const url = new URL(textoTrimmed)
    const pathParts = url.pathname.split('/').filter(p => p.length > 0)
    
    // Se o último segmento parecer um código (letras e números)
    const ultimoSegmento = pathParts[pathParts.length - 1]
    if (ultimoSegmento && /^[A-Z0-9]+$/i.test(ultimoSegmento)) {
      return ultimoSegmento.toUpperCase()
    }
  } catch (e) {
    // Não é uma URL válida, continuar
  }
  
  // Se não conseguiu extrair de URL, retornar texto original (já é um código)
  return textoTrimmed.toUpperCase()
}

async function validar() {
  if (!codigo.value.trim()) return
  loading.value = true
  error.value = null
  errorType.value = null
  bilhete.value = null
  bilheteValidado.value = null
  ticketValidado.value = false
  
  try {
    // POST /porteiro/validar - Valida ticket sem fazer check-in
    const resultado = await store.validarTicket(codigo.value.trim().toUpperCase())
    if (resultado) {
      bilhete.value = resultado
      bilheteValidado.value = resultado
      ticketValidado.value = true
      // Mostrar modal com detalhes do bilhete
      showModalBilhete.value = true
    }
  } catch (e: any) {
    // Capturar tipo de erro se disponível
    errorType.value = e.type || null
    // Mostrar modal de erro
    mensagemErro.value = e.message || 'Erro ao validar bilhete. Tente novamente.'
    mostrarModalErro.value = true
  }
  
  loading.value = false
}

async function confirmarCheckIn() {
  if (!bilheteValidado.value) return
  mostrarModal.value = false
  confirmando.value = true
  
  try {
    // POST /porteiro/checkin - FAZ O CHECK-IN
    await store.validarBilhete(bilheteValidado.value.codigoTicketCompact, bilheteValidado.value.eventoId)
    
    // Mostrar modal de sucesso
    bilheteCheckIn.value = bilheteValidado.value
    mensagemSucesso.value = `Check-in realizado com sucesso para o ticket ${bilheteValidado.value.codigoTicketCompact} - ${bilheteValidado.value.compradorNome}`
    mostrarModalSucesso.value = true
    
    // Limpar dados do bilhete validado
    bilhete.value = null
    bilheteValidado.value = null
    ticketValidado.value = false
    error.value = null
    errorType.value = null
    codigo.value = ''
    
  } catch (e: any) {
    // Capturar tipo de erro se disponível
    errorType.value = e.type || null
    // Mostrar modal de erro em vez de definir error.value
    mensagemErro.value = e.message || 'Erro ao fazer check-in. Tente novamente.'
    mostrarModalErro.value = true
  } finally {
    confirmando.value = false
  }
}

function iniciarCheckIn() {
  if (bilheteValidado.value) {
    mostrarModal.value = true
  }
}

function cancelarCheckIn() {
  mostrarModal.value = false
}

function fecharModalSucesso() {
  mostrarModalSucesso.value = false
  bilheteCheckIn.value = null
  inputRef.value?.focus()
}

function fecharModalErro() {
  mostrarModalErro.value = false
  mensagemErro.value = ''
  errorType.value = null
}

function limpar() {
  bilhete.value = null
  bilheteValidado.value = null
  ticketValidado.value = false
  error.value = null
  errorType.value = null
  codigo.value = ''
  inputRef.value?.focus()
}

function formatDate(d: string | null | undefined) {
  if (!d) return '-'
  try {
    const date = new Date(d)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '-'
  }
}
function statusLabel(s: Bilhete['status']) {
  return { VALID: 'Válido', USED: 'Utilizado', CANCELLED: 'Cancelado', EXPIRED: 'Expirado' }[s] || s
}
function statusClass(s: Bilhete['status']) {
  switch (s) {
    case 'VALID': return 'bg-green-100 text-green-700'
    case 'USED': return 'bg-red-100 text-red-700'
    case 'CANCELLED': return 'bg-red-100 text-red-700'
    case 'EXPIRED': return 'bg-gray-200 text-gray-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
function statusText(s: Bilhete['status']) {
  return { VALID: 'Válido', USED: 'Utilizado', CANCELLED: 'Cancelado', EXPIRED: 'Expirado' }[s] || s
}
function statusIconClass(s: Bilhete['status']) {
  switch (s) {
    case 'VALID': return 'bg-green-100'
    case 'USED': return 'bg-red-100'
    case 'CANCELLED': return 'bg-red-100'
    case 'EXPIRED': return 'bg-gray-200'
    default: return 'bg-gray-100'
  }
}
function fecharModalBilhete() {
  showModalBilhete.value = false
  bilheteValidado.value = null
}

/**
 * Retorna o ícone apropriado baseado no tipo de erro
 */
function getErrorIcon(type: string | null): string {
  const icons: Record<string, string> = {
    'Check-in Fechado': '🔒',
    'Bilhete Já Utilizado': 'ℹ️',
    'Bilhete Expirado': '⏱️',
    'Bilhete Cancelado': '❌',
    'Evento Encerrado': '🚧',
    'Evento Incorreto': '🎫'
  }
  return icons[type || ''] || '⚠️'
}

/**
 * Retorna o título apropriado baseado no tipo de erro
 */
function getErrorTitle(type: string | null): string {
  const titles: Record<string, string> = {
    'Check-in Fechado': 'Check-in Fechado',
    'Bilhete Já Utilizado': 'Bilhete Já Utilizado',
    'Bilhete Expirado': 'Bilhete Expirado',
    'Bilhete Cancelado': 'Bilhete Cancelado',
    'Evento Encerrado': 'Evento Encerrado',
    'Evento Incorreto': 'Evento Incorreto'
  }
  return titles[type || ''] || 'Erro de Validação'
}

/**
 * Retorna a classe CSS para o fundo do ícone baseado no tipo de erro
 */
function getErrorBgClass(type: string | null): string {
  const classes: Record<string, string> = {
    'Check-in Fechado': 'bg-yellow-100',
    'Bilhete Já Utilizado': 'bg-blue-100',
    'Bilhete Expirado': 'bg-gray-100',
    'Bilhete Cancelado': 'bg-red-100',
    'Evento Encerrado': 'bg-gray-100',
    'Evento Incorreto': 'bg-orange-100'
  }
  return classes[type || ''] || 'bg-red-100'
}

/**
 * Retorna a classe CSS para o texto do título baseado no tipo de erro
 */
function getErrorTextClass(type: string | null): string {
  const classes: Record<string, string> = {
    'Check-in Fechado': 'text-yellow-800',
    'Bilhete Já Utilizado': 'text-blue-800',
    'Bilhete Expirado': 'text-gray-800',
    'Bilhete Cancelado': 'text-red-800',
    'Evento Encerrado': 'text-gray-800',
    'Evento Incorreto': 'text-orange-800'
  }
  return classes[type || ''] || 'text-red-800'
}

/**
 * Retorna a classe CSS para o botão baseado no tipo de erro
 */
function getErrorButtonClass(type: string | null): string {
  const classes: Record<string, string> = {
    'Check-in Fechado': 'bg-yellow-600 text-white hover:bg-yellow-700',
    'Bilhete Já Utilizado': 'bg-blue-600 text-white hover:bg-blue-700',
    'Bilhete Expirado': 'bg-gray-600 text-white hover:bg-gray-700',
    'Bilhete Cancelado': 'bg-red-600 text-white hover:bg-red-700',
    'Evento Encerrado': 'bg-gray-600 text-white hover:bg-gray-700',
    'Evento Incorreto': 'bg-orange-600 text-white hover:bg-orange-700'
  }
  return classes[type || ''] || 'bg-red-600 text-white hover:bg-red-700'
}

async function confirmarCheckin() {
  if (!bilheteValidado.value) return
  
  try {
    await checkinStore.validarBilhete(bilheteValidado.value.codigoTicket, bilheteValidado.value.eventoId)
    showModalBilhete.value = false
    showModalSucesso.value = true
    bilheteValidado.value = null
  } catch (error: any) {
    showModalBilhete.value = false
    showModalErro.value = true
    erroMensagem.value = error.message || 'Erro ao realizar check-in'
    bilheteValidado.value = null
  }
}
</script>

<style>
/* Garantir que o scanner de QR Code funcione corretamente em Android */
#qr-reader {
  position: relative;
  background: #000;
}

/* Forçar visibilidade do vídeo em Android */
#qr-reader video {
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  min-height: 300px !important;
  display: block !important;
  object-fit: contain !important;
  background: #000;
  z-index: 1;
}

/* Container interno */
#qr-reader > div {
  min-height: 300px !important;
  width: 100% !important;
  position: relative !important;
}

/* Canvas de overlay do QR */
#qr-reader canvas {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 2 !important;
}

/* Garantir que elementos internos sejam visíveis */
#qr-reader * {
  max-width: 100%;
}
</style>

<style scoped>
.card { @apply bg-white rounded-lg shadow-sm border border-gray-200 p-5; }
.input { @apply border border-gray-300 rounded px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full; }
.btn-primary { @apply bg-blue-600 text-white px-4 py-3 rounded font-medium hover:bg-blue-700 disabled:opacity-50; }
.btn-confirm { @apply bg-green-600 text-white px-4 py-3 rounded font-medium hover:bg-green-700 disabled:opacity-50; }
.btn-secondary { @apply bg-gray-100 text-gray-800 px-4 py-2 rounded font-medium hover:bg-gray-200; }
.btn-danger { @apply bg-red-600 text-white px-4 py-3 rounded font-medium hover:bg-red-700 disabled:opacity-50; }
</style>
