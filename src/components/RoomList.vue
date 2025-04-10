<template>
  <div class="room-list">
    <div class="header">
      <h2>Комнаты чата</h2>
      <div class="buttons">
        <Button label="Создать комнату" @click="showCreateRoomDialog = true" />
        <Button label="Просмотр данных" @click="goToDataTable" class="p-button-secondary" />
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();

    const goToDataTable = () => {
      router.push('/data');
    };

    return {
      goToDataTable
    };
  }
};
</script>

<style scoped>
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
</style> 