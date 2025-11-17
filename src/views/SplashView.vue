<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import splashLogo from '@/assets/logo-splash.svg'

const router = useRouter()

onMounted(() => {
  const hasSeenSplash = sessionStorage.getItem('hasSeenSplash')

  if (hasSeenSplash) {
    router.replace('/home')
  } else {
    sessionStorage.setItem('hasSeenSplash', 'true')
    setTimeout(() => {
      router.replace('/home')
    }, 2500)
  }
})
</script>

<template>
  <div class="flex h-screen w-screen flex-col items-center justify-center bg-indigo-950 px-4">

    <img :src="splashLogo" alt="Logo Aplikasi" class="w-48 animate-pulse duration-1000" />

    <p class="mt-4 text-white text-sm font-medium tracking-wider">
      Tetaplah bersamaku...
    </p>

  </div>
</template>