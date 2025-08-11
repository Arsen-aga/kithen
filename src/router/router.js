import Main from '@/pages/loginAuth.vue';
import ErrorPage from '@/pages/404Page.vue';

import { createRouter, createWebHistory } from 'vue-router';


const routes = [

    {
        name: 'Home',
        path: '',
        component: Main,
    },
    {
        name: 'Admin',
        path: '/admin',
        component: () => import('@/pages/AccountPage.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        component: ErrorPage,
    },


];

const router = createRouter({
    mode: 'history',
    routes,
    history: createWebHistory(),
    scrollBehavior() {
        document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
    },
});

export default router;
