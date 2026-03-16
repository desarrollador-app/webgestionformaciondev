<template>
    <div class="modal-content">
        <div class="form">
            <div class="form-group">
                <label for="tipoDocumento" class="form-label required">Tipo de documento</label>
                <Select 
                    id="tipoDocumento" 
                    v-model="formData.tipoDocumento" 
                    :options="tiposDocumento" 
                    optionLabel="label"
                    optionValue="value"
                    :required="true"
                />
            </div>
            
                <div class="form-group">
                    <label for="documento" class="form-label required">Documento</label>
                    <InputText 
                        id="documento" 
                        v-model="formData.documento" 
                        :required="true"
                        :class="{ 'p-invalid': errors.documento }"
                    />
                    <small v-if="errors.documento" class="p-error">{{ errors.documento }}</small>
                </div>
            
            <div class="form-group">
                <label for="nombre" class="form-label required">Nombre</label>
                <InputText 
                    id="nombre" 
                    v-model="formData.nombre" 
                    :required="true"
                    :class="{ 'p-invalid': errors.nombre }"
                />
                <small v-if="errors.nombre" class="p-error">{{ errors.nombre }}</small>
            </div>
            
            <div class="form-group">
                <label for="apellido1" class="form-label required">Primer apellido</label>
                <InputText 
                    id="apellido1" 
                    v-model="formData.apellido1" 
                    :required="true"
                    :class="{ 'p-invalid': errors.apellido1 }"
                />
                <small v-if="errors.apellido1" class="p-error">{{ errors.apellido1 }}</small>
            </div>
            
            <div class="form-group">
                <label for="apellido2" class="form-label">Segundo apellido</label>
                <InputText 
                    id="apellido2" 
                    v-model="formData.apellido2"
                    :class="{ 'p-invalid': errors.apellido2 }"
                />
                <small v-if="errors.apellido2" class="p-error">{{ errors.apellido2 }}</small>
            </div>
            
            <div class="form-group">
                <label for="telefono" class="form-label required">Teléfono</label>
                <InputText 
                    id="telefono" 
                    v-model="formData.telefono" 
                    :required="true"
                />
            </div>
            
            <div class="form-group">
                <label for="correoElectronico" class="form-label">Correo electrónico</label>
                <InputText 
                    id="correoElectronico" 
                    v-model="formData.correoElectronico" 
                />
            </div>
            
            <div class="form-group">
                <label for="nss" class="form-label">NSS</label>
                <InputText 
                    id="nss" 
                    v-model="formData.NSS" 
                />
            </div>
            
            <div class="form-group">
                <label for="fecha_nacimiento" class="form-label">Fecha de nacimiento</label>
                <DatePicker 
                    id="fecha_nacimiento" 
                    v-model="fechaNacimientoLocal" 
                    dateFormat="dd/mm/yy"
                    showIcon
                />
            </div>
            
            <div class="form-group">
                <label for="sexo" class="form-label">Sexo</label>
                <Select 
                    id="sexo" 
                    v-model="formData.sexo" 
                    :options="sexos" 
                    optionLabel="label"
                    optionValue="value"
                />
            </div>
            
            <div class="form-group">
                <label for="domicilio" class="form-label">Domicilio</label>
                <Textarea 
                    id="domicilio" 
                    v-model="formData.domicilio" 
                    :rows="3"
                />
            </div>
            
            <div class="form-group">
                <label for="nivel_estudios" class="form-label required">Nivel de estudios</label>
                <Select 
                    id="nivel_estudios" 
                    v-model="formData.nivel_estudios" 
                    :options="nivelesEstudios" 
                    optionLabel="label"
                    optionValue="value"
                    :required="true"
                />
            </div>
            
            <div class="form-group">
                <label for="es_docente" class="form-label">Es docente</label>
                <Checkbox 
                    id="es_docente" 
                    v-model="formData.es_docente" 
                    binary
                />
            </div>
            
            <div class="form-group">
                <label for="es_alumno" class="form-label">Es alumno</label>
                <Checkbox 
                    id="es_alumno" 
                    v-model="formData.es_alumno" 
                    binary
                />
            </div>
            
            <div class="form-group">
                <label for="discapacidad" class="form-label">Discapacidad</label>
                <Checkbox 
                    id="discapacidad" 
                    v-model="formData.discapacidad" 
                    binary
                />
            </div>
            
            <div class="form-group">
                <label for="afectadosTerrorismo" class="form-label">Afectados por terrorismo</label>
                <Checkbox 
                    id="afectadosTerrorismo" 
                    v-model="formData.afectadosTerrorismo" 
                    binary
                />
            </div>
            
            <div class="form-group">
                <label for="afectadosViolenciaGenero" class="form-label">Afectados por violencia de género</label>
                <Checkbox 
                    id="afectadosViolenciaGenero" 
                    v-model="formData.afectadosViolenciaGenero" 
                    binary
                />
            </div>
            
            <div class="form-group">
                <label for="comentarios" class="form-label">Comentarios</label>
                <Textarea 
                    id="comentarios" 
                    v-model="formData.comentarios" 
                    :rows="3"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted, nextTick, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import { useDateUTC } from '@/composables/useDateUTC.js'
import { PATTERN_NIF, PATTERN_NIE, MIN_LENGTH_DOCUMENTO, MAX_LENGTH_DOCUMENTO, LENGTH_CIF_NIF } from '@/utils/enums.js'
import { validateFieldLength, validateFieldMinLength } from '@/utils/functions.js'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:modelValue'])

