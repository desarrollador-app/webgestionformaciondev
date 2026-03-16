<template>
    <div class="modal-content">
        <div class="form">
            <div class="form-group">
                <label for="cif" class="form-label required">CIF</label>
                <InputText 
                    id="cif" 
                    v-model="formData.cif" 
                    :required="true"
                    :class="{ 'p-invalid': errors.cif }"
                />
                <small v-if="errors.cif" class="p-error">{{ errors.cif }}</small>
            </div>

            <div class="form-group">
                <label for="directos" class="form-label required">Costes Directos</label>
                <InputNumber 
                    id="directos" 
                    v-model="formData.directos" 
                    mode="decimal"
                    :min-fraction-digits="2"
                    :max-fraction-digits="2"
                    currency="EUR"
                    locale="es-ES"
                    :required="true"
                />
            </div>
            <div class="form-group">
                <label for="indirectos" class="form-label required">Costes Indirectos</label>
                <InputNumber 
                    id="indirectos" 
                    v-model="formData.indirectos" 
                    mode="decimal"
                    :min-fraction-digits="2"
                    :max-fraction-digits="2"
                    currency="EUR"
                    locale="es-ES"
                    :required="true"
                />
            </div>

            <div class="form-group">
                <label for="organizacion" class="form-label required">Organización</label>
                <InputNumber 
                    id="organizacion" 
                    v-model="formData.organizacion" 
                    mode="decimal"
                    :min-fraction-digits="2"
                    :max-fraction-digits="2"
                    currency="EUR"
                    locale="es-ES"
                    :required="true"
                />
            </div>
            <div class="form-group">
                <label for="salariales" class="form-label required">Salariales</label>
                <InputNumber 
                    id="salariales" 
                    v-model="formData.salariales" 
                    mode="decimal"
                    :min-fraction-digits="2"
                    :max-fraction-digits="2"
                    currency="EUR"
                    locale="es-ES"
                    :required="true"
                />
            </div>

            <h4>Períodos Mensuales</h4>
            <div class="periodos-grid">
                <div class="form-group" v-for="mes in meses" :key="mes.value">
                    <label :for="mes.value" class="form-label">{{ mes.label }}</label>
                    <InputNumber 
                        :id="mes.value" 
                        v-model="formData[mes.value]" 
                        mode="decimal"
                        :min-fraction-digits="2"
                        :max-fraction-digits="2"
                        currency="EUR"
                        locale="es-ES"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { validateCifNif } from '@/utils/functions.js'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    },
    grupoPreseleccionado: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['update:modelValue', 'update:formData'])

const formData = ref({
    id_grupo: props.grupoPreseleccionado?.id_grupo || null,
    cif: '',
    directos: null,
    indirectos: null,
    organizacion: null,
    salariales: null,
    periodos_enero: null,
    periodos_febrero: null,
    periodos_marzo: null,
    periodos_abril: null,
    periodos_mayo: null,
    periodos_junio: null,
    periodos_julio: null,
    periodos_agosto: null,
    periodos_septiembre: null,
    periodos_octubre: null,
    periodos_noviembre: null,
    periodos_diciembre: null,
    ...props.modelValue
})

// Meses para los períodos
const meses = [
    { value: 'periodos_enero', label: 'Enero' },
    { value: 'periodos_febrero', label: 'Febrero' },
    { value: 'periodos_marzo', label: 'Marzo' },
    { value: 'periodos_abril', label: 'Abril' },
    { value: 'periodos_mayo', label: 'Mayo' },
    { value: 'periodos_junio', label: 'Junio' },
    { value: 'periodos_julio', label: 'Julio' },
    { value: 'periodos_agosto', label: 'Agosto' },
    { value: 'periodos_septiembre', label: 'Septiembre' },
    { value: 'periodos_octubre', label: 'Octubre' },
    { value: 'periodos_noviembre', label: 'Noviembre' },
    { value: 'periodos_diciembre', label: 'Diciembre' }
]

// Objeto para almacenar errores de validación
const errors = ref({})

// Validación del formulario
const isFormValid = computed(() => {
    // Validaciones de patrones
    validateCifNif(errors.value, 'cif', formData.value.cif)
    
    // Campos requeridos
    const requiredFields = {
        cif: formData.value.cif?.trim(),
        directos: formData.value.directos,
        indirectos: formData.value.indirectos,
        organizacion: formData.value.organizacion,
        salariales: formData.value.salariales
    }
    
    // Verificar que todos los campos requeridos estén llenos
    const requiredFieldsValid = Object.values(requiredFields).every(value => 
        value !== null && value !== undefined && value !== ''
    )
    
    // Verificar que no hay errores de validación
    const allPatternValid = Object.values(errors.value).every(errorMsg => errorMsg === '')
    
    return requiredFieldsValid && allPatternValid
})

// Emitir cambios del formulario
watch(formData, (newValue) => {
    emit('update:modelValue', newValue)
    emit('update:formData', newValue)
}, { deep: true })

// Exponer formData e isFormValid para el componente padre
defineExpose({
    formData,
    isFormValid
})
</script>
