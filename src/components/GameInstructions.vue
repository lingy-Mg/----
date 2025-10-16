<template>
  <div class="game-instructions">
    <h2>🎮 游戏说明</h2>
    <div class="instructions-content">
      <div class="instruction-item">
        <span class="step-number">1</span>
        <p>从底部待选区域拖动彩色拼图块</p>
      </div>
      <div class="instruction-item">
        <span class="step-number">2</span>
        <p>将拼图块放置到棋盘的任意位置</p>
      </div>
      <div class="instruction-item">
        <span class="step-number">3</span>
        <p>将1-4号拼图按顺序放在顶部一行即可获胜</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-instructions {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.game-instructions h2 {
  margin: 0 0 15px 0;
  font-size: 20px;
  color: #333;
  text-align: center;
}

.instructions-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.instruction-item p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

@media (max-width: 600px) {
  .game-instructions {
    padding: 15px;
  }
  
  .instruction-item p {
    font-size: 13px;
  }
}
</style>
