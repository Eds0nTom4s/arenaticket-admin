/**
 * Store Pinia para gerenciamento de usuários
 * ArenaTicket - GDSE
 */

import { defineStore } from 'pinia';
import { usuarioService } from '@/services/usuarioService';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto, UsuarioFilters, UserRole } from '@/types/usuario';

interface UsuarioState {
  usuarios: Usuario[];
  currentUsuario: Usuario | null;
  loading: boolean;
  error: string | null;
  filters: UsuarioFilters;
}

export const useUsuarioStore = defineStore('usuario', {
  state: (): UsuarioState => ({
    usuarios: [],
    currentUsuario: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      status: 'todos',
      role: null,
    },
  }),

  getters: {
    /**
     * Retorna usuários filtrados com base nos filtros ativos
     */
    usuariosFiltrados: (state): Usuario[] => {
      let filtered = [...state.usuarios];

      // Filtrar por busca (nome ou telefone)
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase().trim();
        filtered = filtered.filter(
          (u) =>
            u.nome.toLowerCase().includes(search) ||
            u.telefone.includes(search)
        );
      }

      // Filtrar por status
      if (state.filters.status === 'ativos') {
        filtered = filtered.filter((u) => u.ativo === true);
      } else if (state.filters.status === 'inativos') {
        filtered = filtered.filter((u) => u.ativo === false);
      }

      // Filtrar por role
      if (state.filters.role) {
        filtered = filtered.filter((u) => u.role === state.filters.role);
      }

      return filtered;
    },

    /**
     * Retorna apenas usuários ativos
     */
    usuariosAtivos: (state): Usuario[] => {
      return state.usuarios.filter((u) => u.ativo);
    },

    /**
     * Retorna apenas usuários inativos
     */
    usuariosInativos: (state): Usuario[] => {
      return state.usuarios.filter((u) => !u.ativo);
    },

    /**
     * Total de usuários
     */
    totalUsuarios: (state): number => {
      return state.usuarios.length;
    },

    /**
     * Total de usuários ativos
     */
    totalAtivos: (state): number => {
      return state.usuarios.filter((u) => u.ativo).length;
    },

    /**
     * Total de usuários inativos
     */
    totalInativos: (state): number => {
      return state.usuarios.filter((u) => !u.ativo).length;
    },

    /**
     * Retorna usuários agrupados por role
     */
    usuariosPorRole: (state) => {
      return state.usuarios.reduce((acc, usuario) => {
        if (!acc[usuario.role]) {
          acc[usuario.role] = [];
        }
        acc[usuario.role].push(usuario);
        return acc;
      }, {} as Record<UserRole, Usuario[]>);
    },
  },

  actions: {
    /**
     * Busca todos os usuários
     */
    async fetchUsuarios(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.usuarios = await usuarioService.getAll();
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Erro ao carregar usuários';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Busca apenas usuários ativos
     */
    async fetchUsuariosAtivos(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.usuarios = await usuarioService.getActives();
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Erro ao carregar usuários';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Busca um usuário por ID
     */
    async fetchUsuarioById(id: string): Promise<Usuario> {
      this.loading = true;
      this.error = null;
      try {
        this.currentUsuario = await usuarioService.getById(id);
        return this.currentUsuario;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Erro ao carregar usuário';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cria um novo usuário
     */
    async createUsuario(data: CreateUsuarioDto): Promise<Usuario> {
      this.loading = true;
      this.error = null;
      try {
        const newUsuario = await usuarioService.create(data);
        this.usuarios.push(newUsuario);
        return newUsuario;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Erro ao criar usuário';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Atualiza um usuário existente
     */
    async updateUsuario(id: string, data: UpdateUsuarioDto): Promise<Usuario> {
      this.loading = true;
      this.error = null;
      try {
        const updatedUsuario = await usuarioService.update(id, data);
        
        // Atualizar na lista local
        const index = this.usuarios.findIndex((u) => u.id === id);
        if (index !== -1) {
          this.usuarios[index] = updatedUsuario;
        }
        
        // Atualizar currentUsuario se for o mesmo
        if (this.currentUsuario?.id === id) {
          this.currentUsuario = updatedUsuario;
        }
        
        return updatedUsuario;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Desativa um usuário (soft delete)
     */
    async deactivateUsuario(id: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await usuarioService.deactivate(id);
        
        // Atualizar status na lista local
        const usuario = this.usuarios.find((u) => u.id === id);
        if (usuario) {
          usuario.ativo = false;
        }
        
        // Atualizar currentUsuario se for o mesmo
        if (this.currentUsuario?.id === id) {
          this.currentUsuario.ativo = false;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Erro ao desativar usuário';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Reativa um usuário
     */
    async activateUsuario(id: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await usuarioService.activate(id);
        
        // Atualizar status na lista local
        const usuario = this.usuarios.find((u) => u.id === id);
        if (usuario) {
          usuario.ativo = true;
        }
        
        // Atualizar currentUsuario se for o mesmo
        if (this.currentUsuario?.id === id) {
          this.currentUsuario.ativo = true;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Erro ao reativar usuário';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Define um filtro específico
     */
    setFilter<K extends keyof UsuarioFilters>(filterType: K, value: UsuarioFilters[K]): void {
      this.filters[filterType] = value;
    },

    /**
     * Limpa todos os filtros
     */
    clearFilters(): void {
      this.filters = {
        search: '',
        status: 'todos',
        role: null,
      };
    },

    /**
     * Define o usuário atual
     */
    setCurrentUsuario(usuario: Usuario | null): void {
      this.currentUsuario = usuario;
    },

    /**
     * Limpa o erro
     */
    clearError(): void {
      this.error = null;
    },
  },
});
