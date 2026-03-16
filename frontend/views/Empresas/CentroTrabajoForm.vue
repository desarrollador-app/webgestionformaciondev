<template>
    <div class="modal-content">
        <div class="form">
            <div class="form-group">
                <label for="nombre" class="form-label required">Nombre del centro</label>
                <InputText 
                    id="nombre"
                    v-model="formData.nombre" 
                    :required="true"
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
                <label for="direccion" class="form-label">Dirección</label>
                <Textarea 
                    id="direccion"
                    v-model="formData.direccion" 
                    rows="3"
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
                    type="email"
                />
            </div>
            
            <div class="form-group">
                <label for="cuenta_bancaria" class="form-label">Cuenta bancaria</label>
                <InputText 
                    id="cuenta_bancaria"
                    v-model="formData.cuenta_bancaria" 
                />
            </div>

            <div class="form-group">
                <label for="iban" class="form-label">IBAN</label>
                <InputText 
                    id="iban"
                    v-model="formData.iban" 
                    maxlength="34"
                />
            </div>

            <div class="form-group">
                <label for="bic" class="form-label">BIC</label>
                <InputText 
                    id="bic"
                    v-model="formData.bic" 
                    maxlength="11"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:modelValue'])

const formData = ref({
    nombre: '',
    NSS: '',
    direccion: '',
    persona_contacto: '',
    telefono1: '',
    telefono2: '',
    fax: '',
    correo_electronico: '',
    cuenta_bancaria: '',
    iban: '',
    bic: '',
    ...props.modelValue
})

// Validación del formulario
const isFormValid = computed(() => {
    // Campos requeridos
    const requiredFields = {
        nombre: formData.value.nombre?.trim()
    }
    
    // Verificar que todos los campos requeridos estén llenos
    const requiredFieldsValid = Object.values(requiredFields).every(value => 
        value !== null && value !== undefined && value !== ''
    )
    
    return requiredFieldsValid
})

// Función simple para emitir los datos del formulario
const emitFormData = () => {
    emit('update:modelValue', formData.value);
};

defineExpose({
    emitFormData,
    isFormValid
});

// Watcher para sincronizar con las props
watch(() => props.modelValue, (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
        formData.value = { ...formData.value, ...newValue };
    }
}, { immediate: true });

</script>