<template>
    <section v-if="accionFormativa">
        <div class="section-header">
            <div class="section-header__main section-main">
                <h1 class="section-main__title">{{ accionFormativa.numero_accion }} - {{ accionFormativa.denominacion }}</h1>
                <div class="section-main__tags">
                    <Tag :value="accionFormativa.modalidad" :severity="getModalidadColor(accionFormativa.modalidad)" />
                </div>
            </div>
        </div>
        
        <ReusableArticle 
            title="Datos de la acción formativa" 
            :list-data="transformAccionFormativaData()"
        >
            <!-- BTN. para abrir formulario -->
            <template #header-action>
                <Button label="Editar" @click="showEditModal = true" />
            </template>
        </ReusableArticle>
        
        <ReusableArticle 
            title="Listado de grupos de la acción formativa"
        >            
            <template #table>
            <div v-if="gruposLoading" class="loading-message">
                Cargando grupos...
            </div>
            <div v-else-if="gruposError" class="error-message">
                <p>Error al cargar los grupos: {{ gruposError }}</p>
                <Button label="Reintentar" @click="loadGrupos" />
            </div>
            <div v-else-if="grupos.length === 0" class="empty-state">
                No hay grupos asociados a esta acción formativa
            </div>
            <div v-else>
                <DataTable 
                    :value="grupos" 
                    :paginator="grupos.length > 25"
                    :rows="25"
                    dataKey="id_grupo"
                    :loading="gruposLoading"
                >
                    <Column field="denominacion" header="Denominación">
                        <template #body="slotProps">
                            <span>{{ slotProps.data.denominacion || '-' }}</span>
                        </template>
                    </Column>
                    
                    <Column field="codigo" header="Código">
                        <template #body="slotProps">
                            <span>{{ slotProps.data.codigo || '-' }}</span>
                        </template>
                    </Column>
                    
                    <Column field="fecha_inicio" header="Fecha Inicio">
                        <template #body="slotProps">
                            <span>{{ formatDateToDDMMYYYY(slotProps.data.fecha_inicio) }}</span>
                        </template>
                    </Column>
                    
                    <Column field="fecha_fin" header="Fecha Fin">
                        <template #body="slotProps">
                            <span>{{ formatDateToDDMMYYYY(slotProps.data.fecha_fin) }}</span>
                        </template>
                    </Column>
                    
                    <Column field="estado" header="Estado">
                        <template #body="slotProps">
                            <Tag 
                                :value="slotProps.data.estado || '-'" 
                                :severity="getGrupoStatusColor(slotProps.data.estado)"
                            />
                        </template>
                    </Column>
                    
                    <Column field="centro_nombre" header="Centro">
                        <template #body="slotProps">
                            <span>{{ slotProps.data.centro_nombre || '-' }}</span>
                        </template>
                    </Column>
                    
                    <Column field="responsable" header="Responsable">
                        <template #body="slotProps">
                            <span>{{ getUsuarioNombre(slotProps.data.responsable, authStore) || '-' }}</span>
                        </template>
                    </Column>
                    
                    <Column header="" :exportable="false">
                        <template #body="slotProps">
                            <div class="table-actions">
                                <Button 
                                    label="Ver" 
                                    size="small" 
                                    outlined 
                                    @click="viewGrupo(slotProps.data.id_grupo)"
                                />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
            </template>
        </ReusableArticle>

        <DocumentacionGeneradaAccionSection :accion-id="accionFormativa.id_accion" />

        <!-- BTN. para abrir formulario -->
        <ReusableDialog 
            v-model:visible="showEditModal" 
            title="Editar acción formativa"
            :form-component="AccionFormativaForm"
            :form-data="accionFormativa"
            @save="handleUpdateAccionFormativa"
            @cancel="handleCancelEdit"
        />
    </section>
    <div v-else-if="loading">
        <p>Cargando acción formativa...</p>
    </div>
    <div v-else>
        <p>Acción formativa no encontrada</p>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/stores/main.js'
import { getAccionFormativaById, updateAccionFormativa } from '@/services/accionesFormativasService.js'
import { getAllGrupos } from '@/services/gruposService.js'
import { getAllAreasProfesionales } from '@/services/areaProfesionalService.js'
import { getAllDesgloseAreasProfesionales } from '@/services/desgloseAreasProfesionalesService.js'
import Tag from 'primevue/tag'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import AccionFormativaForm from './AccionFormativaForm.vue'
import DocumentacionGeneradaAccionSection from './DocumentacionGeneradaAccionSection.vue'
import { grupoEstadoMixin } from '@/utils/mixins.js'
import { formatDateToDDMMYYYY, getUsuarioNombre } from '@/utils/functions.js'
import { useToast } from 'primevue/usetoast'
import { MODALIDAD_SESIONES } from '@/utils/enums.js'
import { useAuthStore } from '@/stores/auth.js'
const route = useRoute()
const router = useRouter()
const store = useStore()
const toast = useToast()
const authStore = useAuthStore()
const accionFormativa = ref(null)
const loading = ref(false)
const error = ref(null)
const showEditModal = ref(false)

const grupos = ref([])
const gruposLoading = ref(false)
const gruposError = ref(null)

const areasProfesionales = ref([])
const desglosesAreas = ref([])

