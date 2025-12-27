<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-[var(--color-text)]">Check-In de Bilhetes</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-1">Validação e entrada de bilhetes no evento</p>
      </div>
    </div>

    <!-- Scanner/Input de Código -->
    <div class="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
      <div class="text-center mb-4 sm:mb-6">
        <div class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full mb-3 sm:mb-4">
          <svg class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Escanear ou Digitar Código</h2>
        <p class="text-xs sm:text-sm text-gray-600">Digite o código do bilhete ou use um leitor de QR Code</p>
      </div>

      <form @submit.prevent="validarCodigo" class="max-w-xl mx-auto">
        <div class="flex flex-col sm:flex-row gap-3">
          <input 
            ref="codigoInput"
            v-model="codigoDigitado" 
            type="text" 
            class="flex-1 px-4 py-3 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all uppercase font-mono"
            placeholder="Digite o código..."
            :disabled="store.loading"
            autofocus
          />
          <button 
            type="submit"
            class="btn-primary px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold whitespace-nowrap"
            :disabled="store.loading || !codigoDigitado.trim()"
          >
            {{ store.loading ? 'Validando...' : 'Validar' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Resultado da Validação - Erro -->
    <div v-if="store.error" :class="store.error.toLowerCase().includes('já utilizado') ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-200'" class="card border-2">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="flex-shrink-0">
          <svg v-if="store.error.toLowerCase().includes('já utilizado')" class="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <svg v-else class="w-10 h-10 sm:w-12 sm:h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 :class="store.error.toLowerCase().includes('já utilizado') ? 'text-yellow-800' : 'text-red-800'" class="text-base sm:text-lg font-semibold">
            {{ store.error.toLowerCase().includes('já utilizado') ? '⚠️ Bilhete Já Utilizado' : '❌ Bilhete Inválido' }}
          </h3>
          <p :class="store.error.toLowerCase().includes('já utilizado') ? 'text-yellow-700' : 'text-red-600'" class="text-sm sm:text-base mt-1">{{ store.error }}</p>
        </div>
        <button @click="limparResultado" class="btn-secondary w-full sm:w-auto whitespace-nowrap">
          Nova Validação
        </button>
      </div>
    </div>

    <!-- Últimos Check-ins -->
    <div v-if="store.ultimosCheckIns.length > 0" class="card">
      <h3 class="text-base sm:text-lg font-semibold mb-4">📋 Últimos Check-Ins</h3>
      <div class="space-y-2">
        <div 
          v-for="bilhete in store.ultimosCheckIns" 
          :key="bilhete.id"
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2"
        >
          <div class="flex items-center gap-3 flex-wrap">
            <div :class="bilhete.status === 'USED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'" 
                 class="px-2 py-1 rounded text-xs font-semibold">
              {{ getStatusLabel(bilhete.status) }}
            </div>
            <div>
              <div class="font-mono text-xs sm:text-sm font-semibold">{{ bilhete.codigoTicketCompact }}</div>
              <div class="text-xs text-gray-600">{{ bilhete.compradorNome }}</div>
            </div>
          </div>
          <div class="text-left sm:text-right">
            <div class="text-xs text-gray-600">{{ formatDate(bilhete.utilizadoEm || bilhete.vendidoEm) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação de Check-In -->
    <div v-if="mostrarModal && bilheteConsultado" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" @click.self="cancelarCheckIn">
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
            
            <div class="bg-gray-50 rounded p-3 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Código:</span>
                <span class="font-mono font-semibold">{{ bilheteConsultado.codigoTicketCompact }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Comprador:</span>
                <span class="font-medium">{{ bilheteConsultado.compradorNome }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Telefone:</span>
                <span>{{ bilheteConsultado.compradorTelefone }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Status:</span>
                <span class="font-semibold text-green-600">{{ getStatusLabel(bilheteConsultado.status) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <button @click="cancelarCheckIn" :disabled="processandoCheckIn" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            Cancelar
          </button>
          <button @click="confirmarCheckIn" :disabled="processandoCheckIn" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <span v-if="!processandoCheckIn">✓ Confirmar Entrada</span>
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
            <p class="text-sm text-gray-600 mb-4">{{ mensagemErro }}</p>
            
            <!-- Dicas específicas por tipo de erro -->
            <div v-if="errorType === 'Check-in Fechado'" class="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <strong>🔒 Dica:</strong> O check-in ainda não foi aberto. Entre em contato com o administrador do evento.
            </div>
            <div v-else-if="errorType === 'Bilhete Já Utilizado'" class="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              <strong>ℹ️ Informação:</strong> Este bilhete já passou pelo check-in anteriormente.
            </div>
            <div v-else-if="errorType === 'Bilhete Expirado' || errorType === 'Bilhete Cancelado'" class="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
              <strong>⚠️ Atenção:</strong> Direcione o cliente ao suporte ou bilheteria.
            </div>
            <div v-else-if="errorType === 'Evento Incorreto'" class="p-3 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
              <strong>🎫 Atenção:</strong> Verifique se o cliente está na entrada correta do evento.
            </div>
            <div v-else-if="errorType === 'Evento Encerrado'" class="p-3 bg-gray-100 border border-gray-300 rounded text-xs text-gray-700">
              <strong>⏱️ Evento finalizado:</strong> Não é mais possível realizar check-in.
            </div>
            <div v-else class="bg-red-50 rounded p-3 text-sm text-red-800">
              <div class="font-medium mb-1">O que pode ter acontecido:</div>
              <ul class="list-disc list-inside space-y-1 text-xs">
                <li>Bilhete já foi utilizado</li>
                <li>Evento não permite check-in no momento</li>
                <li>Problema de conexão com o servidor</li>
                <li>Código do bilhete inválido</li>
              </ul>
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
import { ref, onMounted } from 'vue'
import { useCheckInStore } from '@/store/checkin'

const store = useCheckInStore()
const codigoDigitado = ref('')
const codigoInput = ref<HTMLInputElement>()
const processandoCheckIn = ref(false)
const mostrarModal = ref(false)
const bilheteConsultado = ref<any>(null)

// Novos estados para modais de feedback
const mostrarModalSucesso = ref(false)
const mostrarModalErro = ref(false)
const mensagemSucesso = ref('')
const mensagemErro = ref('')
const bilheteCheckIn = ref<any>(null)
const errorType = ref<string | null>(null) // Tipo de erro do backend

onMounted(() => {
  // Auto-focus no input
  codigoInput.value?.focus()
})

function getStatusLabel(status: string) {
  switch (status) {
    case 'VALID': return 'Válido'
    case 'USED': return 'Utilizado'
    case 'CANCELLED': return 'Cancelado'
    case 'EXPIRED': return 'Expirado'
    default: return status
  }
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('pt-AO', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '-'
  }
}

/**
 * Extrai o código do bilhete de uma URL ou retorna o texto original
 * Exemplos:
 * - https://arenaticket.gdse.ao/bilhete/GDSE76833507 → GDSE76833507
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

async function validarCodigo() {
  if (!codigoDigitado.value.trim()) return
  
  // Extrair código do bilhete (caso seja URL do QR Code)
  const codigoExtraido = extrairCodigoDoBilhete(codigoDigitado.value)
  console.log('Código original:', codigoDigitado.value)
  console.log('Código extraído:', codigoExtraido)
  
  try {
    // Primeiro consultar o bilhete (GET - não faz check-in)
    const resultado = await store.consultarBilhete(codigoExtraido)
    if (resultado) {
      bilheteConsultado.value = resultado
      // Se válido, mostrar modal de confirmação
      if (resultado.status === 'VALID') {
        mostrarModal.value = true
      } else {
        // Se não for válido, mostrar no store.error automaticamente
        store.error = `Bilhete com status: ${getStatusLabel(resultado.status)}`
      }
    }
  } catch (error) {
    console.error('Erro ao consultar:', error)
  }
}

async function confirmarCheckIn() {
  if (!bilheteConsultado.value) return
  mostrarModal.value = false
  processandoCheckIn.value = true
  
  try {
    // Agora sim fazer o POST para check-in
    await store.validarBilhete(bilheteConsultado.value.codigoTicketCompact, bilheteConsultado.value.eventoId)
    if (store.bilhete) {
      // Mostrar modal de sucesso
      bilheteCheckIn.value = bilheteConsultado.value
      mensagemSucesso.value = `Check-in realizado com sucesso para o ticket ${bilheteConsultado.value.codigoTicketCompact} - ${bilheteConsultado.value.compradorNome}`
      mostrarModalSucesso.value = true
      
      // Limpar dados
      limparResultado()
    }
  } catch (error: any) {
    // Capturar tipo de erro se disponível
    errorType.value = error.type || null
    // Mostrar modal de erro
    mensagemErro.value = error.message || 'Erro ao fazer check-in. Tente novamente.'
    mostrarModalErro.value = true
  } finally {
    processandoCheckIn.value = false
  }
}

function fecharModalSucesso() {
  mostrarModalSucesso.value = false
  bilheteCheckIn.value = null
  codigoInput.value?.focus()
}

function fecharModalErro() {
  mostrarModalErro.value = false
  mensagemErro.value = ''
  errorType.value = null
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
  return titles[type || ''] || 'Erro no Check-in'
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

function cancelarCheckIn() {
  mostrarModal.value = false
  bilheteConsultado.value = null
}

function limparResultado() {
  store.limparBilhete()
  codigoDigitado.value = ''
  codigoInput.value?.focus()
}
</script>
