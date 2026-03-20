<template>
    <section>
        <div class="section-header">
            <div class="section-header__main section-main">
                <h1 class="section-main__title">Grupos</h1>
            </div>
            <div class="section-header__actions">
                <Button 
                    label="Descargar XML masivo"
                    :disabled="!selectedGrupos.length"
                    @click="exportXML"
                />

                <Button label="Nuevo Grupo" @click="showModal = true" />
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
                <label for="estado-filter">Estado</label>
                <Select 
                    id="estado-filter"
                    v-model="filters['estado'].value" 
                    :options="estadoOptions"
                    optionLabel="label"
                    optionValue="value"
                    showClear
                >
                    <template #option="slotProps">
                        <Tag :value="slotProps.option.label" :severity="getGrupoStatusColor(slotProps.option.value)" />
                    </template>
                </Select>
            </div>
            
            <div class="table-filters__group filter">
                <label for="plan-filter">Expediente Plan</label>
                <Select 
                    id="plan-filter"
                    v-model="planFilter"
                    :options="planesOptions"
                    optionLabel="expediente"
                    optionValue="id_plan"
                    :showClear="true"
                    @change="onPlanChange"
                />
            </div>
            
            <div class="table-filters__group filter">
                <label for="accion-formativa-filter">Acción Formativa</label>
                <Select 
                    id="accion-formativa-filter"
                    v-model="accionFormativaFilter"
                    :options="accionesFormativasOptions"
                    optionLabel="denominacion"
                    optionValue="id_accion_formativa"
                    :showClear="true"
                    :disabled="!planFilter"
                />
            </div>
            
            <div class="table-filters__group filter">
                <label for="fecha-range-filter">Rango de Fechas</label>
                <DatePicker 
                    id="fecha-range-filter"
                    v-model="fechaRangeFilter"
                    selectionMode="range"
                    :manualInput="false"
                    :showClear="true"
                    dateFormat="dd/mm/yy"
                />
            </div>
        </div>

        <div v-if="error" class="error-message">
            <p>Error al cargar los grupos: {{ error }}</p>
            <Button label="Reintentar" @click="fetchGrupos" />
        </div>

        <DataTable 
            :value="filteredGrupos" 
            v-model:selection="selectedGrupos"
            selectionMode="multiple"
            :paginator="filteredGrupos.length > 25"
            :rows="25"
            v-model:filters="filters"
            :globalFilterFields="['codigo', 'denominacion', 'estado', 'responsable', 'centro_nombre', 'lugar_imparticion_nombre', 'accionFormativa.plan.expediente']"
            dataKey="id_grupo"
            :loading="loading"
            :filterMode="'custom'"
            editMode="cell"
            @cell-edit-complete="onCellEditComplete"
        >
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="denominacion" header="Denominación" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.denominacion || '-' }}</span>
                </template>
            </Column>
            
            <Column field="expediente_plan" header="Expediente Plan" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.accionFormativa?.plan?.expediente || '-' }}</span>
                </template>
            </Column>
            <!-- Añadimos la columna Bonificación -->
            <Column field="tipo_bonificacion" header="Bonificación">
                <template #body="slotProps">
                    {{ slotProps.data.tipo_bonificacion || 'Sin asignar' }}
                </template>
            </Column>
            <Column field="fecha_inicio" header="Fecha Inicio" sortable>
                <template #body="slotProps">
                    <span>{{ formatDate(slotProps.data.fecha_inicio) }}</span>
                </template>
            </Column>
            
            <Column field="fecha_fin" header="Fecha Fin" sortable>
                <template #body="slotProps">
                    <span>{{ formatDate(slotProps.data.fecha_fin) }}</span>
                </template>
            </Column>
            <!--  Modificiamos la columna Código para que se pueda editar -->
            <Column field="codigo" header="Código" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.codigo || '-' }}</span>
                </template>
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" autofocus style="width: 100%" />
                </template>
            </Column>
            <Column field="estado" header="Estado" sortable>
                <template #body="slotProps">
                    <Tag 
                        :value="slotProps.data.estado || '-'" 
                        :severity="getGrupoStatusColor(slotProps.data.estado)"
                    />
                </template>
            </Column>
            <Column header="" :exportable="false">
                <template #body="slotProps">
                    <div class="table-actions">
                        <Button
                           label="Eliminar" 
                                size="small" 
                                outlined
                                severity="danger"
                                @click="confirmDeleteGrupo(slotProps.data)"
                         />
                        <a :href="`/grupos/${slotProps.data.id_grupo}`">
                            <Button 
                                label="Ver" 
                                size="small" 
                                outlined
                            />
                        </a>
                    </div>
                </template>
            </Column>
        </DataTable>

        <ReusableDialog 
            v-model:visible="showModal" 
            title="Nuevo grupo"
            :form-component="GruposForm"
            :form-props="{ isEditingMode: 'general' }"
            @save="handleSaveGrupo"
            @cancel="handleCancelGrupo"
        />
    </section>
</template>

