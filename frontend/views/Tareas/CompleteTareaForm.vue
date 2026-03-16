<template>
    <div class="modal-content">
        <p>Vas a marcar como completada la tarea: <strong>"{{ formData.nombre_tarea }}"</strong>, esta acción no se puede deshacer.</p>
        <div class="form">
            
            <div class="form-group">
                <label for="observaciones" class="form-label">Observaciones</label>
                <Textarea 
                    id="observaciones" 
                    v-model="formData.observaciones" 
                    :rows="3"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Textarea from 'primevue/textarea'
import { ESTADO_TAREA } from '@/utils/enums.js'
import { useAuthStore } from '@/stores/auth.js'
import { loadResponsablesForSelect } from '@/utils/functions.js'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    },
    tarea: {
        type: Object,
        default: () => ({})
    },
    grupoPreseleccionado: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['update:modelValue', 'update:tarea'])

const authStore = useAuthStore()

// Lista de responsables cargada desde localStorage
const responsables = ref([])
const loadingUsers = ref(false)
const usersError = ref(null)

const formData = ref({
    nombre_tarea: '',
    estado: ESTADO_TAREA.COMPLETA, // Establecer como completada por defecto
    observaciones: '',
    id_grupo: '',
    autor_azure_id: authStore.user?.id || '',
    responsable_azure_id: '',
    ...props.modelValue
})

// Función simple para emitir los datos del formulario
const emitFormData = () => {
    emit('update:modelValue', formData.value);
    emit('update:tarea', formData.value);
};

defineExpose({
    emitFormData
});

// Watcher para modelValue (usado por ReusableDialog)
watch(() => props.modelValue, (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
        // Si no viene autor_azure_id en los datos, usar el del usuario logueado
        const dataToMerge = { ...newValue }
        if (!dataToMerge.autor_azure_id) {
            dataToMerge.autor_azure_id = authStore.user?.id || ''
        }
        //Establecer estado como completada por defecto
        dataToMerge.estado = ESTADO_TAREA.COMPLETA
        
        formData.value = { ...formData.value, ...dataToMerge }
    }
}, { immediate: true })

// Cargar responsables al montar el componente
onMounted(async () => {
    await loadResponsablesForSelect(authStore, {
        loadingRef: loadingUsers,
        errorRef: usersError,
        responsablesRef: responsables
    })
})
</script>
