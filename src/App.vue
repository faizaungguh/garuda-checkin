<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { HomeIcon, MagnifyingGlassIcon, ArchiveBoxIcon } from '@heroicons/vue/16/solid';

const route = useRoute();
const isSplash = computed(() => route.path === '/')

const isActive = (path) => route.path === path

</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800 font-sans">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <nav v-if="!isSplash"
      class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-end z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">

      <router-link to="/home"
        class="relative flex flex-col items-center justify-center w-full py-3 transition-all duration-200 group"
        :class="isActive('/home') ? 'text-indigo-800' : 'text-gray-400 hover:text-gray-500'">
        <HomeIcon class="w-6 h-6 mb-1" />
        <span class="text-[10px] font-medium tracking-wide">Home</span>

        <div
          class="absolute bottom-0 h-1 w-8 bg-indigo-800 rounded-t-full transition-transform duration-300 ease-out origin-bottom"
          :class="isActive('/home') ? 'scale-x-100' : 'scale-x-0'"></div>
      </router-link>

      <router-link to="/search"
        class="relative flex flex-col items-center justify-center w-full py-3 transition-all duration-200 group"
        :class="isActive('/search') ? 'text-indigo-800' : 'text-gray-400 hover:text-gray-500'">
        <MagnifyingGlassIcon class="w-6 h-6 mb-1" />
        <span class="text-[10px] font-medium tracking-wide">Search</span>

        <div
          class="absolute bottom-0 h-1 w-8 bg-indigo-800 rounded-t-full transition-transform duration-300 ease-out origin-bottom"
          :class="isActive('/search') ? 'scale-x-100' : 'scale-x-0'"></div>
      </router-link>

      <router-link to="/storage"
        class="relative flex flex-col items-center justify-center w-full py-3 transition-all duration-200 group"
        :class="isActive('/storage') ? 'text-indigo-800' : 'text-gray-400 hover:text-gray-500'">
        <ArchiveBoxIcon class="w-6 h-6 mb-1" />
        <span class="text-[10px] font-medium tracking-wide">Storage</span>

        <div
          class="absolute bottom-0 h-1 w-8 bg-indigo-800 rounded-t-full transition-transform duration-300 ease-out origin-bottom"
          :class="isActive('/storage') ? 'scale-x-100' : 'scale-x-0'"></div>
      </router-link>

    </nav>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-ac~tive {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>