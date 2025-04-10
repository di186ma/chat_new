<template>
  <div class="rooms-container">
    <Card>
      <template #title>Комнаты чата</template>
      <template #content>
        <div class="p-grid">
          <div class="p-col-12 p-md-4">
            <div class="p-inputgroup">
              <InputText v-model="newRoomName" placeholder="Название комнаты" />
              <Button icon="pi pi-plus" @click="createRoom" />
            </div>
          </div>
        </div>
        <DataTable :value="rooms" class="p-datatable-sm">
          <Column field="name" header="Название"></Column>
          <Column header="Действия">
            <template #body="slotProps">
              <Button 
                icon="pi pi-comments" 
                @click="joinRoom(slotProps.data.name)"
                label="Присоединиться"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

export default {
  components: {
    Card,
    InputText,
    Button,
    DataTable,
    Column
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const rooms = ref([]);
    const newRoomName = ref('');

    const loadRooms = async () => {
      try {
        rooms.value = await store.dispatch('fetchRooms');
      } catch (error) {
        console.error('Failed to load rooms:', error);
      }
    };

    const createRoom = async () => {
      if (newRoomName.value.trim()) {
        try {
          await store.dispatch('createRoom', newRoomName.value);
          newRoomName.value = '';
          await loadRooms();
        } catch (error) {
          console.error('Failed to create room:', error);
        }
      }
    };

    const joinRoom = (roomName) => {
      router.push(`/chat/${roomName}`);
    };

    onMounted(loadRooms);

    return {
      rooms,
      newRoomName,
      createRoom,
      joinRoom
    };
  }
};
</script>

<style scoped>
.rooms-container {
  padding: 2rem;
}

.p-inputgroup {
  margin-bottom: 1rem;
}
</style> 