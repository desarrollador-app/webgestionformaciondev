<template>
    <div class="modal-content">
        <div class="form">
                <div class="form-group">
                    <label for="plan" class="form-label">Plan</label>
                    <Select 
                        id="plan" 
                        v-model="formData.id_plan" 
                        :options="planes" 
                        optionLabel="nombre"
                        optionValue="id_plan"
                        showClear
                        :disabled="hasActivePlan"
                    />
                </div>
                <div class="form-group">
                    <label for="denominacion" class="form-label required">Denominación</label>
                    <InputText 
                        id="denominacion" 
                        v-model="formData.denominacion"
                        :required="true"
                        :class="{ 'p-invalid': errors.denominacion }"
                    />
                    <small v-if="errors.denominacion" class="p-error">{{ errors.denominacion }}</small>
                </div>
                <div class="form-group">
                    <label for="numeroAccion" class="form-label required">Número de acción</label>
                    <InputText 
                        id="numeroAccion" 
                        v-model="formData.numero_accion"
                        :required="true"
                        :class="{ 'p-invalid': numeroAccionError || errors.numero_accion }"
                        @input="validateNumeroAccion"
                    />
                    <small v-if="numeroAccionError" class="p-error">{{ numeroAccionError }}</small>
                    <small v-if="errors.numero_accion" class="p-error">{{ errors.numero_accion }}</small>
                </div>
                <div class="form-group">
                    <label for="modalidad" class="form-label required">Modalidad</label>
                    <Select 
                        id="modalidad" 
                        v-model="formData.modalidad" 
                        :options="modalidades" 
                        optionLabel="label"
                        optionValue="value"
                        :required="true"
                        @change="onModalidadChange"
                    />
                </div>
                <div class="form-group">
                    <label for="nivelFormacion" class="form-label">Nivel de formación</label>
                    <Select 
                        id="nivelFormacion" 
                        v-model="formData.nivel_formacion" 
                        :options="nivelesFormacion" 
                        optionLabel="label"
                        optionValue="value"
                    />
                </div>     
                <div class="form-group">
                    <label for="areaProfesional" class="form-label">Área profesional</label>
                    <Select 
                        id="areaProfesional" 
                        v-model="formData.id_area" 
                        :options="areasProfesionales" 
                        :optionLabel="formatAreaLabel"
                        optionValue="id_area"
                        @change="onAreaChange"
                    />
                </div>
                
                <div class="form-group">
                    <label for="desgloseArea" class="form-label">Desglose del área</label>
                    <Select 
                        id="desgloseArea" 
                        v-model="formData.id_desglose" 
                        :options="desglosesArea" 
                        :optionLabel="formatDesgloseLabel"
                        optionValue="id_desglose"
                        :disabled="!formData.id_area"
                        @change="onDesgloseChange"
                    />
                </div>

					<div class="form-group">
						<label for="esSeguridadPrivada" class="form-label">Es seguridad privada</label>
						<Checkbox 
							id="esSeguridadPrivada" 
							v-model="formData.es_seguridad_privada" 
							binary
						/>
					</div>

					<div class="form-group">
						<label for="horasTotalesDiploma" class="form-label">Horas totales diploma</label>
						<InputNumber 
							id="horasTotalesDiploma" 
							v-model="formData.horas_totales_diploma"
							:min="0"
						/>
						<small>Si se rellena, se usará en el diploma en lugar de la suma de horas</small>
					</div>

					<div class="form-group">
						<label for="desgloseHorasDiploma" class="form-label">Desglose horas diploma</label>
						<InputText 
							id="desgloseHorasDiploma" 
							v-model="formData.desglose_horas_diploma"
						/>
					</div>
					<div class="form-group">
						<label for="modalidadDiploma" class="form-label">Modalidad diploma</label>
						<Select 
							id="modalidadDiploma" 
							v-model="formData.modalidad_diploma" 
							:options="[{label: MODALIDAD_SESIONES.PRESENCIAL, value: MODALIDAD_SESIONES.PRESENCIAL}, 
										{label: MODALIDAD_SESIONES.TELEFORMACION, value: MODALIDAD_SESIONES.TELEFORMACION},
										{label: MODALIDAD_SESIONES.MIXTA, value: MODALIDAD_SESIONES.MIXTA}]" 
							optionLabel="label"
							optionValue="value"
						/>
							<small>Si se rellena, se usará en el diploma en lugar de la modalidad de la acción formativa</small>
					</div>
                               
                    <div v-if="formData.modalidad === MODALIDAD_SESIONES.PRESENCIAL || formData.modalidad === MODALIDAD_SESIONES.MIXTA" class="form-group">
                        <label for="horasPresencial" class="form-label required">Horas presenciales</label>
                        <InputNumber 
                            id="horasPresencial" 
                            v-model="formData.horas_modalidad_presencial" 
                            :min="0"
                            :required="true"
                        />
                    </div>
                    
                    <div v-if="formData.modalidad === MODALIDAD_SESIONES.TELEFORMACION || formData.modalidad === MODALIDAD_SESIONES.MIXTA" class="form-group">
                        <label for="horasTeleformacion" class="form-label required">Horas teleformación</label>
                        <InputNumber 
                            id="horasTeleformacion" 
                            v-model="formData.horas_modalidad_teleformacion" 
                            :min="0"
                            :required="true"
                        />
                    </div>
                
            <div class="form-group">
                <label for="participantes" class="form-label">Número de participantes</label>
                <InputNumber 
                    id="participantes" 
                    v-model="formData.participantes" 
                    :min="0"
                />
            </div>

            <div class="form-group">
                <label for="usuario" class="form-label">Usuario</label>
                <InputText 
                    id="usuario" 
                    v-model="formData.usuario"
                    :class="{ 'p-invalid': errors.usuario }"
                />
                <small v-if="errors.usuario" class="p-error">{{ errors.usuario }}</small>
            </div>

            <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <InputText 
                    id="password" 
                    v-model="formData.password"
                    :class="{ 'p-invalid': errors.password }"
                />
                <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
            </div>


            <div class="form-group">
                <label for="cifPlataforma" class="form-label">CIF plataforma</label>
                <InputText 
                    id="cifPlataforma" 
                    v-model="formData.cif_plataforma"
                    :class="{ 'p-invalid': errors.cif_plataforma }"
                />
                <small v-if="errors.cif_plataforma" class="p-error">{{ errors.cif_plataforma }}</small>
            </div>
            
            <div class="form-group">
                <label for="razonSocialPlataforma" class="form-label">Razón social plataforma</label>
                <InputText 
                    id="razonSocialPlataforma" 
                    v-model="formData.razon_social_plataforma"
                    :class="{ 'p-invalid': errors.razon_social_plataforma }"
                />
                <small v-if="errors.razon_social_plataforma" class="p-error">{{ errors.razon_social_plataforma }}</small>
            </div>
            
            <div class="form-group">
                <label for="uri" class="form-label">URI</label>
                <InputText 
                    id="uri" 
                    v-model="formData.uri"
                    :class="{ 'p-invalid': errors.uri }"
                />
                <small v-if="errors.uri" class="p-error">{{ errors.uri }}</small>
            </div>
                <div class="form-group">
                    <label for="objetivos" class="form-label required">Objetivos</label>
                    <Textarea 
                        id="objetivos" 
                        v-model="formData.objetivos"
                        :required="true"
                        :rows="3"
                    />
                </div>
                
                <div class="form-group">
                    <label for="contenido" class="form-label required">Contenido</label>
                    <Textarea 
                        id="contenido" 
                        v-model="formData.contenido"
                        :required="true"
                        :rows="3"
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
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted, computed } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { getAreasProfesionalesConDesgloses } from '@/services/areaProfesionalService.js'
import { getAllDesgloseAreasProfesionales } from '@/services/desgloseAreasProfesionalesService.js'
import { getAllPlans } from '@/services/plansService.js'
import { checkNumeroAccionExistsInPlan } from '@/services/accionesFormativasService.js'
import { useStore } from '@/stores/main.js'
import {MODALIDAD_SESIONES, NIVEL_FORMACION} from '@/utils/enums.js'
import Checkbox from 'primevue/checkbox'
import { validateCifPlataforma, validateFieldLength } from '@/utils/functions.js'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:modelValue'])