<script setup>
import {deleteGrupo} from '@/services/gruposService.js'
import{useConfirm} from 'primevue/useconfirm'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores/main.js'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import DatePicker from 'primevue/datepicker'
import { useGrupos } from '@/composables/useGrupos.js'
import { usePlans } from '@/composables/usePlans.js'
import { useAccionesFormativas } from '@/composables/useAccionesFormativas.js'
import { grupoEstadoMixin } from '@/utils/mixins.js'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import GruposForm from './GruposForm.vue'
import { useToast } from 'primevue/usetoast'
import {  createGrupo } from '@/services/gruposService.js'
import { createDefaultGrupoTareas } from '@/services/tareasService.js'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { getGrupoById } from '@/services/gruposService.js'


const router = useRouter()
const selectedGrupos = ref([])

const store = useStore()
const { grupos: allGrupos, loading, error, fetchGrupos } = useGrupos()
const { planes, fetchPlans } = usePlans()
const { accionesFormativas, fetchAccionesFormativas } = useAccionesFormativas()

const toast = useToast()

const filters = ref({
    global: { value: null, matchMode: 'contains' },
    estado: { value: null, matchMode: 'equals' }
})

const planFilter = ref(null)
const accionFormativaFilter = ref(null)
const fechaRangeFilter = ref(null)
const showModal = ref(false)

const grupos = allGrupos

const estadoOptions = ref([
    { label: 'Ejecutado', value: 'Ejecutado' },
    { label: 'En Ejecución', value: 'En Ejecucion' },
    { label: 'En Proyecto', value: 'En Proyecto' },
    { label: 'Cancelado', value: 'Cancelado' },
    { label: 'Certificado', value: 'Certificado' }
])

const planesOptions = computed(() => {
    return planes.value || []
})

const accionesFormativasOptions = computed(() => {
    if (!planFilter.value) {
        return []
    }
    return accionesFormativas.value.filter(accion => accion.id_plan === planFilter.value)
})

const filteredGrupos = computed(() => {
    let filtered = grupos.value
    
    if (planFilter.value) {
        filtered = filtered.filter(grupo => 
            grupo.accionFormativa?.plan?.id_plan === planFilter.value
        )
    }
    
    if (accionFormativaFilter.value) {
        filtered = filtered.filter(grupo => 
            grupo.accionFormativa?.id_accion_formativa === accionFormativaFilter.value
        )
    }
    
    if (fechaRangeFilter.value && fechaRangeFilter.value.length === 2) {
        const [fechaInicio, fechaFin] = fechaRangeFilter.value
        filtered = filtered.filter(grupo => {
            const grupoFechaInicio = grupo.fecha_inicio ? new Date(grupo.fecha_inicio) : null
            const grupoFechaFin = grupo.fecha_fin ? new Date(grupo.fecha_fin) : null
            
            const fechaInicioEnRango = grupoFechaInicio && 
                grupoFechaInicio >= fechaInicio && 
                grupoFechaInicio <= fechaFin
            
            const fechaFinEnRango = grupoFechaFin && 
                grupoFechaFin >= fechaInicio && 
                grupoFechaFin <= fechaFin
            
            return fechaInicioEnRango || fechaFinEnRango
        })
    }
    
    return filtered
})

const viewGrupo = (grupoId) => {
    router.push(`/grupos/${grupoId}`)
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-ES')
}

const onPlanChange = () => {
    accionFormativaFilter.value = null
    if (!planFilter.value) {
        store.clearActivePlan()
    }
}

const applyPlanFilter = () => {
    if (store.activePlan && store.activePlan.id_plan) {
        planFilter.value = store.activePlan.id_plan
    }
}
const confirm= useConfirm();
//Función para DIÁLOGO DE CONFIRMACIÓN de eliminacion de grupo
const  confirmDeleteGrupo = (grupo) =>{
    confirm.require({
        message:'¿Seguro que quieres eliminar el grupo"${grupo.denominacion}"?',
        header:'Confirmar eliminación',
        acceptLabel:"Eliminar",
        rejectLabel: 'Cancelar',
        acceptClass:'p button danger',
        accept:() => deleteGrupoHandler(grupo)
    })

}
//Funcion para eliminar el Grupo desde LISTA de TABLA
const deleteGrupoHandler = async(grupo) =>{
    try{
        await deleteGrupo(grupo.id_grupo)
        //Quitar de la tabla sin recargar
        grupos.value = grupos.value.filter(g => g.id_grupo!==grupo.id_grupo)
        //Toast de confirmacion
        toast.add({
            severity:'success',
            summary:'Grupo eliminado',
            detail:'El grupo "${grupo.denominacion}"se eliminó correctamente',
            life:3000
        })
    }catch(error){
        console.error('Error al eliminar grupo:', error)
        toast.add({
            severity:'error',
            summary:'Error',
            detail:'No se pudo eliminar el grupo',
            life:3000
        }

        )
    }
}
const handleCancelGrupo = () => {
    showModal.value = false
    //Todo: reset form data
}

