<template>
    <div class="modal-content">
        <div class="form">
            <div class="form-group">
                <label for="razon_social" class="form-label required">Razón social</label>
                <InputText 
                    id="razon_social" 
                    v-model="formData.razon_social"
                    :required="true"
                />
            </div>
            
            <div class="form-group">
                <label for="CIF" class="form-label required">CIF</label>
                <InputText 
                    id="CIF" 
                    v-model="formData.CIF"
                    :required="true"
                    :class="{ 'p-invalid': errors.CIF }"
                />
                <small v-if="errors.CIF" class="p-error">{{ errors.CIF }}</small>
            </div>
            
            <div class="form-group">
                <label for="NSS" class="form-label">NSS (Número de Seguridad Social)</label>
                <InputText 
                    id="NSS" 
                    v-model="formData.NSS" 
                />
            </div>
            
            <div class="form-group">
                <label for="direccion" class="form-label">Dirección</label>
                <InputText 
                    id="direccion" 
                    v-model="formData.direccion" 
                />
            </div>
            
            <div class="form-group">
                <label for="persona_contacto" class="form-label">Persona de contacto</label>
                <InputText 
                    id="persona_contacto" 
                    v-model="formData.persona_contacto" 
                />
            </div>
            
            <div class="form-group">
                <label for="telefono1" class="form-label">Teléfono 1</label>
                <InputText 
                    id="telefono1" 
                    v-model="formData.telefono1" 
                />
            </div>
            
            <div class="form-group">
                <label for="telefono2" class="form-label">Teléfono 2</label>
                <InputText 
                    id="telefono2" 
                    v-model="formData.telefono2" 
                />
            </div>
            
            <div class="form-group">
                <label for="fax" class="form-label">Fax</label>
                <InputText 
                    id="fax" 
                    v-model="formData.fax" 
                />
            </div>
            
            <div class="form-group">
                <label for="correo_electronico" class="form-label">Correo electrónico</label>
                <InputText 
                    id="correo_electronico" 
                    v-model="formData.correo_electronico" 
                />
            </div>
            
            <div class="form-group">
                <label for="pagina_web" class="form-label">Página web</label>
                <InputText 
                    id="pagina_web" 
                    v-model="formData.pagina_web" 
                />
            </div>
            
            <div class="form-group">
                <label for="sector_actividad" class="form-label">Sector de actividad</label>
                <InputText 
                    id="sector_actividad" 
                    v-model="formData.sector_actividad" 
                />
            </div>
            
            <div class="form-group">
                <label for="CNAE" class="form-label">CNAE</label>
                <InputText 
                    id="CNAE" 
                    v-model="formData.CNAE" 
                />
            </div>
            
            <div class="form-group">
                <label for="CNAE2009" class="form-label">CNAE 2009</label>
                <InputText 
                    id="CNAE2009" 
                    v-model="formData.CNAE2009" 
                />
            </div>
            
            <div class="form-group">
                <label for="nombre_representante" class="form-label">Nombre del representante</label>
                <InputText 
                    id="nombre_representante" 
                    v-model="formData.nombre_representante" 
                />
            </div>
            
            <div class="form-group">
                <label for="NIF_representante" class="form-label">NIF del representante</label>
                <InputText 
                    id="NIF_representante" 
                    v-model="formData.NIF_representante"
                    :class="{ 'p-invalid': errors.NIF_representante }"
                />
                <small v-if="errors.NIF_representante" class="p-error">{{ errors.NIF_representante }}</small>
            </div>
            
            <div class="form-group">
                <label for="informa_RLT" class="form-label">Informa RLT</label>
                <Select 
                    id="informa_RLT" 
                    v-model="formData.informa_RLT" 
                    :options="rltOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Seleccione una opción"
                />
            </div>
            
            <div class="form-group">
                <label for="valor_informe" class="form-label">Valor del informe</label>
                <Select 
                    id="valor_informe" 
                    v-model="formData.valor_informe" 
                    :options="valorInformeOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Seleccione una opción"
                />
            </div>
            
            <div class="form-group">
                <label for="fecha_discrepancia" class="form-label">Fecha de discrepancia</label>
                <DatePicker 
                    id="fecha_discrepancia" 
                    v-model="fechaDiscrepanciaLocal" 
                    dateFormat="dd/mm/yy"
                    showIcon
                />
            </div>
            
            <div class="form-group">
                <label for="resuelto" class="form-label">Resuelto</label>
                <Select 
                    id="resuelto" 
                    v-model="formData.resuelto" 
                    :options="resueltoOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Seleccione una opción"
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
import { ref, defineProps, defineEmits, watch, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import { INFORMA_RLT_OPTIONS, RESUELTO_OPTIONS, VALOR_INFORME_OPTIONS } from '@/utils/enums'
import { useDateUTC } from '@/composables/useDateUTC.js'
import { validateCif, validateNif } from '@/utils/functions.js'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:modelValue'])

// Usar el composable useDateUTC para la fecha de discrepancia
const { localValue: fechaDiscrepanciaLocal, utcValue: fechaDiscrepanciaUTC } = useDateUTC()

const rltOptions = INFORMA_RLT_OPTIONS
const resueltoOptions = RESUELTO_OPTIONS
const valorInformeOptions = VALOR_INFORME_OPTIONS

// Objeto para almacenar errores de validación
const errors = ref({})

// Validación del formulario
const isFormValid = computed(() => {
    // Validaciones de patrones
    validateCif(errors.value, 'CIF', formData.value.CIF)
    validateNif(errors.value, 'NIF_representante', formData.value.NIF_representante)
    
    // Campos requeridos
    const requiredFields = {
        razon_social: formData.value.razon_social?.trim(),
        CIF: formData.value.CIF?.trim()
    }
    
    // Verificar que todos los campos requeridos estén llenos
    const requiredFieldsValid = Object.values(requiredFields).every(value => 
        value !== null && value !== undefined && value !== ''
    )
    
    // Verificar que no hay errores de validación
    const allPatternValid = Object.values(errors.value).every(errorMsg => errorMsg === '')

    return requiredFieldsValid && allPatternValid
})

const formData = ref({
    razon_social: '',
    CIF: '',
    NSS: '',
    direccion: '',
    persona_contacto: '',
    telefono1: '',
    telefono2: '',
    fax: '',
    correo_electronico: '',
    pagina_web: '',
    sector_actividad: '',
    CNAE: '',
    CNAE2009: '',
    nombre_representante: '',
    NIF_representante: '',
    informa_RLT: '',
    valor_informe: '',
    fecha_discrepancia: null,
    resuelto: false,
    comentarios: '',
    ...props.modelValue
})

// Función simple para emitir los datos del formulario
const emitFormData = () => {
    const dataToEmit = { 
        ...formData.value,
        fecha_discrepancia: fechaDiscrepanciaUTC.value
    };
    
    // Convertir string resuelto a boolean antes de emitir
    if (dataToEmit.resuelto !== undefined) {
        dataToEmit.resuelto = dataToEmit.resuelto === 'Sí';
    }
    
    emit('update:modelValue', dataToEmit);
};

defineExpose({
    emitFormData,
    isFormValid
});

watch(() => props.modelValue, (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
        // Actualizar formData con todos los campos excepto fechas
        const { fecha_discrepancia, ...otherData } = newValue;
        
        // Convertir boolean resuelto a string para el select
        if (otherData.resuelto !== undefined) {
            otherData.resuelto = otherData.resuelto ? 'Sí' : 'No';
        }
        
        formData.value = { ...formData.value, ...otherData };
        
        // Manejar fecha UTC usando el composable
        if (fecha_discrepancia) {
            const fechaDiscrepanciaDate = typeof fecha_discrepancia === 'string' ? new Date(fecha_discrepancia) : fecha_discrepancia;
            fechaDiscrepanciaUTC.value = fechaDiscrepanciaDate;
        }
    }
}, { immediate: true });
</script>