<template>
    <ReusableArticle 
        title="Documentación de la Empresa"
    >
        <template #header-action>
            <Button 
                label="Añadir documentación" 
                @click="showAddDialog = true"
            />
        </template>

        <template #table>

            <div v-if="error" class="error-message">
                <p>Error al cargar la documentación: {{ error }}</p>
                <Button label="Reintentar" @click="fetchDocumentacion" />
            </div>

            <div v-else-if="loading" class="loading-message">
                Cargando documentación...
            </div>

            <div v-else-if="documentacion.length === 0" class="empty-state">
                No hay documentación disponible
            </div>

            <div v-else>
                <DataTable :value="documentacion" :loading="loading">
                <Column field="tipo_documento" header="Tipo de documentación" sortable>
                    <template #body="slotProps">
                        <span>{{ slotProps.data.tipo_documento }}</span>
                    </template>
                </Column>
                
                <Column field="fecha_subida" header="Fecha de subida" sortable>
                    <template #body="slotProps">
                        <span>{{ formatDate(slotProps.data.fecha_subida) }}</span>
                    </template>
                </Column>
                
                <Column field="observaciones" header="Observaciones">
                    <template #body="slotProps">
                        <span>{{ slotProps.data.observaciones || '-' }}</span>
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
            </div>

        <ReusableDialog 
            v-model:visible="showAddDialog" 
            title="Añadir documentación"
            :form-component="DocumentacionEmpresaForm"
            :form-data="formData"
            @save="handleAddDocumento"
            @cancel="handleCancelAddDialog"
        />
        </template>
    </ReusableArticle>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import DocumentacionEmpresaForm from './DocumentacionEmpresaForm.vue'
import { useDocumentacionEmpresa } from '@/composables/useDocumentacionEmpresa.js'
import { getSignedUrl } from '@/services/documentacionEmpresaService.js'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'

const props = defineProps({
    empresaId: {
        type: Number,
        required: true
    }
})

const confirm = useConfirm()
const toast = useToast()

const { documentacion, loading, error, fetchDocumentacion, addDocumento, removeDocumento } = useDocumentacionEmpresa(props.empresaId)

const showAddDialog = ref(false)
const uploading = ref(false)

const formData = ref({
    tipo_documento: '',
    observaciones: '',
    archivo: null
})

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES')
}

const viewDocument = async (documento) => {
    try {
        // Obtener URL firmada del backend
        const response = await getSignedUrl(documento.id_documento)
        const signedUrl = response.signedUrl
        
        if (signedUrl) {
            // Para PDFs, abrir en nueva ventana con parámetros para visualización
            if (documento.nombre_archivo.toLowerCase().endsWith('.pdf')) {
                window.open(signedUrl, '_blank', 'noopener,noreferrer')
            } else {
                // Para otros tipos de archivo, abrir normalmente
                window.open(signedUrl, '_blank')
            }
        } else {
            throw new Error('No se pudo obtener la URL del archivo')
        }
    } catch (error) {
        console.error('Error al obtener URL firmada:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al abrir archivo',
            detail: 'No se pudo acceder al archivo. Inténtalo de nuevo.',
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
            handleDeleteDocumento(documento.id_documento)
        }
    })
}

const handleDeleteDocumento = async (documentoId) => {
    try {
        await removeDocumento(documentoId)
        toast.add({
            severity: 'success',
            summary: 'Documento eliminado',
            detail: 'El documento ha sido eliminado correctamente',
            life: 3000
        })
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error al eliminar',
            detail: 'No se pudo eliminar el documento',
            life: 3000
        })
    }
}

const handleAddDocumento = async (documentoData) => {
    uploading.value = true
    
    try {
        const dataToSave = {
            id_empresa: props.empresaId,
            tipo_documento: documentoData.tipo_documento,
            observaciones: documentoData.observaciones,
            archivo: documentoData.archivo
        }
        
        await addDocumento(dataToSave)
        
        toast.add({
            severity: 'success',
            summary: 'Documento subido',
            detail: 'El documento ha sido subido correctamente',
            life: 3000
        })
        
        showAddDialog.value = false
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error al subir',
            detail: 'No se pudo subir el documento',
            life: 3000
        })
    } finally {
        uploading.value = false
    }
}

const handleCancelAddDialog = () => {
    showAddDialog.value = false
    formData.value = {
        tipo_documento: '',
        observaciones: '',
        archivo: null
    }
}

onMounted(() => {
    fetchDocumentacion()
})
</script>
