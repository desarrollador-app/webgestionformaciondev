<template>
    <section v-if="plan">
        <div class="section-header">
            <div class="section-header__main section-main">
                <h1 class="section-main__title">{{ plan.nombre }}</h1>
                <div class="section-main__tags">
                    <Tag :value="plan.estado" :severity="getPlanStatusColor(plan.estado)" />
                </div>
            </div>
        </div>
        <ReusableArticle 
            title="Datos del plan" 
            :list-data="transformPlanData()"
        >
            <template #header-action>
                <Button label="Editar" @click="showEditModal = true" />
            </template>
        </ReusableArticle>
        <ReusableArticle 
            title="Listado de acciones formativas del plan"
        >
            <template #header-action>
                <Button label="Crear acción" @click="showAccionModal = true" />
            </template>
            <template #table>
                <DataTable :value="accionesFormativas">
                    <Column field="denominacion" header="Denominación"></Column>
                    <Column field="numero_accion" header="Número Acción"></Column>
                    <Column field="modalidad" header="Modalidad"></Column>
                    <Column field="nivel_formacion" header="Participantes"></Column>
                    <Column header="">
                        <template #body="slotProps">
                        <!-- BTN. con opción de abrir en nueva pestaña -->
                            <a :href="`/acciones-formativas/${slotProps.data.id_accion}`">
                                <Button 
                                    label="Ver"
                                    outlined
                                />
                            </a>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </ReusableArticle>
        <ReusableArticle 
            title="Listado de grupos del plan"
        >
            <template #header-action>
                <Button 
                    label="Crear grupo" 
                    :disabled="!hasAccionesFormativas"
                    @click="showGrupoModal = true" 
                />
            </template>
            <template #table>
                <DataTable :value="grupos">
                    <Column field="denominacion" header="Denominación"></Column>
                    <Column field="codigo" header="Código"></Column>
                    <Column field="estado" header="Estado"></Column>
                    <Column field="fecha_inicio" header="Fecha Inicio">
                        <template #body="slotProps">
                            {{ slotProps.data.fecha_inicio ? new Date(slotProps.data.fecha_inicio).toLocaleDateString() : '-' }}
                        </template>
                    </Column>
                    <Column field="fecha_fin" header="Fecha Fin">
                        <template #body="slotProps">
                            {{ slotProps.data.fecha_fin ? new Date(slotProps.data.fecha_fin).toLocaleDateString() : '-' }}
                        </template>
                    </Column>
                    <Column field="accionFormativa.denominacion" header="Acción Formativa"></Column>
                    <Column header="">
                        <template #body="slotProps">
                            <div class="table-actions">
                                <!-- BTN. con opción de abrir en nueva pestaña -->
                                <a :href="`/grupos/${slotProps.data.id_grupo}`">
                                    <Button 
                                        label="Ver"
                                        outlined
                                    />
                                </a>
                                <!-- BTN. que abre dialogo de confirmación -->
                                <Button 
                                    label="Eliminar"
                                    outlined
                                    @click="deleteGrupoHandler(slotProps.data.id_grupo)"
                                />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </ReusableArticle>

        <ReusableDialog 
            v-model:visible="showEditModal" 
            title="Editar plan"
            :form-component="PlanForm"
            :form-data="plan"
            @save="handleUpdatePlan"
            @cancel="handleCancelEdit"
        />
        
        
        <ReusableDialog 
            v-model:visible="showAccionModal" 
            title="Nueva acción formativa"
            :form-component="AccionFormativaForm"
            @save="handleSaveAccionFormativa"
            @cancel="handleCancelAccionFormativa"
        />

        <ReusableDialog 
            v-model:visible="showGrupoModal" 
            title="Nuevo grupo"
            :form-component="GruposForm"
            :form-props="{ isEditingMode: 'general' }"
            @save="handleSaveGrupo"
            @cancel="handleCancelGrupo"
        />
    </section>
    <div v-else-if="loading">
        <p>Cargando plan...</p>
    </div>
    <div v-else>
        <p>Plan no encontrado</p>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/stores/main.js'
import { getPlanById, updatePlan } from '@/services/plansService.js'
import { planEstadoMixin } from '@/utils/mixins.js'
import { formatDateToDDMMYYYY, getUsuarioNombre } from '@/utils/functions.js'
import { useAuthStore } from '@/stores/auth.js'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import PlanForm from './PlanForm.vue'
import AccionFormativaForm from '@/views/AccionesFormativas/AccionFormativaForm.vue'
import GruposForm from '@/views/Grupos/GruposForm.vue'
import { getAllAccionesFormativas, createAccionFormativa } from '@/services/accionesFormativasService.js'
import { getAllGrupos, createGrupo, deleteGrupo } from '@/services/gruposService.js'
import { createDefaultGrupoTareas } from '@/services/tareasService.js'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const store = useStore()
const toast = useToast()
const authStore = useAuthStore()
const plan = ref(null)
const loading = ref(false)
const error = ref(null)
const showEditModal = ref(false)
const showAccionModal = ref(false)
const showGrupoModal = ref(false)
const accionesFormativas = ref([])
const grupos = ref([])

