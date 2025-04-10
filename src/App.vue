<template>
  <div class="app">
    <Menubar :model="menuItems">
      <template #end v-if="isAuthenticated">
        <div class="user-info">
          <span class="username">{{ username }}</span>
        </div>
      </template>
    </Menubar>
    <router-view></router-view>
  </div>
</template>

<script>
import Menubar from 'primevue/menubar';
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'App',
  components: {
    Menubar
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const username = computed(() => {
      const user = store.state.user;
      return user ? user.username : '';
    });

    const menuItems = computed(() => {
      if (isAuthenticated.value) {
        return [
          {
            label: 'Комнаты',
            icon: 'pi pi-home',
            command: () => router.push('/rooms')
          },
          {
            label: 'Выйти',
            icon: 'pi pi-sign-out',
            command: () => {
              store.dispatch('logout');
              router.push('/login');
            }
          }
        ];
      } else {
        return [
          {
            label: 'Войти',
            icon: 'pi pi-sign-in',
            command: () => router.push('/login')
          },
          {
            label: 'Регистрация',
            icon: 'pi pi-user-plus',
            command: () => router.push('/register')
          }
        ];
      }
    });

    return {
      menuItems,
      isAuthenticated,
      username
    };
  }
};
</script>

<style>
.app {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

.user-info {
  margin-right: 10px;
}

.username {
  font-weight: bold;
}
</style> 