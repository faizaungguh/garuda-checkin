<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/db'
import { MagnifyingGlassIcon, TicketIcon, UserIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const searchMode = ref('email')
const searchResults = ref([])
const isSearching = ref(false)
const searchPerformed = ref(false)

const emailQuery = ref('')
const selectedTribune = ref('A')
const seatNumber = ref('')

const tribuneOptions = ['A', 'B', 'C1', 'C2', 'D']


const searchByEmail = async () => {
  if (!emailQuery.value || emailQuery.value.length < 3) {
    alert("Ketik minimal 3 huruf untuk mencari.")
    return
  }

  isSearching.value = true
  searchPerformed.value = true
  searchResults.value = []

  try {
    const query = emailQuery.value.toLowerCase()

    const allParticipants = await db.participants.toArray()

    searchResults.value = allParticipants.filter(p =>
      (p.fullname && p.fullname.toLowerCase().includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query))
    )
  } catch (e) {
    console.error(e)
  } finally {
    isSearching.value = false
  }
}

const searchByTribune = async () => {
  if (!seatNumber.value) {
    alert("Masukkan nomor kursi/urut.")
    return
  }

  isSearching.value = true
  searchPerformed.value = true
  searchResults.value = []

  try {
    const formattedNumber = seatNumber.value.toString().padStart(4, '0')
    const targetID = `${selectedTribune.value}-${formattedNumber}`

    console.log("Mencari ID:", targetID)

    const participant = await db.participants.get(targetID)

    if (participant) {
      searchResults.value = [participant]
    }
  } catch (e) {
    console.error(e)
  } finally {
    isSearching.value = false
  }
}

const manualCheckIn = async (participant) => {
  if (!confirm(`Konfirmasi Check-in manual untuk:\n${participant.fullname}?`)) return

  try {
    await db.participants.update(participant.id, {
      isCheckedIn: true,
      checkinTime: new Date().toISOString()
    })

    participant.isCheckedIn = true
    alert("Berhasil Check-in Manual!")
  } catch (e) {
    alert("Gagal update database.")
  }
}

const switchMode = (mode) => {
  searchMode.value = mode
  searchResults.value = []
  searchPerformed.value = false
  emailQuery.value = ''
  seatNumber.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 pb-32">

    <h1 class="text-2xl font-bold text-gray-800 mb-6">Pencarian Manual</h1>

    <div class="flex bg-gray-200 p-1 rounded-xl mb-6">
      <button @click="switchMode('email')" class="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
        :class="searchMode === 'email' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'">
        Via Email / Nama
      </button>
      <button @click="switchMode('tribune')" class="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
        :class="searchMode === 'tribune' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'">
        Via Tribun & Kursi
      </button>
    </div>

    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">

      <div v-if="searchMode === 'email'">
        <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Cari Peserta</label>
        <div class="flex gap-2">
          <input v-model="emailQuery" @keyup.enter="searchByEmail" type="text" placeholder="Nama atau Email..."
            class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors" />
          <button @click="searchByEmail"
            class="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-transform">
            <MagnifyingGlassIcon class="w-6 h-6" />
          </button>
        </div>
        <p class="text-xs text-gray-400 mt-2">Tekan enter untuk mencari.</p>
      </div>

      <div v-else>
        <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Lokasi Kursi</label>
        <div class="flex gap-3">
          <select v-model="selectedTribune"
            class="w-1/3 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500">
            <option v-for="t in tribuneOptions" :key="t" :value="t">{{ t }}</option>
          </select>

          <input v-model="seatNumber" type="number" placeholder="Nomor (cth: 1)"
            class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500" />

          <button @click="searchByTribune"
            class="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-transform">
            <MagnifyingGlassIcon class="w-6 h-6" />
          </button>
        </div>
        <p class="text-xs text-gray-400 mt-2">Contoh: Pilih 'C1', ketik '1' untuk cari C1-0001</p>
      </div>

    </div>

    <div v-if="isSearching" class="text-center py-8 text-gray-400">
      Mencari data...
    </div>

    <div v-else-if="searchPerformed && searchResults.length === 0" class="text-center py-8">
      <div class="bg-red-50 text-red-500 inline-block p-3 rounded-full mb-3">
        <UserIcon class="w-6 h-6" />
      </div>
      <p class="text-gray-500 font-medium">Data tidak ditemukan.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="p in searchResults" :key="p.id"
        class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 relative overflow-hidden">
        <div class="absolute top-0 left-0 bottom-0 w-1" :class="p.isCheckedIn ? 'bg-green-500' : 'bg-gray-300'"></div>

        <div class="pl-3">
          <h3 class="font-bold text-gray-800">{{ p.fullname }}</h3>
          <p class="text-sm text-gray-500 truncate">{{ p.email }}</p>
        </div>

        <div class="pl-3 grid grid-cols-3 gap-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
          <div>
            <span class="block font-bold text-gray-400">TIKET</span>
            {{ p.id }}
          </div>
          <div>
            <span class="block font-bold text-gray-400">TRIBUN</span>
            {{ p.tribune }}
          </div>
          <div>
            <span class="block font-bold text-gray-400">GATE</span>
            {{ p.gate }}
          </div>
        </div>

        <div class="pl-3 mt-1">
          <button v-if="!p.isCheckedIn" @click="manualCheckIn(p)"
            class="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 transition-colors">
            Check In Manual
          </button>

          <div v-else
            class="w-full bg-green-50 text-green-600 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
            <CheckCircleIcon class="w-5 h-5" />
            Sudah Masuk
          </div>
        </div>

      </div>
    </div>

  </div>
</template>