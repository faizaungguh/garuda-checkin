<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../db'
import Papa from 'papaparse'
import {
  ArrowDownTrayIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const isImporting = ref(false)
const totalData = ref(0)
const checkedInData = ref(0)
const importStatus = ref('')
const tribuneStats = ref([]) // State untuk data statistik

// --- 1. HITUNG DATA & STATISTIK ---
const countData = async () => {
  const allData = await db.participants.toArray()

  totalData.value = allData.length
  checkedInData.value = allData.filter(p => p.isCheckedIn).length

  // LOGIKA GROUPING PER TRIBUN
  // Kita buat object sementara untuk menampung hitungan
  const statsMap = {}

  allData.forEach(p => {
    const tr = p.tribune || 'Tanpa Tribun' // Handle jika kosong

    if (!statsMap[tr]) {
      statsMap[tr] = { name: tr, total: 0, present: 0 }
    }

    statsMap[tr].total++
    if (p.isCheckedIn) {
      statsMap[tr].present++
    }
  })

  // Ubah object ke array dan urutkan berdasarkan nama tribun
  tribuneStats.value = Object.values(statsMap).sort((a, b) => a.name.localeCompare(b.name))
}

onMounted(() => {
  countData()
})

// --- 2. FUNGSI IMPORT ---
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  isImporting.value = true
  importStatus.value = 'Membaca file...'

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase().replace(/^\ufeff/, ""),
    complete: async (results) => {
      const rawData = results.data
      if (!rawData.length) {
        alert('File CSV kosong!')
        isImporting.value = false
        return
      }

      const cleanData = rawData.map(row => {
        const rawStatus = row.ischeckedin;
        const isCheckedInBool = String(rawStatus).trim() === '1';

        return {
          id: String(row.id || row['kode tiket'] || ''),
          email: row.email || '',
          fullname: row.fullname || '',
          category: row.category || '',
          tribune: row.tribune || '',
          gate: String(row.gate || ''),
          isCheckedIn: isCheckedInBool,
          checkinTime: row.checkintime || ''
        }
      })

      try {
        await db.participants.clear()
        await db.participants.bulkPut(cleanData)
        await countData() // Update statistik setelah import

        importStatus.value = 'Selesai!'
        alert(`Sukses! ${cleanData.length} data berhasil diimport.`)
        event.target.value = null
      } catch (error) {
        console.error(error)
        alert('Gagal menyimpan ke database: ' + error.message)
      } finally {
        isImporting.value = false
      }
    },
    error: (err) => {
      alert('Gagal parsing CSV: ' + err.message)
      isImporting.value = false
    }
  })
}

// --- 3. FUNGSI EXPORT ---
const exportData = async () => {
  try {
    const allData = await db.participants.toArray()
    if (allData.length === 0) {
      alert("Database kosong.")
      return
    }

    const exportFormatted = allData.map(row => ({
      'Kode Tiket': row.id,
      'Nama Lengkap': row.fullname,
      'Email': row.email,
      'Tribun': row.tribune,
      'Gate': row.gate,
      'Status': row.isCheckedIn ? 'SUDAH MASUK' : 'BELUM',
      'Waktu Check-in': row.checkinTime ? new Date(row.checkinTime).toLocaleString('id-ID') : '-'
    }))

    const csv = Papa.unparse(exportFormatted)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().slice(0, 10)

    link.setAttribute("href", url)
    link.setAttribute("download", `Laporan_Checkin_${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

  } catch (e) {
    console.error(e)
    alert("Gagal mengekspor data.")
  }
}

// --- 4. HAPUS DATA ---
const clearDatabase = async () => {
  const confirmPhrase = prompt("Ketik 'melesathebat' untuk menghapus semua data:")
  if (confirmPhrase === 'melesathebat') {
    await db.participants.clear()
    await countData() // Reset statistik jadi 0
    alert('Database berhasil dikosongkan.')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 pb-32">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Storage & Data</h1>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <p class="text-xs text-gray-400 mb-1">Total Peserta</p>
        <p class="text-2xl font-bold text-gray-800">{{ totalData }}</p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <p class="text-xs text-gray-400 mb-1">Sudah Hadir</p>
        <p class="text-2xl font-bold text-green-600">{{ checkedInData }}</p>
      </div>
    </div>

    <div v-if="tribuneStats.length > 0" class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
      <div class="flex items-center gap-2 mb-4">
        <ChartBarIcon class="w-5 h-5 text-indigo-600" />
        <h3 class="font-bold text-gray-700">Statistik Per Tribun</h3>
      </div>

      <div class="space-y-4">
        <div v-for="stat in tribuneStats" :key="stat.name">
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium text-gray-600">{{ stat.name }}</span>
            <span class="text-gray-500">
              <span class="font-bold text-green-600">{{ stat.present }}</span> / {{ stat.total }}
            </span>
          </div>

          <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div class="bg-green-500 h-2.5 rounded-full transition-all duration-500"
              :style="{ width: (stat.present / stat.total * 100) + '%' }"></div>
          </div>

          <div class="text-right">
            <span class="text-[10px] text-gray-400">{{ Math.round(stat.present / stat.total * 100) }}% Hadir</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <h3 class="font-bold text-gray-700 mb-2">Laporan & Backup</h3>
      <p class="text-xs text-gray-400 mb-4">Download data terbaru beserta status kehadirannya.</p>
      <button @click="exportData"
        class="w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
        <DocumentArrowDownIcon class="w-5 h-5" />
        Download CSV
      </button>
    </div>

    <div class="mb-8" v-if="totalData === 0">
      <h3 class="font-bold text-gray-700 mb-2">Import Data Baru</h3>

      <div v-if="isImporting" class="text-center py-4 bg-white rounded-xl border border-dashed border-gray-300">
        <div class="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2">
        </div>
        <p class="text-xs text-gray-500">{{ importStatus }}</p>
      </div>

      <label v-else
        class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
          <ArrowDownTrayIcon class="w-8 h-8 text-gray-400 mb-2" />
          <p class="text-sm text-gray-500"><span class="font-semibold">Klik untuk upload</span> CSV</p>
        </div>
        <input type="file" accept=".csv" class="hidden" @change="handleFileUpload" />
      </label>
    </div>

    <div class="pt-6 border-t border-gray-200">
      <button @click="clearDatabase"
        class="w-full py-3 text-red-500 font-medium text-sm flex items-center justify-center gap-2 hover:text-red-700 transition-colors">
        <TrashIcon class="w-4 h-4" />
        Hapus Semua Data
      </button>
    </div>

  </div>
</template>