<template>
  <section v-if="grupo">
    <div class="section-header">
      <div class="section-header__main section-main">
        <h1 class="section-main__title">Correo de Bienvenida</h1>
        <p class="section-main__subtitle">{{ grupo.denominacion }}</p>
      </div>
    </div>

    <ReusableArticle title="Alumnos">
      <template #header-action>
        <Button 
          label="Mandar email masivo" 
          @click="sendBulkWelcomeEmails"
          :disabled="loading || alumnos.length === 0"
          severity="primary"
        />
      </template>
      
      <template #table>
        <div v-if="loading" class="loading-message">
          <i class="pi pi-spin pi-spinner"></i>
          Cargando alumnos...
        </div>

        <div v-else-if="error" class="error-message">
          <p>Error al cargar los datos: {{ error }}</p>
          <Button label="Reintentar" @click="loadData" />
        </div>

        <div v-else-if="alumnos.length === 0" class="empty-state">
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
                  :value="slotProps.data.bienvenida.enviado ? 'Sí' : 'No'"
                  :severity="slotProps.data.bienvenida.enviado ? 'success' : 'danger'"
                />
              </template>
            </Column>

            <Column header="Fecha de envío" sortable>
              <template #body="slotProps">
                <span v-if="slotProps.data.bienvenida.fecha_envio">
                  {{ formatDateToDDMMYYYY(slotProps.data.bienvenida.fecha_envio) }}
                </span>
                <span v-else>-</span>
              </template>
            </Column>

            <Column header="" :exportable="false">
              <template #body="slotProps">
                <div class="table-actions">
                  <Button 
                    label="Enviar mail" 
                    size="small"
                    outlined
                    @click="sendWelcomeEmail(slotProps.data)"
                    :disabled="sendingEmails[slotProps.data.id_persona]"
                    :loading="sendingEmails[slotProps.data.id_persona]"
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
    :message="`¿Estás seguro de enviar emails de bienvenida a ${alumnos.filter(alumno => !alumno.bienvenida.enviado && alumno.email).length} alumnos?`"
    details="Se enviarán emails a todos los alumnos que aún no han recibido el email de bienvenida."
    save-label="Enviar emails"
    cancel-label="Cancelar"
    @save="confirmBulkWelcomeEmails"
    @cancel="showBulkEmailDialog = false"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { emailService } from '@/services/emailService.js'
import { getGrupoById } from '@/services/gruposService.js'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import { useToast } from 'primevue/usetoast'
import { formatDateToDDMMYYYY } from '@/utils/functions.js'

const route = useRoute()
const toast = useToast()

// Estado reactivo
const grupo = ref(null)
const alumnos = ref([])
const loading = ref(false)
const error = ref(null)
const sendingEmails = ref({})
const showBulkEmailDialog = ref(false)

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
    
    // Cargar alumnos con estado de emails
    const response = await emailService.getGroupStudentsWithEmailStatus(grupoId.value)
    alumnos.value = response.alumnos
  } catch (err) {
    error.value = 'Error al cargar los datos'
    console.error('Error loading data:', err)
  } finally {
    loading.value = false
  }
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

const sendWelcomeEmail = async (alumno) => {
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
    await emailService.sendWelcomeEmail({
      idGrupo: parseInt(grupoId.value),
      idPersona: alumno.id_persona,
      email: alumno.email,
      nombre: alumno.nombre
    })

    toast.add({
      severity: 'success',
      summary: 'Email enviado',
      detail: `Email de bienvenida enviado correctamente a ${alumno.nombre}`,
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

const sendBulkWelcomeEmails = async () => {
  const alumnosSinEmail = alumnos.value.filter(alumno => 
    !alumno.bienvenida.enviado && alumno.email
  )

  if (alumnosSinEmail.length === 0) {
    toast.add({
      severity: 'info',
      summary: 'No hay emails pendientes',
      detail: 'Todos los alumnos ya han recibido el email de bienvenida',
      life: 3000
    })
    return
  }

  showBulkEmailDialog.value = true
}

const confirmBulkWelcomeEmails = async () => {
  const alumnosSinEmail = alumnos.value.filter(alumno => 
    !alumno.bienvenida.enviado && alumno.email
  )
  
  const alumnosSinEmailConfigurado = alumnos.value.filter(alumno => 
    !alumno.bienvenida.enviado && !alumno.email
  )

  let successCount = 0
  let errorCount = 0

  const erroresPorTipo = new Map() // Agrupar errores por tipo

  for (const alumno of alumnosSinEmail) {
    try {
      await emailService.sendWelcomeEmail({
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

onMounted(() => {
  loadData()
})
</script>
