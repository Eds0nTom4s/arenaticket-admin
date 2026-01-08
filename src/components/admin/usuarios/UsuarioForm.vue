<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Nome Completo -->
    <div>
      <label for="nome" class="block text-sm font-medium text-gray-700">
        Nome Completo *
      </label>
      <input
        id="nome"
        v-model="formData.nome"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        :class="{ 'border-red-500': errors.nome }"
        placeholder="Digite o nome completo"
        @blur="validateField('nome')"
      />
      <p v-if="errors.nome" class="mt-1 text-sm text-red-600">
        {{ errors.nome }}
      </p>
    </div>

    <!-- Telefone -->
    <div>
      <label for="telefone" class="block text-sm font-medium text-gray-700">
        Telefone *
      </label>
      <input
        id="telefone"
        v-model="formData.telefone"
        type="tel"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        :class="{ 'border-red-500': errors.telefone }"
        placeholder="923456789"
        @blur="validateField('telefone')"
      />
      <p class="mt-1 text-xs text-gray-500">
        Formato: 923456789 ou +244923456789
      </p>
      <p v-if="errors.telefone" class="mt-1 text-sm text-red-600">
        {{ errors.telefone }}
      </p>
    </div>

    <!-- Senha -->
    <div>
      <label for="senha" class="block text-sm font-medium text-gray-700">
        Senha {{ isEdit ? '(deixe em branco para manter a atual)' : '*' }}
      </label>
      <input
        id="senha"
        v-model="formData.senha"
        type="password"
        :required="!isEdit"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        :class="{ 'border-red-500': errors.senha }"
        placeholder="Digite a senha"
        @blur="validateField('senha')"
      />
      <p class="mt-1 text-xs text-gray-500">
        Mínimo 6 caracteres
      </p>
      <p v-if="errors.senha" class="mt-1 text-sm text-red-600">
        {{ errors.senha }}
      </p>
    </div>

    <!-- Confirmar Senha -->
    <div v-if="formData.senha">
      <label for="confirmacaoSenha" class="block text-sm font-medium text-gray-700">
        Confirmar Senha *
      </label>
      <input
        id="confirmacaoSenha"
        v-model="formData.confirmacaoSenha"
        type="password"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        :class="{ 'border-red-500': errors.confirmacaoSenha }"
        placeholder="Confirme a senha"
        @blur="validateField('confirmacaoSenha')"
      />
      <p v-if="errors.confirmacaoSenha" class="mt-1 text-sm text-red-600">
        {{ errors.confirmacaoSenha }}
      </p>
    </div>

    <!-- Perfil de Acesso -->
    <div>
      <label for="role" class="block text-sm font-medium text-gray-700">
        Perfil de Acesso *
      </label>
      <select
        id="role"
        v-model="formData.role"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        :class="{ 'border-red-500': errors.role }"
        @blur="validateField('role')"
      >
        <option value="">Selecione...</option>
        <option
          v-for="option in roleOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }} - {{ option.description }}
        </option>
      </select>
      <p v-if="errors.role" class="mt-1 text-sm text-red-600">
        {{ errors.role }}
      </p>
    </div>

    <!-- Status -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Status
      </label>
      <div class="flex items-center gap-4">
        <label class="flex items-center">
          <input
            v-model="formData.ativo"
            type="radio"
            :value="true"
            class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">Ativo</span>
        </label>
        <label class="flex items-center">
          <input
            v-model="formData.ativo"
            type="radio"
            :value="false"
            class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">Inativo</span>
        </label>
      </div>
    </div>

    <!-- Botões -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <button
        type="button"
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        @click="$emit('cancel')"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Salvando...' : (isEdit ? 'Atualizar Usuário' : 'Criar Usuário') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ROLE_OPTIONS, type UserRole, type CreateUsuarioDto, type UpdateUsuarioDto } from '@/types/usuario';
import {
  validarNome,
  validarTelefone,
  validarSenha,
  validarConfirmacaoSenha,
  validarRole,
} from '@/utils/validators/usuarioValidators';

interface Props {
  initialData?: Partial<CreateUsuarioDto | UpdateUsuarioDto>;
  isEdit?: boolean;
  loading?: boolean;
}

interface Emits {
  (e: 'submit', data: CreateUsuarioDto | UpdateUsuarioDto): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  loading: false,
});

const emit = defineEmits<Emits>();

const roleOptions = ROLE_OPTIONS;

const formData = ref<{
  nome: string;
  telefone: string;
  senha: string;
  confirmacaoSenha: string;
  role: UserRole | '';
  ativo: boolean;
}>({
  nome: '',
  telefone: '',
  senha: '',
  confirmacaoSenha: '',
  role: '',
  ativo: true,
});

const errors = ref<{
  nome: string | null;
  telefone: string | null;
  senha: string | null;
  confirmacaoSenha: string | null;
  role: string | null;
}>({
  nome: null,
  telefone: null,
  senha: null,
  confirmacaoSenha: null,
  role: null,
});

// Preencher dados iniciais se estiver editando
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      formData.value = {
        nome: data.nome || '',
        telefone: data.telefone || '',
        senha: '',
        confirmacaoSenha: '',
        role: (data.role as UserRole) || '',
        ativo: data.ativo ?? true,
      };
    }
  },
  { immediate: true }
);

const validateField = (field: keyof typeof errors.value) => {
  switch (field) {
    case 'nome':
      errors.value.nome = validarNome(formData.value.nome);
      break;
    case 'telefone':
      errors.value.telefone = validarTelefone(formData.value.telefone);
      break;
    case 'senha':
      errors.value.senha = validarSenha(formData.value.senha, props.isEdit);
      break;
    case 'confirmacaoSenha':
      if (formData.value.senha) {
        errors.value.confirmacaoSenha = validarConfirmacaoSenha(
          formData.value.senha,
          formData.value.confirmacaoSenha
        );
      }
      break;
    case 'role':
      errors.value.role = validarRole(formData.value.role);
      break;
  }
};

const validateForm = (): boolean => {
  validateField('nome');
  validateField('telefone');
  validateField('senha');
  
  if (formData.value.senha) {
    validateField('confirmacaoSenha');
  }
  
  validateField('role');

  return !Object.values(errors.value).some((error) => error !== null);
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }

  const data: CreateUsuarioDto | UpdateUsuarioDto = {
    nome: formData.value.nome.trim(),
    telefone: formData.value.telefone.trim(),
    senha: formData.value.senha || undefined,
    role: formData.value.role as UserRole,
    ativo: formData.value.ativo,
  };

  emit('submit', data);
};
</script>
