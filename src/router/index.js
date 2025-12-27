import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/dsa',
    name: 'DSA',
    component: () => import('@/views/DSAView.vue')
  },
  {
    path: '/algorithm',
    name: 'Algorithm',
    component: () => import('@/views/AlgorithmView.vue')
  },
  {
    path: '/interview',
    name: 'Interview',
    component: () => import('@/views/InterviewView.vue')
  },
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('@/views/PracticeView.vue')
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('@/views/GameView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