const loadPlan = async (planId) => {
    loading.value = true
    error.value = null
    
    try {
        const planData = await getPlanById(planId)
        plan.value = planData
        store.setActivePlan(planData)
    } catch (err) {
        error.value = 'Error al cargar el plan'
        console.error('Error loading plan:', err)
    } finally {
        loading.value = false
    }
}

const transformPlanData = () => {
    return {
        nombre: plan.value.nombre,
        solicitante: plan.value.solicitante,
        expediente: plan.value.expediente,
        estado: plan.value.estado,
        fecha_convocatoria_plan: plan.value.fecha_convocatoria_plan,
        responsable: getUsuarioNombre(plan.value.responsable, authStore),
        tipo_bonificacion: plan.value.tipo_bonificacion,
        fecha_inicio: formatDateToDDMMYYYY(plan.value.fecha_inicio, '-'),
        fecha_fin: formatDateToDDMMYYYY(plan.value.fecha_fin, '-'),
    }
}

const handleUpdatePlan = async (planData) => {
    try {
        const updatedPlan = await updatePlan(plan.value.id_plan, planData)
        plan.value = updatedPlan
        store.setActivePlan(updatedPlan)
        showEditModal.value = false
        
        toast.add({
            severity: 'success',
            summary: 'Plan actualizado',
            detail: 'El plan se ha actualizado exitosamente',
            life: 3000
        })
    } catch (error) {
        console.error('Error al actualizar el plan:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al actualizar',
            detail: 'No se pudo actualizar el plan',
            life: 3000
        })
    }
}

const handleCancelEdit = () => {
    showEditModal.value = false
}

const handleSaveAccionFormativa = async (accionData) => {
    try {
        // Asegurar que el id_plan se establezca correctamente
        const accionDataWithPlan = {
            ...accionData,
            id_plan: plan.value.id_plan
        }
        const newAccion = await createAccionFormativa(accionDataWithPlan)
        showAccionModal.value = false
        await loadAccionesFormativasFromPlan()
        
        
        toast.add({
            severity: 'success',
            summary: 'Acción formativa creada',
            detail: 'La acción formativa se ha creado exitosamente',
            life: 3000
        })
    } catch (error) {
        console.error('Error al crear la acción formativa:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al crear la acción formativa',
            detail: 'Error al crear la acción formativa',
            life: 3000
        })
    }
}

const handleCancelAccionFormativa = () => {
    showAccionModal.value = false
}

const handleSaveGrupo = async (grupoData) => {
    try {
        const newGrupo = await createGrupo(grupoData)
        
        await createDefaultGrupoTareas(newGrupo.id_grupo)
        showGrupoModal.value = false
        await loadGruposFromPlan()
                
        toast.add({
            severity: 'success',
            summary: 'Grupo creado',
            detail: 'El grupo se ha creado exitosamente',
            life: 3000
        })
    } catch (error) {
        console.error('Error al crear el grupo:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al crear el grupo',
            detail: 'Error al crear el grupo',
            life: 3000
        })
    }
}

const handleCancelGrupo = () => {
    showGrupoModal.value = false
}

const loadAccionesFormativasFromPlan = async () => {
    try {
        const accionesData = await getAllAccionesFormativas({ expediente_plan: plan.value.expediente })
        accionesFormativas.value = accionesData
    } catch (error) {
        console.error('Error al cargar las acciones formativas:', error)
        accionesFormativas.value = []
    }
}

const loadGruposFromPlan = async () => {
    try {
        const gruposDelPlan = await getAllGrupos({ expediente_plan: plan.value.expediente })
        grupos.value = gruposDelPlan
    } catch (error) {
        console.error('Error al cargar los grupos:', error)
        grupos.value = []
    }
}

const viewAccionFormativa = (accionId) => {
    const accion = accionesFormativas.value.find(a => a.id_accion === accionId)
    if (accion) {
        store.setActiveAccionFormativa(accion)
    }
    router.push(`/acciones-formativas/${accionId}`)
}

const viewGrupo = (grupoId) => {
    const grupo = grupos.value.find(g => g.id_grupo === grupoId)
    if (grupo) {
        store.setActiveGrupo(grupo)
    }
    router.push(`/grupos/${grupoId}`)
}

const deleteGrupoHandler = async (grupoId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
        try {
            await deleteGrupo(grupoId)
            await loadGruposFromPlan()
            
            toast.add({
                severity: 'success',
                summary: 'Grupo eliminado',
                detail: 'El grupo se ha eliminado exitosamente',
                life: 3000
            })
        } catch (error) {
            console.error('Error al eliminar el grupo:', error)
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el grupo',
                life: 3000
            })
        }
    }
}

onMounted(async () => {
    const planId = route.params.id
        if (store.activePlan && store.activePlan.id_plan == planId) {
        plan.value = store.activePlan
    } else {
        await loadPlan(planId)
    }
    await loadAccionesFormativasFromPlan()
    await loadGruposFromPlan()
})

const { getPlanStatusColor } = planEstadoMixin.methods

// Computed property para verificar si hay acciones formativas
const hasAccionesFormativas = computed(() => {
    return accionesFormativas.value && accionesFormativas.value.length > 0
})

</script>
