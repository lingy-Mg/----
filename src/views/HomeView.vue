<script setup lang="ts">
import PuzzleBoard from '../components/PuzzleBoard.vue'
</script>

<template>
  <main>
    <PuzzleBoard />
  </main>
</template>

<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
