<template>
    <div class="modal-content">
        <div class="form">
            <div class="form-group">
                <label for="nombre" class="form-label required">Título de la tarea</label>
                <InputText 
                    id="nombre" 
                    v-model="formData.nombre_tarea"
                    :required="true"
                />
            </div>
            
            <div class="form-group">
                <label for="id_grupo" class="form-label">Grupo</label>
                <Select 
                    id="id_grupo" 
                    v-model="formData.id_grupo" 
                    :options="grupos" 
                    optionLabel="denominacion"
                    optionValue="id_grupo"
                    :loading="loading"
                    :disabled="isGrupoDisabled"
                    :required="true"
                />
            </div>
            
            <div class="form-group">
                <label for="estado" class="form-label required">Estado</label>
                <Select 
                    id="estado" 
                    v-model="formData.estado" 
                    :options="estadoTareaOptions" 
                    optionLabel="label"
                    optionValue="value"
                    :required="true"
                />
            </div>
<!-- Añadimos los apartados de fecha_vencimiento y color -->
            <div class="form-group">
                <label for="fecha_vencimiento" class="form-label">Fecha de vencimiento</label>
                <InputText
                    id="fecha_vencimiento"
                    v-model="formData.fecha_vencimiento"
                    type="date"
                />
            </div>
            <div class="form-group">
                <label for="color" class="form-label">Color</label>
                <Select
                    id="color"
                    v-model="formData.color"
                    :options="colorOptions"
                    optionLabel="label"
                    optionValue="value"
                />
            </div>
            
            <div class="form-group">
                <label for="observaciones" class="form-label">Observaciones</label>
                <Textarea 
                    id="observaciones" 
                    v-model="formData.observaciones" 
                    :rows="3"
                />
            </div>
            
            
            <div class="form-group">
                <label for="responsable_azure_id" class="form-label">Responsable</label>
                <!-- <label for="responsable_azure_id" class="form-label required">Responsable</label> -->
                <Select 
                    id="responsable_azure_id" 
                    v-model="formData.responsable_azure_id" 
                    :options="responsables" 
                    optionLabel="label"
                    optionValue="value"
                    :disabled="loadingUsers"
                    :loading="loadingUsers"
                />
                <small v-if="usersError" class="error-message">
                    Error al cargar responsables: {{ usersError }}
                </small>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { ESTADO_TAREA } from '@/utils/enums.js'
import { useGrupos } from '@/composables/useGrupos.js'
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

const { grupos, loading } = useGrupos()
const authStore = useAuthStore()

// Lista de responsables cargada desde localStorage
const responsables = ref([])
const loadingUsers = ref(false)
const usersError = ref(null)

// Añado los datos de fecha_vencimiento y color al formulario
const formData = ref({
    nombre_tarea: '',
    estado: '',
    observaciones: '',
    id_grupo: '',
    autor_azure_id: authStore.user?.id || '',
    responsable_azure_id: '',
    fecha_vencimiento: '',
    color: 'azul',
    ...props.modelValue
})

// Añado los daros para controlar los colores
const colorOptions = [
    { label: 'Rojo', value: 'rojo' },
    { label: 'Amarillo', value: 'amarillo' },
    { label: 'Verde', value: 'verde' },
    { label: 'Azul', value: 'azul' }
]

const estadoTareaOptions = [
    { label: ESTADO_TAREA.PENDIENTE, value: ESTADO_TAREA.PENDIENTE },
    { label: ESTADO_TAREA.COMPLETA, value: ESTADO_TAREA.COMPLETA }
]

// Validación del formulario 
const isFormValid = computed(() => {
    const requiredFields = {
        nombre_tarea: formData.value.nombre_tarea?.trim(),
        estado: formData.value.estado
    }

    const requiredFieldsValid = Object.values(requiredFields).every(value =>
        value !== null && value !== undefined && value !== ''
    )

    return requiredFieldsValid
})

/** const isFormValid = computed(() => {
    // Campos requeridos
    const requiredFields = {
        nombre_tarea: formData.value.nombre_tarea?.trim(),
        id_grupo: formData.value.id_grupo,
        estado: formData.value.estado,
        responsable_azure_id: formData.value.responsable_azure_id
    }
    
    // Verificar que todos los campos requeridos estén llenos
    const requiredFieldsValid = Object.values(requiredFields).every(value => 
        value !== null && value !== undefined && value !== ''
    )
    
    return requiredFieldsValid
}) */

const isGrupoDisabled = computed(() => {
    return props.grupoPreseleccionado !== null
})

// Función simple para emitir los datos del formulario
const emitFormData = () => {
    emit('update:modelValue', formData.value);
    emit('update:tarea', formData.value);
};

defineExpose({
    emitFormData,
    isFormValid
});

// Watcher para modelValue (usado por ReusableDialog) - similar a PlanForm.vue
watch(() => props.modelValue, (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
        // Si no viene autor_azure_id en los datos, usar el del usuario logueado
        const dataToMerge = { ...newValue }
        if (!dataToMerge.autor_azure_id) {
            dataToMerge.autor_azure_id = authStore.user?.id || ''
        }
        formData.value = { ...formData.value, ...dataToMerge }
    }
}, { immediate: true })

// Watcher para tarea (usado por otros componentes) Añadimos los campos de fecha_vencimiento y color    
watch(() => props.tarea, (newTarea) => {
    if (newTarea && Object.keys(newTarea).length > 0) {
        formData.value = {
            nombre_tarea: newTarea.nombre_tarea || '',
            id_grupo: newTarea.id_grupo || '',
            estado: newTarea.estado || '',
            observaciones: newTarea.observaciones || '',
            autor_azure_id: newTarea.autor_azure_id || '',
            responsable_azure_id: newTarea.responsable_azure_id || '',
            fecha_vencimiento: newTarea.fecha_vencimiento || '',
            color: newTarea.color || 'azul'
        }
    }
}, { immediate: true })

// Watcher para grupo preseleccionado
watch(() => props.grupoPreseleccionado, (newGrupo) => {
    if (newGrupo && newGrupo.id_grupo && formData.value.id_grupo !== newGrupo.id_grupo) {
        formData.value.id_grupo = newGrupo.id_grupo
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
