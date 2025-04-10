<template>
  <div class="room-list">
    <div class="header">
      <h2>Комнаты чата</h2>
      <div class="buttons">
        <Button label="Создать комнату" @click="showCreateRoomDialog = true" />
        <Button label="Просмотр данных" @click="goToDataTable" class="p-button-secondary" />
      </div>
    </div>
    
    <div class="room-list-content">
      <div v-for="room in rooms" :key="room.id" class="room-item">
        <router-link :to="{ name: 'chat', params: { roomName: room.name } }">
          {{ room.name }}
        </router-link>
      </div>
    </div>

    <Dialog v-model:visible="showCreateRoomDialog" header="Создание комнаты" :modal="true">
      <div class="create-room-form">
        <InputText v-model="newRoomName" placeholder="Название комнаты" />
      </div>
      <template #footer>
        <Button label="Отмена" @click="showCreateRoomDialog = false" class="p-button-text" />
        <Button label="Создать" @click="createRoom" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'

export default {
  name: 'RoomList',
  components: {
    Button,
    Dialog,
    InputText
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const newRoomName = ref('')
    const showCreateRoomDialog = ref(false)

    const rooms = computed(() => store.getters.rooms)

    const loadRooms = async () => {
      try {
        await store.dispatch('loadRooms')
      } catch (error) {
        console.error('Ошибка при загрузке комнат:', error)
      }
    }

    const createRoom = async () => {
      if (!newRoomName.value.trim()) return
      try {
        await store.dispatch('createRoom', newRoomName.value)
        newRoomName.value = ''
        showCreateRoomDialog.value = false
        await loadRooms()
      } catch (error) {
        console.error('Ошибка при создании комнаты:', error)
      }
    }

    const goToDataTable = () => {
      router.push('/data')
    }

    onMounted(loadRooms)

    return {
      rooms,
      newRoomName,
      showCreateRoomDialog,
      createRoom,
      goToDataTable
    }
  }
}
</script>

<style scoped>
.room-list {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.buttons {
  display: flex;
  gap: 10px;
}

.room-list-content {
  margin-bottom: 20px;
}

.room-item {
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.room-item a {
  text-decoration: none;
  color: #333;
}

.create-room-form {
  margin-bottom: 20px;
}
</style> 