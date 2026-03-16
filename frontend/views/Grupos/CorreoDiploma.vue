<template>
  <section v-if="grupo">
    <div class="section-header">
      <div class="section-header__main section-main">
        <h1 class="section-main__title">Correo de Diploma</h1>
        <p class="section-main__subtitle">{{ grupo.denominacion }}</p>
      </div>
    </div>

    <ReusableArticle title="Alumnos">
      <template #header-action>
        <Button 
          label="Añadir trasera" 
          severity="secondary"
          @click="addTrasera"
        />
        <Button 
          label="Mandar email masivo" 
          @click="sendBulkDiplomaEmails"
          :disabled="loading || alumnos.length === 0 || archivosAdjuntos.length === 0"
          severity="primary"
          v-tooltip.top="archivosAdjuntos.length === 0 ? 'Debe añadir una parte trasera antes de enviar diplomas' : ''"
        />
      </template>
      
      <!-- Mensaje cuando no hay parte trasera -->
      <div v-if="archivosAdjuntos.length === 0" class="p-mb-4">
        <div class="p-card p-p-3" style="background-color: #fff3cd; border: 1px solid #ffeaa7;">
          <div class="flex align-items-center">
            <i class="pi pi-exclamation-triangle" style="color: #856404; margin-right: 8px;"></i>
            <div>
              <h5 class="p-m-0" style="color: #856404;">Parte trasera requerida</h5>
              <p class="p-m-0 p-mt-1" style="color: #856404;">
                Para enviar emails de diploma, debe añadir primero una parte trasera al grupo.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sección de archivos adjuntos -->
      <div v-if="archivosAdjuntos.length > 0" class="p-mb-4">
        <h4>Archivos adjuntos al diploma:</h4>
        <div class="p-grid">
          <div v-for="archivo in archivosAdjuntos" :key="archivo.id_documento">
            <div class="p-card p-p-3">
              <div class="flex justify-content-between align-items-center">
                <div>
                  <h5 class="p-m-0">{{ archivo.nombre_archivo }}</h5>
                  <small class="p-text-secondary">
                    Subido: {{ formatDate(archivo.fecha_subida) }}
                  </small>
                </div>
                <div class="flex gap-2">
                  <Button 
                    icon="pi pi-download" 
                    size="small" 
                    outlined
                    @click="descargarArchivo(archivo)"
                    v-tooltip.top="'Descargar archivo'"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    size="small" 
                    severity="danger"
                    outlined
                    @click="eliminarArchivo(archivo)"
                    v-tooltip.top="'Eliminar archivo'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #table>
        <div v-if="loading" class="loading-message">
          <i class="pi pi-spin pi-spinner"></i>
          Cargando alumnos...
        </div>

        <div v-else-if="error" class="error-message">
          <p>Error al cargar los datos: {{ error }}</p>
          <Button label="Reintentar" @click="loadData" />
        </div>

        <div v-else-if="alumnos.length === 0" class="empty-message">
          <p>No hay alumnos en este grupo</p>
        </div>

        <div v-else>
          <DataTable :value="alumnos" :paginator="alumnos.length > 25" :rows="10" class="p-datatable-sm">
            <Column field="nombre" header="Nombre" sortable>
              <template #body="slotProps">
                <div>
                  {{ slotProps.data.nombre }}
                </div>
              </template>
            </Column>

            <Column header="Enviado" sortable>
              <template #body="slotProps">
                <Tag 
                  :value="slotProps.data.diploma.enviado ? 'Sí' : 'No'"
                  :severity="slotProps.data.diploma.enviado ? 'success' : 'danger'"
                />
              </template>
            </Column>

            <Column header="Fecha de envío" sortable>
              <template #body="slotProps">
                <span v-if="slotProps.data.diploma.fecha_envio">
                  {{ formatDate(slotProps.data.diploma.fecha_envio) }}
                </span>
                <span v-else>-</span>
              </template>
            </Column>

            <Column header="" :exportable="false">
              <template #body="slotProps">
                <div class="table-actions">
                  <Button 
                    label="Ver diploma" 
                    size="small"
                    outlined
                    @click="viewDiploma(slotProps.data)"
                    :disabled="!slotProps.data.diploma.enviado"
                    v-tooltip.top="slotProps.data.diploma.enviado ? 'Ver diploma generado' : 'Primero debe enviar el email de diploma'"
                  />
                  <Button 
                    label="Enviar mail" 
                    size="small"
                    outlined
                    @click="sendDiplomaEmail(slotProps.data)"
                    :disabled="sendingEmails[slotProps.data.id_persona] || archivosAdjuntos.length === 0 || !slotProps.data.email"
                    :loading="sendingEmails[slotProps.data.id_persona]"
                    v-tooltip.top="archivosAdjuntos.length === 0 ? 'Debe añadir una parte trasera antes de enviar diplomas' : ''"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </ReusableArticle>
  </section>
  
  <div v-else-if="loading">
    <p>Cargando grupo...</p>
  </div>
  <div v-else>
    <p>Grupo no encontrado</p>
  </div>

  <!-- Diálogo de confirmación para envío masivo -->
  <ReusableDialog
    v-model:visible="showBulkEmailDialog"
    title="Confirmar envío masivo"
    :dialog-type="'confirmation'"
    :confirm-label="'Enviar emails'"
    :cancel-label="'Cancelar'"
    :confirm-severity="'primary'"
    @confirm="confirmBulkDiplomaEmails"
    @cancel="cancelBulkEmailDialog"
  >
    <template #content>
      <p>¿Estás seguro de enviar emails de diploma a <strong>{{ alumnos.filter(alumno => !alumno.diploma.enviado && alumno.email).length }} alumnos</strong>?</p>
      <p class="p-text-secondary">Se enviarán emails a todos los alumnos que aún no han recibido el email de diploma.</p>
      <p v-if="alumnos.filter(alumno => !alumno.diploma.enviado && !alumno.email).length > 0" class="p-text-warning">
        <i class="pi pi-exclamation-triangle"></i>
        {{ alumnos.filter(alumno => !alumno.diploma.enviado && !alumno.email).length }} alumnos no tienen email configurado y no recibirán el diploma.
      </p>
    </template>
  </ReusableDialog>

  <!-- Diálogo para añadir trasera -->
  <ReusableDialog
    v-model:visible="showTraseraDialog"
    title="Añadir trasera del diploma"
    :width="'50vw'"
	:dialog-type="'confirmation'"
    :confirm-label="'Subir archivo'"
    :cancel-label="'Cancelar'"
    :confirm-severity="'primary'"
    :confirm-disabled="!selectedFile || uploadingFile || archivosAdjuntos.length > 0"
    :confirm-loading="uploadingFile"
    @confirm="subirTrasera"
    @cancel="cancelarTrasera" 
  >
    <template #content>
      <div class="p-fluid">
        <!-- Mostrar archivo existente si hay uno -->
        <div v-if="archivosAdjuntos.length > 0" class="field">
          <h4>Archivo adjunto actual:</h4>
          <div class="p-mb-3 p-p-3 p-border-1 p-border-round p-surface-50">
            <div class="flex justify-content-between align-items-center">
              <div class="flex align-items-center">
                <i class="pi pi-file-pdf p-mr-2" style="color: #dc3545; font-size: 1.5rem;"></i>
                <div>
                  <strong>{{ archivosAdjuntos[0].nombre_archivo }}</strong>
                  <br>
                  <small class="p-text-secondary">Subido: {{ formatDate(archivosAdjuntos[0].fecha_subida) }}</small>
                </div>
              </div>
              <div class="flex align-items-center">
                <Button 
                  label="Eliminar"
                  size="small" 
                  @click="eliminarArchivo(archivosAdjuntos[0])"
                  :loading="deletingFile"
                />
              </div>
            </div>
          </div>
          <div class="p-message p-message-info">
            <i class="pi pi-info-circle"></i>
            <span>Ya existe un archivo adjunto. Elimínalo si quieres subir uno nuevo.</span>
          </div>
        </div>

        <!-- Sección para seleccionar archivo (solo si no hay adjunto existente) -->
        <div v-else class="field">
          <label for="file-upload">Seleccionar PDF</label>
          <FileUpload
            id="file-upload"
            name="archivo"
            accept=".pdf"
            :maxFileSize="10000000"
            @select="onFileSelect"
            :auto="false"
            chooseLabel="Seleccionar PDF"
            uploadLabel="Subir PDF"
            cancelLabel="Cancelar"
            removeLabel="Eliminar"
            clearLabel="Limpiar"
            browseLabel="Explorar"
            class="p-button-outlined"
          >
            <template #empty>
              <span>No se ha seleccionado ningún archivo</span>
            </template>
          </FileUpload>
          <small class="p-text-secondary">Solo se permite un archivo adjunto por grupo</small>
        </div>
      </div>
    </template>
  </ReusableDialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '@/stores/main.js'
