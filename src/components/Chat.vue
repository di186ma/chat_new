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
  name: 'Chat',
  components: {
    Card,
    InputText,
    Button
  },
  props: {
    roomName: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const store = useStore();
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
        
        const room = roomsResponse.data.find(r => r.name === props.roomName);
        
        if (room) {
          const messagesResponse = await axios.get(`http://localhost:8000/api/messages/?room=${room.id}`, {
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
      socket = new WebSocket(`ws://localhost:8000/ws/chat/${props.roomName}/?token=${token}`);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        messages.value.push(data);
        scrollToBottom();
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setTimeout(connectWebSocket, 1000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    const sendMessage = () => {
      if (!newMessage.value.trim()) return;
      
      if (socket && socket.readyState === WebSocket.OPEN) {
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
      messages,
      newMessage,
      messagesContainer,
      currentUsername,
      sendMessage
    };
  }
};
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.messages-container {
  height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.message {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.my-message {
  background-color: #e3f2fd;
  margin-left: 20%;
}

.input-container {
  display: flex;
  gap: 10px;
}

.input-container input {
  flex: 1;
}
</style> 