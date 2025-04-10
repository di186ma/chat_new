import { createRouter, createWebHistory } from 'vue-router';
import { useStore } from 'vuex';

import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Rooms from '../components/Rooms.vue';
import Chat from '../components/Chat.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: Rooms,
    meta: { requiresAuth: true }
  },
  {
    path: '/chat/:roomName',
    name: 'Chat',
    component: Chat,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    redirect: '/rooms'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const store = useStore();
  const isAuthenticated = store.getters.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router; 