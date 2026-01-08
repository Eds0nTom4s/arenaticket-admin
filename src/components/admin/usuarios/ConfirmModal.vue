<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="close"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Overlay -->
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

          <!-- Modal -->
          <div
            class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            @click.stop
          >
            <!-- Header -->
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ title }}
              </h3>
            </div>

            <!-- Content -->
            <div class="mb-6">
              <p class="text-sm text-gray-600">
                {{ message }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                @click="close"
              >
                Cancelar
              </button>
              <button
                type="button"
                :class="confirmButtonClass"
                @click="confirm"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'primary';
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirmar',
  variant: 'danger',
});

const emit = defineEmits<Emits>();

const confirmButtonClass = computed(() => {
  const baseClass = 'rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  if (props.variant === 'danger') {
    return `${baseClass} bg-red-600 hover:bg-red-700 focus:ring-red-500`;
  }
  
  return `${baseClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
});

const close = () => {
  emit('update:modelValue', false);
};

const confirm = () => {
  emit('confirm');
  close();
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
