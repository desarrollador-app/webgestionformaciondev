<template>
  <div v-if="authStore.isLoading && !authStore.isInitialized" class="loading-container">
    <div class="flex flex-column align-items-center gap-3">
      <ProgressSpinner />
      <p>Cargando aplicación...</p>
    </div>
  </div>
  <Layout v-else>
    <router-view />
  </Layout>
  <Toast />
  <ConfirmDialog />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import Layout from '@/components/Layout/Navbar.vue';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

const authStore = useAuthStore();

onMounted(async () => {
  // Inicializa la autenticación al montar la aplicación
  await authStore.initialize();
});
</script>