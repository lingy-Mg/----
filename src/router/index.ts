import { createRouter, createWebHistory } from 'vue-router'
import ChessView from '../views/ChessView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ChessView,
    },
  ],
})

export default router
