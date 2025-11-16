import { useAuthStore } from '@/store/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

interface UploadResponse {
  success: boolean
  url: string
  filename: string
  size: number
  message: string
}

export async function uploadBanner(file: File): Promise<string> {
  const auth = useAuthStore()
  
  if (!auth.token) {
    throw new Error('Usuário não autenticado')
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/admin/upload/banner`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao fazer upload' }))
    throw new Error(error.message || 'Erro ao fazer upload')
  }

  const data: UploadResponse = await response.json()
  return data.url
}

export async function deleteBanner(url: string): Promise<void> {
  const auth = useAuthStore()
  
  if (!auth.token) {
    throw new Error('Usuário não autenticado')
  }

  const response = await fetch(`${BASE_URL}/admin/upload/banner?url=${encodeURIComponent(url)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao deletar banner' }))
    throw new Error(error.message || 'Erro ao deletar banner')
  }
}