// Usar el composable useDateUTC para la fecha de nacimiento
const { localValue: fechaNacimientoLocal, utcValue: fechaNacimientoUTC } = useDateUTC()

const formData = ref({
    tipoDocumento: '',
    documento: '',
    nombre: '',
    apellido1: '',
    apellido2: '',
    telefono: '',
    correoElectronico: '',
    NSS: '',
    fecha_nacimiento: null,
    sexo: null,
    domicilio: '',
    nivel_estudios: null,
    es_docente: false,
    es_alumno: false,
    discapacidad: false,
    afectadosTerrorismo: false,
    afectadosViolenciaGenero: false,
    comentarios: '',
    ...props.modelValue
})

const tiposDocumento = ref([
    { label: 'NIF', value: 'NIF' },
    { label: 'NIE', value: 'NIE' },
    { label: 'Pasaporte', value: 'Pasaporte' }
])

// Objeto para almacenar errores de validación
const errors = ref({})


// Función para validar documento según tipo (NIF, NIE, Pasaporte)
const validateDocumento = (fieldName, value, tipoDocumento) => {
    if (!value) {
        errors.value[fieldName] = ''
        return true
    }
    
    // Validar longitud según XSD: minLength 9, maxLength 15
    if (value.length < MIN_LENGTH_DOCUMENTO || value.length > MAX_LENGTH_DOCUMENTO) {
        errors.value[fieldName] = `El documento debe tener entre ${MIN_LENGTH_DOCUMENTO} y ${MAX_LENGTH_DOCUMENTO} caracteres`
        return false
    }
    
    // Validar según tipo de documento
    if (tipoDocumento === 'NIF') {
        if (value.length === LENGTH_CIF_NIF && !PATTERN_NIF.test(value)) {
            errors.value[fieldName] = 'El formato del NIF no es válido'
            return false
        }
    } else if (tipoDocumento === 'NIE') {
        if (value.length === LENGTH_CIF_NIF && !PATTERN_NIE.test(value)) {
            errors.value[fieldName] = 'El formato del NIE no es válido'
            return false
        }
    } else if (tipoDocumento === 'Pasaporte') {
        // Pasaporte: puede tener diferentes formatos, generalmente alfanumérico
        // No hay patrón específico en el XSD, solo validamos longitud
    }
    
    errors.value[fieldName] = ''
    return true
}

const sexos = ref([
    { label: 'Hombre', value: 'H' },
    { label: 'Mujer', value: 'M' },
    { label: 'Otro', value: 'O' }
])

const nivelesEstudios = ref([
    { label: 'Sin estudios', value: 0 },
    { label: 'Educación Primaria', value: 1 },
    { label: 'Educación Secundaria Obligatoria', value: 2 },
    { label: 'Bachillerato', value: 3 },
    { label: 'Formación Profesional Grado Medio', value: 4 },
    { label: 'Formación Profesional Grado Superior', value: 5 },
    { label: 'Grado Universitario', value: 6 },
    { label: 'Máster', value: 7 },
    { label: 'Doctorado', value: 8 }
])

// Validación del formulario
const isFormValid = computed(() => {
    // Validaciones de longitud máxima según XSD
    validateFieldLength(errors.value, 'nombre', formData.value.nombre, 30)
    validateFieldLength(errors.value, 'apellido1', formData.value.apellido1, 30)
    validateFieldLength(errors.value, 'apellido2', formData.value.apellido2, 30)
    
    // Validación de documento según tipo y longitud (minLength 9, maxLength 15 según XSD)
    validateDocumento('documento', formData.value.documento, formData.value.tipoDocumento)
    
    // Campos requeridos
    const requiredFields = {
        tipoDocumento: formData.value.tipoDocumento?.trim(),
        documento: formData.value.documento?.trim(),
        nombre: formData.value.nombre?.trim(),
        apellido1: formData.value.apellido1?.trim(),
        telefono: formData.value.telefono?.trim(),
        nivel_estudios: formData.value.nivel_estudios
    }
    
    // Verificar que todos los campos requeridos estén llenos
    const requiredFieldsValid = Object.values(requiredFields).every(value => 
        value !== null && value !== undefined && value !== ''
    )
    
    // Validación de email si se proporciona
    let emailValid = true
    if (formData.value.correoElectronico && formData.value.correoElectronico.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        emailValid = emailRegex.test(formData.value.correoElectronico.trim())
    }
    
    // Verificar que no hay errores de longitud ni validación
    const allLengthValid = Object.values(errors.value).every(errorMsg => errorMsg === '')
    
    return requiredFieldsValid && emailValid && allLengthValid
})

// Función simple para emitir los datos del formulario
const emitFormData = () => {
    const dataToEmit = {
        ...formData.value,
        fecha_nacimiento: fechaNacimientoUTC.value
    };
    emit('update:modelValue', dataToEmit);
};

defineExpose({
    emitFormData,
    isFormValid
});

// Watcher simple para sincronizar con las props
watch(() => props.modelValue, (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
        // Actualizar formData con todos los campos excepto fechas
        const { fecha_nacimiento, ...otherData } = newValue;
        formData.value = { ...formData.value, ...otherData };
        
        // Manejar fecha UTC usando el composable
        if (fecha_nacimiento) {
            const fechaNacimientoDate = typeof fecha_nacimiento === 'string' ? new Date(fecha_nacimiento) : fecha_nacimiento;
            fechaNacimientoUTC.value = fechaNacimientoDate;
        }
    }
}, { immediate: true });
</script>