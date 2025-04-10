<template>
  <div class="data-table-page">
    <h2>Данные из базы данных</h2>
    <DataTable :value="messages" :paginator="true" :rows="10" 
               :rowsPerPageOptions="[5,10,20]" 
               :loading="loading"
               responsiveLayout="scroll">
      <Column field="id" header="ID" :sortable="true"></Column>
      <Column field="username" header="Пользователь" :sortable="true"></Column>
      <Column field="content" header="Сообщение" :sortable="true"></Column>
      <Column field="room" header="Комната" :sortable="true"></Column>
      <Column field="created_at" header="Дата" :sortable="true">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.created_at) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import axios from 'axios';

export default {
  name: 'DataTablePage',
  components: {
    DataTable,
    Column
  },
  setup() {
    const store = useStore();
    const messages = ref([]);
    const loading = ref(true);

    const loadMessages = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/messages/', {
          headers: {
            'Authorization': `Bearer ${store.state.token}`
          }
        });
        messages.value = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке сообщений:', error);
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU');
    };

    onMounted(() => {
      loadMessages();
    });

    return {
      messages,
      loading,
      formatDate
    };
  }
};
</script>

<style scoped>
.data-table-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}
</style> 