const handleSaveGrupo = async (grupoData) => {
    try {
        const newGrupo = await createGrupo(grupoData)
        await createDefaultGrupoTareas(newGrupo.id_grupo)
        showModal.value = false
        //Todo: reset form data
        toast.add({
            severity: 'success',
            summary: 'Grupo creado',
            detail: 'El grupo se ha creado exitosamente',
            life: 3000
        })
        grupos.value.unshift(newGrupo);
        await fetchGrupos();
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

const onCellEditComplete = (event) => {
    let { data, newValue, field } = event;

    // 1. Si lo deja vacío, cancelamos
    if (!newValue || newValue.trim() === '') {
        event.preventDefault(); 
        return;
    }

    // 2. Comprobamos si el código ya existe (sin compararlo consigo mismo)
    const estaRepetido = grupos.value.some(grupo => 
        grupo.id_grupo !== data.id_grupo && 
        grupo.codigo === newValue && 
        (grupo.accionFormativa?.id_accion_formativa == data.accionFormativa?.id_accion_formativa || 
        grupo.id_accion == data.id_accion)
    );

    // 3. Si está repetido, bloqueamos
    if (estaRepetido) {
        event.preventDefault(); 
        alert('Este código ya está en uso en esta acción formativa. Elige otro.');
        return;
    }

    // 4. Si es válido, actualizamos la tabla
    data[field] = newValue;

    console.log("Listo para guardar en BD:", newValue);
};

onMounted(async () => {
    await Promise.all([
        fetchPlans(),
        fetchAccionesFormativas()
    ])
    applyPlanFilter()
})

watch(() => store.activePlan, (newPlan) => {
    if (newPlan && newPlan.id_plan) {
        planFilter.value = newPlan.id_plan
    }
}, { deep: true })



const { getGrupoStatusColor } = grupoEstadoMixin.methods

const exportXML = async () => {

    if (!selectedGrupos.value.length) return

    const zip = new JSZip()

    toast.add({
        severity: 'info',
        summary: 'Generando XML',
        detail: 'Preparando descarga...',
        life: 2000
    })

    for (const grupo of selectedGrupos.value) {

        const fullGrupo = await getGrupoById(grupo.id_grupo)

        const xml = generateGrupoXML(fullGrupo)

        zip.file(`grupo_${grupo.codigo}.xml`, xml)
    }

    const content = await zip.generateAsync({ type: "blob" })

    saveAs(content, "grupos_xml.zip")
    selectedGrupos.value = []
}

const generateGrupoXML = (grupo) => {

    const alumnosXML = grupo.alumnosPersonaGrupo?.map(alumno => `
        <alumno>
            <nombre>${alumno.persona?.nombre || ''}</nombre>
            <apellido1>${alumno.persona?.apellido1 || ''}</apellido1>
            <apellido2>${alumno.persona?.apellido2 || ''}</apellido2>
            <dni>${alumno.persona?.dni || ''}</dni>
        </alumno>
    `).join('') || ''

    const docentesXML = grupo.docentesPersonaGrupo?.map(docente => `
        <docente>
            <nombre>${docente.persona?.nombre || ''}</nombre>
            <apellido1>${docente.persona?.apellido1 || ''}</apellido1>
            <apellido2>${docente.persona?.apellido2 || ''}</apellido2>
        </docente>
    `).join('') || ''

    return `
<grupo>

    <datos_generales>
        <id>${grupo.id_grupo}</id>
        <codigo>${grupo.codigo}</codigo>
        <denominacion>${grupo.denominacion}</denominacion>
        <estado>${grupo.estado}</estado>
        <fecha_inicio>${grupo.fecha_inicio}</fecha_inicio>
        <fecha_fin>${grupo.fecha_fin}</fecha_fin>
        <numero_participantes>${grupo.numero_participantes}</numero_participantes>
    </datos_generales>

    <accion_formativa>
        <id>${grupo.accionFormativa?.id_accion_formativa}</id>
        <denominacion>${grupo.accionFormativa?.denominacion}</denominacion>
        <modalidad>${grupo.accionFormativa?.modalidad}</modalidad>
        <expediente_plan>${grupo.accionFormativa?.plan?.expediente}</expediente_plan>
    </accion_formativa>

    <centro>
        <nombre>${grupo.centro_nombre}</nombre>
        <cif>${grupo.centro_cif}</cif>
        <direccion>${grupo.centro_direccion}</direccion>
        <localidad>${grupo.centro_localidad}</localidad>
        <cp>${grupo.centro_codPostal}</cp>
    </centro>

    <lugar_imparticion>
        <nombre>${grupo.lugar_imparticion_nombre}</nombre>
        <cif>${grupo.lugar_imparticion_cif}</cif>
        <direccion>${grupo.lugar_imparticion_direccion}</direccion>
        <localidad>${grupo.lugar_imparticion_localidad}</localidad>
        <cp>${grupo.lugar_imparticion_codPostal}</cp>
    </lugar_imparticion>

    <alumnos>
        ${alumnosXML}
    </alumnos>

    <docentes>
        ${docentesXML}
    </docentes>

</grupo>
`.trim()
}


</script>