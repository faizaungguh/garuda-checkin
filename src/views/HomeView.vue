<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../db'
import logo from '@/assets/icon-garuda-01-circle.svg'
import { ArrowDownTrayIcon, QrCodeIcon } from '@heroicons/vue/24/outline'
import QrScanner from '../components/QrScanner.vue'

const router = useRouter()

const isLoading = ref(true)
const hasData = ref(false)
const totalData = ref(0)
const isScanning = ref(false)

const gates = ref([])
const selectedGate = ref(localStorage.getItem('selectedGate') || '')

onMounted(async () => {
  try {
    const count = await db.participants.count()
    totalData.value = count
    hasData.value = count > 0

    if (hasData.value) {
      const uniqueGates = await db.participants.orderBy('gate').uniqueKeys()
      gates.value = uniqueGates

      if (!selectedGate.value && uniqueGates.length > 0) {
        selectedGate.value = uniqueGates[0]
        localStorage.setItem('selectedGate', uniqueGates[0])
      }
    }
  } catch (error) {
    console.error("Gagal memuat data:", error)
  } finally {
    isLoading.value = false
  }
})

const handleGateChange = () => {
  localStorage.setItem('selectedGate', selectedGate.value)
}

const startScan = () => {
  if (!selectedGate.value) {
    alert("Mohon pilih Gate/Gerbang terlebih dahulu!")
    return
  }
  isScanning.value = true
}

const goToImport = () => {
  router.push('/storage')
}

const onScanResult = async (ticketId) => {
  isScanning.value = false

  alert(`Berhasil Scan! ID Tiket: ${ticketId}`)
  console.log("ID:", ticketId)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 pb-32 relative">
    <div class="flex items-center gap-4 mb-8 mt-2">

      <div
        class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
        <img :src="logo" alt="Logo" class="w-8 h-8 opacity-80" />
      </div>
      <h1 class="text-xl font-semibold text-gray-800 tracking-tight">
        Kendalisada Check In
      </h1>
    </div>

    <div v-if="isLoading" class="flex h-64 items-center justify-center">
      <div class="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
    </div>

    <div v-else-if="!hasData" class="flex flex-col items-center justify-center h-[60vh]">

      <button @click="goToImport"
        class="group flex flex-col items-center justify-center gap-3 p-8 rounded-full hover:bg-gray-100 transition-all duration-300 active:scale-95">
        <div
          class="w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white shadow-sm group-hover:border-indigo-400 group-hover:text-indigo-600 text-gray-500 transition-colors">
          <ArrowDownTrayIcon class="w-10 h-10" />
        </div>

        <span class="text-lg font-semibold text-gray-600 group-hover:text-indigo-600">
          Import
        </span>
      </button>

      <p class="mt-4 text-sm text-gray-400 text-center px-8">
        Database kosong.<br>Tap ikon di atas untuk mengimpor data CSV.
      </p>
    </div>

    <div v-else class="flex flex-col gap-6 animate-fade-in">

      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <p class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Status Database</p>
        <div class="flex justify-between items-end">
          <span class="text-3xl font-bold text-indigo-600">{{ totalData }}</span>
          <span class="text-sm text-gray-500 mb-1">Peserta Terdaftar</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-3">Lokasi Jaga (Gate)</label>

        <div class="relative">
          <select v-model="selectedGate" @change="handleGateChange"
            class="block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl bg-gray-50">
            <option value="" disabled>-- Pilih Gate --</option>
            <option v-for="g in gates" :key="g" :value="g">
              Gate {{ g }}
            </option>
          </select>
        </div>
        <p class="mt-2 text-xs text-gray-400">
          Aplikasi akan memvalidasi tiket sesuai gate ini.
        </p>
      </div>

      <button @click="startScan"
        class="mt-4 w-full bg-indigo-600 text-white py-4 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 text-lg font-bold hover:bg-indigo-700 active:scale-95 transition-all">
        <QrCodeIcon class="w-6 h-6" />
        Mulai Scan QR
      </button>
    </div>
    <transition name="fade">
      <QrScanner v-if="isScanning" @result="onScanResult" @close="isScanning = false" />
    </transition>
  </div>
</template>

<style scoped>
/* Animasi sederhana saat konten muncul */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>