const transformAccionFormativaData = () => {
    const areaProfesional = areasProfesionales.value.find(area => area.id_area === accionFormativa.value.id_area)
    const areaText = areaProfesional 
        ? `${areaProfesional.abreviatura} - ${areaProfesional.nombre}` 
        : (accionFormativa.value.id_area ? `ID: ${accionFormativa.value.id_area}` : '-')

    const desglose = desglosesAreas.value.find(des => des.id_desglose === accionFormativa.value.id_desglose)
    const desgloseText = desglose 
        ? `${desglose.codigo_grupo} - ${desglose.desglose}` 
        : (accionFormativa.value.id_desglose ? `ID: ${accionFormativa.value.id_desglose}` : '-')

    return {
        'Denominación': accionFormativa.value.denominacion,
        'Número de acción': accionFormativa.value.numero_accion || '-',
        'Modalidad': accionFormativa.value.modalidad,
        'Nivel de formación': accionFormativa.value.nivel_formacion || '-',
        'Plan asociado': accionFormativa.value.plan?.nombre || 'No asociado',
        'Área profesional': areaText,
        'Desglose': desgloseText,
		'Seguridad privada': accionFormativa.value.es_seguridad_privada ? 'Sí' : 'No',
        'Horas presenciales': accionFormativa.value.horas_modalidad_presencial || 0,
        'Horas teleformación': accionFormativa.value.horas_modalidad_teleformacion || 0,
        'Total participantes': accionFormativa.value.participantes || 0,
        'CIF plataforma': accionFormativa.value.cif_plataforma || '-',
        'Razón social plataforma': accionFormativa.value.razon_social_plataforma || '-',
        'Horas totales diploma (manual)': accionFormativa.value.horas_totales_diploma || 0,
        'Desglose horas diploma (manual)': accionFormativa.value.desglose_horas_diploma || '-',
        'Modalidad diploma (manual)': accionFormativa.value.modalidad_diploma || '-',
        'URI': accionFormativa.value.uri || '-',
        'Usuario': accionFormativa.value.usuario || '-',
        'Objetivos': accionFormativa.value.objetivos || 'No especificados',
        'Contenido': accionFormativa.value.contenido || '-',
        'Observaciones': accionFormativa.value.observaciones || 'No especificadas'
    }
}


const loadAccionFormativa = async (accionId) => {
    loading.value = true
    error.value = null
    
    try {
        const accionData = await getAccionFormativaById(accionId)
        accionFormativa.value = accionData
        store.setActiveAccionFormativa(accionData)
        await loadGrupos(accionId)
    } catch (err) {
        error.value = 'Error al cargar la acción formativa'
        console.error('Error loading accion formativa:', err)
    } finally {
        loading.value = false
    }
}

const loadGrupos = async (accionId) => {
    if (!accionId) return
    
    gruposLoading.value = true
    gruposError.value = null
    
    try {
        const gruposData = await getAllGrupos({ id_accion: accionId })
        grupos.value = gruposData
    } catch (err) {
        gruposError.value = 'Error al cargar los grupos'
        console.error('Error loading grupos:', err)
    } finally {
        gruposLoading.value = false
    }
}

const loadAreasProfesionales = async () => {
    try {
        const areasData = await getAllAreasProfesionales()
        areasProfesionales.value = areasData
    } catch (error) {
        console.error('Error al cargar las áreas profesionales:', error)
        areasProfesionales.value = []
    }
}

const loadDesglosesAreas = async () => {
    try {
        const desglosesData = await getAllDesgloseAreasProfesionales()
        desglosesAreas.value = desglosesData
    } catch (error) {
        console.error('Error al cargar los desgloses de áreas:', error)
        desglosesAreas.value = []
    }
}

const handleUpdateAccionFormativa = async (accionData) => {
    try {
        const updatedAccion = await updateAccionFormativa(accionFormativa.value.id_accion, accionData)
        
        accionFormativa.value = updatedAccion
        store.setActiveAccionFormativa(updatedAccion)
        showEditModal.value = false
        
        toast.add({
            severity: 'success',
            summary: 'Acción formativa actualizada',
            detail: 'La acción formativa se ha actualizado exitosamente',
            life: 3000
        })
    } catch (error) {
        console.error('Error al actualizar la acción formativa:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al actualizar la acción formativa',
            detail: 'Error al actualizar la acción formativa',
            life: 3000
        })
    }
}

const handleCancelEdit = () => {
    showEditModal.value = false
}

const getModalidadColor = (modalidad) => {
    const colors = {
        [MODALIDAD_SESIONES.TELEFORMACION]: 'info',
        [MODALIDAD_SESIONES.PRESENCIAL]: 'success',
        [MODALIDAD_SESIONES.MIXTA]: 'warning'
    }
    return colors[modalidad] || 'secondary'
}

const viewGrupo = (grupoId) => {
    router.push(`/grupos/${grupoId}`)
}

const { getGrupoStatusColor } = grupoEstadoMixin.methods

onMounted(async () => {
    const accionId = route.params.id
    
    await Promise.all([
        loadAreasProfesionales(),
        loadDesglosesAreas()
    ])
    
    if (store.activeAccionFormativa && store.activeAccionFormativa.id_accion == accionId) {
        accionFormativa.value = store.activeAccionFormativa
        await loadGrupos(accionId)
    } else {
        await loadAccionFormativa(accionId)
    }
})
</script>
