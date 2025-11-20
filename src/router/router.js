import Home from '@/pages/AccountPage.vue'
import ListPage from '@/pages/admin/ListPage.vue'
import UniversalPage from '@/pages/admin/UniversalPage.vue'
import Login from '@/pages/loginAuth.vue'

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
    children: [
      {
        name: 'List',
        path: 'list/:pathName',
        component: ListPage,
        props: true,
      },
      {
        name: 'Edit',
        path: 'edit/:name/:id',
        component: UniversalPage,
        props: true,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/404Page.vue'),
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
