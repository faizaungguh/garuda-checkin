<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['result', 'close'])

let html5QrCode = null
const isStopping = ref(false) // State untuk mencegah double click

onMounted(() => {
  startScanner()
})

onUnmounted(() => {
  // Pastikan kamera mati saat komponen dihancurkan
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().catch(err => console.warn("Force stop error:", err))
    html5QrCode.clear()
  }
})

const startScanner = () => {
  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0
  }

  // Hapus instance lama jika ada (safety check)
  if (html5QrCode) {
    try { html5QrCode.clear() } catch (e) { }
  }

  html5QrCode = new Html5Qrcode("reader")

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (decodedText) => {
      // === SUKSES SCAN ===
      handleStop(decodedText)
    },
    (errorMessage) => {
      // Error per frame, abaikan
    }
  ).catch((err) => {
    console.error("Camera Start Error:", err)
    alert("Gagal membuka kamera. Pastikan izin diberikan.")
    emit('close')
  })
}

// Fungsi aman untuk mematikan kamera
const handleStop = async (result = null) => {
  if (isStopping.value) return // Jangan jalankan 2x
  isStopping.value = true

  if (html5QrCode) {
    try {
      // Coba matikan kamera baik-baik
      if (html5QrCode.isScanning) {
        await html5QrCode.stop()
      }
      html5QrCode.clear() // PENTING: Hapus elemen video dari layar
    } catch (err) {
      console.warn("Gagal stop kamera:", err)
      // Tetap lanjut tutup overlay meskipun error
    }
  }

  // Kirim event ke Home
  if (result) {
    emit('result', result)
  } else {
    emit('close')
  }
}
</script>

<template>
  <div class="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center touch-none">

    <button @click="handleStop(null)"
      class="absolute top-8 right-6 text-white bg-gray-800/50 p-3 rounded-full hover:bg-gray-700 backdrop-blur-sm z-[10000]">
      <XMarkIcon class="w-8 h-8" />
    </button>

    <div class="w-full px-4">
      <div id="reader" class="w-full overflow-hidden rounded-2xl bg-black"></div>
    </div>

    <p class="text-white mt-8 text-sm font-medium tracking-wide opacity-80">
      Arahkan kamera ke QR Code Tiket
    </p>

  </div>
</template>

<style>
/* CSS Hack untuk merapikan tampilan bawaan library */
#reader video {
  object-fit: cover;
  border-radius: 1rem;
}

#reader__scan_region {
  background: transparent !important;
}

#reader__dashboard_section_csr button {
  display: none !important;
}
</style>