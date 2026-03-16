<template>
    <section v-if="grupo">
        <div class="section-header">
            <div class="section-header__main section-main">
                <h1 class="section-main__title">{{ grupo.codigo }} - {{ grupo.denominacion }}</h1>
                <div class="section-main__tags">
                    <Tag v-if="grupo.estado" :value="grupo.estado" :severity="getGrupoStatusColor(grupo.estado)" />
                    <Tag v-if="grupo.accionFormativa?.modalidad" :value="grupo.accionFormativa?.modalidad" :severity="getModalidadColor(grupo.accionFormativa?.modalidad)" />
                </div> 
            </div>
        </div>
        
        <ReusableArticle 
            title="Datos del grupo" 
            :list-data="transformGrupoData()"
        >
            <template #header-action>
                <Button label="Editar" @click="openEditGrupoModal('general')" />
            </template>
        </ReusableArticle>

        <ReusableArticle 
            v-if="grupo.accionFormativa?.modalidad === MODALIDAD_SESIONES.PRESENCIAL || grupo.accionFormativa?.modalidad === MODALIDAD_SESIONES.MIXTA"
            title="Formación presencial" 
        >
            <template #header-action>
                <Button label="Editar impartición" @click="openEditGrupoModal('presencial')" />
            </template>
            <template #misc>
                <h4 class="section-content__title">Datos del centro</h4>
                <ul class="section-content__list">
                    <li v-for="(value, key) in formacionPresencialDataCentro" :key="key">
                        <span class="label">{{ formatLabel(key) }}:</span> <span>{{ value }}</span>
                    </li>
                </ul>
                <h4 class="section-content__title">Datos del lugar de impartición</h4>
                <ul class="section-content__list">
                    <li v-for="(value, key) in formacionPresencialDataImparticion" :key="key">
                        <span class="label">{{ formatLabel(key) }}:</span> <span>{{ value }}</span>
                    </li>
                </ul>
                <h4 v-if="grupo.aula_virtual" class="section-content__title">Aula virtual</h4>
                <ul v-if="grupo.aula_virtual" class="section-content__list">
                    <li v-for="(value, key) in formacionPresencialDataAulaVirtual" :key="key">
                        <span class="label">{{ formatLabel(key) }}:</span> <span>{{ value }}</span>
                    </li>
                </ul>
                <Divider />
                <GrupoDocentesSection :grupo-id="grupo.id_grupo" modalidad="Presencial" />
                <Divider />
                <div class="section-content__header content-header">
                    <h2 class="content-header__title">Sesiones</h2>
                    <Button label="Ver y editar sesiones" @click="navigateToSesiones('Presencial')" />
                </div>
                <ul class="section-content__list">
                    <li v-for="(value, key) in formacionPresencialDataSesiones" :key="key">
                        <span class="label">{{ formatLabel(key) }}:</span> <span>{{ value }}</span>
                    </li>
                    <!-- Añadimos la sección de tutor para mostrar el nombre -->
                    <li>
                        <span class="label">Tutor/es:</span> <span>{{ tutoresDelGrupo }}</span>
                    </li>
                </ul>
                <div class="mini-datepicker-container" v-if="mesesConSesionesPresencial.length > 0">
                    <div 
                        v-for="(mesInfo) in mesesConSesionesPresencial"
                        :key="`presencial-${mesInfo.year}-${mesInfo.month}`"
                        class="mini-datepicker-wrapper"
                    >
                        <DatePicker
                            v-model="selectedDatesPresencial" 
                            :viewDate="new Date(Date.UTC(mesInfo.year, mesInfo.month, 1))"
                            :minDate="new Date(Date.UTC(mesInfo.year, mesInfo.month, 1))"
                            :maxDate="new Date(Date.UTC(mesInfo.year, mesInfo.month + 1, 0))"
                            inline 
                            disabled
                            :dateFormat="'dd/mm/yy'"
                            selectionMode="multiple"
                            >
                            <template #date="slotProps">
                                <div 
                                    :class="{ 
                                        'has-sessions': isDateWithSessions(slotProps.date)
                                    }"
                                    :data-date="formatDateForComparison(slotProps.date)"
                                    class="date-cell"
                                >
                                    <span class="date-number">{{ slotProps.date.day }}</span>
                                </div>
                            </template>
                        </DatePicker>
                    </div>
                </div>
            </template>
        </ReusableArticle>

        <ReusableArticle 
            v-if="grupo.accionFormativa?.modalidad === MODALIDAD_SESIONES.TELEFORMACION || grupo.accionFormativa?.modalidad === MODALIDAD_SESIONES.MIXTA"
            title="Formación teleformación" 
            :list-data="formacionTeleformacionData"
        >
            <template #header-action>
                <Button label="Editar impartición" @click="openEditGrupoModal('teleformacion')" />
            </template>
            <template #misc>
                <h4 class="section-content__title">Datos del centro</h4>
                <ul class="section-content__list">
                    <li v-for="(value, key) in formacionTeleformacionDataCentro" :key="key">
                        <span class="label">{{ formatLabel(key) }}:</span> <span>{{ value }}</span>
                    </li>
                </ul>
                <Divider />
                <GrupoDocentesSection :grupo-id="grupo.id_grupo" modalidad="Teleformacion" />
                <Divider />
                <div class="section-content__header content-header">
                    <h2 class="content-header__title">Sesiones</h2>
                    <Button label="Ver y editar sesiones" @click="navigateToSesiones('Teleformacion')" />
                </div>
                <ul class="section-content__list">
                    <li v-for="(value, key) in formacionTeleformacionDataSesiones" :key="key">
                        <span class="label">{{ formatLabel(key) }}:</span> <span>{{ value }}</span>
                    </li>
                </ul>
                <div class="mini-datepicker-container" v-if="mesesConSesionesTeleformacion.length > 0">
                    <div 
                        v-for="(mesInfo) in mesesConSesionesTeleformacion"
                        :key="`teleformacion-${mesInfo.year}-${mesInfo.month}`"
                        class="mini-datepicker-wrapper"
                    >
                        <DatePicker
                            :modelValue="getSelectedDatesTeleformacion(mesInfo.year, mesInfo.month)" 
                            :viewDate="new Date(Date.UTC(mesInfo.year, mesInfo.month, 1))"
                            :minDate="new Date(Date.UTC(mesInfo.year, mesInfo.month, 1))"
                            :maxDate="new Date(Date.UTC(mesInfo.year, mesInfo.month + 1, 0))"
                            inline 
                            disabled
                            :dateFormat="'dd/mm/yy'"
                            selectionMode="multiple"
                            >
                            <template #date="slotProps">
                                <div 
                                    :class="{ 
                                        'has-sessions': isDateWithSessions(slotProps.date)
                                    }"
                                    :data-date="formatDateForComparison(slotProps.date)"
                                    class="date-cell"
                                >
                                    <span class="date-number">{{ slotProps.date.day }}</span>
                                </div>
                            </template>
                        </DatePicker>
                    </div>
                </div>

            </template>
        </ReusableArticle>

        <GrupoAlumnosSection :grupo-id="grupo.id_grupo" />

        <DocumentacionGeneradaSection :grupo-id="grupo.id_grupo" />

        <DocumentacionGrupo :grupo-id="grupo.id_grupo" />

        <ReusableArticle 
            title="Costes" 
        >
            <template #header-action>
                <Button label="Añadir Coste" @click="openCosteModal" />
            </template>
            <template #table>
                <div v-if="costesLoading" class="loading-message">
                    Cargando costes...
                </div>
                <div v-else-if="costesError" class="error-message">
                    <p>Error al cargar los costes: {{ costesError }}</p>
                </div>
                <div v-else-if="costes.length === 0" class="empty-state">
                    No hay costes asociados a este grupo
                </div>
                <div v-else>
                    <DataTable :value="costes">
                        <Column field="cif" header="CIF" />
                        <Column field="directos" header="Directos" />
                        <Column field="indirectos" header="Indirectos" />
                        <Column field="organizacion" header="Organización" />
                        <Column field="salariales" header="Salariales" />
                        <Column field="" header="Periodos">
                            <template #body="slotProps">
                                {{ formatPeriodos(slotProps.data) }}
                            </template>
                        </Column>
                        <Column header="">
                            <template #body="slotProps">
                                <div class="coste-actions">
                                    <Button  
                                        @click="editCoste(slotProps.data)"
                                        outlined
                                        label="Editar"
                                        size="small"
                                    />
                                    <Button  
                                        @click="deleteCoste(slotProps.data.id_coste)"
                                        outlined
                                        label="Eliminar"
                                        size="small"
                                    />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </ReusableArticle>

        <ReusableArticle 
            title="Tareas" 
        >
            <template #header-action>
                <Button label="Añadir Tarea" @click="openTareaModal" />
            </template>
            <template #table>
                <div v-if="tareasLoading" class="loading-message">
                    Cargando tareas...
                </div>
                <div v-else-if="tareasError" class="error-message">
                    <p>Error al cargar las tareas: {{ tareasError }}</p>
                </div>
                <div v-else-if="tareas.length === 0" class="empty-state">
                No hay tareas asociadas a este grupo
            </div>
                <div v-else>
                    <DataTable :value="tareasConNombres">
                        <Column field="nombre_tarea" header="Tarea" />
                        <Column field="estado" header="Estado">
                            <template #body="slotProps">
                                <Tag 
                                    :value="slotProps.data.estado" 
                                    :severity="getTareaStatusColor(slotProps.data.estado)"
                                />
                            </template>
                        </Column>
                        <Column field="responsable_azure_id" header="Responsable">
                            <template #body="slotProps">
                                <span>{{ getUsuarioNombre(slotProps.data.responsable_azure_id, authStore) }}</span>
                            </template>
                        </Column>
                        <Column field="observaciones" header="Observaciones" />
                        <Column field="autor_azure_id" header="Autor">
                            <template #body="slotProps">
                                <span>{{ getUsuarioNombre(slotProps.data.autor_azure_id, authStore) }}</span>
                            </template>
                        </Column>
                        <Column header="">
                            <template #body="slotProps">
                                <div class="table-actions">
                                    <Button 
                                        label="Eliminar" 
                                        size="small" 
                                        outlined
                                        @click="confirmDeleteTarea(slotProps.data.id_tarea)"
                                    />
                                    <Button 
                                        label="Editar" 
                                        size="small" 
                                        outlined
                                        @click="editTarea(slotProps.data.id_tarea)"
                                    />
                                    <Button 
                                        v-if="slotProps.data.estado === 'Pendiente'"
                                        label="Completar" 
                                        size="small" 
                                        outlined
                                        @click="openCompleteDialog(slotProps.data.id_tarea)"
                                    />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </ReusableArticle>
        <ReusableDialog 
            v-model:visible="showTareaModal" 
            title="Añadir Nueva Tarea"
            :form-component="TareaForm"
            :form-props="{ grupoPreseleccionado: grupo?.id_grupo ? { id_grupo: grupo.id_grupo } : null }"
            :form-data="tareaFormData"
            @save="onSaveTarea"
            @cancel="onCancelTarea"
        />
        
        <ReusableDialog 
            v-model:visible="showCosteModal" 
            :title="isEditingCoste ? 'Editar Coste' : 'Añadir Nuevo Coste'"
            :form-component="CostesForm"
            :form-props="{ grupoPreseleccionado: grupo }"
            :form-data="costeFormData"
            @save="onSaveCoste"
            @cancel="onCancelCoste"
        />
        
        <ReusableDialog 
            v-model:visible="showEditModal" 
            :title="isEditingGrupo ? 'Editar Grupo' : 'Nuevo Grupo'"
            :form-component="GruposForm"
            :form-data="grupoFormData"
            :form-props="{ isEditingMode: isEditingMode }"
            @save="onSaveGrupo"
            @cancel="onCancelGrupo"
        />
        
        <!-- Diálogo de confirmación para eliminar coste -->
        <ReusableDialog 
            v-model:visible="showDeleteConfirmModal" 
            title="Confirmar eliminación"
            message="¿Estás seguro de que quieres eliminar este coste?"
            details="Esta acción no se puede deshacer."
            @cancel="cancelDeleteCoste"
            @save="confirmDeleteCoste"
        />

        <!-- Diálogos para tareas -->
        <ReusableDialog
            v-model:visible="showDeleteDialog"
            title="Confirmar eliminación"
            :dialog-type="'confirmation'"
            message="¿Estás seguro de que quieres eliminar esta tarea?"
            :confirm-label="'Eliminar'"
            :cancel-label="'Cancelar'"
            :confirm-severity="'danger'"
            @confirm="handleDeleteTarea"
            @cancel="cancelDeleteTarea"
        />

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
    </section>
    <div v-else-if="loading">
        <p>Cargando grupo...</p>
    </div>
    <div v-else>
        <p>Grupo no encontrado</p>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/stores/main.js'
