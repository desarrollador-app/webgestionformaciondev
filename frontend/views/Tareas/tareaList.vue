<template>
    <section>
        <div class="section-header">
            <div class="section-header__main section-main">
                <h1 class="section-main__title">Tareas</h1>
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
                <label for="estado-filter">Filtrar por estado</label>
                <Select 
                    id="estado-filter"
                    v-model="filters['estado'].value" 
                    :options="estadoOptions"
                    optionLabel="label"
                    optionValue="value"
                    :showClear="true"
                />
            </div>
            <div class="table-filters__group filter">
                <label for="grupo-filter">Filtrar por grupo</label>
                <Select 
                    id="grupo-filter"
                    v-model="filters['id_grupo'].value" 
                    :options="grupoOptions"
                    optionLabel="label"
                    optionValue="value"
                    :showClear="true"
                />
            </div>
            <div class="table-filters__group filter">
                <label for="responsable-filter">Filtrar por responsable</label>
                <Select 
                    id="responsable-filter"
                    v-model="filters['responsable_azure_id'].value" 
                    :options="responsableOptions"
                    optionLabel="label"
                    optionValue="value"
                    :showClear="true"
                />
            </div>
            <div class="table-filters__actions">
                <Button
                    label="Añadir tarea"
                    @click="openCreateDialog"
                />
            </div>
        </div>

        <div v-if="error" class="error-message">
            <p>Error al cargar las tareas: {{ error }}</p>
            <Button label="Reintentar" @click="fetchTareas" />
        </div>

        <DataTable 
            :value="tareasConNombres" 
            :paginator="tareasConNombres.length > 25"
            :rows="25"
            v-model:filters="filters"
            :globalFilterFields="['nombre_tarea', 'observaciones', 'responsable_nombre', 'autor_nombre']"
            dataKey="id_tarea"
            :loading="loading"
        >
        <!-- Cambiamos la columna nombre_tarea -->
            <Column field="nombre_tarea" header="Tarea" sortable>
                <template #body="slotProps">
                    <span :class="getColorClass(slotProps.data.color)">
                        {{ slotProps.data.nombre_tarea }}
                    </span>
                </template>
            </Column>
            <Column field="responsable_azure_id" header="Responsable" sortable>
                <template #body="slotProps">
                    <span>{{ getUsuarioNombre(slotProps.data.responsable_azure_id, authStore) }}</span>
                </template>
            </Column>
            <Column field="observaciones" header="Observaciones" sortable />
            <Column field="autor_azure_id" header="Autor" sortable>
                <template #body="slotProps">
                    <span>{{ getUsuarioNombre(slotProps.data.autor_azure_id, authStore) }}</span>
                </template>
            </Column>

            <!-- Campo codigo -->
            <Column field="codigo" header="Nº de Grupo" sortable>
                <template #body="slotProps">
                    <span>
                        {{ slotProps.data.grupo?.codigo 
                            ? getGrupoDenominacion(slotProps.data.grupo.codigo) 
                            : 'Sin grupo' }}
                    </span>
                </template>
            </Column>
            
            <Column field="id_grupo" header="Grupo" sortable>
                <template #body="slotProps">
                    <span>{{ getGrupoDenominacion(slotProps.data.id_grupo) }}</span>
                </template>
            </Column>
<!-- Añadimos la columna fecha_vencimiento -->
            <Column field="fecha_vencimiento" header="Vencimiento" sortable>
                <template #body="slotProps">
                        <span>{{ formatFecha(slotProps.data.fecha_vencimiento) }}</span>
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

        <ReusableDialog 
            v-model:visible="showDeleteDialog" 
            title="Confirmar eliminación"
            message="¿Estás seguro de que quieres eliminar esta tarea?"
            dialog-type="confirmation"
            confirm-label="Eliminar"
            cancel-label="Cancelar"
            confirm-severity="danger"
            @confirm="handleDeleteTarea"
            @cancel="showDeleteDialog = false"
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

        <ReusableDialog 
            v-model:visible="showCreateDialog" 
            title="Crear tarea"
            :form-component="TareaForm"
            @save="handleCreateTarea"
            @cancel="showCreateDialog = false"
        />

    </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTareas } from '@/composables/useTareas.js'
