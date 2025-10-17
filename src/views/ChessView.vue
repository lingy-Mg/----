<script setup lang="ts">
import { ref } from 'vue'
import ChessBoardNew from '@/components/chess/ChessBoardNew.vue'
import DebugPanel from '@/components/chess/panels/DebugPanel.vue'

// 获取 ChessBoard 组件的引用
const chessBoardRef = ref<InstanceType<typeof ChessBoardNew> | null>(null)
</script>

<template>
  <div class="chess-view">
    <ChessBoardNew ref="chessBoardRef" />
    
    <!-- 调试面板（页面级别） -->
    <DebugPanel
      v-if="chessBoardRef?.debugState"
      :show-debug="chessBoardRef.debugState.showDebug.value"
      :debug-settings="chessBoardRef.debugState.debugSettings"
      :close-debug="() => chessBoardRef!.debugState.showDebug.value = false"
      :reset-all-debug-settings="chessBoardRef.debugState.resetAllDebugSettings"
      :export-debug-settings="chessBoardRef.debugState.exportDebugSettings"
      :import-debug-settings="chessBoardRef.debugState.importDebugSettings"
      :reset-shape="chessBoardRef.debugState.resetShape"
      :update-shape-settings="chessBoardRef.debugState.updateShapeSettings"
    />
  </div>
</template>

<style scoped>
.chess-view {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  /* padding: 2rem 0; */
}
</style>