import { useAuthStore } from '@/stores/auth.js'
import { getGrupoById, updateGrupo } from '@/services/gruposService.js'
import { useCostesGrupo } from '@/composables/useCostesGrupo.js'
import { useDiasImparticionTeleformacion } from '@/composables/useDiasImparticionTeleformacion.js'
import { useDiasImparticionPresencial } from '@/composables/useDiasImparticionPresencial.js'
import { useSesiones } from '@/composables/useSesiones.js'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { tareaEstadoMixin } from '@/utils/mixins.js'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import GrupoAlumnosSection from './GrupoAlumnosSection.vue'
import DocumentacionGeneradaSection from './DocumentacionGeneradaSection.vue'
import { getAllTareas, createTarea, updateTarea, deleteTarea } from '@/services/tareasService.js'
import GrupoDocentesSection from './GrupoDocentesSection.vue'
import DocumentacionGrupo from './DocumentacionGrupo/DocumentacionGrupo.vue'
import TareaForm from '@/views/Tareas/TareaForm.vue'
import CompleteTareaForm from '@/views/Tareas/CompleteTareaForm.vue'
import CostesForm from './CostesForm.vue'
import GruposForm from './GruposForm.vue'
import DatePicker from 'primevue/datepicker'
import { grupoEstadoMixin } from '@/utils/mixins.js'
import { formatDateToDDMMYYYY, loadResponsables, getUsuarioNombre, formatLabel, formatTimeToHHMM } from '@/utils/functions.js'
import Divider from 'primevue/divider'
import { useToast } from 'primevue/usetoast'
import { getAccionFormativaById } from '@/services/accionesFormativasService.js'
import { MODALIDAD_SESIONES } from '@/utils/enums.js'

