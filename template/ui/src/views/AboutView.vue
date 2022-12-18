<script setup lang="ts">
import { usePagesStore } from '@/stores/pages';
import { onMounted } from 'vue';

const store = usePagesStore();

onMounted(() => {
  store.loadPage();
});
</script>

<template>
  <div class="about">
    <h1>{{ store.content }}</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
