<template>
    <ReusableArticle 
        title="Documentación generada"
    >
        <template #table>
            <DataTable 
                :value="documentos" 
                :paginator="documentos.length > 25"
                :rows="25"
                dataKey="id"
                emptyMessage="No hay documentos generados"
            >
                <Column field="nombre" header="Nombre" sortable>
                    <template #body="slotProps">
                        <span>{{ slotProps.data.nombre }}</span>
                    </template>
                </Column>
                
                <Column header="" :exportable="false">
                    <template #body="slotProps">
                        <div class="table-actions">
                            <!-- BTN. para descargar archivo -->
                            <Button 
                                label="Descargar" 
                                size="small" 
                                outlined
                                @click="() => descargarDocumento(slotProps.data)"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </template>
    </ReusableArticle>
</template>

<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const props = defineProps({
    accionId: {
        type: [String, Number],
        required: true
    }
})

// Datos de ejemplo para la documentación generada
const documentos = ref([
    {
        id: 1,
        nombre: 'Fundae - AAFF'
    }
])

const descargarDocumento = async (documento) => {
    try {
        if (documento.nombre === 'Fundae - AAFF') {
            // Descargar XML AAFF - Acciones Formativas
            const response = await fetch(`/api/acciones-formativas/${props.accionId}/aaff-xml`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            
            if (!response.ok) {
                // Intentar leer el error del backend
                let errorMessage = 'Error al generar el XML'
                let errorDetails = ''
                
                try {
                    const errorData = await response.json()
                    if (errorData.error) {
                        errorMessage = errorData.error
                    }
                    if (errorData.details) {
                        errorDetails = typeof errorData.details === 'string' 
                            ? errorData.details 
                            : Array.isArray(errorData.details) 
                                ? errorData.details.join(', ') 
                                : ''
                    }
                } catch (e) {
                    console.error('Error al parsear respuesta de error:', e)
                }
                
                toast.add({
                    severity: 'error',
                    summary: errorMessage,
                    detail: errorDetails || 'No se pudo generar el documento',
                    life: 5000
                })
                return
            }
            
            // Crear blob y descargar
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `aaff_${props.accionId}.xml`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            
            toast.add({
                severity: 'success',
                summary: 'XML generado',
                detail: 'El XML se ha generado y descargado correctamente.',
                life: 3000
            })
        } else {
            console.log('Descargando documento:', documento.nombre)
            // TODO: Implementar otras funcionalidades de descarga
        }
    } catch (error) {
        console.error('Error al descargar documento:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error al descargar el documento',
            life: 5000
        })
    }
}
</script>