const route = useRoute()
const router = useRouter()
const store = useStore()
const authStore = useAuthStore()
const toast = useToast()

// Composables para sesiones
const { 
    dias: diasTeleformacion, 
    loading: diasTeleformacionLoading, 
    fetchDias: fetchDiasTeleformacion
} = useDiasImparticionTeleformacion()

const { 
    dias: diasPresencial, 
    loading: diasPresencialLoading, 
    fetchDias: fetchDiasPresencial
} = useDiasImparticionPresencial()

const { 
    sesiones, 
    loading: sesionesLoading, 
    fetchSesiones
} = useSesiones()

const { getGrupoStatusColor } = grupoEstadoMixin.methods
const { getTareaStatusColor } = tareaEstadoMixin.methods

// Computed para obtener los días existentes según la modalidad
const diasExistentes = computed(() => {
    if (grupo.value?.accionFormativa?.modalidad === MODALIDAD_SESIONES.TELEFORMACION) {
        return diasTeleformacion.value || []
    } else if (grupo.value?.accionFormativa?.modalidad === MODALIDAD_SESIONES.PRESENCIAL) {
        return diasPresencial.value || []
    } else if (grupo.value?.accionFormativa?.modalidad === MODALIDAD_SESIONES.MIXTA) {
        // En modalidad mixta, combinamos ambos tipos
        return [...(diasTeleformacion.value || []), ...(diasPresencial.value || [])]
    }
    return []
})

