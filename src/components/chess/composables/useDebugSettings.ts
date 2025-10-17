import { ref, reactive, watch } from 'vue'

/**
 * 调试设置类型
 */
interface DebugSettings {
  shapes: Record<number, {
    scale: number
    offsetX: number
    offsetY: number
  }>
}

/**
 * 调试设置管理组合式函数
 */
export function useDebugSettings() {
  // ===== 响应式状态 =====
  const showDebug = ref(false)
  
  const debugSettings = reactive<DebugSettings>({
    shapes: {
      1: { scale: 1.67, offsetX: 5, offsetY: 5 },
      2: { scale: 1.4, offsetX: -1, offsetY: -2 },
      3: { scale: 1.4, offsetX: -2, offsetY: -2 },
      4: { scale: 1.13, offsetX: 7, offsetY: 6 }
    }
  })

  // ===== 本地存储键名 =====
  const STORAGE_KEY = 'chess-debug-settings'
  const SHOW_DEBUG_KEY = 'chess-show-debug'

  // ===== 初始化 =====
  function initializeDebugSettings() {
    // 读取调试面板显示状态
    const savedShowDebug = localStorage.getItem(SHOW_DEBUG_KEY)
    if (savedShowDebug !== null) {
      showDebug.value = JSON.parse(savedShowDebug)
    }

    // 读取调试设置
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        Object.assign(debugSettings, parsed)
      } catch (error) {
        console.warn('Failed to parse saved debug settings:', error)
        resetAllDebugSettings()
      }
    }
  }

  // ===== 调试设置方法 =====
  
  /**
   * 重置所有调试设置
   */
  function resetAllDebugSettings() {
    debugSettings.shapes = {
      1: { scale: 1.67, offsetX: 5, offsetY: 5 },
      2: { scale: 1.4, offsetX: -1, offsetY: -2 },
      3: { scale: 1.4, offsetX: -2, offsetY: -2 },
      4: { scale: 1.13, offsetX: 7, offsetY: 6 }
    }
    saveDebugSettings()
  }

  /**
   * 重置单个棋子的设置
   */
  function resetShape(shapeId: number) {
    const defaultSettings: Record<number, { scale: number; offsetX: number; offsetY: number }> = {
      1: { scale: 1.67, offsetX: 5, offsetY: 5 },
      2: { scale: 1.4, offsetX: -1, offsetY: -2 },
      3: { scale: 1.4, offsetX: -2, offsetY: -2 },
      4: { scale: 1.13, offsetX: 7, offsetY: 6 }
    }
    debugSettings.shapes[shapeId] = { ...defaultSettings[shapeId] }
    saveDebugSettings()
  }

  /**
   * 更新棋子设置
   */
  function updateShapeSettings(shapeId: number, settings: Partial<{ scale: number; offsetX: number; offsetY: number }>) {
    const shapeSettings = debugSettings.shapes[shapeId]
    if (shapeSettings) {
      Object.assign(shapeSettings, settings)
      saveDebugSettings()
    }
  }

  /**
   * 保存调试设置到本地存储
   */
  function saveDebugSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(debugSettings))
  }

  /**
   * 保存显示状态到本地存储
   */
  function saveShowDebugState() {
    localStorage.setItem(SHOW_DEBUG_KEY, JSON.stringify(showDebug.value))
  }

  /**
   * 导出设置
   */
  function exportDebugSettings() {
    const dataStr = JSON.stringify(debugSettings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'chess-debug-settings.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * 导入设置
   */
  function importDebugSettings() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          Object.assign(debugSettings, imported)
          saveDebugSettings()
        } catch (error) {
          console.error('Failed to import debug settings:', error)
          alert('导入失败：文件格式不正确')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  /**
   * 切换调试面板显示
   */
  function toggleDebugPanel() {
    showDebug.value = !showDebug.value
  }

  // ===== 计算棋子样式 =====
  
  /**
   * 获取棋子的调试样式
   */
  function getPieceDebugStyle(shapeId: number) {
    const settings = debugSettings.shapes[shapeId]
    if (!settings) return {}

    return {
      transform: `scale(${settings.scale}) translate(${settings.offsetX}px, ${settings.offsetY}px)`,
      transformOrigin: 'center center'
    }
  }

  // ===== 监听器 =====
  
  // 监听显示状态变化并保存
  watch(showDebug, saveShowDebugState)

  // 初始化
  initializeDebugSettings()

  return {
    // 状态
    showDebug,
    debugSettings,
    
    // 方法
    resetAllDebugSettings,
    resetShape,
    updateShapeSettings,
    exportDebugSettings,
    importDebugSettings,
    toggleDebugPanel,
    getPieceDebugStyle,
    
    // 工具方法
    saveDebugSettings,
    initializeDebugSettings
  }
}