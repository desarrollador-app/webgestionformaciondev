<template>
    <Dialog 
        :visible="visible" 
        modal 
		:style=" { width: width }"
        :header="title" 
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        class="p-fluid"
        @hide="onHide"
        @update:visible="onVisibleChange"
    >
        <template #header>
            <div class="flex align-items-center gap-2">
                <span class="font-bold text-lg">{{ title }}</span>
            </div>
        </template>
        
        <component 
            v-if="formComponent"
            :is="formComponent" 
            ref="formComponentRef"
            v-model="formData" 
            v-bind="formProps"
            :key="formDataKey"
            @update:modelValue="onFormDataUpdate"
        />
        <div v-if="message">
            <p>{{ message }}</p>
            <div v-if="details">
                <p>{{ details }}</p>
            </div>
        </div>
        
		<slot name="content"></slot>
        
        <template #footer>
            <div>
                <Button 
                    :label="cancelLabel" 
                    :severity="cancelSeverity"
                    @click="onCancel" 
                />
                <Button 
                    :label="confirmLabel" 
                    :severity="confirmSeverity"
                    :disabled="!isFormValid || confirmDisabled"
                    :loading="confirmLoading"
                    @click="onConfirm" 
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

// Props
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Nuevo elemento'
    },
    formComponent: {
        type: [Object, String],
        default: null
    },
    formProps: {
        type: Object,
        default: () => ({})
    },
    formData: {
        type: Object,
        default: () => ({})
    },
    message: {
        type: String,
        default: ''
    },
    details: {
        type: String,
        default: ''
    },
    confirmLabel: {
        type: String,
        default: 'Guardar'
    },
    cancelLabel: {
        type: String,
        default: 'Cancelar'
    },
    confirmSeverity: {
        type: String,
        default: 'primary'
    },
    cancelSeverity: {
        type: String,
        default: 'secondary'
    },
    dialogType: {
        type: String,
        default: 'form', // 'form' o 'confirmation'
        validator: (value) => ['form', 'confirmation'].includes(value)
    },
    width: {
        type: String,
        default: '50rem'
    },
    confirmDisabled: {
        type: Boolean,
        default: false
    },
    confirmLoading: {
        type: Boolean,
        default: false
    }
})

// Emits
const emit = defineEmits(['update:visible', 'save', 'cancel', 'confirm', 'update:formData'])

// Datos del formulario
const formData = ref({ ...props.formData })
const formDataKey = ref(0)

// Watch para sincronizar con el prop visible
watch(() => props.visible, (newValue) => {
    if (!newValue) {
        resetForm()
    } else {
        // Cuando se abre el modal, sincronizar los datos
        formData.value = { ...props.formData }
        formDataKey.value++ // Forzar re-renderización del componente
    }
})

// Watch para sincronizar cambios en formData prop
watch(() => props.formData, (newValue) => {
    if (props.visible && newValue) {
        formData.value = { ...newValue }
        formDataKey.value++ // Forzar re-renderización del componente
    }
}, { deep: true })

const formComponentRef = ref(null)

// Verificar si el formulario es válido
const isFormValid = computed(() => {
    if (formComponentRef.value && typeof formComponentRef.value.isFormValid !== 'undefined') {
        return formComponentRef.value.isFormValid
    }
    return true // Por defecto, permitir guardar si no hay validación
})

// Funciones del modal
const onVisibleChange = (newValue) => {
    emit('update:visible', newValue)
}

const onHide = () => {
    emit('update:visible', false)
}

const onCancel = () => {
    emit('cancel')
    emit('update:visible', false)
    resetForm()
}

const onConfirm = () => {
    if (props.dialogType === 'form') {
        if (formComponentRef.value && typeof formComponentRef.value.emitFormData === 'function') {
            formComponentRef.value.emitFormData()
        }
        
        emit('save', formData.value)
        emit('update:visible', false)
        resetForm()
    } else {
        emit('confirm')
    }
}

const onFormDataUpdate = (newValue) => {
    formData.value = newValue
    emit('update:formData', newValue)
}

const resetForm = () => {
    formData.value = { ...props.formData }
}
</script>
