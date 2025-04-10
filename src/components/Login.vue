<template>
  <div class="login-container">
    <Card class="login-card">
      <template #title>Вход</template>
      <template #content>
        <form @submit.prevent="handleSubmit">
          <div class="p-field">
            <label for="username">Имя пользователя</label>
            <InputText id="username" v-model="username" />
          </div>
          <div class="p-field">
            <label for="password">Пароль</label>
            <Password id="password" v-model="password" />
          </div>
          <Message v-if="error" severity="error">{{ error }}</Message>
          <Button type="submit" label="Войти" />
        </form>
      </template>
    </Card>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

export default {
  components: {
    Card,
    InputText,
    Password,
    Button,
    Message
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const error = computed(() => store.getters.error);

    const handleSubmit = async () => {
      try {
        const response = await store.dispatch('login', {
          username: username.value,
          password: password.value
        });
        console.log('Login response:', response);
        router.push('/rooms');
      } catch (error) {
        console.error('Login failed:', error);
      }
    };

    return {
      username,
      password,
      error,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-card {
  width: 400px;
}

.p-field {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}
</style> 