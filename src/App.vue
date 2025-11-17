<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const isSplash = computed(() => route.path === '/')

</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800 font-sans">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <nav v-if="!isSplash"
      class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 text-center text-xs text-gray-400">
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