// Función para crear una fecha UTC desde los componentes del DatePicker
const createUTCDate = (year, month, day) => {
    return new Date(Date.UTC(year, month, day))
}

// Función para obtener la fecha en formato string YYYY-MM-DD sin problemas de timezone
const formatDateToString = (date) => {
    if (!date) return ''
    if (date instanceof Date) {
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
    return ''
}

// Función para verificar si una fecha tiene sesiones
const isDateWithSessions = (date) => {
    if (!date || !diasExistentes.value.length) return false
    
    const dateString = formatDateToString(createUTCDate(date.year, date.month, date.day))
    
    return diasExistentes.value.some(dia => {
        const diaDate = formatDateToString(new Date(dia.fecha_imparticion))
        return diaDate === dateString
    })
}

// Función para formatear la fecha para comparación
const formatDateForComparison = (date) => {
    if (!date) return ''
    return formatDateToString(createUTCDate(date.year, date.month, date.day))
}

// Función para formatear el mes
const formatMonth = (monthNum) => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return meses[monthNum - 1] || ''
}

// Función para identificar los meses diferentes con sesiones de presencial
const mesesConSesionesPresencial = computed(() => {
    if (!diasPresencial.value || !Array.isArray(diasPresencial.value) || diasPresencial.value.length === 0) {
        return []
    }
    
    const mesesMap = new Map()
    
    diasPresencial.value.forEach(dia => {
        const fecha = new Date(dia.fecha_imparticion)
        const mes = fecha.getUTCMonth() // 0-11
        const año = fecha.getUTCFullYear()
        const key = `${año}-${mes}`
        
        if (!mesesMap.has(key)) {
            mesesMap.set(key, {
                year: año,
                month: mes,
                date: new Date(Date.UTC(año, mes, 1))
            })
        }
    })
    
    return Array.from(mesesMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
})

// Función para identificar los meses diferentes con sesiones de teleformación
const mesesConSesionesTeleformacion = computed(() => {
    if (!diasTeleformacion.value || !Array.isArray(diasTeleformacion.value) || diasTeleformacion.value.length === 0) {
        return []
    }
    
    const mesesMap = new Map()
    
    diasTeleformacion.value.forEach(dia => {
        const fecha = new Date(dia.fecha_imparticion)
        const mes = fecha.getUTCMonth() // 0-11
        const año = fecha.getUTCFullYear()
        const key = `${año}-${mes}`
        
        if (!mesesMap.has(key)) {
            mesesMap.set(key, {
                year: año,
                month: mes,
                date: new Date(Date.UTC(año, mes, 1))
            })
        }
    })
    
    return Array.from(mesesMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
})

// Computed para obtener todas las fechas con sesiones de presencial
const selectedDatesPresencial = computed(() => {
    if (!diasPresencial.value || !Array.isArray(diasPresencial.value)) {
        return []
    }
    
    return diasPresencial.value.map(dia => {
        const fecha = new Date(dia.fecha_imparticion)
        return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()))
    })
})

// Computed para obtener todas las fechas con sesiones de teleformación
const selectedDatesTeleformacion = computed(() => {
    if (!diasTeleformacion.value || !Array.isArray(diasTeleformacion.value)) {
        return []
    }
    
    return diasTeleformacion.value.map(dia => {
        const fecha = new Date(dia.fecha_imparticion)
        return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()))
    })
})


// Composable para costes
const { 
    costes, 
    loading: costesLoading, 
    error: costesError, 
    fetchCostesByGrupo, 
    createCoste, 
    updateCoste, 
    removeCoste 
} = useCostesGrupo()

const grupo = ref(null)
const loading = ref(false)
const error = ref(null)
const showEditModal = ref(false)
const isEditingGrupo = ref(false)
const isEditingMode = ref(null)
const grupoFormData = ref({})

const tareas = ref([])
const tareasLoading = ref(false)
const tareasError = ref(null)
const showTareaModal = ref(false)

// Computed para agregar campos de nombres a las tareas
const tareasConNombres = computed(() => {
    return tareas.value.map(tarea => ({
        ...tarea,
        responsable_nombre: getUsuarioNombre(tarea.responsable_azure_id, authStore),
        autor_nombre: getUsuarioNombre(tarea.autor_azure_id, authStore)
    }))
})

// Variables para costes
const showCosteModal = ref(false)
const isEditingCoste = ref(false)
const costeFormData = ref({
    id_grupo: null,
    cif: '',
    directos: null,
    indirectos: null,
    organizacion: null,
    salariales: null,
    periodos_enero: null,
    periodos_febrero: null,
    periodos_marzo: null,
    periodos_abril: null,
    periodos_mayo: null,
    periodos_junio: null,
    periodos_julio: null,
    periodos_agosto: null,
    periodos_septiembre: null,
    periodos_octubre: null,
    periodos_noviembre: null,
    periodos_diciembre: null
})

// Variables para diálogo de confirmación de eliminación
const showDeleteConfirmModal = ref(false)
const costeToDelete = ref(null)

const tareaFormData = ref({
    nombre_tarea: '',
    id_grupo: '',
    estado: '',
    observaciones: '',
    autor_azure_id: '',
    responsable_azure_id: ''
})

