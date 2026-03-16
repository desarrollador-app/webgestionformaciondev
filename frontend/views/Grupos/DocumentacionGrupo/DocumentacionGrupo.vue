<template>
    <ReusableArticle title="Seguimiento de documentación">
        <template #header-action>
            <Button 
                label="Añadir documentación" 
                @click="showForm = true"
            />
        </template>
        
        <template #table>
            <div v-if="error" class="error-message">
                {{ error }}
            </div>
            
            <div v-else-if="loading" class="loading-message">
                Cargando documentación...
            </div>
            
            <div v-else-if="documentacionFiltrada.length === 0" class="empty-state">
                No hay documentación disponible para este grupo.
            </div>
            
            <DataTable 
                v-else
                :value="documentacionFiltrada" 
                :paginator="documentacionFiltrada.length > 25" 
                :rows="10"
            >
                <Column field="tipo_documento" header="Tipo de documentación" sortable></Column>
                <Column field="fecha_subida" header="Fecha de subida" sortable>
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.fecha_subida) }}
                    </template>
                </Column>
                <Column field="observaciones" header="Observaciones">
                    <template #body="slotProps">
                        <span v-if="slotProps.data.observaciones">{{ slotProps.data.observaciones }}</span>
                        <span v-else class="text-muted">-</span>
                    </template>
                </Column>
                <Column header="" :exportable="false">
                    <template #body="slotProps">
                        <div class="table-actions">
                            <Button 
                                label="Ver" 
                                size="small" 
                                outlined 
                                @click="viewDocument(slotProps.data)"
                            />
                            <Button 
                                label="Eliminar" 
                                size="small" 
                                outlined
                                @click="confirmDelete(slotProps.data)"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </template>
    </ReusableArticle>

    <ReusableDialog
        v-model:visible="showForm"
        title="Añadir documentación"
        :form-component="DocumentacionGrupoForm"
        v-model:form-data="formData"
        :confirm-loading="saving"
        :width="'50vw'"
        @save="saveDocumento"
        @cancel="closeForm"
    />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useDocumentacionGrupo } from '@/composables/useDocumentacionGrupo'
import { getSignedUrl } from '@/services/documentacionGrupoService'
import DocumentacionGrupoForm from './DocumentacionGrupoForm.vue'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const props = defineProps({
    grupoId: {
        type: Number,
        required: true
    }
})

const confirm = useConfirm()
const toast = useToast()

const { documentacion, loading, error, fetchDocumentacion, addDocumento, removeDocumento } = useDocumentacionGrupo(props.grupoId)

const showForm = ref(false)
const saving = ref(false)
const formData = ref({})

// Filtrar documentos excluyendo los de tipo "trasera"
const documentacionFiltrada = computed(() => {
    return documentacion.value.filter(doc => doc.tipo_documento !== 'trasera')
})

onMounted(() => {
    fetchDocumentacion()
})

const closeForm = () => {
    showForm.value = false
    formData.value = {}
}

const saveDocumento = async (formDataFromDialog) => {
    // Usar los datos del diálogo si están disponibles, sino usar el formData local
    const dataToSave = formDataFromDialog || formData.value
    
    saving.value = true
    try {
        const documentoData = {
            ...dataToSave,
            id_grupo: props.grupoId
        }
        
        await addDocumento(documentoData)
        toast.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Documento añadido correctamente',
            life: 3000 
        })
        closeForm()
    } catch (err) {
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: err.message || 'Error al guardar el documento',
            life: 3000 
        })
    } finally {
        saving.value = false
    }
}

const viewDocument = async (documento) => {
    try {
        const response = await getSignedUrl(documento.id_documento)
        window.open(response.signedUrl, '_blank')
    } catch (err) {
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'No se pudo abrir el documento',
            life: 3000 
        })
    }
}

const confirmDelete = (documento) => {
    confirm.require({
        message: `¿Estás seguro de que quieres eliminar el documento "${documento.tipo_documento}"?`,
        header: 'Confirmar eliminación',
        acceptLabel: 'Eliminar',
        rejectLabel: 'Cancelar',
        accept: () => {
            deleteDocumento(documento)
        }
    })
}

const deleteDocumento = async (documento) => {
    try {
        await removeDocumento(documento.id_documento)
        toast.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Documento eliminado correctamente',
            life: 3000 
        })
    } catch (err) {
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: err.message || 'Error al eliminar el documento',
            life: 3000 
        })
    }
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}
</script>
