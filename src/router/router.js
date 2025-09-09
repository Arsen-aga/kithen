import Home from '@/pages/AccountPage.vue'
import Login from '@/pages/loginAuth.vue'
import ErrorPage from '@/pages/404Page.vue'

import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    name: 'Login',
    path: '/login',
    component: Login,
  },
  {
    name: 'Home',
    path: '/',
    component: Home,
  },
  {
    name: 'Admin',
    path: '/admin',
    component: () => import('@/pages/AdminPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: ErrorPage,
  },
]

const router = createRouter({
  mode: 'history',
  routes,
  history: createWebHistory(),
  scrollBehavior() {
    document.getElementById('app').scrollIntoView({ behavior: 'smooth' })
  },
})

export default router