// Variables para diálogos de tareas
const showDeleteDialog = ref(false)
const tareaToDelete = ref(null)

const showEditDialog = ref(false)
const tareaToEdit = ref(null)
const formData = ref({})

const showCompleteDialog = ref(false)
const tareaToComplete = ref(null)
const completeFormData = ref({})

const transformGrupoData = () => {
    if (!grupo.value) return {}
    
    const data = {
        'Fecha inicio': formatDateToDDMMYYYY(grupo.value.fecha_inicio, '-'),
        'Fecha fin': formatDateToDDMMYYYY(grupo.value.fecha_fin, '-'),
        'Número de participantes': grupo.value.numero_participantes || 0,
        'Responsable': getUsuarioNombre(grupo.value.responsable, authStore),
        'Teléfono responsable': grupo.value.telefono_responsable || '-',
        'Observaciones': grupo.value.observaciones || '-',
        'ID Curso en Moodle': grupo.value.moodle_grupo_id || '-',
    }
    
    // Añadir lugar y fecha diploma si existe
    if (grupo.value.lugar_fecha_diploma) {
        data['Lugar y fecha diploma'] = grupo.value.lugar_fecha_diploma
    }
    
    // Solo incluir número de homologación si la acción formativa es de seguridad privada
    if (grupo.value.accionFormativa?.es_seguridad_privada) {
        data['Nº Inscripción Seguridad'] = grupo.value.num_homologacion_seguridad || '-'
    }
    
    // Solo incluir horas presenciales si la modalidad es presencial o mixta
    if (grupo.value.accionFormativa?.modalidad === MODALIDAD_SESIONES.PRESENCIAL || grupo.value.accionFormativa?.modalidad === MODALIDAD_SESIONES.MIXTA) {
        data['Horas modalidad presencial'] = grupo.value.accionFormativa?.horas_modalidad_presencial || 0
    }
    
    // Solo incluir horas teleformación si la modalidad es teleformación o mixta
    if (grupo.value.accionFormativa?.modalidad === MODALIDAD_SESIONES.TELEFORMACION || grupo.value.accionFormativa?.modalidad === MODALIDAD_SESIONES.MIXTA) {
        data['Horas modalidad teleformación'] = grupo.value.accionFormativa?.horas_modalidad_teleformacion || 0
    }
    
    return data
}

const formacionPresencialDataCentro = computed(() => {
    if (!grupo.value) return {}
    return {
        'Centro': grupo.value.centro_nombre || '-',
        'CIF': grupo.value.centro_cif || '-',
        'Dirección detallada': grupo.value.centro_direccion || '-',
        'Localidad': grupo.value.centro_localidad || '-',
        'Código postal': grupo.value.centro_codPostal || '-',
    }
})

const formacionTeleformacionDataCentro = computed(() => {
    if (!grupo.value) return {}
    return {
        'Centro': grupo.value.tele_centro_nombre || '-',
        'CIF': grupo.value.tele_centro_cif || '-',
        'Dirección detallada': grupo.value.tele_centro_direccion || '-',
        'Localidad': grupo.value.tele_centro_localidad || '-',
        'Código postal': grupo.value.tele_centro_codPostal || '-',
    }
})

const formacionPresencialDataImparticion = computed(() => {
    if (!grupo.value) return {}
    return {
        'Centro': grupo.value.lugar_imparticion_nombre || '-',
        'CIF': grupo.value.lugar_imparticion_cif || '-',
        'Dirección detallada': grupo.value.lugar_imparticion_direccion || '-',
        'Localidad': grupo.value.lugar_imparticion_localidad || '-',
        'Código postal': grupo.value.lugar_imparticion_codPostal || '-',
    }
})

const formacionPresencialDataAulaVirtual = computed(() => {
    if (!grupo.value) return {}
    return {
        'Medio': grupo.value.medio_aula_virtual || '-',
        'Conexión': grupo.value.conexion_aula_virtual || '-',
        'Contacto': grupo.value.contacto_aula_virtual || '-',
        'Teléfono': grupo.value.telefono_aula_virtual || '-',
        'Bimodal': grupo.value.bimodal_aula_virtual ? 'Sí' : 'No'|| '-',
        'Sin participantes en centro': grupo.value.sin_participantes_en_centro_aula_virtual ? 'Sí' : 'No' || '-',
        'Sin docentes en centro': grupo.value.sin_docentes_en_centro_aula_virtual ? 'Sí' : 'No' || '-',
    }
})

const formacionPresencialDataSesiones = computed(() => {
    if (!grupo.value) return {}
    return {
        'Nº Horas Formación Presencial': grupo.value.accionFormativa?.horas_modalidad_presencial || 0,
        'Días de impartición': grupo.value.dias_presencial_horario || '-',
        'Horario mañana': (formatTimeToHHMM(grupo.value.hora_inicio_tramo1_presencial_horario) || '-') + ' - ' + (formatTimeToHHMM(grupo.value.hora_fin_tramo1_presencial_horario) || '-'),
        'Horario tarde': (formatTimeToHHMM(grupo.value.hora_inicio_tramo2_presencial_horario) || '-') + ' - ' + (formatTimeToHHMM(grupo.value.hora_fin_tramo2_presencial_horario) || '-'),
    }
})

