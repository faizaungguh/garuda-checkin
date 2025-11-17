<script setup>
import { onMounted, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { XMarkIcon } from '@heroicons/vue/24/outline'

// Event untuk komunikasi ke Home: 
// 'result' = dapet QR, 'close' = user tutup kamera
const emit = defineEmits(['result', 'close'])

let html5QrCode = null

onMounted(() => {
  startScanner()
})

// PENTING: Matikan kamera saat komponen hilang agar tidak memakan baterai/memori
onUnmounted(() => {
  stopScanner()
})

const startScanner = () => {
  const config = {
    fps: 10, // Frame per detik (10 cukup, hemat baterai)
    qrbox: { width: 250, height: 250 } // Ukuran kotak fokus scan
  }

  html5QrCode = new Html5Qrcode("reader")

  html5QrCode.start(
    { facingMode: "environment" }, // Pakai Kamera Belakang
    config,
    (decodedText) => {
      // SUKSES SCAN
      stopScanner() // Stop dulu
      emit('result', decodedText) // Kirim teks (ID Tiket) ke Home
    },
    (errorMessage) => {
      // Error scanning per frame (wajar saat QR belum pas), abaikan saja
    }
  ).catch((err) => {
    console.error(err)
    alert("Gagal membuka kamera. Pastikan izin kamera diberikan.")
    emit('close')
  })
}

const stopScanner = () => {
  if (html5QrCode) {
    html5QrCode.stop().catch((err) => console.error("Stop failed", err))
    html5QrCode.clear()
  }
}
</script>

<template>
  <div class="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">

    <button @click="$emit('close')"
      class="absolute top-6 right-6 text-white bg-gray-800/50 p-2 rounded-full hover:bg-gray-700 backdrop-blur-sm z-[101]">
      <XMarkIcon class="w-8 h-8" />
    </button>

    <div id="reader" class="w-full max-w-md overflow-hidden rounded-lg"></div>

    <p class="text-white mt-8 text-sm font-medium tracking-wide opacity-80">
      Arahkan kamera ke QR Code Tiket
    </p>

  </div>
</template>

<style>
/* Sedikit styling agar border kamera dari library terlihat bagus */
#reader__scan_region {
  background: transparent !important;
}

#reader__dashboard_section_csr button {
  display: none !important;
  /* Sembunyikan tombol bawaan library jika muncul */
}
</style>