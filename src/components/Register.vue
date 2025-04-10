<template>
  <div class="register-container">
    <Card class="register-card">
      <template #title>Регистрация</template>
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
          <div class="p-field">
            <label for="password2">Подтверждение пароля</label>
            <Password id="password2" v-model="password2" />
          </div>
          <Message v-if="error" severity="error">{{ error }}</Message>
          <Button type="submit" label="Зарегистрироваться" />
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
    const password2 = ref('');
    const error = computed(() => store.getters.error);

    const handleSubmit = async () => {
      try {
        await store.dispatch('register', {
          username: username.value,
          password: password.value,
          password2: password2.value
        });
        router.push('/login');
      } catch (error) {
        console.error('Registration failed:', error);
      }
    };

    return {
      username,
      password,
      password2,
      error,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.register-card {
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