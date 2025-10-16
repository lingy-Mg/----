<script setup lang="ts">
import PuzzleBoard from '../components/PuzzleBoard.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <main>
    <div class="game-selector">
      <h1>拼图游戏系列</h1>
      <div class="games">
        <div class="game-card">
          <h2>简单拼图 (4×4)</h2>
          <p>Phase 1: 基础拖拽拼图游戏</p>
          <PuzzleBoard />
        </div>
        
        <div class="game-card">
          <h2>拼图棋盘 (8×8)</h2>
          <p>Phase 2: 策略拼图对弈游戏</p>
          <RouterLink to="/chess" class="play-button">
            进入游戏 →
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.game-selector {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.games {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.game-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.game-card h2 {
  margin-top: 0;
  color: #2c3e50;
}

.game-card p {
  color: #666;
  margin-bottom: 1rem;
}

.play-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s;
}

.play-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>

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
