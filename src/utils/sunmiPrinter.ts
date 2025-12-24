import type { BilheteVendaPresencial } from '@/types/evento'

// --- Interfaces para o novo SDK SunmiPrinterX ---

const Align = {
  LEFT: 0,
  CENTER: 1,
  RIGHT: 2
} as const

const ErrorLevel = {
  L: 0,
  M: 1,
  Q: 2,
  H: 3
} as const

type AlignType = typeof Align[keyof typeof Align]
type ErrorLevelType = typeof ErrorLevel[keyof typeof ErrorLevel]

interface TextStyle {
  enableBold(enable: boolean): TextStyle
  enableUnderline(enable: boolean): TextStyle
  setAlign(align: AlignType): TextStyle
  setTextSize(size: number): TextStyle
}

interface QrStyle {
  setDot(size: number): QrStyle
  setErrorLevel(level: ErrorLevelType): QrStyle
  setAlign(align: AlignType): QrStyle
}

interface LineApi {
  initLine(): void
  printText(text: string, style: TextStyle): void
  printQrCode(content: string, style: QrStyle): void
  lineWrap(lines: number): void
  autoOut(): void
  cutPaper(): void
}

interface SunmiPrinterXAPI {
  lineApi(): LineApi
  openDrawer(): void
}

// --- Interface para o SDK antigo (para referência) ---
interface SunmiPrinterAPI {
  printerInit(): void
  printText(text: string, size?: number, isBold?: boolean, isUnderline?: boolean): void
  printQRCode(content: string, moduleSize?: number, errorLevel?: number): void
  printBarCode(
    content: string,
    symbology?: number,
    height?: number,
    width?: number,
    textPosition?: number
  ): void
  printBitmap(base64: string, width?: number, height?: number): void
  lineWrap(lines?: number): void
  setAlignment(alignment: number): void // 0=left, 1=center, 2=right
  setFontSize(size: number): void
  cutPaper(): void
  openDrawer(): void
}

declare global {
  interface Window {
    // Novo SDK (ponte a ser criada no Android)
    SunmiPrinterX?: SunmiPrinterXAPI
    // SDK Antigo (será removido)
    sunmi?: {
      printer: SunmiPrinterAPI
    }
    // App wrapper customizado (existente)
    AndroidPrinter?: any
  }
}

/**
 * Utilitário para impressão de bilhetes em dispositivos SUNMI
 */