import { emailService } from '@/services/emailService.js'
import { getGrupoById } from '@/services/gruposService.js'
import { 
  getAllDocumentacionGrupo, 
  createDocumento, 
  deleteDocumento, 
  getSignedUrl 
} from '@/services/documentacionGrupoService.js'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import FileUpload from 'primevue/fileupload'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const store = useStore()
const toast = useToast()

// Estado reactivo
const grupo = ref(null)
const alumnos = ref([])
const loading = ref(false)
const error = ref(null)
const sendingEmails = ref({})
const showBulkEmailDialog = ref(false)
const showTraseraDialog = ref(false)
const selectedFile = ref(null)
const uploadingFile = ref(false)
const deletingFile = ref(false)
const archivosAdjuntos = ref([])

// Computed
const grupoId = computed(() => route.params.id)

// Métodos
const loadData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Cargar datos del grupo
    const grupoData = await getGrupoById(grupoId.value)
    grupo.value = grupoData
    
    // Cargar alumnos con estado de emails (solo los que tienen tipo Diploma)
    const response = await emailService.getGroupStudentsWithEmailStatus(grupoId.value, 'diploma')
    alumnos.value = response.alumnos
    
    // Cargar archivos adjuntos
    await cargarArchivosAdjuntos()
  } catch (err) {
    error.value = 'Error al cargar los datos'
    console.error('Error loading data:', err)
  } finally {
    loading.value = false
  }
}

