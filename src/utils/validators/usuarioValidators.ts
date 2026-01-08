/**
 * Validadores para formulários de usuário
 * ArenaTicket - GDSE
 */

import type { UserRole } from '@/types/usuario';

/**
 * Valida o nome do usuário
 */
export const validarNome = (nome: string): string | null => {
  if (!nome || nome.trim().length < 3) {
    return 'O nome deve ter pelo menos 3 caracteres';
  }
  if (nome.trim().length > 100) {
    return 'O nome deve ter no máximo 100 caracteres';
  }
  return null;
};

/**
 * Valida o telefone (formato angolano)
 */
export const validarTelefone = (telefone: string): string | null => {
  if (!telefone) {
    return 'O telefone é obrigatório';
  }

  // Remover espaços e caracteres especiais
  const cleaned = telefone.replace(/\D/g, '');

  // Validar formato angolano (9 dígitos começando com 9)
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return null;
  }

  // Validar com código do país (+244)
  if (cleaned.length === 12 && cleaned.startsWith('244') && cleaned[3] === '9') {
    return null;
  }

  return 'Telefone inválido. Use formato: 923456789 ou +244923456789';
};

/**
 * Valida a senha
 * @param senha - Senha a validar
 * @param isEdit - Se true, senha é opcional (edição)
 */
export const validarSenha = (senha: string, isEdit = false): string | null => {
  // Senha é opcional na edição
  if (isEdit && (!senha || senha.trim() === '')) {
    return null;
  }

  if (!senha || senha.length < 6) {
    return 'A senha deve ter pelo menos 6 caracteres';
  }

  if (senha.length > 50) {
    return 'A senha deve ter no máximo 50 caracteres';
  }

  return null;
};

/**
 * Valida se a confirmação de senha corresponde à senha
 */
export const validarConfirmacaoSenha = (senha: string, confirmacao: string): string | null => {
  if (senha !== confirmacao) {
    return 'As senhas não correspondem';
  }
  return null;
};

/**
 * Valida o role/perfil do usuário
 */
export const validarRole = (role: string): string | null => {
  const rolesValidos: UserRole[] = ['ADMIN', 'VENDEDOR', 'PORTEIRO', 'MONITORING'];

  if (!role || !rolesValidos.includes(role as UserRole)) {
    return 'Selecione um perfil válido';
  }

  return null;
};

/**
 * Formata o telefone para o formato padrão (9 dígitos)
 */
export const formatarTelefone = (telefone: string): string => {
  const cleaned = telefone.replace(/\D/g, '');
  
  // Se começar com 244, remover (código do país)
  if (cleaned.startsWith('244')) {
    return cleaned.substring(3);
  }
  
  return cleaned;
};

/**
 * Formata o telefone para exibição com código do país
 */
export const formatarTelefoneDisplay = (telefone: string): string => {
  const cleaned = formatarTelefone(telefone);
  return `+244 ${cleaned}`;
};