const formacionTeleformacionDataSesiones = computed(() => {
    if (!grupo.value) return {}
    return {
        'Nº Horas Formación Teleformación': grupo.value.accionFormativa?.horas_modalidad_teleformacion || 0,
        'Días de impartición': grupo.value.dias_tele || '-',
        'Horario mañana': (formatTimeToHHMM(grupo.value.hora_inicio_tramo1_tele) || '-') + ' - ' + (formatTimeToHHMM(grupo.value.hora_fin_tramo1_tele) || '-'),
        'Horario tarde': (formatTimeToHHMM(grupo.value.hora_inicio_tramo2_tele) || '-') + ' - ' + (formatTimeToHHMM(grupo.value.hora_fin_tramo2_tele) || '-'),
    }
})

const getSelectedDatesTeleformacion = (year, month) => {
    // Filtrar las fechas por año y mes (usando métodos UTC para evitar problemas de timezone)
    return selectedDatesTeleformacion.value.filter(date => 
        date.getUTCFullYear() === year && date.getUTCMonth() === month
    )
}

const formacionTeleformacionData = computed(() => {
    if (!grupo.value) return {}
    return {
        'Plataforma': grupo.value.accionFormativa?.razon_social_plataforma || '-',
        'CIF plataforma': grupo.value.accionFormativa?.cif_plataforma || '-',
        'URI': grupo.value.accionFormativa?.uri || '-',
        'Usuario': grupo.value.accionFormativa?.usuario || '-',
    }
})

const loadTareas = async (grupoId) => {
    tareasLoading.value = true
    tareasError.value = null    
    try {
        const tareasData = await getAllTareas({id_grupo: grupoId})
        tareas.value = tareasData
    } catch (err) {
        tareasError.value = 'Error al cargar las tareas'
        console.error('Error loading tareas:', err)
    } finally {
        tareasLoading.value = false
    }
}

const loadCostes = async (grupoId) => {
    try {
        await fetchCostesByGrupo(grupoId)
    } catch (err) {
        console.error('Error loading costes:', err)
    }
}

const loadGrupo = async (grupoId) => {
    loading.value = true
    error.value = null
    
    try {
        const grupoData = await getGrupoById(grupoId)
        if (!grupoData.accionFormativa) {
            grupoData.accionFormativa = await getAccionFormativaById(grupoData.id_accion)
        }
        grupo.value = grupoData
        store.setActiveGrupo(grupoData)
    } catch (err) {
        error.value = 'Error al cargar el grupo'
        console.error('Error loading grupo:', err)
    } finally {
        loading.value = false
    }
}

const getModalidadColor = (modalidad) => {
    const colors = {
        'Teleformacion': 'info',
        'Presencial': 'success',
        'Mixta': 'warning'
    }
    return colors[modalidad] || 'secondary'
}

const formatPeriodos = (coste) => {
    const meses = [
        { key: 'periodos_enero', nombre: 'Enero' },
        { key: 'periodos_febrero', nombre: 'Febrero' },
        { key: 'periodos_marzo', nombre: 'Marzo' },
        { key: 'periodos_abril', nombre: 'Abril' },
        { key: 'periodos_mayo', nombre: 'Mayo' },
        { key: 'periodos_junio', nombre: 'Junio' },
        { key: 'periodos_julio', nombre: 'Julio' },
        { key: 'periodos_agosto', nombre: 'Agosto' },
        { key: 'periodos_septiembre', nombre: 'Septiembre' },
        { key: 'periodos_octubre', nombre: 'Octubre' },
        { key: 'periodos_noviembre', nombre: 'Noviembre' },
        { key: 'periodos_diciembre', nombre: 'Diciembre' }
    ]
    
    const periodosConValor = meses
        .filter(mes => coste[mes.key] && coste[mes.key] > 0)
        .map(mes => `${mes.nombre} - ${coste[mes.key]}`)
    
    return periodosConValor.length > 0 ? periodosConValor.join(', ') : 'Sin periodos'
}

const openTareaModal = () => {
    if (grupo.value && grupo.value.id_grupo) {
        tareaFormData.value.id_grupo = grupo.value.id_grupo
    }
    showTareaModal.value = true
}


const onCancelTarea = () => {
    showTareaModal.value = false
    tareaFormData.value = {
        nombre_tarea: '',
        id_grupo: '',
        estado: '',
        observaciones: '',
        autor_azure_id: '',
        responsable_azure_id: ''
    }
}

const onSaveTarea = async (tareaData) => {
    try {
        if (grupo.value && grupo.value.id_grupo) {
            tareaData.id_grupo = grupo.value.id_grupo
        }
        
        await createTarea(tareaData)
        
        await loadTareas(grupo.value.id_grupo)
        
        showTareaModal.value = false
        
        tareaFormData.value = {
            nombre_tarea: '',
            id_grupo: '',
            estado: '',
            observaciones: '',
            autor_azure_id: '',
            responsable_azure_id: ''
        }
        
        toast.add({
            severity: 'success',
            summary: 'Tarea creada',
            detail: 'La tarea se ha creado exitosamente',
            life: 3000
        })
    } catch (error) {
        console.error('Error al crear la tarea:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al crear la tarea',
            detail: 'Error al crear la tarea',
            life: 3000
        })    
    }
}

const openCosteModal = () => {
    isEditingCoste.value = false
    resetCosteForm()
    showCosteModal.value = true
}

