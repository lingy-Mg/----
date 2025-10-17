<template>
  <div v-if="showDebug" class="debug-panel">
    <div class="debug-header">
      <h3>🔧 高级调试工具 <span class="version">v2.0</span></h3>
      <button class="debug-close-btn" @click="closeDebug">
        ✕ 关闭
      </button>
    </div>
    
    <div class="debug-content">
      <!-- 键盘控制提示 -->
      <div class="keyboard-hint">
        <h4>⌨️ 键盘控制 (当前: 棋子 {{ selectedShapeId }})</h4>
        <div class="hint-grid">
          <div class="hint-item">
            <span class="hint-key">↑↓←→</span>
            <span class="hint-desc">偏移 ±1px</span>
          </div>
          <div class="hint-item">
            <span class="hint-key">+ / -</span>
            <span class="hint-desc">缩放 ±0.01</span>
          </div>
        </div>
        <p class="hint-note">💡 点击任意棋子区域选中后使用键盘控制</p>
      </div>

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
        :class="{ 'selected-shape': selectedShapeId === shapeId }"
        @click="selectShape(shapeId)"
        tabindex="0"
      >
        <div class="shape-header">
          <div class="shape-title">
            <span class="shape-icon">🧩</span>
            <span class="shape-name">棋子 {{ shapeId }}</span>
            <span class="shape-type-tag">{{ shapeId === 4 ? '鸟类' : '普通' }}</span>
          </div>
          <button @click="resetShape(shapeId)" class="btn-reset-inline" title="重置">
            🔄
          </button>
        </div>
        
        <!-- 棋子预览区 -->
        <div class="piece-preview-section">
          <div class="piece-preview-compact">
            <img 
              :src="getPiecePreviewSvg(shapeId)" 
              :alt="`棋子 ${shapeId}`"
              class="piece-preview-image"
              @error="onImageError"
            />
            <span class="piece-id-badge">{{ shapeId }}</span>
          </div>
        </div>
        
        <div class="debug-controls">
          <!-- 缩放控制 -->
          <div class="control-group">
            <label>缩放 ({{ (debugSettings.shapes[shapeId]?.scale || 1).toFixed(2) }}x)</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.01"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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

// ===== 本地状态 =====
const selectedShapeId = ref<number>(1) // 默认选中第一个棋子

// ===== 生命周期 =====
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

// ===== 键盘控制 =====
function handleKeyPress(event: KeyboardEvent) {
  if (!props.showDebug) return

  const shapeId = selectedShapeId.value
  const currentSettings = props.debugSettings.shapes[shapeId] || { scale: 1, offsetX: 0, offsetY: 0 }

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      props.updateShapeSettings(shapeId, { offsetY: currentSettings.offsetY - 1 })
      break
    case 'ArrowDown':
      event.preventDefault()
      props.updateShapeSettings(shapeId, { offsetY: currentSettings.offsetY + 1 })
      break
    case 'ArrowLeft':
      event.preventDefault()
      props.updateShapeSettings(shapeId, { offsetX: currentSettings.offsetX - 1 })
      break
    case 'ArrowRight':
      event.preventDefault()
      props.updateShapeSettings(shapeId, { offsetX: currentSettings.offsetX + 1 })
      break
    case '+':
    case '=':
      event.preventDefault()
      props.updateShapeSettings(shapeId, { scale: Math.min(5, currentSettings.scale + 0.01) })
      break
    case '-':
    case '_':
      event.preventDefault()
      props.updateShapeSettings(shapeId, { scale: Math.max(0.1, currentSettings.scale - 0.01) })
      break
  }
}

// ===== 选择棋子 =====
function selectShape(shapeId: number) {
  selectedShapeId.value = shapeId
}

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

// ===== 棋子预览相关方法 =====
function getPiecePreviewSvg(shapeId: number): string {
  // 使用正确的资源路径
  return new URL(`../../../assets/pieces/piece${shapeId}.svg`, import.meta.url).href
}

function getPieceTypeName(shapeId: number): string {
  const names = {
    1: '基础棋子',
    2: '特殊棋子',
    3: '高级棋子',
    4: '鸟类棋子'
  }
  return names[shapeId as keyof typeof names] || '未知棋子'
}

function onImageError(event: Event) {
  const img = event.target as HTMLImageElement
  const shapeId = img.alt.match(/\d+/)?.[0]
  
  // 如果默认路径失败，尝试备用路径
  if (!img.src.includes('SVG/资源') && shapeId) {
    img.src = `/SVG/资源 ${shapeId}.svg`
    return
  }
  
  // 如果所有路径都失败，显示占位符
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent && !parent.querySelector('.error-placeholder')) {
    const placeholder = document.createElement('div')
    placeholder.className = 'error-placeholder'
    placeholder.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">🧩</div>
      <div>棋子 ${shapeId}</div>
      <div style="font-size: 0.6rem; opacity: 0.7;">图片加载失败</div>
    `
    parent.appendChild(placeholder)
  }
}
</script>

<style scoped>
.debug-panel {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 400px;
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

/* 键盘控制提示 */
.keyboard-hint {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05));
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.keyboard-hint h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #4caf50;
  font-weight: 600;
}

.hint-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.hint-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: 4px;
}

.hint-key {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffc107;
  font-family: 'Courier New', monospace;
}

.hint-desc {
  font-size: 0.7rem;
  color: #aaa;
}

.hint-note {
  margin: 0;
  font-size: 0.7rem;
  color: #81c784;
  font-style: italic;
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
  border: 2px solid #333;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  position: relative;
}

.debug-shape-control:hover {
  border-color: #555;
  background: rgba(255, 255, 255, 0.08);
}

.debug-shape-control.selected-shape {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3),
              0 4px 12px rgba(76, 175, 80, 0.2);
}

.debug-shape-control.selected-shape .shape-header::after {
  content: '✓';
  position: absolute;
  right: 3rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: #4caf50;
  background: rgba(76, 175, 80, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 50%;
  font-weight: 700;
  line-height: 1;
}

.shape-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #444;
  position: relative;
}

.shape-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shape-icon {
  font-size: 1.2rem;
}

.shape-name {
  font-size: 1rem;
  font-weight: 600;
  color: #4caf50;
}

.shape-type-tag {
  font-size: 0.7rem;
  color: #999;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #555;
}

.btn-reset-inline {
  background: rgba(255, 152, 0, 0.2);
  color: #ffa726;
  border: 1px solid rgba(255, 152, 0, 0.4);
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  line-height: 1;
}

.btn-reset-inline:hover {
  background: rgba(255, 152, 0, 0.3);
  transform: rotate(180deg);
}

.debug-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 棋子预览样式 - 简化版 */
.piece-preview-section {
  margin-bottom: 1rem;
}

.piece-preview-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  border: 1px solid #444;
  position: relative;
}

.piece-preview-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
}

.piece-id-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 193, 7, 0.9);
  color: #000;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 193, 7, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.error-placeholder {
  color: #f44336;
  font-size: 0.75rem;
  text-align: center;
  padding: 1rem;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 4px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.control-group label {
  font-size: 0.8rem;
  color: #aaa;
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
.btn-import {
  background: linear-gradient(135deg, #555, #333);
  color: white;
  border: 1px solid #666;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;
}

.btn-reset-all:hover,
.btn-export:hover,
.btn-import:hover {
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
    width: 360px;
  }
}

@media (max-width: 900px) {
  .debug-panel {
    width: 320px;
  }
  
  .piece-preview-image {
    width: 50px;
    height: 50px;
  }
  
  .piece-id-badge {
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
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