const sendDiplomaEmail = async (alumno) => {
  // Verificar que existe parte trasera
  if (archivosAdjuntos.value.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Parte trasera requerida',
      detail: 'Debe añadir una parte trasera antes de enviar emails de diploma',
      life: 5000
    })
    return
  }

  if (!alumno.email) {
    toast.add({
      severity: 'warn',
      summary: 'Email requerido',
      detail: 'Este alumno no tiene email configurado',
      life: 3000
    })
    return
  }

  sendingEmails.value[alumno.id_persona] = true

  try {
    await emailService.sendDiplomaEmail({
      idGrupo: parseInt(grupoId.value),
      idPersona: alumno.id_persona,
      email: alumno.email,
      nombre: alumno.nombre
    })

    toast.add({
      severity: 'success',
      summary: 'Email enviado',
      detail: `Email de diploma enviado correctamente a ${alumno.nombre}`,
      life: 3000
    })

    // Recargar datos para actualizar el estado
    await loadData()
  } catch (err) {
    const { tipo, mensaje } = clasificarError(err)
    
    // Determinar severity según tipo de error
    let severity = 'error'
    if (tipo.includes('429') || tipo.includes('red')) {
      severity = 'warn'
    }
    
    // Construir mensaje detallado con información adicional
    let detalleCompleto = `Alumno: ${alumno.nombre}\nEmail: ${alumno.email}\n\n`
    detalleCompleto += `Motivo: ${mensaje}\n\n`
    
    // Agregar información técnica si está disponible
    if (err.response?.status) {
      detalleCompleto += `Código HTTP: ${err.response.status}`
    }
    if (err.response?.data?.details) {
      const details = Array.isArray(err.response.data.details) 
        ? err.response.data.details.join(', ') 
        : err.response.data.details
      detalleCompleto += `\nDetalles técnicos: ${details}`
    }
    
    toast.add({
      severity: severity,
      summary: `Error al enviar email - ${tipo}`,
      detail: detalleCompleto,
      life: 10000
    })
    
    console.error(`Error enviando email a ${alumno.nombre} [${tipo}]:`, err)
  } finally {
    sendingEmails.value[alumno.id_persona] = false
  }
}

