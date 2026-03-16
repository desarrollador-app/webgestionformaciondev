import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index';
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import { CustomPreset } from './config/primevue-preset.js';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import '@mdi/font/css/materialdesignicons.css';
import './styles/main.scss';

// Importar servicios de PrimeVue
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

// Importar componentes de PrimeVue que se usarán globalmente
import Button from 'primevue/button';
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const app = createApp(App);
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia);
app.use(router);
app.use(PrimeVue,
	{ 
		theme: {
			preset: CustomPreset
		},
		locale: {
			firstDayOfWeek: 1, //Monday
			dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
			dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
			monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
		},
	}
);
app.use(ToastService);
app.use(ConfirmationService);

// Registrar componentes de PrimeVue globalmente
app.component('Button', Button);
app.component('DataTable', DataTable);
app.component('Column', Column);

app.mount('#app');
