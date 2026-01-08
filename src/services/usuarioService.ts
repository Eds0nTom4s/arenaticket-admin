/**
 * Service para gerenciamento de usuários
 * ArenaTicket - GDSE
 */

import { api } from '@/utils/api';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '@/types/usuario';

const BASE_PATH = '/admin/usuarios';

export const usuarioService = {
  /**
   * Busca todos os usuários
   */
  async getAll(): Promise<Usuario[]> {
    try {
      return await api<Usuario[]>(BASE_PATH);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Erro ao carregar usuários');
      }
      throw new Error('Erro ao carregar usuários');
    }
  },

  /**
   * Busca apenas usuários ativos
   */
  async getActives(): Promise<Usuario[]> {
    try {
      return await api<Usuario[]>(`${BASE_PATH}/ativos`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Erro ao carregar usuários ativos');
      }
      throw new Error('Erro ao carregar usuários ativos');
    }
  },

  /**
   * Busca um usuário por ID
   */
  async getById(id: string): Promise<Usuario> {
    try {
      return await api<Usuario>(`${BASE_PATH}/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Usuário não encontrado');
      }
      throw new Error('Usuário não encontrado');
    }
  },

  /**
   * Cria um novo usuário
   */
  async create(data: CreateUsuarioDto): Promise<Usuario> {
    try {
      return await api<Usuario>(BASE_PATH, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof Error) {
        // Mensagens amigáveis para erros comuns
        const message = error.message;
        if (message.includes('telefone')) {
          throw new Error('Este telefone já está cadastrado');
        }
        throw new Error(message || 'Erro ao criar usuário');
      }
      throw new Error('Erro ao criar usuário');
    }
  },

  /**
   * Atualiza um usuário existente
   */
  async update(id: string, data: UpdateUsuarioDto): Promise<Usuario> {
    try {
      // Remover senha se vazia (não alterar)
      const payload = { ...data };
      if (!payload.senha || payload.senha.trim() === '') {
        delete payload.senha;
      }

      return await api<Usuario>(`${BASE_PATH}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (error instanceof Error) {
        const message = error.message;
        if (message.includes('telefone')) {
          throw new Error('Este telefone já está cadastrado');
        }
        if (message.includes('não encontrado')) {
          throw new Error('Usuário não encontrado');
        }
        throw new Error(message || 'Erro ao atualizar usuário');
      }
      throw new Error('Erro ao atualizar usuário');
    }
  },

  /**
   * Desativa um usuário (soft delete)
   */
  async deactivate(id: string): Promise<void> {
    try {
      await api<void>(`${BASE_PATH}/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Erro ao desativar usuário');
      }
      throw new Error('Erro ao desativar usuário');
    }
  },

  /**
   * Reativa um usuário
   */
  async activate(id: string): Promise<void> {
    try {
      await api<void>(`${BASE_PATH}/${id}/ativar`, {
        method: 'PATCH',
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Erro ao reativar usuário');
      }
      throw new Error('Erro ao reativar usuário');
    }
  },
};