const sendBulkDiplomaEmails = async () => {
  // Verificar que existe parte trasera
  if (archivosAdjuntos.value.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Parte trasera requerida',
      detail: 'Debe añadir una parte trasera antes de enviar emails de diploma',
      life: 5000
    })
    return
  }

  // Clasificar alumnos
  const alumnosSinEmail = alumnos.value.filter(alumno => 
    !alumno.diploma.enviado && alumno.email
  )
  
  const alumnosSinEmailConfigurado = alumnos.value.filter(alumno => 
    !alumno.diploma.enviado && !alumno.email
  )
  
  const alumnosYaEnviados = alumnos.value.filter(alumno => 
    alumno.diploma.enviado
  )

  if (alumnosSinEmail.length === 0) {
    let message = 'Todos los alumnos ya han recibido el email de diploma'
    if (alumnosSinEmailConfigurado.length > 0) {
      message += `. ${alumnosSinEmailConfigurado.length} alumnos no tienen email configurado`
    }
    
    toast.add({
      severity: 'info',
      summary: 'No hay emails pendientes',
      detail: message,
      life: 5000
    })
    return
  }

  showBulkEmailDialog.value = true
}

// Helper para clasificar tipos de error
const clasificarError = (err) => {
  let tipo = 'Error desconocido'
  let mensaje = ''
  
  // Error de red o timeout
  if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
    tipo = 'Error de red/timeout'
    mensaje = 'Problema de conexión con el servidor'
  }
  // Error de validación del backend
  else if (err.response?.status === 400) {
    tipo = 'Error de validación'
    mensaje = err.response.data?.error || err.response.data?.details || 'Datos inválidos'
  }
  // Error de autenticación
  else if (err.response?.status === 401 || err.response?.status === 403) {
    tipo = 'Error de autenticación'
    mensaje = 'Problemas con los permisos de Microsoft Graph API'
  }
  // Error 429 - Rate Limit
  else if (err.response?.status === 429) {
    tipo = 'Límite de envío alcanzado'
    mensaje = 'Demasiados emails en poco tiempo. Espera unos minutos'
  }
  // Error del servidor
  else if (err.response?.status >= 500) {
    tipo = 'Error del servidor'
    mensaje = err.response.data?.error || 'Error interno del servidor'
  }
  // Otros errores de Graph API
  else if (err.response?.data?.error) {
    tipo = 'Error de Microsoft Graph'
    mensaje = err.response.data.error
    if (err.response.data.details) {
      if (Array.isArray(err.response.data.details)) {
        mensaje += ': ' + err.response.data.details.join(', ')
      } else {
        mensaje += ': ' + err.response.data.details
      }
    }
  }
  
  return { tipo, mensaje: mensaje || tipo }
}

const confirmBulkDiplomaEmails = async () => {
  const alumnosSinEmail = alumnos.value.filter(alumno => 
    !alumno.diploma.enviado && alumno.email
  )
  
  const alumnosSinEmailConfigurado = alumnos.value.filter(alumno => 
    !alumno.diploma.enviado && !alumno.email
  )

  let successCount = 0
  let errorCount = 0

  const erroresPorTipo = new Map() // Agrupar errores por tipo
  
  for (const alumno of alumnosSinEmail) {
    try {
      await emailService.sendDiplomaEmail({
        idGrupo: parseInt(grupoId.value),
        idPersona: alumno.id_persona,
        email: alumno.email,
        nombre: alumno.nombre
      })
      successCount++
    } catch (err) {
      errorCount++
      
      const { tipo, mensaje } = clasificarError(err)
      
      // Agrupar errores por tipo
      if (!erroresPorTipo.has(tipo)) {
        erroresPorTipo.set(tipo, { count: 0, mensaje })
      }
      erroresPorTipo.get(tipo).count++
      
      console.error(`Error enviando email a ${alumno.nombre} [${tipo}]:`, err)
    }
  }

  // Crear mensaje detallado del resultado
  let message = `Enviados: ${successCount} | Errores: ${errorCount}`
  
  if (errorCount > 0) {
    message += '\n\nDetalles de errores:'
    for (const [tipo, info] of erroresPorTipo) {
      message += `\n• ${tipo}: ${info.count} email(s)`
      if (info.mensaje && info.mensaje !== tipo) {
        message += `\n  ↳ ${info.mensaje}`
      }
    }
  }
  
  if (alumnosSinEmailConfigurado.length > 0) {
    message += `\n\n${alumnosSinEmailConfigurado.length} alumnos sin email configurado`
  }

  // Determinar severity según tipo de error
  let severity = 'success'
  if (errorCount > 0) {
    // Si hay errores de rate limit, es warning (se puede reintentar)
    if (erroresPorTipo.has('Límite de envío alcanzado')) {
      severity = 'warn'
    } else {
      severity = 'error'
    }
  }

  toast.add({
    severity: severity,
    summary: `Envío masivo completado: ${successCount}/${alumnosSinEmail.length} exitosos`,
    detail: message,
    life: 15000
  })

  // Recargar datos para actualizar el estado
  await loadData()
  
  showBulkEmailDialog.value = false
}