const editCoste = (coste) => {
    isEditingCoste.value = true
    costeFormData.value = { ...coste }
    showCosteModal.value = true
}

const onSaveCoste = async (costeData) => {
    try {
        if (grupo.value && grupo.value.id_grupo) {
            costeData.id_grupo = grupo.value.id_grupo
        }
        
        if (isEditingCoste.value) {
            await updateCoste(costeData.id_coste, costeData)
        } else {
            await createCoste(costeData)
        }
        
        await loadCostes(grupo.value.id_grupo)
        showCosteModal.value = false
        resetCosteForm()
        
        toast.add({
            severity: 'success',
            summary: 'Coste guardado',
            detail: 'El coste se ha guardado exitosamente',
            life: 3000
        })
    } catch (error) {
        console.error('Error al guardar el coste:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al guardar el coste',
            detail: 'Error al guardar el coste',
            life: 3000
        })
    }
}

const onCancelCoste = () => {
    showCosteModal.value = false
    resetCosteForm()
}

const deleteCoste = (costeId) => {
    costeToDelete.value = costeId
    showDeleteConfirmModal.value = true
}

const confirmDeleteCoste = async () => {
    try {
        await removeCoste(costeToDelete.value)
        await loadCostes(grupo.value.id_grupo)
        toast.add({
            severity: 'success',
            summary: 'Coste eliminado',
            detail: 'El coste se ha eliminado exitosamente',
            life: 3000
        })
        showDeleteConfirmModal.value = false
        costeToDelete.value = null
    } catch (error) {
        console.error('Error al eliminar el coste:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al eliminar el coste',
            detail: 'Error al eliminar el coste',
            life: 3000
        })
        showDeleteConfirmModal.value = false
        costeToDelete.value = null
    }
}

const cancelDeleteCoste = () => {
    showDeleteConfirmModal.value = false
    costeToDelete.value = null
}

const resetCosteForm = () => {
    costeFormData.value = {
        id_grupo: grupo.value?.id_grupo || null,
        cif: '',
        directos: null,
        indirectos: null,
        organizacion: null,
        salariales: null,
        periodos_enero: null,
        periodos_febrero: null,
        periodos_marzo: null,
        periodos_abril: null,
        periodos_mayo: null,
        periodos_junio: null,
        periodos_julio: null,
        periodos_agosto: null,
        periodos_septiembre: null,
        periodos_octubre: null,
        periodos_noviembre: null,
        periodos_diciembre: null
    }
}

// Funciones para edición de grupo
const openEditGrupoModal = (mode) => {
    isEditingGrupo.value = true
    isEditingMode.value = mode
    grupoFormData.value = grupo.value
    // Usar nextTick para asegurar que los datos se asignen antes de abrir el modal
    nextTick(() => {
        showEditModal.value = true
    })
}


// Campos a excluir del payload (relaciones anidadas que no se deben enviar)
const EXCLUDED_FIELDS = ['accionFormativa', 'alumnosPersonaGrupo', 'docentesPersonaGrupo']

const onSaveGrupo = async (grupoData) => {
    try {
        if (isEditingGrupo.value && grupo.value) {
            const filteredData = Object.fromEntries(
                Object.entries(grupoData).filter(([key]) => !EXCLUDED_FIELDS.includes(key))
            )
            await updateGrupo(grupo.value.id_grupo, filteredData)
            await loadGrupo(grupo.value.id_grupo)
        }
        
        showEditModal.value = false
        isEditingGrupo.value = false
        isEditingMode.value = null
        grupoFormData.value = {}
        
        toast.add({
            severity: 'success',
            summary: 'Grupo actualizado',
            detail: 'El grupo se ha actualizado exitosamente',
            life: 3000
        })
    } catch (error) {
        console.error('Error al actualizar el grupo:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al actualizar el grupo',
            detail: 'Error al actualizar el grupo',
            life: 3000
        })
    }
}

const onCancelGrupo = () => {
    showEditModal.value = false
    isEditingGrupo.value = false
    isEditingMode.value = null
    grupoFormData.value = {}
}

const navigateToSesiones = (tipoModalidadSesiones) => {
    if (grupo.value && grupo.value.id_grupo) {
        // Guardar el tipo de modalidad en el store
        store.setTipoModalidadSesiones(tipoModalidadSesiones)
        // Navegar a sesiones
        router.push(`/grupos/${grupo.value.id_grupo}/sesiones`)
    }
}

// Función para cargar datos de sesiones
const loadDatosSesiones = async (grupoId) => {
    try {
        const modalidad = grupo.value?.accionFormativa?.modalidad
        
        // Cargar días de impartición según la modalidad
        if (modalidad === MODALIDAD_SESIONES.TELEFORMACION || modalidad === MODALIDAD_SESIONES.MIXTA) {
            await fetchDiasTeleformacion({ id_grupo: grupoId })
        }
        
        if (modalidad === MODALIDAD_SESIONES.PRESENCIAL || modalidad === MODALIDAD_SESIONES.MIXTA) {
            await fetchDiasPresencial({ id_grupo: grupoId })
        }
        
        // Cargar sesiones del grupo
        await fetchSesiones({ id_grupo: grupoId })
    } catch (err) {
        console.error('Error cargando datos de sesiones:', err)
    }
}

