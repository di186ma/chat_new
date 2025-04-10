import { createRouter, createWebHistory } from 'vue-router';
import { useStore } from 'vuex';

import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Chat from '../components/Chat.vue';
import RoomList from '../components/RoomList.vue';
import DataTablePage from '../components/DataTablePage.vue';

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
    name: 'RoomList',
    component: RoomList,
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
  },
  {
    path: '/data',
    name: 'DataTable',
    component: DataTablePage,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Навигационный guard для проверки аутентификации
router.beforeEach((to, from, next) => {
  const store = useStore();
  const isAuthenticated = store.state.token;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router; 