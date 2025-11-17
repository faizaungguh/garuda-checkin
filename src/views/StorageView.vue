<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../db'
import Papa from 'papaparse'

const isImporting = ref(false)
const totalData = ref(0)
const importStatus = ref('')

const countData = async () => {
  totalData.value = await db.participants.count()
}

onMounted(() => {
  countData()
})

// src/views/StorageView.vue

// src/views/StorageView.vue (Bagian handleFileUpload)

// src/views/StorageView.vue

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  isImporting.value = true
  importStatus.value = 'Membaca file...'

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    // 1. PEMBERSIH HEADER (Anti-BOM & Anti-Spasi)
    // Ini menjamin kolom 'email' terbaca meskipun ada karakter aneh
    transformHeader: (header) => {
      return header.trim().toLowerCase().replace(/^\ufeff/, "")
    },
    complete: async (results) => {
      const rawData = results.data

      // Debug: Lihat baris pertama di Console (F12)
      console.log("Data Mentah Baris 1:", rawData[0])

      if (!rawData.length) {
        alert('File CSV kosong!')
        isImporting.value = false
        return
      }

      // 2. MAPPING & KONVERSI DATA
      const cleanData = rawData.map(row => {
        // Ambil status raw (bisa angka 0, 1 atau string "0", "1")
        const rawStatus = row.ischeckedin;

        // LOGIKA 0 dan 1:
        // Jika isinya "1" -> True (Sudah Masuk)
        // Selain itu ("0", kosong, dll) -> False (Belum Masuk)
        const isCheckedInBool = String(rawStatus).trim() === '1';

        return {
          // Pastikan ID jadi String biar konsisten saat dicari
          id: String(row.id || row['kode tiket'] || ''),

          // Ambil email (fallback ke string kosong biar ga error)
          email: row.email || '',

          fullname: row.fullname || '',
          category: row.category || '',
          tribune: row.tribune || '',

          // Pastikan Gate jadi String ("2", "3") biar cocok sama Dropdown
          gate: String(row.gate || ''),

          // SIMPAN KE DATABASE SEBAGAI BOOLEAN (True/False)
          // Biar logika di Home gampang
          isCheckedIn: isCheckedInBool
        }
      })

      try {
        // Reset Database Lama
        await db.participants.clear()

        // Masukkan Data Baru
        await db.participants.bulkPut(cleanData)

        // Update UI
        await countData()

        importStatus.value = 'Selesai!'
        alert(`Sukses! ${cleanData.length} data berhasil diimport.`)

        // Reset input file
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

const clearDatabase = async () => {
  const confirmPhrase = prompt("Ketik 'melesathebat' untuk menghapus semua data:")
  if (confirmPhrase === 'melesathebat') {
    await db.participants.clear()
    await countData()
    alert('Database berhasil dikosongkan.')
  } else {
    alert('Penghapusan dibatalkan. Kata kunci salah.')
  }
}
</script>

<template>
  <div class="p-6 max-w-md mx-auto">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Storage & Data</h1>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <p class="text-sm text-gray-500 mb-1">Total Peserta Terdaftar</p>
      <p class="text-4xl font-bold text-indigo-600">{{ totalData }}</p>
    </div>

    <div class="mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-2">Import Database (CSV)</label>

      <div v-if="isImporting" class="text-center py-4">
        <div class="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2">
        </div>
        <p class="text-sm text-gray-500">{{ importStatus }}</p>
      </div>

      <input v-else type="file" accept=".csv" @change="handleFileUpload" class="block w-full text-sm text-gray-500
          file:mr-4 file:py-2.5 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100
          cursor-pointer border border-gray-300 rounded-lg" />
      <p class="mt-2 text-xs text-gray-400">Pastikan format CSV sesuai (id, fullname, gate, dll).</p>
    </div>

    <div class="pt-6 border-t border-gray-200">
      <button @click="clearDatabase"
        class="w-full py-3 px-4 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
        Hapus Semua Data
      </button>
    </div>

  </div>
</template>