<template>
  <div v-if="showDebug" class="debug-panel">
    <div class="debug-header">
      <h3>🔧 高级调试工具 <span class="version">v2.0</span></h3>
      <button class="debug-close-btn" @click="closeDebug">
        ✕ 关闭
      </button>
    </div>
    
    <div class="debug-content">
      <!-- 全局操作区 -->
      <div class="debug-global-controls">
        <button @click="resetAllDebugSettings" class="btn-reset-all">
          🔄 重置所有设置
        </button>
        <button @click="exportDebugSettings" class="btn-export">
          📤 导出设置
        </button>
        <button @click="importDebugSettings" class="btn-import">
          📥 导入设置
        </button>
      </div>

      <!-- 各棋子控制区 -->
      <div 
        v-for="shapeId in [1, 2, 3, 4]" 
        :key="shapeId" 
        class="debug-shape-control"
      >
        <h4>
          🧩 棋子类型 {{ shapeId }} 
          <span class="shape-type">{{ shapeId === 4 ? '(鸟类)' : '(普通)' }}</span>
        </h4>
        
        <div class="debug-controls">
          <!-- 缩放控制 -->
          <div class="control-group">
            <label>缩放 ({{ debugSettings.shapes[shapeId]?.scale || 1 }}x)</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              :value="debugSettings.shapes[shapeId]?.scale || 1"
              @input="updateScale(shapeId, $event)"
              class="range-slider"
            />
          </div>

          <!-- X轴偏移 -->
          <div class="control-group">
            <label>X轴偏移 ({{ debugSettings.shapes[shapeId]?.offsetX || 0 }}px)</label>
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              :value="debugSettings.shapes[shapeId]?.offsetX || 0"
              @input="updateOffsetX(shapeId, $event)"
              class="range-slider"
            />
          </div>

          <!-- Y轴偏移 -->
          <div class="control-group">
            <label>Y轴偏移 ({{ debugSettings.shapes[shapeId]?.offsetY || 0 }}px)</label>
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              :value="debugSettings.shapes[shapeId]?.offsetY || 0"
              @input="updateOffsetY(shapeId, $event)"
              class="range-slider"
            />
          </div>

          <!-- 重置单个棋子 -->
          <button @click="resetShape(shapeId)" class="btn-reset">
            🔄 重置此棋子
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ===== Props =====
interface Props {
  showDebug: boolean
  debugSettings: {
    shapes: Record<number, {
      scale: number
      offsetX: number
      offsetY: number
    }>
  }
  closeDebug: () => void
  resetAllDebugSettings: () => void
  exportDebugSettings: () => void
  importDebugSettings: () => void
  resetShape: (shapeId: number) => void
  updateShapeSettings: (shapeId: number, settings: any) => void
}

const props = defineProps<Props>()

// ===== 方法 =====
function updateScale(shapeId: number, event: Event) {
  const target = event.target as HTMLInputElement
  const scale = parseFloat(target.value)
  props.updateShapeSettings(shapeId, { scale })
}

function updateOffsetX(shapeId: number, event: Event) {
  const target = event.target as HTMLInputElement
  const offsetX = parseInt(target.value)
  props.updateShapeSettings(shapeId, { offsetX })
}

function updateOffsetY(shapeId: number, event: Event) {
  const target = event.target as HTMLInputElement
  const offsetY = parseInt(target.value)
  props.updateShapeSettings(shapeId, { offsetY })
}
</script>

<style scoped>
.debug-panel {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 360px;
  max-height: 85vh;
  background: rgba(0, 0, 0, 0.92);
  color: #e0e0e0;
  border-radius: 12px;
  border: 1px solid #333;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  border-bottom: 1px solid #333;
}

.debug-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffc107;
}

.version {
  font-size: 0.8rem;
  opacity: 0.8;
  font-weight: normal;
}

.debug-close-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.debug-close-btn:hover {
  background: #d32f2f;
  transform: scale(1.05);
}

.debug-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  scrollbar-width: thin;
  scrollbar-color: #555 transparent;
}

.debug-content::-webkit-scrollbar {
  width: 6px;
}

.debug-content::-webkit-scrollbar-track {
  background: transparent;
}

.debug-content::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 3px;
}

.debug-global-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.debug-shape-control {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid #333;
}

.debug-shape-control h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #4caf50;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.shape-type {
  font-size: 0.8rem;
  font-weight: normal;
  color: #999;
}

.debug-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-size: 0.85rem;
  color: #ccc;
  font-weight: 500;
}

.range-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #333;
  outline: none;
  cursor: pointer;
  appearance: none;
}

.range-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffc107;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.range-slider::-webkit-slider-thumb:hover {
  background: #ff8f00;
  transform: scale(1.1);
}

.range-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffc107;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* 按钮样式 */
.btn-reset-all,
.btn-export,
.btn-import,
.btn-reset {
  background: linear-gradient(135deg, #555, #333);
  color: white;
  border: 1px solid #666;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;
}

.btn-reset-all:hover,
.btn-export:hover,
.btn-import:hover,
.btn-reset:hover {
  background: linear-gradient(135deg, #666, #444);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-reset-all {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-color: #ff9800;
}

.btn-reset-all:hover {
  background: linear-gradient(135deg, #f57c00, #ef6c00);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .debug-panel {
    right: 10px;
    width: 320px;
  }
}

@media (max-width: 768px) {
  .debug-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    left: 20px;
    width: auto;
    max-height: 60vh;
    transform: none;
  }
}
</style>