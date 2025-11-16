# Documentação Técnica - API de Lotes de Bilhetes

## Endpoint para Criação de Lotes

**URL:** `POST /api/v1/admin/lotes`

**Autenticação:** Requer token JWT com role `ADMIN`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Estrutura do Payload

```json
{
  "eventoId": "uuid-do-evento",
  "nome": "1º Lote - Arquibancada",
  "preco": 2500.00,
  "quantidadeTotal": 500,
  "inicioVenda": "2025-11-20T08:00:00+01:00",
  "fimVenda": "2025-12-15T23:59:00+01:00"
}
```

---

## Campos do Formulário

### 1. **eventoId** (obrigatório)
- **Tipo:** UUID
- **Descrição:** ID do evento ao qual o lote pertence
- **Validação:** Deve ser um UUID válido de um evento existente
- **Frontend:** Campo `select` populado com eventos disponíveis (GET `/api/v1/admin/eventos`)

---

### 2. **nome** (obrigatório)
- **Tipo:** String
- **Descrição:** Nome identificador do lote
- **Exemplos:** "1º Lote - Arquibancada", "VIP - Camarote", "Promocional"
- **Validação:** Não pode ser vazio
- **Frontend:** Campo `input type="text"`

---

### 3. **preco** (obrigatório)
- **Tipo:** Decimal (BigDecimal)
- **Descrição:** Preço unitário do bilhete em Kwanzas
- **Formato:** Número com 2 casas decimais (ex: 2500.00)
- **Validação:** Deve ser maior que 0.01
- **Frontend:** 
  - Campo `input type="number"` com `step="0.01"` e `min="0.01"`
  - Placeholder: "Ex: 2500.00"

---

### 4. **quantidadeTotal** (obrigatório)
- **Tipo:** Integer
- **Descrição:** Quantidade total de bilhetes disponíveis no lote
- **Validação:** Deve ser maior ou igual a 1
- **Frontend:** 
  - Campo `input type="number"` com `min="1"` e `step="1"` (sem casas decimais)
  - Placeholder: "Ex: 500"

---

### 5. **inicioVenda** (obrigatório)
- **Tipo:** OffsetDateTime (ISO 8601)
- **Descrição:** Data/hora de início da disponibilidade do lote para venda
- **Formato esperado pelo backend:** `"2025-11-20T08:00:00+01:00"` (ISO 8601 com timezone)
- **Validação:** Deve ser uma data válida
- **Frontend:** 
  - **Campo 1:** `input type="date"` para a data (formato navegador: `YYYY-MM-DD`)
  - **Campo 2:** `input type="time"` para a hora (formato navegador: `HH:mm`, **sem segundos**)
  - **Conversão JavaScript:** Combinar data + hora + timezone fixo `+01:00` (Angola)
  
**Exemplo de conversão:**
```javascript
const dataInicio = "2025-11-20";  // valor do input type="date"
const horaInicio = "08:00";        // valor do input type="time"

// Montar string ISO 8601
const inicioVenda = `${dataInicio}T${horaInicio}:00+01:00`;
// Resultado: "2025-11-20T08:00:00+01:00"
```

---

### 6. **fimVenda** (obrigatório)
- **Tipo:** OffsetDateTime (ISO 8601)
- **Descrição:** Data/hora de encerramento da venda do lote
- **Formato esperado:** `"2025-12-15T23:59:00+01:00"`
- **Validação:** Deve ser posterior a `inicioVenda`
- **Frontend:** 
  - **Campo 1:** `input type="date"` para a data
  - **Campo 2:** `input type="time"` para a hora (**sem segundos**)
  - **Conversão:** Idêntica ao campo `inicioVenda`

**Exemplo de conversão:**
```javascript
const dataFim = "2025-12-15";
const horaFim = "23:59";

const fimVenda = `${dataFim}T${horaFim}:00+01:00`;
// Resultado: "2025-12-15T23:59:00+01:00"
```

---

## ⚠️ Formato de Data/Hora - IMPORTANTE

### ❌ **NÃO USAR:**
- ❌ Formato americano (MM/DD/YYYY)
- ❌ Campos de segundos ou milissegundos no formulário (o backend aceita, mas não são necessários)
- ❌ Conceito de "intervalo de evento" (não existe para lotes)
- ❌ Múltiplos fusos horários (sempre usar `+01:00` fixo)

### ✅ **USAR:**
- ✅ Formato ISO 8601: `YYYY-MM-DDTHH:mm:ss+01:00`
- ✅ Campos separados no formulário: 
  - `<input type="date">` para a data
  - `<input type="time">` para a hora (sem segundos)
- ✅ Timezone fixo de Angola: `+01:00` (UTC+1)
- ✅ Segundos sempre como `:00` ao montar o payload

---

## Exemplo Completo de Payload

```json
{
  "eventoId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "nome": "1º Lote - Arquibancada",
  "preco": 2500.00,
  "quantidadeTotal": 500,
  "inicioVenda": "2025-11-20T08:00:00+01:00",
  "fimVenda": "2025-12-15T23:59:00+01:00"
}
```

---

## Resposta de Sucesso (201 Created)

```json
{
  "id": "uuid-do-lote-criado",
  "eventoId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "nome": "1º Lote - Arquibancada",
  "preco": 2500.00,
  "quantidadeTotal": 500,
  "quantidadeReservada": 0,
  "quantidadeVendida": 0,
  "quantidadeDisponivel": 500,
  "inicioVenda": "2025-11-20T08:00:00+01:00",
  "fimVenda": "2025-12-15T23:59:00+01:00",
  "createdAt": "2025-11-16T02:30:00+01:00",
  "updatedAt": null
}
```