// Funciones para manejar acciones de tareas
const confirmDeleteTarea = (idTarea) => {
    tareaToDelete.value = idTarea
    showDeleteDialog.value = true
}

const editTarea = (idTarea) => {
    const tarea = tareasConNombres.value.find(t => t.id_tarea === idTarea)
    if (tarea) {
        tareaToEdit.value = tarea
        formData.value = { ...tarea }
        showEditDialog.value = true
    }
}

const openCompleteDialog = (idTarea) => {
    const tarea = tareasConNombres.value.find(t => t.id_tarea === idTarea)
    if (tarea) {
        tareaToComplete.value = tarea
        completeFormData.value = { ...tarea }
        showCompleteDialog.value = true
    }
}

const handleCancelEdit = () => {
    showEditDialog.value = false
    tareaToEdit.value = null
    formData.value = {}
}

const handleCancelComplete = () => {
    showCompleteDialog.value = false
    tareaToComplete.value = null
    completeFormData.value = {}
}

const handleDeleteTarea = async () => {
    if (tareaToDelete.value) {
        try {
            await deleteTarea(tareaToDelete.value)
            showDeleteDialog.value = false
            tareaToDelete.value = null
            
            // Recargar las tareas
            await loadTareas(grupo.value.id_grupo)
            
            toast.add({
                severity: 'success',
                summary: 'Tarea eliminada',
                detail: 'La tarea se ha eliminado exitosamente',
                life: 3000
            })
        } catch (error) {
            console.error('Error al eliminar la tarea:', error)
            toast.add({
                severity: 'error',
                summary: 'Error al eliminar',
                detail: 'No se pudo eliminar la tarea',
                life: 3000
            })
        }
    }
}

const cancelDeleteTarea = () => {
    showDeleteDialog.value = false
    tareaToDelete.value = null
}

const handleUpdateTarea = async (tareaData) => {
    try {
        await updateTarea(tareaToEdit.value.id_tarea, tareaData)
        tareaToEdit.value = null
        showEditDialog.value = false

        // Recargar las tareas
        await loadTareas(grupo.value.id_grupo)

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

const handleCompleteTareaSave = async (tareaData) => {
    try {
        console.log('tareaData', tareaData)
        await updateTarea(tareaToComplete.value.id_tarea, tareaData)
        tareaToComplete.value = null
        showCompleteDialog.value = false

        // Recargar las tareas
        await loadTareas(grupo.value.id_grupo)

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

// Filtramos los tutores para que no salgan repetidos ni se mezclen con otros grupos
const tutoresDelGrupo = computed(() => {
    if (!sesiones.value || sesiones.value.length === 0 || !grupo.value) return 'Sin tutor';
    
    // 1. Nos quedamos SOLO con las sesiones de este grupo exacto
    const sesionesDeEsteGrupo = sesiones.value.filter(s => {
        const idGrupoSesion = s.diaPresencial?.id_grupo || s.diaTeleformacion?.id_grupo || s.docente?.id_grupo;
        return idGrupoSesion === grupo.value.id_grupo;
    });
    
    // Si después de filtrar resulta que no hay sesiones para este grupo:
    if (sesionesDeEsteGrupo.length === 0) return 'Sin tutor';
    
    // 2. Sacamos los nombres solo de esas sesiones filtradas
    const nombres = sesionesDeEsteGrupo.map(s => getNombreTutor(s));
    
    // 3. Quitamos los repetidos
    const unicos = [...new Set(nombres)].filter(nombre => nombre !== 'Sin tutor');
    
    return unicos.length > 0 ? unicos.join(', ') : 'Sin tutor';
});

const getNombreTutor = (sesion) => {
    // Miramos todo lo que trae la sesión
    console.log("Sesión ENTERA:", sesion);
    
    const persona = sesion?.docente?.persona
    if (!persona) return 'Sin tutor'
    
    return [
        persona.nombre,
        persona.apellido1,
        persona.apellido2
    ].filter(Boolean).join(' ')
}
onMounted(async () => {
    const grupoId = route.params.id
    if (store.activeGrupo && store.activeGrupo.id_grupo == grupoId) {
        grupo.value = store.activeGrupo
    } else {
        await loadGrupo(grupoId)
    }
    await loadResponsables(authStore)
    await loadTareas(grupoId)
    await loadCostes(grupoId)
    await loadDatosSesiones(grupoId)
})
</script>

<style scoped lang="scss">
@use '@/styles/abstracts/variables.scss' as *;
@use '@/styles/abstracts/colors.scss' as *;

.mini-datepicker-container {
    display: flex;
    flex-wrap: wrap;
   
}

.mini-datepicker {
    max-width: 365px;
}

:deep(.p-datepicker-calendar) {
    .p-datepicker-header {
        .p-datepicker-prev-button {
            color: $color__secondary  
        }
        .p-datepicker-next-button {
            color: $color__secondary  
        }
    }
    .p-datepicker-day {
        border-radius: 0px !important;
    }

    td {
        padding: 0;
    }

    .p-datepicker-day-selected {
        background-color: $color__accent-red-light;     
    }

    td:has(.has-sessions) {
        background-color: $color__accent-red-light;  
        .date-cell {
            .date-number {
                font-weight: 600;
                color: $color__accent-red;
            }
        }
    }
    
    .date-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        justify-content: center;
    }
}

.table-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: flex-end;
}
</style>