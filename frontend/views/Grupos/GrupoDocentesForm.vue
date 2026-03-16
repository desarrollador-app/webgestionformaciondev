<template>
    <div class="modal-content">
        <div class="form">
            <div class="form-group">
                <label for="persona" class="form-label required">Persona</label>
                <Select 
                    id="persona" 
                    v-model="formData.id_persona" 
                    :options="personas" 
                    optionLabel="label"
                    optionValue="value"
                    :loading="loadingPersonas"
                    filter
                    :required="true"
                    @filter="searchPersonas"
                />
            </div>
            
            <div class="form-group">
                <label for="tipoTutoria" class="form-label required">Tipo tutoría</label>
                <Select 
                    id="tipoTutoria" 
                    v-model="formData.tipotutoria" 
                    :options="tiposTutoria" 
                    optionLabel="label"
                    optionValue="value"
                    :required="true"
                />
            </div>

            <div class="form-group">
                <label for="descripcion" class="form-label" :class="{ 'required': formData.tipotutoria === TIPO_TUTORIA.OTRAS }">Descripción</label>
                <Textarea
                    id="descripcion" 
                    v-model="formData.descripcion" 
                    :required="formData.tipotutoria === TIPO_TUTORIA.OTRAS"
                    :class="{ 'p-invalid': errors.descripcion }"
                />
                <small v-if="errors.descripcion" class="p-error">{{ errors.descripcion }}</small>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted, nextTick, computed } from 'vue'
import Select from 'primevue/select'
import { getAllPersonas } from '@/services/personasService.js'
import { TIPO_TUTORIA_OPTIONS, TIPO_TUTORIA } from '@/utils/enums.js'
import Textarea from 'primevue/textarea'
import { validateFieldLength } from '@/utils/functions.js'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:modelValue'])

const formData = ref({
    id_persona: null,
    tutoria: true,
    tipotutoria: null,
    modalidad: null,
    descripcion: null
})

const personas = ref([])
const loadingPersonas = ref(false)

// Objeto para almacenar errores de validación
const errors = ref({})

// Usar las constantes importadas
const tiposTutoria = ref(TIPO_TUTORIA_OPTIONS)

// Validación del formulario
const isFormValid = computed(() => {
    // Validaciones de longitud máxima según XSD
    validateFieldLength(errors.value, 'descripcion', formData.value.descripcion, 50)
    
    // Campos requeridos
    const requiredFields = {
        id_persona: formData.value.id_persona
    }
    
    // Si el tipo de tutoría es "Otras", la descripción es requerida
    if (formData.value.tipotutoria === TIPO_TUTORIA.OTRAS) {
        requiredFields.descripcion = formData.value.descripcion?.trim()
    }
    
    // Verificar que todos los campos requeridos estén llenos
    const requiredFieldsValid = Object.values(requiredFields).every(value => 
        value !== null && value !== undefined && value !== ''
    )
    
    // Verificar que no hay errores de longitud
    const allLengthValid = Object.values(errors.value).every(errorMsg => errorMsg === '')
    
    return requiredFieldsValid && allLengthValid
})

const isUpdatingFromProps = ref(false)

const searchPersonas = async (event) => {
    loadingPersonas.value = true
    try {
        const personasData = await getAllPersonas({ es_docente: true })
        personas.value = personasData.map(persona => ({
            label: `${persona.nombre} ${persona.apellido1} ${persona.apellido2 || ''} (${persona.documento})`,
            value: persona.id_persona
        }))
    } catch (error) {
        console.error('Error al cargar personas:', error)
    } finally {
        loadingPersonas.value = false
    }
}

watch(formData, async (newValue) => {
    if (!isUpdatingFromProps.value) {
        await nextTick()
        emit('update:modelValue', newValue)
    }
}, { deep: true })

const initializeFormData = () => {
    if (Object.keys(props.modelValue).length > 0) {
        isUpdatingFromProps.value = true
        formData.value = { ...formData.value, ...props.modelValue }
        isUpdatingFromProps.value = false
    }
}

// Función para emitir los datos del formulario (compatible con ReusableDialog)
const emitFormData = () => {
    emit('update:modelValue', formData.value);
};

onMounted(async () => {
    initializeFormData()
    await searchPersonas({})
})

defineExpose({
    emitFormData,
    isFormValid
});
</script>