### Campos Somente Leitura (não enviar no POST):
- `id` - Gerado automaticamente pelo sistema
- `quantidadeReservada` - Calculado pelo sistema (reservas temporárias)
- `quantidadeVendida` - Calculado pelo sistema (bilhetes vendidos)
- `quantidadeDisponivel` - Calculado: `total - reservada - vendida`
- `createdAt` / `updatedAt` - Timestamps automáticos

---

## Erros Comuns

### 400 Bad Request - Validação de Campos
```json
{
  "timestamp": "2025-11-16T02:30:00+01:00",
  "status": 400,
  "error": "Validation Error",
  "message": "Erro de validação: {preco=O preço deve ser maior que zero}",
  "path": "/api/v1/admin/lotes"
}
```

**Causas comuns:**
- Campo obrigatório vazio
- Preço menor ou igual a zero
- Quantidade total menor que 1
- Formato de data inválido

---

### 404 Not Found - Evento Inexistente
```json
{
  "timestamp": "2025-11-16T02:30:00+01:00",
  "status": 404,
  "error": "Not Found",
  "message": "Evento não encontrado",
  "path": "/api/v1/admin/lotes"
}
```

**Causa:** O UUID do evento informado não existe no sistema.

---

### 401 Unauthorized - Token Inválido
```json
{
  "timestamp": "2025-11-16T02:30:00+01:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Token inválido ou expirado",
  "path": "/api/v1/admin/lotes"
}
```

**Causa:** Token JWT ausente, inválido ou expirado. Fazer login novamente em `/api/v1/auth/login`.

---

## Endpoint de Atualização de Lotes

**URL:** `PUT /api/v1/admin/lotes/{id}`

**Payload:** Idêntico ao POST, incluindo todos os campos obrigatórios.

**Observação:** Não é possível alterar as quantidades `quantidadeReservada` e `quantidadeVendida` (são gerenciadas automaticamente pelo sistema durante o processo de compra).

---

## Endpoint de Listagem de Lotes

**URL:** `GET /api/v1/admin/lotes`

**Resposta:** Array de objetos `LoteBilheteDTO` com todos os lotes cadastrados.

```json
[
  {
    "id": "uuid-lote-1",
    "eventoId": "uuid-evento",
    "nome": "1º Lote - Arquibancada",
    "preco": 2500.00,
    "quantidadeTotal": 500,
    "quantidadeReservada": 12,
    "quantidadeVendida": 238,
    "quantidadeDisponivel": 250,
    "inicioVenda": "2025-11-20T08:00:00+01:00",
    "fimVenda": "2025-12-15T23:59:00+01:00",
    "createdAt": "2025-11-10T10:00:00+01:00",
    "updatedAt": "2025-11-15T14:30:00+01:00"
  }
]
```

---

## Fluxo Recomendado no Frontend

1. **Ao abrir o formulário de criação:**
   - Carregar lista de eventos: `GET /api/v1/admin/eventos`
   - Popular o `<select>` de eventos

2. **Preencher campos do formulário:**
   - Nome do lote
   - Preço (com 2 casas decimais)
   - Quantidade total (inteiro)
   - Data/hora de início (campos separados)
   - Data/hora de fim (campos separados)

3. **Ao submeter:**
   - Validar campos no frontend (campo vazio, preço > 0, quantidade >= 1)
   - Converter data + hora → formato ISO 8601 com `+01:00`
   - Fazer POST para `/api/v1/admin/lotes`

4. **Tratar resposta:**
   - **201:** Exibir mensagem de sucesso e redirecionar para lista de lotes
   - **400:** Exibir erros de validação próximo aos campos correspondentes
   - **404:** Exibir "Evento não encontrado" (não deveria ocorrer se select está populado corretamente)
   - **401:** Redirecionar para login

---

## Exemplo de Código React/TypeScript

```typescript
interface LoteFormData {
  eventoId: string;
  nome: string;
  preco: number;
  quantidadeTotal: number;
  dataInicio: string;    // YYYY-MM-DD
  horaInicio: string;    // HH:mm
  dataFim: string;       // YYYY-MM-DD
  horaFim: string;       // HH:mm
}

const criarLote = async (formData: LoteFormData) => {
  const payload = {
    eventoId: formData.eventoId,
    nome: formData.nome,
    preco: formData.preco,
    quantidadeTotal: formData.quantidadeTotal,
    inicioVenda: `${formData.dataInicio}T${formData.horaInicio}:00+01:00`,
    fimVenda: `${formData.dataFim}T${formData.horaFim}:00+01:00`
  };

  const response = await fetch('http://localhost:8080/api/v1/admin/lotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
};
```

---

## Notas Importantes

1. **Não há conceito de intervalo para lotes** - Os campos `inicioVenda` e `fimVenda` controlam apenas o período de **disponibilidade comercial** do lote, não têm relação com o horário do evento em si.

2. **Timezone fixo:** Todas as datas devem usar `+01:00` (Africa/Luanda). Não permitir que o usuário altere o fuso horário.

3. **Segundos sempre `:00`:** Embora o backend aceite segundos, o formulário não precisa desse nível de precisão. Sempre enviar `:00` ao montar o ISO 8601.

4. **Validação de datas:** Idealmente, validar no frontend que `fimVenda` é posterior a `inicioVenda`.

5. **Campos somente leitura na edição:** Ao editar um lote existente, exibir `quantidadeReservada`, `quantidadeVendida` e `quantidadeDisponivel` como campos desabilitados (não enviar no PUT).

---

## Suporte

Para dúvidas ou problemas com a API, consultar a equipe de backend ou acessar a documentação Swagger em:

**URL Swagger:** `http://localhost:8080/swagger-ui`