const cancelBulkEmailDialog = () => {
  showBulkEmailDialog.value = false
}

const addTrasera = () => {
  showTraseraDialog.value = true
}

const viewDiploma = async (alumno) => {
  try {
    // Mostrar loading
    toast.add({
      severity: 'info',
      summary: 'Cargando diploma',
      detail: `Buscando diploma de ${alumno.nombre}...`,
      life: 2000
    })

    // Obtener URL de descarga del diploma
    const response = await emailService.downloadDiploma(grupoId.value, alumno.id_persona)
    
    if (response.downloadUrl) {
      // Abrir el diploma en una nueva pestaña
      window.open(response.downloadUrl, '_blank')
      
      toast.add({
        severity: 'success',
        summary: 'Diploma encontrado',
        detail: `Diploma de ${alumno.nombre} abierto correctamente`,
        life: 3000
      })
    } else {
      throw new Error('No se encontró URL de descarga')
    }
  } catch (error) {
    console.error('Error al ver diploma:', error)
    
    let errorMessage = 'No se pudo abrir el diploma'
    if (error.response?.status === 404) {
      errorMessage = 'No se encontró diploma generado para este alumno'
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error al ver diploma',
      detail: errorMessage,
      life: 5000
    })
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const onFileSelect = (event) => {
  selectedFile.value = event.files[0]
}

const cancelarTrasera = () => {
  showTraseraDialog.value = false
  selectedFile.value = null
  deletingFile.value = false
}

const subirTrasera = async () => {
  if (!selectedFile.value) return
  
  uploadingFile.value = true
  
  try {
    const documentoData = {
      id_grupo: parseInt(grupoId.value),
      tipo_documento: 'trasera',
      observaciones: 'Trasera del diploma',
      archivo: selectedFile.value
    }
    
    await createDocumento(documentoData)
    
    toast.add({
      severity: 'success',
      summary: 'Archivo subido',
      detail: 'La trasera del diploma se ha subido correctamente',
      life: 3000
    })
    
    // Recargar archivos adjuntos
    await cargarArchivosAdjuntos()
    
    // Cerrar diálogo
    showTraseraDialog.value = false
    selectedFile.value = null
    
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error al subir archivo',
      detail: 'No se pudo subir el archivo. Inténtalo de nuevo.',
      life: 3000
    })
    console.error('Error uploading file:', err)
  } finally {
    uploadingFile.value = false
  }
}

const cargarArchivosAdjuntos = async () => {
  try {
    const archivos = await getAllDocumentacionGrupo({
      id_grupo: parseInt(grupoId.value),
      tipo_documento: 'trasera'
    })
    archivosAdjuntos.value = archivos
  } catch (err) {
    console.error('Error loading attached files:', err)
  }
}

const eliminarArchivo = async (archivo) => {
  deletingFile.value = true
  
  try {
    await deleteDocumento(archivo.id_documento)
    
    toast.add({
      severity: 'success',
      summary: 'Archivo eliminado',
      detail: 'El archivo se ha eliminado correctamente',
      life: 3000
    })
    
    // Recargar archivos adjuntos
    await cargarArchivosAdjuntos()
    
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error al eliminar archivo',
      detail: 'No se pudo eliminar el archivo. Inténtalo de nuevo.',
      life: 3000
    })
    console.error('Error deleting file:', err)
  } finally {
    deletingFile.value = false
  }
}

const descargarArchivo = async (archivo) => {
  try {
    // Obtener URL firmada para descarga
    const response = await getSignedUrl(archivo.id_documento)
    
    // Crear enlace de descarga
    const link = document.createElement('a')
    link.href = response.signedUrl
    link.download = archivo.nombre_archivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.add({
      severity: 'success',
      summary: 'Descarga iniciada',
      detail: `Descargando ${archivo.nombre_archivo}`,
      life: 3000
    })
    
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error al descargar archivo',
      detail: 'No se pudo descargar el archivo. Inténtalo de nuevo.',
      life: 3000
    })
    console.error('Error downloading file:', err)
  }
}

onMounted(() => {
  loadData()
})
</script>