const store = useStore()

const formData = ref({
    denominacion: '',
    numero_accion: '',
    modalidad: null,
    id_area: null,
    id_desglose: null,
    codigo_grupo_accion: '',
    horas_modalidad_presencial: null,
    horas_modalidad_teleformacion: null,
    cif_plataforma: '',
    razon_social_plataforma: '',
    uri: '',
    usuario: '',
    password: '',
    observaciones: '',
    nivel_formacion: null,
    objetivos: '',
    contenido: '',
    participantes: null,
    id_plan: null,
	es_seguridad_privada: false,
    ...props.modelValue
})


const modalidades = ref([
    { label: MODALIDAD_SESIONES.TELEFORMACION, value: MODALIDAD_SESIONES.TELEFORMACION },
    { label: MODALIDAD_SESIONES.PRESENCIAL, value: MODALIDAD_SESIONES.PRESENCIAL },
    { label: MODALIDAD_SESIONES.MIXTA, value: MODALIDAD_SESIONES.MIXTA }
])

const nivelesFormacion = ref([
    { label: NIVEL_FORMACION.BASICO, value: NIVEL_FORMACION.BASICO },
    { label: NIVEL_FORMACION.SUPERIOR, value: NIVEL_FORMACION.SUPERIOR }
])

const areasProfesionales = ref([])
const allDesglosesArea = ref([])
const planes = ref([])
const numeroAccionError = ref('')
const isCheckingNumeroAccion = ref(false)

