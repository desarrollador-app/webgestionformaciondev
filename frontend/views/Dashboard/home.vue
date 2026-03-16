<template>
  <div class="dashboard-container">
    <section class="dashboard-container__section dashboard-section dashboard-section--tareas">
      <h2 class="dashboard-section__title">Tareas pendientes</h2>
      <div v-if="tareasLoading" class="loading-message">
        Cargando tareas...
      </div>
      <div v-else-if="tareasPendientes.length === 0" class="empty-state">
        No hay tareas pendientes actualmente
      </div>
      <div v-else class="tareas-grid">
        <DashboardCard
          v-for="tarea in tareasPendientes"
          :key="tarea.id_tarea"
          :title="tarea.nombre_tarea || 'Sin nombre'"
          :subtitle="getGrupoInfo(tarea)"
          :description="getPlanInfo(tarea)"
        >
          <template #content>
            <div v-if="tarea.observaciones">
              <Divider />
              <p>{{ tarea.observaciones }}</p>
            </div>
          </template>
          <template #actions>
            <div class="tarea-actions">
              <Button 
                label="Ir al grupo"
                size="small"
                outlined
                @click="viewGrupoFromTarea(tarea)" 
              />
              <Button 
                label="Editar" 
                size="small" 
                outlined
                @click="editTarea(tarea)"
              />
              <Button 
                v-if="tarea.estado === 'Pendiente'"
                label="Completar" 
                size="small" 
                @click="handleCompleteTarea(tarea)"
              />
            </div>
          </template>
        </DashboardCard>
      </div>
    </section>
    <section class="dashboard-container__section dashboard-section dashboard-section--grupos">
      <h2 class="dashboard-section__title">Grupos en ejecución</h2>
      <div v-if="loading" class="loading-message">
        Cargando grupos...
      </div>
      <div v-else-if="gruposActivos.length === 0" class="empty-state">
        No hay grupos en ejecución actualmente
      </div>
      <div v-else class="grupos-grid">
        <DashboardCard
          v-for="grupo in gruposActivos"
          :key="grupo.id_grupo"
          :title="grupo.codigo ? `${grupo.codigo} - ${grupo.denominacion}` : grupo.denominacion || 'Sin denominación'"
          :description="`Plan ${grupo.accionFormativa?.plan?.expediente || 'Sin expediente'}`"
        >
          <template #content>
            <Tag :value="grupo.accionFormativa?.modalidad || 'Sin modalidad'" severity="secondary" />
            
            <!-- Añadimos la fecha, con el formato adecuado -->
            <div class="flex items-center gap-2 mb-1">
                <i class="pi pi-calendar"></i>
                <span><strong>Inicio:</strong> {{ grupo.fecha_inicio ? grupo.fecha_inicio.split('T')[0] : 'Sin definir' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-flag"></i>
                <span><strong>Fin:</strong> {{ grupo.fecha_fin ? grupo.fecha_fin.split('T')[0] : 'Sin definir' }}</span>
              </div>
          </template>
          <!-- BTN. con opción de abrir en nueva pestaña -->                     
          <template #actions>
            <a :href="`/grupos/${grupo.id_grupo}`">
              <Button label="Ver grupo" size="small" />
            </a>
          </template>
        </DashboardCard>
      </div>
    </section>

    <ReusableDialog 
            v-model:visible="showEditDialog" 
            title="Editar tarea"
            :form-component="TareaForm"
            :form-data="tareaToEdit"
            @save="handleUpdateTarea"
            @cancel="handleCancelEdit"
        />

    <ReusableDialog 
            v-model:visible="showCompleteDialog" 
            title="Completar tarea"
            :form-component="CompleteTareaForm"
            :form-data="tareaToComplete"
            @save="handleCompleteTareaSave"
            @cancel="handleCancelComplete"
        />
  </div>
</template>

<script setup>
import { useGrupos } from '@/composables/useGrupos.js'
import { useTareas } from '@/composables/useTareas.js'
import DashboardCard from '@/components/Cards/DashboardCard.vue'
import Button from 'primevue/button'
import TareaForm from '@/views/Tareas/TareaForm.vue'
import Tag from 'primevue/tag'
import CompleteTareaForm from '@/views/Tareas/CompleteTareaForm.vue'
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useToast } from 'primevue/usetoast'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import Divider from 'primevue/divider'

const { gruposActivos, loading, error } = useGrupos();
const { tareas, loading: tareasLoading, error: tareasError, completeTarea, updateTareaData } = useTareas();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

// Variables para el diálogo de edición
const showEditDialog = ref(false)
const tareaToEdit = ref(null)
const formData = ref({})

// Variables para el diálogo de completar tarea
const showCompleteDialog = ref(false)
const tareaToComplete = ref(null)
const completeFormData = ref({})
const tareasPendientes = computed(() => {
  if (!authStore.user?.id) return []
  return tareas.value.filter(tarea => tarea.estado === 'Pendiente' && tarea.responsable_azure_id === authStore.user.id)
})

const getGrupoInfo = (tarea) => {
  if (!tarea.grupo) return 'Sin responsable'
  
  const { codigo, denominacion } = tarea.grupo
  if (codigo && denominacion) {
    return `${codigo} - ${denominacion}`
  } else if (codigo) {
    return codigo
  } else if (denominacion) {
    return denominacion
  } else {
    return 'Sin información del grupo'
  }
}

const getPlanInfo = (tarea) => {
  if (!tarea.grupo?.accionFormativa?.plan) return 'Sin plan'
  
  const { expediente } = tarea.grupo.accionFormativa.plan
  return `Plan ${expediente}`
}

const viewGrupo = (grupoId) => {
  router.push(`/grupos/${grupoId}`);
}

const viewTarea = (tareaId) => {
  router.push(`/tareas/${tareaId}`);
}

const viewGrupoFromTarea = (tarea) => {
  router.push(`/grupos/${tarea.id_grupo}`);
}

const editTarea = (tarea) => {
  tareaToEdit.value = tarea
  formData.value = { ...tarea }
  showEditDialog.value = true
}

const handleUpdateTarea = async (tareaData) => {
    try {
      await updateTareaData(tareaToEdit.value.id_tarea, tareaData)
      tareaToEdit.value = null
      showEditDialog.value = false
      
      toast.add({
        severity: 'success',
        summary: 'Tarea actualizada',
        detail: 'La tarea se ha actualizado exitosamente',
        life: 3000
      })
    } catch (error) {
      console.error('Error al actualizar la tarea:', error)
      toast.add({
        severity: 'error',
        summary: 'Error al actualizar',
        detail: 'No se pudo actualizar la tarea',
        life: 3000
      })
    }

}

const handleCancelEdit = () => {
  showEditDialog.value = false
  tareaToEdit.value = null
  formData.value = {}
}

const handleCompleteTarea = (tarea) => {
  tareaToComplete.value = tarea
  completeFormData.value = { ...tarea }
  showCompleteDialog.value = true
}

const handleCompleteTareaSave = async (tareaData) => {
  try {
    await updateTareaData(tareaToComplete.value.id_tarea, tareaData)
    tareaToComplete.value = null
    showCompleteDialog.value = false

    toast.add({
      severity: 'success',
      summary: 'Tarea completada',
      detail: 'La tarea se ha completado exitosamente',
      life: 3000
    })
  } catch (error) {
    console.error('Error al completar la tarea:', error)
    toast.add({
      severity: 'error',
      summary: 'Error al completar',
      detail: 'No se pudo completar la tarea',
      life: 3000
    })
  }
}

const handleCancelComplete = () => {
  showCompleteDialog.value = false
  tareaToComplete.value = null
  completeFormData.value = {}
}
</script>

<style scoped lang="scss">
@use './home.scss';

.tarea-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>