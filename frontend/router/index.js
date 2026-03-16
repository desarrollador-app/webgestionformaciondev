import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import HomeView from '@/views/Dashboard/home.vue';
import PlanesView from '@/views/Planes/planList.vue';
import PlanDetailView from '@/views/Planes/planDetail.vue';
import AccionesFormativasView from '@/views/AccionesFormativas/accionesFormativas.vue';
import AccionFormativaDetailView from '@/views/AccionesFormativas/accionFormativaDetail.vue';
import GruposView from '@/views/Grupos/groupsList.vue';
import GrupoDetailView from '@/views/Grupos/grupoDetail.vue';
import PersonasView from '@/views/Personas/personsList.vue';
import PersonaDetailView from '@/views/Personas/personaDetail.vue';
import EmpresasView from '@/views/Empresas/empresas.vue';
import EmpresaDetailView from '@/views/Empresas/empresaDetail.vue';
import TareasView from '@/views/Tareas/tareaList.vue';
import SesionesView from '@/views/Sesiones/sesion.vue';
import CorreoBienvenidaView from '@/views/Grupos/CorreoBienvenida.vue';
import CorreoDiplomaView from '@/views/Grupos/CorreoDiploma.vue';


const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:3000' 
  : window.location.origin;
  
const routes = [
	{
		path: '/.auth/login/aad/callback',
		name: 'AzureCallback',
		beforeEnter: async (to, from, next) => {
			try {
				const code = to.query.code;
				const error = to.query.error;
				
				if (error) {
					next('/');
					return;
				}
				
				if (code) {
					const response = await fetch(`${API_BASE_URL}/auth/callback?code=${code}`, {
						method: 'GET',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
						}
					});
					
					if (response.ok) {
						const authStore = useAuthStore();
						await authStore.updateAuthState();
						next('/');
						return;
					}
				}
				
				next('/');
			} catch (error) {
				console.error('Error procesando callback de autenticación de Azure:', error);
				next('/');
			}
		}
	},
	{
		path: '/',
		name: 'Home',
		component: HomeView,
		meta: { requiresAuth: true }
	},
	{
		path: '/planes',
		name: 'Planes',
		component: PlanesView,
		meta: { requiresAuth: true }
	},
	{
		path: '/planes/:id',
		name: 'PlanDetail',
		component: PlanDetailView,
		meta: { requiresAuth: true }
	},
	{
		path: '/acciones-formativas',
		name: 'Acciones formativas',
		component: AccionesFormativasView,
		meta: { requiresAuth: true }
	},
	{
		path: '/acciones-formativas/:id',
		name: 'AccionFormativaDetail',
		component: AccionFormativaDetailView,
		meta: { requiresAuth: true }
	},
	{
		path: '/grupos',
		name: 'Grupos',
		component: GruposView,
		meta: { requiresAuth: true }
	},
	{
		path: '/grupos/:id',
		name: 'GrupoDetail',
		component: GrupoDetailView,
		meta: { requiresAuth: true }
	},
	{
		path: '/personas',
		name: 'Personas',
		component: PersonasView,
		meta: { requiresAuth: true }
	},
	{
		path: '/personas/:id',
		name: 'PersonaDetail',
		component: PersonaDetailView,
		meta: { requiresAuth: true }
	},
	{
		path: '/empresas',
		name: 'Empresas',
		component: EmpresasView,
		meta: { requiresAuth: true }
	},
	{
		path: '/empresas/:id',
		name: 'EmpresaDetail',
		component: EmpresaDetailView,
		meta: { requiresAuth: true }
	},
	{
		path: '/tareas',
		name: 'Tareas',
		component: TareasView,
		meta: { requiresAuth: true }
	},
	{
		path: '/grupos/:id/sesiones',
		name: 'Sesiones',
		component: SesionesView,
		meta: { requiresAuth: true }
	},
	{
		path: '/grupos/:id/correo-bienvenida',
		name: 'CorreoBienvenida',
		component: CorreoBienvenidaView,
		meta: { requiresAuth: true }
	},
	{
		path: '/grupos/:id/correo-diploma',
		name: 'CorreoDiploma',
		component: CorreoDiplomaView,
		meta: { requiresAuth: true }
	}
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
});

/**
 * Guard de navegación para autenticación.
 * Verifica si el usuario está autenticado y si el usuario está autenticado, 
 * permite el acceso a la ruta. Si no, redirige a Azure Login.
 
router.beforeEach(async (to, from, next) => {	
	const authStore = useAuthStore();
	
	if (!authStore.isInitialized) {
		await authStore.initialize();
	}
	
	const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
	
	if (requiresAuth && !authStore.isAuthenticated) {
		await authStore.login();
		return;
	}
	
	next();
}); */


router.beforeEach((to, from, next) => {
    next();
});

export default router; 