// Objeto para almacenar errores de validación
const errors = ref({})

const hasActivePlan = computed(() => !!store.activePlan)



// Validación del formulario
const isFormValid = computed(() => {
    // Validaciones de longitud máxima según XSD
    validateFieldLength(errors.value, 'denominacion', formData.value.denominacion, 255)
    validateFieldLength(errors.value, 'numero_accion', formData.value.numero_accion, 5)
    validateFieldLength(errors.value, 'cif_plataforma', formData.value.cif_plataforma, 9)
    validateFieldLength(errors.value, 'razon_social_plataforma', formData.value.razon_social_plataforma, 55)
    validateFieldLength(errors.value, 'uri', formData.value.uri, 255)
    validateFieldLength(errors.value, 'usuario', formData.value.usuario, 50)
    validateFieldLength(errors.value, 'password', formData.value.password, 50)
    
    // Validaciones de patrones según XSD
    validateCifPlataforma(errors.value, 'cif_plataforma', formData.value.cif_plataforma)
    
    // Campos requeridos
    const requiredFields = {
        denominacion: formData.value.denominacion?.trim(),
        numero_accion: formData.value.numero_accion?.trim(),
        modalidad: formData.value.modalidad,
        objetivos: formData.value.objetivos?.trim(),
        contenido: formData.value.contenido?.trim()
    }

    if (formData.value.modalidad === MODALIDAD_SESIONES.PRESENCIAL || formData.value.modalidad === MODALIDAD_SESIONES.MIXTA) {
        requiredFields.horas_modalidad_presencial = formData.value.horas_modalidad_presencial
    }
    if (formData.value.modalidad === MODALIDAD_SESIONES.TELEFORMACION || formData.value.modalidad === MODALIDAD_SESIONES.MIXTA) {
        requiredFields.horas_modalidad_teleformacion = formData.value.horas_modalidad_teleformacion
    }
    
    // Verificar que todos los campos requeridos estén llenos
    const requiredFieldsValid = Object.values(requiredFields).every(value => 
        value !== null && value !== undefined && value !== ''
    )
    
    // Verificar que no hay errores de validación
    const noValidationErrors = !numeroAccionError.value && !isCheckingNumeroAccion.value
    
    // Verificar que no hay errores de longitud ni patrones
    const allLengthValid = Object.values(errors.value).every(errorMsg => errorMsg === '')
    
    return requiredFieldsValid && noValidationErrors && allLengthValid
})

