/**
 * Tipos para o módulo de Gestão de Usuários
 * ArenaTicket - GDSE
 */

export type UserRole = 'ADMIN' | 'VENDEDOR' | 'PORTEIRO' | 'MONITORING';

export interface Usuario {
  id: string;
  nome: string;
  telefone: string;
  role: UserRole;
  ativo: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateUsuarioDto {
  nome: string;
  telefone: string;
  senha: string;
  role: UserRole;
  ativo: boolean;
}

export interface UpdateUsuarioDto {
  nome: string;
  telefone: string;
  senha?: string;
  role: UserRole;
  ativo: boolean;
}

export interface UsuarioFilters {
  search: string;
  status: 'todos' | 'ativos' | 'inativos';
  role: UserRole | null;
}

export interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  color: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'ADMIN',
    label: 'Administrador',
    description: 'Acesso total ao sistema',
    color: 'blue'
  },
  {
    value: 'VENDEDOR',
    label: 'Vendedor',
    description: 'Vendas presenciais',
    color: 'orange'
  },
  {
    value: 'PORTEIRO',
    label: 'Porteiro',
    description: 'Validação de bilhetes',
    color: 'purple'
  },
  {
    value: 'MONITORING',
    label: 'Monitoring',
    description: 'Métricas e logs',
    color: 'gray'
  }
];

export const getRoleLabel = (role: UserRole): string => {
  return ROLE_OPTIONS.find(opt => opt.value === role)?.label || role;
};

export const getRoleColor = (role: UserRole): string => {
  return ROLE_OPTIONS.find(opt => opt.value === role)?.color || 'gray';
};
