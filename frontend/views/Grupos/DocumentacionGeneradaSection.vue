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

    <!-- Dialog para seleccionar sesiones del control de asistencia -->
    <ReusableDialog
        v-model:visible="showControlAsistenciaDialog"
        title="Descargar control de asistencia"
		message="Selecciona las sesiones de las que quieres descargar el control de asistencia."
        :dialog-type="'confirmation'"
        :confirm-label="'Descargar'"
        :cancel-label="'Cancelar'"
        :confirm-severity="'primary'"
        :confirm-disabled="selectedSesiones.length === 0"
        :confirm-loading="loadingDescarga"
        @confirm="confirmarDescargaControlAsistencia"
        @cancel="cancelarControlAsistencia"
    >
        <template #content>
            <div v-if="loadingSesiones">
                <ProgressSpinner style="width: 50px; height: 50px;" />
            </div>
            <div v-else>
                <MultiSelect
                    v-model="selectedSesiones"
                    :options="sesionesOptions"
                    optionLabel="label"
                    optionValue="value"
                    filter
                    placeholder="Seleccione sesiones"
                    :maxSelectedLabels="1"
                />
                <small v-if="sesionesOptions.length === 0">
                    No hay sesiones disponibles para este grupo.
                </small>
            </div>
        </template>
    </ReusableDialog>
</template>

<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MultiSelect from 'primevue/multiselect'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'
import { getAllDiasImparticionPresencial } from '@/services/diasImparticionPresencialService.js'
import { getAllDiasImparticionTeleformacion } from '@/services/diasImparticionTeleformacionService.js'

const toast = useToast()
const props = defineProps({
    grupoId: {
        type: [String, Number],
        required: true
    }
})

// Estado del dialog de control de asistencia
const showControlAsistenciaDialog = ref(false)
const loadingSesiones = ref(false)
const loadingDescarga = ref(false)
const selectedSesiones = ref([])
const sesionesOptions = ref([])

// Datos de ejemplo para la documentación generada
const documentos = ref([
    {
        id: 1,
        nombre: 'Fundae - Inicio grupo'
    },
    {
        id: 2,
        nombre: 'Fundae - Fin grupo'
    },
    {
        id: 3,
        nombre: 'Recibí de Material Praxis'
    },
    {
        id: 4,
        nombre: 'Recibí de Diploma Praxis'
    },
    {
        id: 5,
        nombre: 'Control de Asistencia'
    }
])

// Función para formatear la fecha de una sesión
const formatDateForSession = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

// Función para obtener el nombre completo del docente
const getDocenteNombre = (docente) => {
    if (!docente || !docente.persona) return 'Sin docente'
    const { nombre, apellido1, apellido2 } = docente.persona
    return `${nombre || ''} ${apellido1 || ''} ${apellido2 || ''}`.trim()
}

// Función para formatear el horario de una sesión (usar UTC para evitar problemas de zona horaria)
const formatTimeForSession = (timeString) => {
    if (!timeString) return ''
    const date = new Date(timeString)
    const hours = date.getUTCHours().toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
}

// Función para cargar las sesiones del grupo
const cargarSesionesGrupo = async () => {
    loadingSesiones.value = true
    sesionesOptions.value = []
    selectedSesiones.value = []
    
    try {
        // Obtener días de impartición presencial y teleformación
        const [diasPresenciales, diasTeleformacion] = await Promise.all([
            getAllDiasImparticionPresencial({ id_grupo: props.grupoId }),
            getAllDiasImparticionTeleformacion({ id_grupo: props.grupoId })
        ])
        
        const opciones = []
        
        // Procesar sesiones presenciales
        diasPresenciales.forEach(dia => {
            if (dia.sesiones && dia.sesiones.length > 0) {
                dia.sesiones.forEach(sesion => {
                    opciones.push({
                        value: sesion.id_sesion,
                        fecha: dia.fecha_imparticion,
                        fechaFormateada: formatDateForSession(dia.fecha_imparticion),
                        docenteNombre: getDocenteNombre(sesion.docente),
                        horarioInicio: formatTimeForSession(sesion.horario_inicio),
                        horarioFin: formatTimeForSession(sesion.horario_fin),
                        tipo: 'presencial'
                    })
                })
            }
        })
        
        // Procesar sesiones de teleformación
        diasTeleformacion.forEach(dia => {
            if (dia.sesiones && dia.sesiones.length > 0) {
                dia.sesiones.forEach(sesion => {
                    opciones.push({
                        value: sesion.id_sesion,
                        fecha: dia.fecha_imparticion,
                        fechaFormateada: formatDateForSession(dia.fecha_imparticion),
                        docenteNombre: getDocenteNombre(sesion.docente),
                        horarioInicio: formatTimeForSession(sesion.horario_inicio),
                        horarioFin: formatTimeForSession(sesion.horario_fin),
                        tipo: 'teleformacion'
                    })
                })
            }
        })
        
        // Ordenar por fecha y luego por horario de inicio
        opciones.sort((a, b) => {
            const fechaComparison = new Date(a.fecha) - new Date(b.fecha)
            if (fechaComparison !== 0) return fechaComparison
            // Si es el mismo día, ordenar por horario de inicio
            return a.horarioInicio.localeCompare(b.horarioInicio)
        })
        
        // Asignar número de sesión y crear el label final
        opciones.forEach((opcion, index) => {
            const numeroSesion = index + 1
            opcion.numeroSesion = numeroSesion
            opcion.label = `Sesión ${numeroSesion} - ${opcion.fechaFormateada} - ${opcion.horarioInicio} a ${opcion.horarioFin} - ${opcion.docenteNombre}`
        })
        
        sesionesOptions.value = opciones
    } catch (error) {
        console.error('Error al cargar las sesiones:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las sesiones del grupo',
            life: 3000
        })
    } finally {
        loadingSesiones.value = false
    }
}

