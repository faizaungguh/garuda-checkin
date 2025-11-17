<script setup>
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  status: String, // 'success', 'error', 'warning', 'already'
  participant: Object,
  message: String
})

const emit = defineEmits(['close'])
</script>

<template>
  <div
    class="fixed inset-0 z-[11000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">

    <div
      class="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">

      <div class="absolute top-0 left-0 w-full h-2 bg-gray-100"></div>

      <div class="mt-4 mb-4">
        <div v-if="status === 'success'"
          class="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 animate-bounce-small">
          <CheckCircleIcon class="w-16 h-16" />
        </div>

        <div v-else-if="status === 'error'"
          class="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-shake">
          <XCircleIcon class="w-16 h-16" />
        </div>

        <div v-else class="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
          <ExclamationTriangleIcon class="w-16 h-16" />
        </div>
      </div>

      <h2 class="text-2xl font-bold mb-1" :class="{
        'text-green-600': status === 'success',
        'text-red-600': status === 'error',
        'text-orange-600': status === 'warning' || status === 'already'
      }">
        {{ status === 'success' ? 'Berhasil!' : (status === 'error' ? 'Gagal!' : 'Perhatian') }}
      </h2>

      <p class="text-gray-500 text-sm mb-6">{{ message }}</p>

      <div v-if="participant" class="w-full bg-gray-50 rounded-xl p-4 mb-6 text-left border border-gray-100">
        <div class="mb-2">
          <p class="text-xs text-gray-400 uppercase font-bold">Nama Lengkap</p>
          <p class="font-semibold text-gray-800 text-lg truncate">{{ participant.fullname }}</p>
        </div>
        <div class="flex justify-between">
          <div>
            <p class="text-xs text-gray-400 uppercase font-bold">Kategori</p>
            <p class="font-medium text-gray-700">{{ participant.category }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-400 uppercase font-bold">Gate</p>
            <p class="font-medium text-gray-700">Gate {{ participant.gate }}</p>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-200">
          <p class="text-xs text-gray-400 uppercase font-bold">ID Tiket</p>
          <p class="font-mono text-gray-600">{{ participant.id }}</p>
        </div>
      </div>

      <button @click="$emit('close')"
        class="w-full py-3.5 rounded-xl font-bold text-white transition-transform active:scale-95 shadow-lg" :class="{
          'bg-green-600 hover:bg-green-700 shadow-green-200': status === 'success',
          'bg-red-600 hover:bg-red-700 shadow-red-200': status === 'error',
          'bg-orange-500 hover:bg-orange-600 shadow-orange-200': status === 'warning' || status === 'already'
        }">
        Tutup / Lanjut Scan
      </button>

    </div>
  </div>
</template>

<style scoped>
/* Animasi Masuk */
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Animasi Ikon Sukses */
.animate-bounce-small {
  animation: bounceSmall 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

@keyframes bounceSmall {
  0% {
    transform: scale(0);
  }

  80% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

/* Animasi Ikon Error */
.animate-shake {
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  75% {
    transform: translateX(5px);
  }
}
</style>