import { useGrupos } from '@/composables/useGrupos.js'
import { useAuthStore } from '@/stores/auth.js'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Select from 'primevue/select'
import TareaForm from './TareaForm.vue'
import Tag from 'primevue/tag'
import CompleteTareaForm from './CompleteTareaForm.vue'
import { useToast } from 'primevue/usetoast'
import { getUsuarioNombre } from '@/utils/functions.js'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import { tareaEstadoMixin } from '@/utils/mixins.js'
import { createTarea } from '@/services/tareasService.js' //import 
const { tareas, loading, error, fetchTareas, removeTarea, completeTarea, updateTareaData } = useTareas()
const { grupos } = useGrupos()
const authStore = useAuthStore()
const toast = useToast()

const { getTareaStatusColor } = tareaEstadoMixin.methods


// Computed para agregar campos de nombres a las tareas para la búsqueda, añadimos para poder ordenadar las tareas
const tareasConNombres = computed(() => {
    return [...tareas.value]
        .map(tarea => ({
            ...tarea,
            responsable_nombre: getUsuarioNombre(tarea.responsable_azure_id, authStore),
            autor_nombre: getUsuarioNombre(tarea.autor_azure_id, authStore)
        }))
        .sort((a, b) => {
            if (!a.fecha_vencimiento) return 1
            if (!b.fecha_vencimiento) return -1
            return new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento)
        })
})

// Función para obtener la denominación del grupo por su ID
const getGrupoDenominacion = (idGrupo) => {
    const grupo = grupos.value.find(g => g.id_grupo === idGrupo)
    return grupo ? grupo.denominacion : `Grupo ${idGrupo}`
}


// Opciones para el filtro de estado
const estadoOptions = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Completada', value: 'Completada' }
]

// Opciones para el filtro de grupo
const grupoOptions = computed(() => [
    { label: 'Todos los grupos', value: null },
    ...grupos.value.map(grupo => ({
        label: grupo.denominacion,
        value: grupo.id_grupo
    }))
])

// Opciones para el filtro de responsable
const responsableOptions = computed(() => [
    { label: 'Todos los responsables', value: null },
    ...authStore.getResponsables.map(responsable => ({
        label: responsable.displayName || responsable.userPrincipalName,
        value: responsable.id
    }))
])

const filters = ref({
    global: { value: null },
    estado: { value: null },
    id_grupo: { value: null },
    responsable_azure_id: { value: null }
})

const showDeleteDialog = ref(false)
const tareaToDelete = ref(null)

const showEditDialog = ref(false)
const tareaToEdit = ref(null)
const formData = ref({})

const showCompleteDialog = ref(false)
const tareaToComplete = ref(null)
const completeFormData = ref({})

const showCreateDialog = ref(false) 

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
            await removeTarea(tareaToDelete.value)
            tareaToDelete.value = null
            showDeleteDialog.value = false
            
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

const handleCompleteTareaSave = async (tareaData) => {
    try {
        console.log('tareaData', tareaData)
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

// Añadimos const formatFecha para darle un formato a la fecha y const getColorClass para controlar los colores en la tabla
const formatFecha = (fecha) => {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-ES')
}
const getColorClass = (color) => {
    return `tarea-color-${color || 'azul'}`
}
    
//Función para abrir el modal
const openCreateDialog = () => {
    showCreateDialog.value = true
}

//Función para guardar la tarea
const handleCreateTarea = async (tareaData) => {
    try {

        const data = { ...tareaData }

        // Si responsable está vacío -> null
        if (!data.responsable_azure_id) {
            data.responsable_azure_id = null
        }

        // Si grupo está vacío -> null
        if (!data.id_grupo) {
            data.id_grupo = null
        }

        await createTarea(data)

        showCreateDialog.value = false

        await fetchTareas()

        toast.add({
            severity: 'success',
            summary: 'Tarea creada',
            detail: 'La tarea se ha creado correctamente',
            life: 3000
        })

    } catch (error) {
        console.error('Error creando tarea:', error)

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear la tarea',
            life: 3000
        })
    }
}
</script>
