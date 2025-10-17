import { watch } from 'vue'
import { gsap } from 'gsap'
import type { ChessPiece, Position } from '@/types/chess'

/**
 * 棋子动画管理
 */
export function usePieceAnimation() {
  /**
   * 存储棋子的上一个位置
   */
  const previousPositions = new Map<string, Position>()

  /**
   * 动画移动棋子
   * @param pieceId 棋子 ID
   * @param fromPosition 起始位置
   * @param toPosition 目标位置
   * @param element DOM 元素
   * @param onComplete 完成回调
   */
  function animateMove(
    pieceId: string,
    fromPosition: Position,
    toPosition: Position,
    element: HTMLElement,
    onComplete?: () => void
  ): void {
    const cellSize = 100 // 格子大小
    const gap = 2 // 格子间距
    
    // 计算移动距离（像素）
    const deltaX = (toPosition.col - fromPosition.col) * (cellSize + gap)
    const deltaY = (toPosition.row - fromPosition.row) * (cellSize + gap)

    // 设置初始位置偏移
    gsap.set(element, {
      x: -deltaX,
      y: -deltaY
    })

    // 执行动画
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        // 清除变换，避免累积
        gsap.set(element, { clearProps: 'x,y' })
        if (onComplete) onComplete()
      }
    })
  }

  /**
   * 跳跃动画（更有趣的移动效果）
   */
  function animateJump(
    pieceId: string,
    fromPosition: Position,
    toPosition: Position,
    element: HTMLElement,
    onComplete?: () => void
  ): void {
    const cellSize = 100
    const gap = 2
    
    const deltaX = (toPosition.col - fromPosition.col) * (cellSize + gap)
    const deltaY = (toPosition.row - fromPosition.row) * (cellSize + gap)

    // 计算跳跃高度（根据距离）
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const jumpHeight = Math.min(distance * 0.3, 60)

    // 创建时间线动画
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(element, { clearProps: 'x,y,z,scale,rotationZ' })
        if (onComplete) onComplete()
      }
    })

    // 设置初始位置
    gsap.set(element, {
      x: -deltaX,
      y: -deltaY,
      z: 0,
      scale: 1
    })

    // 跳跃动画
    tl.to(element, {
      x: 0,
      y: 0,
      z: jumpHeight,
      scale: 1.1,
      duration: 0.3,
      ease: 'power2.out'
    })
    .to(element, {
      z: 0,
      scale: 1,
      duration: 0.3,
      ease: 'power2.in'
    }, '-=0.15')
    .to(element, {
      scale: 0.95,
      duration: 0.05,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    }, '-=0.1')
  }

  /**
   * 滑动动画（流畅的移动）
   */
  function animateSlide(
    pieceId: string,
    fromPosition: Position,
    toPosition: Position,
    element: HTMLElement,
    onComplete?: () => void
  ): void {
    const cellSize = 100
    const gap = 2
    
    const deltaX = (toPosition.col - fromPosition.col) * (cellSize + gap)
    const deltaY = (toPosition.row - fromPosition.row) * (cellSize + gap)

    // 创建时间线
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(element, { clearProps: 'x,y,rotationZ,scale' })
        if (onComplete) onComplete()
      }
    })

    gsap.set(element, {
      x: -deltaX,
      y: -deltaY
    })

    // 流畅滑动 + 轻微旋转
    tl.to(element, {
      x: 0,
      y: 0,
      rotationZ: deltaX > 0 ? 5 : -5,
      duration: 0.4,
      ease: 'power1.inOut'
    })
    .to(element, {
      rotationZ: 0,
      duration: 0.15,
      ease: 'power2.out'
    }, '-=0.1')
  }

  /**
   * 传送动画（淡入淡出）
   */
  function animateTeleport(
    pieceId: string,
    fromPosition: Position,
    toPosition: Position,
    element: HTMLElement,
    onComplete?: () => void
  ): void {
    const cellSize = 100
    const gap = 2
    
    const deltaX = (toPosition.col - fromPosition.col) * (cellSize + gap)
    const deltaY = (toPosition.row - fromPosition.row) * (cellSize + gap)

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(element, { clearProps: 'all' })
        if (onComplete) onComplete()
      }
    })

    gsap.set(element, {
      x: -deltaX,
      y: -deltaY
    })

    tl.to(element, {
      opacity: 0,
      scale: 0.5,
      duration: 0.2,
      ease: 'power2.in'
    })
    .set(element, {
      x: 0,
      y: 0
    })
    .to(element, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      ease: 'back.out(1.7)'
    })
  }

  /**
   * 更新棋子位置并触发动画
   */
  function updatePiecePosition(piece: ChessPiece, element: HTMLElement | null): void {
    if (!element || !piece.position) return

    const previousPos = previousPositions.get(piece.id)
    
    if (previousPos && piece.position) {
      // 检查位置是否改变
      if (previousPos.row !== piece.position.row || previousPos.col !== piece.position.col) {
        // 触发跳跃动画（最有趣的效果）
        animateJump(piece.id, previousPos, piece.position, element)
      }
    }

    // 更新位置记录
    if (piece.position) {
      previousPositions.set(piece.id, { ...piece.position })
    }
  }

  /**
   * 清除棋子位置记录
   */
  function clearPiecePosition(pieceId: string): void {
    previousPositions.delete(pieceId)
  }

  return {
    animateMove,
    animateJump,
    animateSlide,
    animateTeleport,
    updatePiecePosition,
    clearPiecePosition
  }
}
