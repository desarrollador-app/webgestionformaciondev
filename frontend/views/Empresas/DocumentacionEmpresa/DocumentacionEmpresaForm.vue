<template>
    <div class="form">
        <div class="form-group">
            <label for="tipo-documento" class="form-label required">Tipo de documentación</label>
            <Select
                id="tipo-documento"
                v-model="formData.tipo_documento"
                :options="tiposDocumento"
                optionLabel="label"
                optionValue="value"
                :class="{ 'p-invalid': errors.tipo_documento }"
                :required="true"
            />
            <small v-if="errors.tipo_documento" class="p-error">{{ errors.tipo_documento }}</small>
        </div>

        <div class="form-group">
            <label for="archivo" class="form-label required">Archivo PDF</label>
            <FileUpload
                id="archivo"
                name="archivo"
                :maxFileSize="10485760"
                :auto="false"
                chooseLabel="Seleccionar PDF"
                uploadLabel="Subir PDF"
                cancelLabel="Cancelar"
                removeLabel="Eliminar"
                clearLabel="Limpiar"
                browseLabel="Explorar"
                accept=".pdf"
                @select="onFileSelect"
                @clear="onFileClear"
                :class="{ 'p-invalid': errors.archivo }"
                :required="true"
            >
                <template #empty>
                    <span>No se ha seleccionado ningún archivo</span>
                </template>
            </FileUpload>
            <small v-if="errors.archivo" class="p-error">{{ errors.archivo }}</small>
            <small class="p-text-secondary">Solo se permiten archivos PDF</small>
        </div>

        <div class="form-group">
            <label for="observaciones" class="form-label">Observaciones</label>
            <Textarea
                id="observaciones"
                v-model="formData.observaciones"
                rows="3"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, defineEmits, defineProps, computed } from 'vue'
import Select from 'primevue/select'
import FileUpload from 'primevue/fileupload'
import Textarea from 'primevue/textarea'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:modelValue'])

const formData = ref({})
const selectedFile = ref(null)
const errors = ref({})

const tiposDocumento = ref([
    { label: 'Adhesión y LPD', value: 'Adhesión y LPD' },
    { label: 'Otros', value: 'Otros' }
])

// Validación del formulario
const isFormValid = computed(() => {
    // Campos requeridos
    const requiredFields = {
        tipo_documento: formData.value.tipo_documento?.trim(),
        archivo: formData.value.archivo
    }
    
    // Verificar que todos los campos requeridos estén llenos
    const requiredFieldsValid = Object.values(requiredFields).every(value => 
        value !== null && value !== undefined && value !== ''
    )
    
    return requiredFieldsValid
})

onMounted(() => {
    if (props.modelValue) {
        formData.value = { ...props.modelValue }
    }
})

watch(formData, (newValue) => {
    emit('update:modelValue', newValue)
}, { deep: true })

const onFileSelect = (event) => {
    const file = event.files[0]
    if (file) {
        selectedFile.value = file
        formData.value.archivo = file
        errors.value.archivo = null
    }
}

const onFileClear = () => {
    selectedFile.value = null
    formData.value.archivo = null
    errors.value.archivo = null
}

// Función para emitir los datos del formulario (compatible con ReusableDialog)
const emitFormData = () => {
    emit('update:modelValue', formData.value);
};

const validateForm = () => {
    errors.value = {}
    
    if (!formData.value.tipo_documento) {
        errors.value.tipo_documento = 'El tipo de documentación es obligatorio'
    }
    
    if (!formData.value.archivo) {
        errors.value.archivo = 'Debe seleccionar un archivo'
    }
    
    return Object.keys(errors.value).length === 0
}

defineExpose({
    emitFormData,
    isFormValid,
    validateForm
})
</script>