const desglosesArea = computed(() => {
    if (!formData.value.id_area) {
        return []
    }
    const filtered = allDesglosesArea.value.filter(desglose => desglose.id_area === formData.value.id_area)
    return filtered
})

const emitFormData = () => {
    emit('update:modelValue', formData.value);
};

defineExpose({
    emitFormData,
    isFormValid
});

// Watcher simple para sincronizar con las props
watch(() => props.modelValue, (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
        formData.value = { ...formData.value, ...newValue };
    }
}, { immediate: true });

onMounted(async () => {
    try {
        const [areasData, planesData] = await Promise.all([
            getAreasProfesionalesConDesgloses(),
            getAllPlans()
        ])  
        areasProfesionales.value = areasData
        planes.value = planesData
        const desglosesData = await getAllDesgloseAreasProfesionales()   
        allDesglosesArea.value = desglosesData
        
        if (store.activePlan) {
            formData.value.id_plan = store.activePlan.id_plan
        }
    } catch (error) {
        console.error('Error al cargar datos:', error)
        console.error('Detalles del error:', error.response?.data || error.message)
    }
})

const formatAreaLabel = (area) => {
    return `${area.abreviatura} - ${area.nombre}`
}

const formatDesgloseLabel = (desglose) => {
    return `${desglose.codigo_grupo} - ${desglose.desglose}`
}

const onAreaChange = () => {
    formData.value.id_desglose = null
    formData.value.codigo_grupo_accion = ''
}

const onDesgloseChange = () => {
    if (formData.value.id_desglose) {
        const desgloseSeleccionado = allDesglosesArea.value.find(
            desglose => desglose.id_desglose === formData.value.id_desglose
        )
        if (desgloseSeleccionado) {
            formData.value.codigo_grupo_accion = desgloseSeleccionado.codigo_grupo
        }
    } else {
        formData.value.codigo_grupo_accion = ''
    }
}

const onModalidadChange = () => {
    // Limpiar campos de horas cuando cambie la modalidad
    formData.value.horas_modalidad_presencial = null
    formData.value.horas_modalidad_teleformacion = null
}

// Función para validar el número de acción en tiempo real
const validateNumeroAccion = async () => {
    const numeroAccion = formData.value.numero_accion?.trim()
    
    if (!numeroAccion) {
        numeroAccionError.value = ''
        return
    }
    
    // Limpiar error anterior
    numeroAccionError.value = ''
    isCheckingNumeroAccion.value = true
    
    try {
        // Usar debounce para evitar muchas llamadas
        setTimeout(async () => {
            if (formData.value.numero_accion?.trim() === numeroAccion) {
                // Si hay un plan activo, validar solo en ese plan
                if (store.activePlan?.id_plan) {
                    const exists = await checkNumeroAccionExistsInPlan(numeroAccion, store.activePlan.id_plan)
                    if (exists) {
                        numeroAccionError.value = 'Este número de acción ya existe en este plan'
                    }
                } else if (formData.value.id_plan) {
                    // Si no hay plan activo pero hay id_plan en el formulario
                    const exists = await checkNumeroAccionExistsInPlan(numeroAccion, formData.value.id_plan)
                    if (exists) {
                        numeroAccionError.value = 'Este número de acción ya existe en este plan'
                    }
                }
                isCheckingNumeroAccion.value = false
            }
        }, 500)
    } catch (error) {
        console.error('Error al validar número de acción:', error)
        isCheckingNumeroAccion.value = false
    }
}

</script>
