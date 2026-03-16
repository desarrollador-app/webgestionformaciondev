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
                <label for="centro" class="form-label required">Centro de trabajo</label>
                <Select 
                    id="centro" 
                    v-model="formData.id_centro" 
                    :options="centros" 
                    optionLabel="label"
                    optionValue="value"
                    :loading="loadingCentros"
                    filter
                    :required="true"
                    @filter="searchCentros"
                />
            </div>
            
            <div class="form-group">
                <label for="fechaInscripcion" class="form-label">Fecha de inscripción</label>
                <DatePicker 
                    id="fechaInscripcion" 
                    v-model="formData.fecha_inscripcion" 
                    dateFormat="dd/mm/yy"
                    showIcon
                />
            </div>
            
            <div class="form-group">
                <label for="estadoCurso" class="form-label">Estado en el curso</label>
                <Select 
                    id="estadoCurso" 
                    v-model="formData.estado_curso" 
                    :options="estadosCurso" 
                    optionLabel="label"
                    optionValue="value"
                />
            </div>
            
            <div class="form-group">
                <label for="progresoCurso" class="form-label">Progreso en el curso</label>
                <Select 
                    id="progresoCurso" 
                    v-model="formData.progreso_curso" 
                    :options="progresosCurso" 
                    optionLabel="label"
                    optionValue="value"
                    />
            </div>
            
            <div class="form-group">
                <label for="diploma" class="form-label">Diploma</label>
                <Select 
                    id="diploma" 
                    v-model="formData.diploma" 
                    :options="tiposDiploma" 
                    optionLabel="label"
                    optionValue="value"
                />
            </div>
            
            <div class="form-group">
                <label for="jornadaLaboral" class="form-label">Jornada laboral</label>
                <Checkbox 
                    id="jornadaLaboral" 
                    v-model="formData.jornada_laboral" 
                    binary
                />
            </div>
            
            <div class="form-group">
                <label for="fijoDiscontinuo" class="form-label">Fijo discontinuo</label>
                <Checkbox 
                    id="fijoDiscontinuo" 
                    v-model="formData.fijo_discontinuo" 
                    binary
                />
            </div>
            
            <div class="form-group">
                <label for="categoriaProfesional" class="form-label required">Categoría profesional</label>
                <Select 
                    id="categoriaProfesional" 
                    v-model="formData.categoria_profesional" 
                    :options="categoriasProfesionales" 
                    optionLabel="label"
                    optionValue="value"
                    :required="true"
                />
            </div>
            
            <div class="form-group">
                <label for="erte" class="form-label">ERTE</label>
                <Checkbox 
                    id="erte" 
                    v-model="formData.ERTE" 
                    binary
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted, nextTick, computed } from 'vue'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import { getAllPersonas } from '@/services/personasService.js'
import { getAllEmpresas } from '@/services/empresasService.js'
import { 
    ESTADO_CURSO_OPTIONS, 
    PROGRESO_CURSO_OPTIONS, 
    TIPO_DIPLOMA_OPTIONS, 
    CATEGORIA_PROFESIONAL_OPTIONS 
} from '@/utils/enums.js'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:modelValue'])

const formData = ref({
    id_persona: null,
    id_centro: null,
    fecha_inscripcion: null,
    estado_curso: null,
    progreso_curso: null,
    diploma: null,
    jornada_laboral: false,
    fijo_discontinuo: false,
    categoria_profesional: null,
    ERTE: false
})

const personas = ref([])
const centros = ref([])
const loadingPersonas = ref(false)
const loadingCentros = ref(false)

// Usar las constantes importadas
const estadosCurso = ref(ESTADO_CURSO_OPTIONS)
const progresosCurso = ref(PROGRESO_CURSO_OPTIONS)
const tiposDiploma = ref(TIPO_DIPLOMA_OPTIONS)
const categoriasProfesionales = ref(CATEGORIA_PROFESIONAL_OPTIONS)

// Validación del formulario
const isFormValid = computed(() => {
    // Campos requeridos
    const requiredFields = {
        id_persona: formData.value.id_persona,
        id_centro: formData.value.id_centro,
        categoria_profesional: formData.value.categoria_profesional
    }
    
    // Verificar que todos los campos requeridos estén llenos
    const requiredFieldsValid = Object.values(requiredFields).every(value => 
        value !== null && value !== undefined && value !== ''
    )
    
    return requiredFieldsValid
})

const isUpdatingFromProps = ref(false)

const searchPersonas = async (event) => {
    loadingPersonas.value = true
    try {
        const personasData = await getAllPersonas({ es_alumno: true })
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

const searchCentros = async (event) => {
    loadingCentros.value = true
    try {
        const empresasData = await getAllEmpresas()
        const centrosData = []

        empresasData.forEach((empresa, index) => {           
            if (empresa.centrosTrabajo && empresa.centrosTrabajo.length > 0) {
                empresa.centrosTrabajo.forEach(centro => {
                    centrosData.push({
                        label: `${centro.nombre} - ${empresa.razon_social}`,
                        value: centro.id_centro
                    })
                })
            } else {
                console.log(`Empresa ${empresa.razon_social} no tiene centros de trabajo`)
            }
        })
        
        centros.value = centrosData
    } catch (error) {
        console.error('Error al cargar centros:', error)
    } finally {
        loadingCentros.value = false
    }
}

watch(formData, async (newValue) => {
    if (!isUpdatingFromProps.value) {
        await nextTick()
        emit('update:modelValue', newValue)
    }
}, { deep: true })

// Función para emitir los datos del formulario (compatible con ReusableDialog)
const emitFormData = () => {
    emit('update:modelValue', formData.value);
};

const initializeFormData = () => {
    if (Object.keys(props.modelValue).length > 0) {
        isUpdatingFromProps.value = true
        formData.value = { ...formData.value, ...props.modelValue }
        isUpdatingFromProps.value = false
    }
}

onMounted(async () => {
    initializeFormData()
    // Cargar personas automáticamente al abrir el formulario
    await searchPersonas({})
    await searchCentros({})
})

defineExpose({
    emitFormData,
    isFormValid
});
</script>