// Función para abrir el dialog de control de asistencia
const abrirDialogControlAsistencia = async () => {
    showControlAsistenciaDialog.value = true
    await cargarSesionesGrupo()
}

// Función para cancelar el dialog
const cancelarControlAsistencia = () => {
    showControlAsistenciaDialog.value = false
    selectedSesiones.value = []
}

// Función para confirmar la descarga del control de asistencia
const confirmarDescargaControlAsistencia = async () => {
    if (selectedSesiones.value.length === 0) return
    
    loadingDescarga.value = true
    
    try {
        // Descargar un documento por cada sesión seleccionada
        for (const sesionId of selectedSesiones.value) {
            // Obtener la información de la sesión para el nombre del archivo
            const sesionInfo = sesionesOptions.value.find(s => s.value === sesionId)
            
            const response = await fetch(`/api/grupos/${props.grupoId}/control-asistencia?sesionId=${sesionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            
            if (!response.ok) {
                let errorMessage = 'Error al generar el CONTROL DE ASISTENCIA'
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
                continue
            }
            
            // Crear blob y descargar
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            
            // Nombre del archivo con el número de grupo y sesión
            const nombreArchivo = sesionInfo 
                ? `control_asistencia_grupo_${props.grupoId}_sesion_${sesionInfo.numeroSesion}.pdf`
                : `control_asistencia_grupo_${props.grupoId}_sesion_${sesionId}.pdf`
            
            a.download = nombreArchivo
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            
            // Pequeña pausa entre descargas para evitar problemas
            if (selectedSesiones.value.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 500))
            }
        }
        
        toast.add({
            severity: 'success',
            summary: 'Descarga completada',
            detail: `Se han descargado ${selectedSesiones.value.length} documento(s) de control de asistencia`,
            life: 3000
        })
        
        showControlAsistenciaDialog.value = false
        selectedSesiones.value = []
    } catch (error) {
        console.error('Error al descargar controles de asistencia:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al descargar los documentos',
            life: 3000
        })
    } finally {
        loadingDescarga.value = false
    }
}

const descargarDocumento = async (documento) => {
    try {
        // Si es Control de Asistencia, abrir el dialog de selección de sesiones
        if (documento.nombre === 'Control de Asistencia') {
            await abrirDialogControlAsistencia()
            return
        }
        
        if (documento.nombre === 'Fundae - Inicio grupo') {
            // Descargar XML Fundae - Inicio grupo
            const response = await fetch(`/api/grupos/${props.grupoId}/fundae-inicio-xml`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            
            if (!response.ok) {
                // Intentar leer el error del backend
                let errorMessage = 'Error al generar el XML de inicio de grupo'
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
                    // Si no se puede parsear como JSON, usar el mensaje por defecto
                    console.error('Error al parsear respuesta de error:', e)
                }
                
                toast.add({
                    severity: 'error',
                    summary: errorMessage,
                    detail: errorDetails || 'No se pudo generar el XML de inicio de grupo',
                    life: 5000
                })
                return
            }
            
            // Crear blob y descargar
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `fundae_inicio_grupo_${props.grupoId}.xml`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            
            toast.add({
                severity: 'success',
                summary: 'XML generado',
                detail: 'El XML de inicio de grupo se ha descargado correctamente',
                life: 3000
            })
        } else if (documento.nombre === 'Fundae - Fin grupo') {
            // Descargar XML Fundae - Fin grupo
            const response = await fetch(`/api/grupos/${props.grupoId}/fundae-fin-xml`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            
            if (!response.ok) {
                // Intentar leer el error del backend
                let errorMessage = 'Error al generar el XML de fin de grupo'
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
                    // Si no se puede parsear como JSON, usar el mensaje por defecto
                    console.error('Error al parsear respuesta de error:', e)
                }
                
                toast.add({
                    severity: 'error',
                    summary: errorMessage,
                    detail: errorDetails || 'No se pudo generar el XML de fin de grupo',
                    life: 5000
                })
                return
            }
            
            // Crear blob y descargar
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `fundae_fin_grupo_${props.grupoId}.xml`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            
            toast.add({
                severity: 'success',
                summary: 'XML generado',
                detail: 'El XML de fin de grupo se ha descargado correctamente',
                life: 3000
            })
        } else if (documento.nombre === 'Recibí de Material Praxis') {
            // Descargar PDF RECIBÍ DE MATERIAL
            const response = await fetch(`/api/grupos/${props.grupoId}/recibi-material`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            
            if (!response.ok) {
                // Intentar leer el error del backend
                let errorMessage = 'Error al generar el RECIBÍ DE MATERIAL'
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
                    // Si no se puede parsear como JSON, usar el mensaje por defecto
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
            a.download = `recibi_material_grupo_${props.grupoId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } else if (documento.nombre === 'Recibí de Diploma Praxis') {
            // Descargar PDF RECIBÍ DE DIPLOMA
            const response = await fetch(`/api/grupos/${props.grupoId}/recibi-diploma`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            
            if (!response.ok) {
                // Intentar leer el error del backend
                let errorMessage = 'Error al generar el RECIBÍ DE DIPLOMA'
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
                    // Si no se puede parsear como JSON, usar el mensaje por defecto
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
            a.download = `recibi_diploma_grupo_${props.grupoId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } else {
            console.log('Descargando documento:', documento.nombre)
            // TODO: Implementar otras funcionalidades de descarga
        }
    } catch (error) {
        console.error('Error al descargar documento:', error)
        toast.add({ 
            severity: 'error',
            summary: 'Error',
            detail: 'Error al descargar el documento',
            life: 3000
        })
    }
}
</script>
