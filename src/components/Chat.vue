<template>
  <div class="chat-container">
    <Card>
      <template #title>Чат: {{ roomName }}</template>
      <template #content>
        <div class="messages-container" ref="messagesContainer">
          <div v-for="(message, index) in messages" :key="index" 
               :class="['message', { 'my-message': message.username === currentUsername }]">
            <strong>{{ message.username }}:</strong> {{ message.message || message.content }}
          </div>
        </div>
        <div class="input-container">
          <InputText v-model="newMessage" @keyup.enter="sendMessage" placeholder="Введите сообщение..." />
          <Button icon="pi pi-send" @click="sendMessage" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import axios from 'axios';

export default {
  components: {
    Card,
    InputText,
    Button
  },
  setup() {
    const route = useRoute();
    const store = useStore();
    const roomName = route.params.roomName;
    const messages = ref([]);
    const newMessage = ref('');
    const messagesContainer = ref(null);
    let socket = null;
    
    const currentUsername = computed(() => {
      return store.state.user ? store.state.user.username : '';
    });

    const scrollToBottom = async () => {
      await nextTick();
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    };

    // Загрузка предыдущих сообщений
    const loadMessages = async () => {
      try {
        // Получаем ID комнаты по имени
        const roomsResponse = await axios.get('http://localhost:8000/api/rooms/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const room = roomsResponse.data.find(r => r.name === roomName);
        
        if (room) {
          const messagesResponse = await axios.get(`http://localhost:8000/api/rooms/${room.id}/messages/`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          console.log('Loaded messages:', messagesResponse.data);
          
          // Преобразуем данные с сервера в формат, ожидаемый компонентом
          messages.value = messagesResponse.data.map(msg => ({
            username: msg.username || (msg.user ? msg.user.username : 'Unknown'),
            message: msg.content
          }));
          
          await scrollToBottom();
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    const connectWebSocket = () => {
      const token = localStorage.getItem('token');
      socket = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/?token=${token}`);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        messages.value.push(data);
        scrollToBottom();
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    const sendMessage = () => {
      if (newMessage.value.trim() && socket) {
        socket.send(JSON.stringify({
          message: newMessage.value
        }));
        newMessage.value = '';
      }
    };

    onMounted(() => {
      loadMessages();
      connectWebSocket();
    });

    onUnmounted(() => {
      if (socket) {
        socket.close();
      }
    });

    return {
      roomName,
      messages,
      newMessage,
      messagesContainer,
      sendMessage,
      currentUsername
    };
  }
};
</script>

<style scoped>
.chat-container {
  padding: 2rem;
}

.messages-container {
  height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
}

.message {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.my-message {
  background-color: #e7f3ff;
  text-align: right;
}

.input-container {
  display: flex;
  gap: 0.5rem;
}

.input-container .p-inputtext {
  flex: 1;
}
</style> 