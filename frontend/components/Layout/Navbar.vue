<template>
  <div class="app-container">
    <Menubar 
    :model="menuItems"
    :key="route.path">
        <template #start>
            <Logo />
        </template>
// Modificamos el circulo del avatar para que salga la primera letra del nombre del usuario si no que salga la letra "U" de usuario
<template #end>
          <div class="user-menu flex items-center gap-3 px-2">
            <Avatar 
              shape="circle" 
              size="large"
              class="cursor-pointer bg-white text-blue-900 flex items-center justify-center select-none"
              @click="toggleUserMenu"
            >
              <span class="font-bold text-xl cursor-pointer select-none">
                {{ inicialUsuario }}
              </span>
            </Avatar>
            <Menu 
              ref="userMenu" 
              id="user_menu" 
              :model="userMenuItems" 
              :popup="true" 
            />
          </div>
        </template>
    </Menubar>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { useStore } from '@/stores/main.js';
import Menubar from 'primevue/menubar';
import Menu from 'primevue/menu';
import Logo from '@/components/Logo/Logo.vue';
import Avatar from 'primevue/avatar';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const store = useStore();
const userMenu = ref();

const toggleUserMenu = (event) => {
  userMenu.value.toggle(event);
};

const userMenuItems = computed(() => [
  {
    label: authStore.user?.name,
    disabled: true,
  },
  {
    separator: true
  },
  {
    label: 'Cerrar sesión',
    command: async () => {
      await authStore.logout();
    }
  }
]);

const menuItems = computed(() => [
   {
    label: 'Inicio',
    url: '/',
    command: () => {
      store.clearActiveState();
    },
    class: route.name === 'Home' || route.name === 'Home alt'
      ? 'p-menuitem-active'
      : ''
  },
  {
    label: 'Planes',
    url: '/planes',
    command: () => {
      store.clearActiveState();
    },
    class: route.name === 'Planes'
      ? 'p-menuitem-active'
      : ''
  },
  {
    label: 'Acciones formativas',
    url: '/acciones-formativas',
    command: () => {
      store.clearActiveState();
    },
    class: route.name === 'Acciones formativas'
      ? 'p-menuitem-active'
      : ''
  },
  {
    label: 'Grupos',
    url: '/grupos',
    command: () => {
      store.clearActiveState();
    },
    class: route.name === 'Grupos'
      ? 'p-menuitem-active'
      : ''
  },
  {
    label: 'Personas',
    url: '/personas',
    command: () => {
      store.clearActiveState();
    },
    class: route.name === 'Personas'
      ? 'p-menuitem-active'
      : ''
  },
  {
    label: 'Empresas',
    url: '/empresas',
    command: () => {
      store.clearActiveState();
    },
    class: route.name === 'Empresas'
      ? 'p-menuitem-active'
      : ''
  },
  {
    label: 'Tareas',
    url: '/tareas',
    command: () => {
      store.clearActiveState();
    },
    class: route.name === 'Tareas'
      ? 'p-menuitem-active'
      : ''
  }

  /**
   * { 
   *  label: 'Tareas',
   *  command: () => {
   *  store.clearActiveState();
   *  router.push('/tareas');
   *  }, 
   *  class: route.name === 'Tareas' ? 'p-menuitem-active' : ''
   *  }
   */
]);

const inicialUsuario = computed(() => {
  const nombre = authStore.user?.name;
  // Si hay nombre, saca la primera letra en mayúscula. Si no, pone "U"
  return nombre ? nombre.charAt(0).toUpperCase() : 'U';
});
</script>

<style scoped>
/* Le decimos que si el botón no es el activo, y no tiene el ratón encima, quite el fondo */
:deep(.p-menubar .p-menuitem:not(.p-menuitem-active):not(:hover) > .p-menuitem-content),
:deep(.p-menubar .p-menuitem:not(.p-menuitem-active):not(:hover) > .p-menuitem-link) {
    background-color: transparent !important;
}

/* Para asegurarnos de que el texto tampoco se quede marcado si está atascado */
:deep(.p-menubar .p-menuitem:not(.p-menuitem-active):not(:hover) .p-menuitem-text) {
    color: inherit !important;
}
</style>