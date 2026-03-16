<template>
    <div class="modal-content">
        <div class="form">
            <div class="form-group">
                <label for="nombre" class="form-label required">Nombre</label>
                <InputText 
                    id="nombre" 
                    v-model="formData.nombre"
                    :required="true"
                />
            </div>
            
            <div class="form-group">
                <label for="solicitante" class="form-label">Solicitante</label>
                <InputText 
                    id="solicitante" 
                    v-model="formData.solicitante" 
                />
            </div>
            
            <div class="form-group">
                <label for="expediente" class="form-label">Expediente</label>
                <InputText 
                    id="expediente" 
                    v-model="formData.expediente" 
                />
            </div>
            
            <div class="form-group">
                <label for="estado" class="form-label required">Estado</label>
                <Select 
                    id="estado" 
                    v-model="formData.estado" 
                    :options="estados" 
                    optionLabel="label"
                    optionValue="value"
                    :required="true"
                />
            </div>
            
            <div class="form-group">
                <label for="fecha_convocatoria_plan" class="form-label">Fecha Convocatoria/Plan</label>
                <Select 
                    id="fecha_convocatoria_plan" 
                    v-model="formData.fecha_convocatoria_plan" 
                    :options="aniosConvocatoria" 
                    optionLabel="label"
                    optionValue="value"
                />
            </div>
            
            <div class="form-group">
                <label for="responsable" class="form-label">Responsable</label>
                <Select 
                    id="responsable" 
                    v-model="formData.responsable" 
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
            
            <div class="form-group">
                <label for="tipo_bonificacion" class="form-label">Tipo de bonificación</label>
                <Select 
                    id="tipo_bonificacion" 
                    v-model="formData.tipo_bonificacion" 
                    :options="tiposBonificacion" 
                    optionLabel="label"
                    optionValue="value"
                />
            </div>
            
            <div class="form-group">
                <label for="fecha_inicio" class="form-label">Fecha de inicio</label>
                <DatePicker 
                    id="fecha_inicio" 
                    v-model="fechaInicioLocal" 
                    dateFormat="dd/mm/yy"
                    showIcon
                />
            </div>
            
            <div class="form-group">
                <label for="fecha_fin" class="form-label">Fecha de fin</label>
                <DatePicker 
                    id="fecha_fin" 
                    v-model="fechaFinLocal" 
                    dateFormat="dd/mm/yy"
                    showIcon
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted, nextTick, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import { useAuthStore } from '@/stores/auth'
import { loadResponsablesForSelect } from '@/utils/functions.js'
import { ESTADOS_PLAN, TIPO_BONIFICACION } from '@/utils/enums.js'
import { useDateUTC } from '@/composables/useDateUTC.js'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:modelValue'])

// Usar el composable useDateUTC para las fechas
const { localValue: fechaInicioLocal, utcValue: fechaInicioUTC } = useDateUTC()
const { localValue: fechaFinLocal, utcValue: fechaFinUTC } = useDateUTC()

const formData = ref({
    nombre: '',
    solicitante: '',
    expediente: '',
    estado: null,
    fecha_convocatoria_plan: null,
    responsable: null,
    tipo_bonificacion: null,
    fecha_inicio: null,
    fecha_fin: null,
    ...props.modelValue
})

const estados = ref(Object.values(ESTADOS_PLAN).map(estado => ({ label: estado, value: estado })))


const authStore = useAuthStore()
const responsables = ref([])
const loadingUsers = ref(false)
const usersError = ref(null)

const tiposBonificacion = ref(Object.values(TIPO_BONIFICACION).map(tipo => ({ label: tipo, value: tipo })))

// Validación del formulario
const isFormValid = computed(() => {
    // Campos requeridos
    const requiredFields = {
        nombre: formData.value.nombre?.trim(),
        estado: formData.value.estado
    }
    
    // Verificar que todos los campos requeridos estén llenos
    const requiredFieldsValid = Object.values(requiredFields).every(value => 
        value !== null && value !== undefined && value !== ''
    )
    
    // Validación de fechas: si ambas fechas están presentes, fecha fin debe ser posterior a fecha inicio
    let datesValid = true
    if (fechaInicioUTC.value && fechaFinUTC.value) {
        const fechaInicio = new Date(fechaInicioUTC.value)
        const fechaFin = new Date(fechaFinUTC.value)
        datesValid = fechaFin >= fechaInicio
    }
    
    return requiredFieldsValid && datesValid
})

// Generar años desde el actual hasta 5 años más
const aniosConvocatoria = ref((() => {
    const anioActual = new Date().getFullYear()
    const anios = []
    for (let i = 0; i <= 5; i++) {
        const anio = anioActual + i
        anios.push({ label: anio.toString(), value: anio })
    }
    return anios
})())


// Función simple para emitir los datos del formulario
const emitFormData = () => {
    const dataToEmit = {
        ...formData.value,
        fecha_inicio: fechaInicioUTC.value,
        fecha_fin: fechaFinUTC.value
    };
    
    emit('update:modelValue', dataToEmit);
};

defineExpose({
    emitFormData,
    isFormValid
});

watch(() => props.modelValue, (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
        // Actualizar formData con todos los campos excepto fechas
        const { fecha_inicio, fecha_fin, ...otherData } = newValue;
        formData.value = { ...formData.value, ...otherData };
        
        // Manejar fechas UTC usando el composable
        if (fecha_inicio) {
            const fechaInicioDate = typeof fecha_inicio === 'string' ? new Date(fecha_inicio) : fecha_inicio;
            fechaInicioUTC.value = fechaInicioDate;
        }
        
        if (fecha_fin) {
            const fechaFinDate = typeof fecha_fin === 'string' ? new Date(fecha_fin) : fecha_fin;
            fechaFinUTC.value = fechaFinDate;
        }
    }
}, { immediate: true });


onMounted(async () => {
    await loadResponsablesForSelect(authStore, {
        loadingRef: loadingUsers,
        errorRef: usersError,
        responsablesRef: responsables
    })
})
</script>
