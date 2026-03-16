<template>
    <section>
        <div class="section-header">
            <div class="section-header__main section-main">
                <h1 class="section-main__title">Acciones Formativas</h1>
            </div>
            <div class="section-header__actions">
                <Button label="Nueva Acción formativa" @click="showModal = true"/>
            </div>
        </div>
        

        <div class="table-filters">
            <div class="table-filters__group filter">
                <label for="global-search">Búsqueda global</label>
                <InputText 
                    id="global-search"
                    v-model="filters['global'].value" 
                />
            </div>
            <div class="table-filters__group filter">
                <label for="expediente-filter">Expediente</label>
                <Select 
                    id="expediente-filter"
                    v-model="filters['expediente_plan'].value"
                    :options="expedientesOptions"
                    :showClear="true"
                />
            </div>
            <div class="table-filters__group filter">
                <label for="modalidad-filter">Modalidad</label>
                <Select 
                    id="modalidad-filter"
                    v-model="filters['modalidad'].value"
                    :options="modalidadesOptions"
                    :showClear="true"
                />
            </div>
        </div>

        <div v-if="error" class="error-message">
            <p>Error al cargar las acciones formativas: {{ error }}</p>
            <Button label="Reintentar" @click="fetchAccionesFormativas" />
        </div>

        <DataTable 
            :value="accionesFormativas" 
            :paginator="accionesFormativas.length > 25"
            :rows="25"
            v-model:filters="filters"
            :globalFilterFields="['denominacion', 'numero_accion', 'modalidad', 'nivel_formacion', 'codigo_grupo_accion', 'expediente_plan']"
            dataKey="id_accion"
            :loading="loading"
            :showFilterMenu="false"
        >
            <Column field="denominacion" header="Denominación" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.denominacion }}</span>
                </template>
            </Column>

            <Column field="expediente_plan" header="Expediente Plan" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.expediente_plan }}</span>
                </template>
            </Column>
            
            <Column field="numero_accion" header="Número Acción" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.numero_accion || '-' }}</span>
                </template>
            </Column>
            
            <Column field="modalidad" header="Modalidad" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.modalidad }}</span>
                </template>
            </Column>
            
            <Column field="nivel_formacion" header="Participantes" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.participantes }}</span>
                </template>
            </Column>
            
            <Column header="" :exportable="false">
                <template #body="slotProps">
                    <div class="table-actions">
                        <!-- BTN. con opción de abrir en nueva pestaña -->
                        <a :href="`/acciones-formativas/${slotProps.data.id_accion}`">
                            <Button 
                                label="Ver" 
                                size="small" 
                                outlined
                            />
                        </a>
                        <Button 
                            label="Duplicar"
                            size="small"
                            outlined
                            @click="duplicarAccion(slotProps.data.id_accion)"
                        />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- BTN. para abrir formulario -->
        <ReusableDialog 
            v-model:visible="showModal" 
            title="Nueva acción formativa"
            :form-component="AccionFormativaForm"
            @save="handleSaveAccionFormativa"
            @cancel="handleCancelAccionFormativa"
        />
    </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores/main.js'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import AccionFormativaForm from './AccionFormativaForm.vue'
import { useAccionesFormativas } from '@/composables/useAccionesFormativas.js'
import { createAccionFormativa } from '@/services/accionesFormativasService.js'
import { getAllPlans } from '@/services/plansService.js'
import { useToast } from 'primevue/usetoast'
import axios from 'axios' 
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

const router = useRouter()
const store = useStore()
const toast = useToast()
const confirm = useConfirm()

const { accionesFormativas, loading, error, fetchAccionesFormativas } = useAccionesFormativas()

const showModal = ref(false)
const planes = ref([])

const filters = ref({
    global: { value: null, matchMode: 'contains' },
    modalidad: { value: null, matchMode: 'equals' },
    expediente_plan: { value: null, matchMode: 'equals' }
})

const modalidadesOptions = computed(() => {
    const modalidades = [...new Set(accionesFormativas.value.map(accion => accion.modalidad).filter(Boolean))]
    return modalidades
})

const expedientesOptions = computed(() => {
    const expedientes = [...new Set(planes.value.map(plan => plan.expediente).filter(Boolean))]
    return expedientes
})

const fetchPlans = async () => {
    try {
        const plansData = await getAllPlans()
        planes.value = plansData
    } catch (error) {
        console.error('Error al cargar los planes:', error)
        planes.value = []
    }
}

const applyPlanFilter = () => {
    if (store.activePlan && store.activePlan.expediente) {
        filters.value.expediente_plan.value = store.activePlan.expediente
    }
}

onMounted(async () => {
    await fetchPlans()
    applyPlanFilter()
    // Aplicar filtro inicial si hay un plan activo
    if (store.activePlan && store.activePlan.expediente) {
        fetchAccionesFormativas({ expediente_plan: store.activePlan.expediente })
    }
})

watch(() => store.activePlan, (newPlan) => {
    if (newPlan && newPlan.expediente) {
        filters.value.expediente_plan.value = newPlan.expediente
    }
}, { deep: true })

// Watcher para limpiar activePlan cuando se borra el filtro de expediente
watch(() => filters.value.expediente_plan.value, (newValue) => {
    if (!newValue && store.activePlan) {
        store.clearActivePlan()
    }
})

const handleSaveAccionFormativa = async (accionData) => {
    try {
       const newAccion = await createAccionFormativa(accionData)
        showModal.value = false 
        toast.add({
            severity: 'success',
            summary: 'Acción formativa creada',
            detail: 'La acción formativa se ha creado exitosamente',
            life: 3000
        })
        accionesFormativas.value.unshift(newAccion)
    } catch (error) {
        console.error('Error al crear la acción formativa:', error)
        
        // Mostrar mensaje de error específico si es un duplicado
        const errorMessage = error.message || 'Error al crear la acción formativa'
        const errorDetails = error.details || []
        
        toast.add({
            severity: 'error',
            summary: 'Error al crear la acción formativa',
            detail: errorDetails.length > 0 ? errorDetails.join(', ') : errorMessage,
            life: 5000
        })
    }
}

const handleCancelAccionFormativa = () => {
    showModal.value = false
}

const viewAccionFormativa = (accionId) => {
    const accion = accionesFormativas.value.find(a => a.id_accion === accionId)
    if (accion) {
        store.setActiveAccionFormativa(accion)
    }
    router.push(`/acciones-formativas/${accionId}`)
}


const duplicarAccion = async (id) => {
   confirm.require({
    message: '¿Quieres duplicar esta acción formativa?',
    header: 'Confirmar duplicado',
    icon: 'pi pi-copy',
    acceptLabel: 'Duplicar',
    rejectLabel: 'Cancelar',

    accept: async () => {
      try {
        const response = await axios.post(`/api/acciones-formativas/${id}/duplicar`)

        accionesFormativas.value.unshift(response.data)

        toast.add({
          severity: 'success',
          summary: 'Acción duplicada',
          detail: 'La acción formativa se ha duplicado correctamente',
          life: 3000
        })

      } catch (error) {
        console.error('Error duplicando acción:', error)

        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo duplicar la acción formativa',
          life: 3000
        })
      }
    }
  })
}

</script>