export const sunmiPrinter = {
  /**
   * Verifica se alguma impressora SUNMI está disponível
   */
  isAvailable(): boolean {
    const hasSunmiPrinterX = typeof window.SunmiPrinterX !== 'undefined'
    const hasAndroidPrinter = typeof (window as any).AndroidPrinter !== 'undefined'
    const hasOldSunmiAPI =
      typeof window.sunmi !== 'undefined' && typeof window.sunmi.printer !== 'undefined'

    console.log('🔍 Detecção impressora:', {
      hasSunmiPrinterX,
      hasAndroidPrinter,
      hasOldSunmiAPI,
      userAgent: navigator.userAgent
    })

    return hasSunmiPrinterX || hasAndroidPrinter || hasOldSunmiAPI
  },

  /**
   * Retorna o tipo de dispositivo detectado
   */
  getDeviceInfo(): string {
    if (!this.isAvailable()) {
      return 'Não detectado'
    }

    const userAgent = navigator.userAgent
    if (userAgent.includes('V2s')) return 'SUNMI V2s'
    if (userAgent.includes('V2')) return 'SUNMI V2'
    if (userAgent.includes('T2')) return 'SUNMI T2'

    return 'SUNMI (modelo desconhecido)'
  },

  /**
   * Imprime um único bilhete
   */
  async imprimirBilhete(bilhete: BilheteVendaPresencial): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Impressora SUNMI não detectada.')
    }

    // Prioridade: Novo SDK SunmiPrinterX
    if (window.SunmiPrinterX) {
      console.log('Printing with SunmiPrinterX')
      return this.imprimirViaSunmiX(bilhete, window.SunmiPrinterX)
    }

    // Fallback 1: App customizado AndroidPrinter
    const androidPrinter = (window as any).AndroidPrinter
    if (androidPrinter && androidPrinter.isAvailable()) {
      console.log('Printing with AndroidPrinter')
      return this.imprimirViaAndroid(bilhete, androidPrinter)
    }

    // Fallback 2: SDK antigo (se ainda presente)
    if (window.sunmi?.printer) {
      console.log('Printing with old Sunmi API')
      return this.imprimirViaOldSunmi(bilhete, window.sunmi.printer)
    }

    throw new Error('Nenhum método de impressão compatível foi encontrado.')
  },

  /**
   * IMPRESSÃO COM O NOVO SDK SUNMIPRINTERX
   */
  async imprimirViaSunmiX(
    bilhete: BilheteVendaPresencial,
    printer: SunmiPrinterXAPI
  ): Promise<void> {
    try {
      const lineApi = printer.lineApi()
      const textStyle = (window as any).SunmiTextStyle as TextStyle // Assumindo que o estilo também está no window
      const qrStyle = (window as any).SunmiQrStyle as QrStyle

      // === CABEÇALHO ===
      lineApi.printText('ARENATICKET\n', textStyle.setAlign(Align.CENTER).setTextSize(32).enableBold(true))
      lineApi.printText(
        'Seu Bilhete para a Diversao\n',
        textStyle.setAlign(Align.CENTER).setTextSize(20).enableBold(false)
      )
      lineApi.lineWrap(1)

      // === CÓDIGO DO BILHETE ===
      lineApi.printText(
        'CODIGO DO BILHETE\n',
        textStyle.setAlign(Align.CENTER).setTextSize(20).enableBold(false)
      )
      lineApi.printText(
        bilhete.codigoTicket + '\n',
        textStyle.setAlign(Align.CENTER).setTextSize(28).enableBold(true).enableUnderline(true)
      )
      lineApi.lineWrap(1)

      // === QR CODE ===
      lineApi.printQrCode(bilhete.codigoTicket, qrStyle.setDot(8).setErrorLevel(ErrorLevel.H).setAlign(Align.CENTER))
      lineApi.lineWrap(1)
      lineApi.printText(
        'Apresente este QR Code na entrada\n',
        textStyle.setAlign(Align.CENTER).setTextSize(18)
      )
      lineApi.lineWrap(2)

      // === INFORMAÇÕES DO EVENTO ===
      lineApi.printText('EVENTO\n', textStyle.setAlign(Align.LEFT).setTextSize(20).enableBold(true))
      lineApi.printText(
        this.truncate(bilhete.evento, 32) + '\n',
        textStyle.setAlign(Align.LEFT).setTextSize(24).enableBold(false)
      )
      lineApi.lineWrap(1)

      lineApi.printText('DATA E HORA\n', textStyle.setAlign(Align.LEFT).setTextSize(20).enableBold(true))
      lineApi.printText(
        this.formatDate(bilhete.dataEvento) + '\n',
        textStyle.setAlign(Align.LEFT).setTextSize(24).enableBold(false)
      )
      lineApi.lineWrap(1)

      lineApi.printText('LOTE\n', textStyle.setAlign(Align.LEFT).setTextSize(20).enableBold(true))
      lineApi.printText(bilhete.lote + '\n', textStyle.setAlign(Align.LEFT).setTextSize(24).enableBold(false))
      lineApi.lineWrap(1)

      lineApi.printText('PRECO\n', textStyle.setAlign(Align.LEFT).setTextSize(20).enableBold(true))
      lineApi.printText(
        this.formatCurrency(bilhete.preco) + '\n',
        textStyle.setAlign(Align.LEFT).setTextSize(28).enableBold(true)
      )
      lineApi.lineWrap(2)

      // === INFORMAÇÕES DO COMPRADOR ===
      lineApi.printText('COMPRADOR\n', textStyle.setAlign(Align.LEFT).setTextSize(20).enableBold(true))
      lineApi.printText(
        this.truncate(bilhete.compradorNome, 32) + '\n',
        textStyle.setAlign(Align.LEFT).setTextSize(24).enableBold(false)
      )
      lineApi.lineWrap(2)

      // === RODAPÉ ===
      lineApi.printText(
        '--------------------------------\n',
        textStyle.setAlign(Align.CENTER).setTextSize(20)
      )
      lineApi.printText('Bilhete valido para 1 pessoa\n', textStyle.setAlign(Align.CENTER).setTextSize(18))
      lineApi.printText('Nao e permitida a reproducao\n', textStyle.setAlign(Align.CENTER).setTextSize(18))
      lineApi.printText('Em caso de duvida, contacte:\n', textStyle.setAlign(Align.CENTER).setTextSize(18))
      lineApi.printText('suporte@arenaticket.gdse.ao\n', textStyle.setAlign(Align.CENTER).setTextSize(18))
      lineApi.lineWrap(3)

      lineApi.cutPaper()
      lineApi.autoOut()
    } catch (error) {
      console.error('Erro ao imprimir via SunmiPrinterX:', error)
      throw new Error('Falha na impressão. Verifique se a impressora está funcionando.')
    }
  },

  /**
   * IMPRESSÃO COM O SDK ANTIGO (FALLBACK)
   */
  async imprimirViaOldSunmi(
    bilhete: BilheteVendaPresencial,
    printer: SunmiPrinterAPI
  ): Promise<void> {
    try {
      printer.printerInit()
      // ... (código original do imprimirBilhete)
      printer.setAlignment(1) // Centro
      printer.printText('ARENATICKET\n', 32, true, false)
      printer.printText('Seu Bilhete para a Diversao\n', 20, false, false)
      printer.lineWrap(1)
      printer.printText('CODIGO DO BILHETE\n', 20, false, false)
      printer.printText(bilhete.codigoTicket + '\n', 28, true, true)
      printer.lineWrap(1)
      printer.printQRCode(bilhete.codigoTicket, 8, 2)
      printer.lineWrap(1)
      printer.printText('Apresente este QR Code na entrada\n', 18, false, false)
      printer.lineWrap(2)
      printer.setAlignment(0) // Esquerda
      printer.printText('EVENTO\n', 20, true, false)
      printer.printText(this.truncate(bilhete.evento, 32) + '\n', 24, false, false)
      printer.lineWrap(1)
      printer.printText('DATA E HORA\n', 20, true, false)
      printer.printText(this.formatDate(bilhete.dataEvento) + '\n', 24, false, false)
      printer.lineWrap(1)
      printer.printText('LOTE\n', 20, true, false)
      printer.printText(bilhete.lote + '\n', 24, false, false)
      printer.lineWrap(1)
      printer.printText('PRECO\n', 20, true, false)
      printer.printText(this.formatCurrency(bilhete.preco) + '\n', 28, true, false)
      printer.lineWrap(2)
      printer.printText('COMPRADOR\n', 20, true, false)
      printer.printText(this.truncate(bilhete.compradorNome, 32) + '\n', 24, false, false)
      printer.lineWrap(2)
      printer.setAlignment(1) // Centro
      printer.printText('--------------------------------\n', 20, false, false)
      printer.printText('Bilhete valido para 1 pessoa\n', 18, false, false)
      printer.printText('Nao e permitida a reproducao\n', 18, false, false)
      printer.printText('Em caso de duvida, contacte:\n', 18, false, false)
      printer.printText('suporte@arenaticket.gdse.ao\n', 18, false, false)
      printer.lineWrap(3)
      printer.cutPaper()
    } catch (error) {
      console.error('Erro ao imprimir via SUNMI (legado):', error)
      throw new Error('Falha na impressão. Verifique se a impressora está funcionando.')
    }
  },

  /**
   * Imprime múltiplos bilhetes sequencialmente
   */
  async imprimirLote(bilhetes: BilheteVendaPresencial[]): Promise<void> {
    if (bilhetes.length === 0) {
      throw new Error('Nenhum bilhete para imprimir')
    }

    for (let i = 0; i < bilhetes.length; i++) {
      const bilhete = bilhetes[i]
      if (bilhete) {
        await this.imprimirBilhete(bilhete)
        if (i < bilhetes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    }
  },

  /**
   * Abre a gaveta de dinheiro
   */
  abrirGaveta(): void {
    if (!this.isAvailable()) {
      console.warn('Impressora SUNMI não detectada')
      return
    }

    try {
      if (window.SunmiPrinterX) {
        window.SunmiPrinterX.openDrawer()
      } else if (window.sunmi?.printer) {
        window.sunmi.printer.openDrawer()
      } else {
        console.warn('Nenhum método para abrir gaveta encontrado.')
      }
    } catch (error) {
      console.error('Erro ao abrir gaveta:', error)
    }
  },

  /**
   * Imprime recibo de venda (resumo)
   */
  async imprimirRecibo(
    bilhetes: BilheteVendaPresencial[],
    metodoPagamento: string,
    pontoVenda: string
  ): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Impressora SUNMI não detectada')
    }

    const total = bilhetes.reduce((sum, b) => sum + b.preco, 0)
    const quantidade = bilhetes.length

    // Usar a nova API se disponível
    if (window.SunmiPrinterX) {
      try {
        const lineApi = window.SunmiPrinterX.lineApi()
        const textStyle = (window as any).SunmiTextStyle as TextStyle

        lineApi.printText('ARENATICKET\n', textStyle.setAlign(Align.CENTER).setTextSize(28).enableBold(true))
        lineApi.printText(
          'RECIBO DE VENDA\n',
          textStyle.setAlign(Align.CENTER).setTextSize(24).enableBold(true)
        )
        lineApi.lineWrap(1)

        lineApi.printText(
          'Data: ' + this.formatDate(new Date().toISOString()) + '\n',
          textStyle.setAlign(Align.LEFT).setTextSize(20)
        )
        lineApi.printText('Ponto: ' + pontoVenda + '\n', textStyle.setAlign(Align.LEFT).setTextSize(20))
        lineApi.lineWrap(1)

        lineApi.printText(
          '--------------------------------\n',
          textStyle.setAlign(Align.LEFT).setTextSize(20)
        )
        lineApi.printText(
          `Quantidade: ${quantidade} bilhete(s)\n`,
          textStyle.setAlign(Align.LEFT).setTextSize(22)
        )
        lineApi.printText(
          `Total: ${this.formatCurrency(total)}\n`,
          textStyle.setAlign(Align.LEFT).setTextSize(26).enableBold(true)
        )
        lineApi.printText(`Pagamento: ${metodoPagamento}\n`, textStyle.setAlign(Align.LEFT).setTextSize(22))
        lineApi.printText(
          '--------------------------------\n',
          textStyle.setAlign(Align.LEFT).setTextSize(20)
        )
        lineApi.lineWrap(2)

        lineApi.printText('Obrigado pela preferencia!\n', textStyle.setAlign(Align.CENTER).setTextSize(20))
        lineApi.lineWrap(4)

        lineApi.cutPaper()
        lineApi.autoOut()
      } catch (error) {
        console.error('Erro ao imprimir recibo com SunmiPrinterX:', error)
        throw new Error('Falha na impressão do recibo')
      }
      return
    }

    // Fallback para API antiga
    if (window.sunmi?.printer) {
      const printer = window.sunmi.printer
      try {
        printer.printerInit()
        printer.setAlignment(1)
        printer.printText('ARENATICKET\n', 28, true, false)
        printer.printText('RECIBO DE VENDA\n', 24, true, false)
        printer.lineWrap(1)
        printer.setAlignment(0)
        printer.printText('Data: ' + this.formatDate(new Date().toISOString()) + '\n', 20, false, false)
        printer.printText('Ponto: ' + pontoVenda + '\n', 20, false, false)
        printer.lineWrap(1)
        printer.printText('--------------------------------\n', 20, false, false)
        printer.printText(`Quantidade: ${quantidade} bilhete(s)\n`, 22, false, false)
        printer.printText(`Total: ${this.formatCurrency(total)}\n`, 26, true, false)
        printer.printText(`Pagamento: ${metodoPagamento}\n`, 22, false, false)
        printer.printText('--------------------------------\n', 20, false, false)
        printer.lineWrap(2)
        printer.setAlignment(1)
        printer.printText('Obrigado pela preferencia!\n', 20, false, false)
        printer.lineWrap(4)
        printer.cutPaper()
      } catch (error) {
        console.error('Erro ao imprimir recibo com API antiga:', error)
        throw new Error('Falha na impressão do recibo')
      }
    }
  },

  // === IMPRESSÃO VIA ANDROID APP (CUSTOM) ===
  imprimirViaAndroid(bilhete: BilheteVendaPresencial, printer: any): void {
    try {
      // (código original, sem alterações)
      printer.setAlignment(1)
      printer.printText('ARENATICKET\n', 30, true, false)
      printer.printText('Seu Bilhete para a Diversao\n', 20, false, false)
      printer.lineWrap(1)
      printer.printText('CODIGO DO BILHETE\n', 20, false, false)
      printer.printText(bilhete.codigoTicket + '\n', 28, true, true)
      printer.lineWrap(1)
      printer.printQRCode(bilhete.codigoTicket, 8)
      printer.lineWrap(1)
      printer.printText('Apresente este QR Code na entrada\n', 18, false, false)
      printer.lineWrap(2)
      printer.setAlignment(0)
      printer.printText('EVENTO\n', 20, true, false)
      printer.printText(this.truncate(bilhete.evento, 32) + '\n', 24, false, false)
      printer.lineWrap(1)
      printer.printText('DATA E HORA\n', 20, true, false)
      printer.printText(this.formatDate(bilhete.dataEvento) + '\n', 24, false, false)
      printer.lineWrap(1)
      printer.printText('LOTE\n', 20, true, false)
      printer.printText(bilhete.lote + '\n', 24, false, false)
      printer.lineWrap(1)
      printer.printText('PRECO\n', 20, true, false)
      printer.printText(this.formatCurrency(bilhete.preco) + '\n', 28, true, false)
      printer.lineWrap(2)
      printer.printText('COMPRADOR\n', 20, true, false)
      printer.printText(this.truncate(bilhete.compradorNome, 32) + '\n', 24, false, false)
      printer.lineWrap(2)
      printer.setAlignment(1)
      printer.printText('--------------------------------\n', 20, false, false)
      printer.printText('Bilhete valido para 1 pessoa\n', 18, false, false)
      printer.printText('Nao e permitida a reproducao\n', 18, false, false)
      printer.printText('Em caso de duvida, contacte:\n', 18, false, false)
      printer.printText('suporte@arenaticket.gdse.ao\n', 18, false, false)
      printer.lineWrap(3)
      printer.cutPaper()
      console.log('✅ Bilhete impresso via AndroidPrinter')
    } catch (error) {
      console.error('❌ Erro ao imprimir via Android:', error)
      throw new Error('Falha na impressão via Android')
    }
  },

  // === UTILITÁRIOS ===
  formatDate(isoDate: string): string {
    const date = new Date(isoDate)
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Luanda'
    }).format(date)
  },

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  },

  truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }
}
