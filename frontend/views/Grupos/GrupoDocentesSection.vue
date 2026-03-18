<template>
    <ReusableArticle 
        title="Docentes" 
    >
        <template #header-action>
            <Button label="Añadir docente" @click="showAddDocenteModal = true" />
        </template>
        
        <!-- Añado la función sortField y :sortOrder= para que salga ordenado direntamente la tabla apellido1 -->
        <template #table>
            <DataTable 
                :value="docentes"
                sortField="persona.apellido1"
                :sortOrder="1"
                :paginator="docentes.length > 25"
                :rows="25"
                dataKey="id_docente_grupo"
                :loading="docentesLoading"
                emptyMessage="No hay docentes en este grupo"
            >
                     <Column field="persona.apellido1" header="Primer Apellido" sortable></Column>
                       <Column field="persona.apellido2" header="Segundo Apellido" sortable></Column>
                <Column field="persona.nombre" header="Nombre" sortable></Column>

       

              
                
                
                <Column field="persona.documento" header="Documento" sortable>
                    <template #body="slotProps">
                        <span>{{ slotProps.data.persona?.documento || '-' }}</span>
                    </template>
                </Column>
                
                <Column field="tipotutoria" header="Tipo tutoría" sortable>
                    <template #body="slotProps">
                        <span>{{ getTipoTutoriaLabel(slotProps.data.tipotutoria) }}</span>
                    </template>
                </Column>

                <Column field="horas_totales" header="Horas" sortable>
                    <template #body="slotProps">
                        <span>{{ slotProps.data.horas_totales || 0 }}</span>
                    </template>
                </Column>
                
                <Column header="" :exportable="false">
                    <template #body="slotProps">
                        <div class="table-actions">
                            <Button 
                                label="Eliminar" 
                                size="small"
                                outlined
                                @click="() => confirmDelete(slotProps.data)"
                            />
                            <Button 
                                label="Editar" 
                                size="small" 
                                outlined 
                                @click="() => editDocenteHandler(slotProps.data)"
                            />
                            <a :href="`/personas/${slotProps.data.persona.id_persona}`">
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
        </template>
    </ReusableArticle>

    <!-- Diálogo para añadir docente -->
    <ReusableDialog 
        v-model:visible="showAddDocenteModal" 
        title="Añadir docente al grupo"
        :form-component="GrupoDocentesForm"
        :form-data="formData"
        @save="handleSaveDocente"
        @cancel="handleCancelDocente"
    />

    <!-- Diálogo para editar docente -->
    <ReusableDialog 
        v-model:visible="showEditDocenteModal" 
        title="Editar docente del grupo"
        :form-component="GrupoDocentesForm"
        :form-data="formData"
        @save="handleUpdateDocente"
        @cancel="handleCancelEditDocente"
    />

    <!-- Diálogo de confirmación para eliminar -->
    <ReusableDialog
        v-model:visible="showDeleteDialog"
        title="Confirmar eliminación"
        :dialog-type="'confirmation'"
        :message="`¿Estás seguro de que quieres eliminar a ${docenteToDelete?.persona?.nombre} ${docenteToDelete?.persona?.apellido1} del grupo?`"
        :confirm-label="'Eliminar'"
        :cancel-label="'Cancelar'"
        :confirm-severity="'danger'"
        :confirm-loading="docentesLoading"
        @confirm="deleteDocente"
        @cancel="cancelDelete"
    />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocentesGrupo } from '@/composables/useDocentesGrupo.js'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import GrupoDocentesForm from './GrupoDocentesForm.vue'
import { useToast } from 'primevue/usetoast'
import { 
    getTipoTutoriaLabel
} from '@/utils/enums.js'

const props = defineProps({
    grupoId: {
        type: [String, Number],
        required: true
    },
    modalidad: {
        type: String,
        required: true
    },
})

const router = useRouter()
const toast = useToast()

// Estados para docentes
const { docentes, loading: docentesLoading, error: docentesError, fetchDocentesConHoras, removeDocente, addDocente, editDocente: updateDocente } = useDocentesGrupo()
const showAddDocenteModal = ref(false)
const showEditDocenteModal = ref(false)
const showDeleteDialog = ref(false)
const docenteToDelete = ref(null)
const docenteToEdit = ref(null)
const menu = ref()

const formData = ref({
    id_persona: null,
    tutoria: true,
    tipotutoria: null,
    modalidad: props.modalidad,
    descripcion: null
})

const loadDocentes = async () => {
    if (!props.grupoId) return
    try {
        await fetchDocentesConHoras(props.grupoId, props.modalidad)
    } catch (error) {
        console.error('Error al cargar docentes:', error)
    }
}

const getNombreCompleto = (persona) => {
    if (!persona) return '-'
    const nombre = persona.nombre || ''
    const apellido1 = persona.apellido1 || ''
    const apellido2 = persona.apellido2 || ''
    return `${nombre} ${apellido1} ${apellido2}`.trim() || '-'
}

const confirmDelete = (docente) => {
    docenteToDelete.value = docente
    showDeleteDialog.value = true
}

const deleteDocente = async () => {
    if (!docenteToDelete.value) return
    
    try {
        await removeDocente(docenteToDelete.value.id_docente_grupo)
        toast.add({
            severity: 'success',
            summary: 'Docente eliminado',
            detail: 'El docente ha sido eliminado del grupo correctamente',
            life: 3000
        })
        showDeleteDialog.value = false
        docenteToDelete.value = null
    } catch (error) {
        console.error('Error al eliminar docente:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el docente del grupo',
            life: 3000
        })
    }
}

const cancelDelete = () => {
    showDeleteDialog.value = false
    docenteToDelete.value = null
}

const editDocenteHandler = (docente) => {
    console.log('Editando docente:', docente)
    console.log('ID del docente:', docente.id_docente_grupo)
    console.log('Nombre del docente:', docente.persona?.nombre, docente.persona?.apellido1)
    
    docenteToEdit.value = docente
    // Preparar los datos del formulario con los datos del docente
    formData.value = {
        id_persona: docente.id_persona,
        tutoria: docente.tutoria,
        tipotutoria: docente.tipotutoria,
        modalidad: props.modalidad,
        descripcion: docente.descripcion
    }
    console.log('Datos del formulario preparados:', formData.value)
    showEditDocenteModal.value = true
}

const viewDocente = (docente) => {
    router.push(`/personas/${docente.persona.id_persona}`)
}

const handleSaveDocente = async (docenteData) => {
    try {
        const docenteToCreate = {
            id_persona: docenteData.id_persona,
            id_grupo: props.grupoId,
            tutoria: docenteData.tutoria,
            tipotutoria: docenteData.tipotutoria,
            modalidad: props.modalidad,
            descripcion: docenteData.descripcion
        }
        
        await addDocente(docenteToCreate)
        
        toast.add({
            severity: 'success',
            summary: 'Docente añadido',
            detail: 'El docente ha sido añadido al grupo correctamente',
            life: 3000
        })
        
        showAddDocenteModal.value = false
        await loadDocentes()
    } catch (error) {
        console.error('Error al guardar docente:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo añadir el docente al grupo',
            life: 3000
        })
    }
}

const handleCancelDocente = () => {
    showAddDocenteModal.value = false
    formData.value = {
        id_persona: null,
        tutoria: true,
        tipotutoria: null,
        modalidad: props.modalidad,
        descripcion: null
    }
}

const handleUpdateDocente = async (docenteData) => {
    if (!docenteToEdit.value) return
    
    try {
        const docenteToUpdate = {
            id_persona: docenteData.id_persona,
            tutoria: docenteData.tutoria,
            tipotutoria: docenteData.tipotutoria,
            modalidad: props.modalidad,
            descripcion: docenteData.descripcion
        }
        
        await updateDocente(docenteToEdit.value.id_docente_grupo, docenteToUpdate)
        
        toast.add({
            severity: 'success',
            summary: 'Docente actualizado',
            detail: 'El docente ha sido actualizado correctamente',
            life: 3000
        })
        
        showEditDocenteModal.value = false
        docenteToEdit.value = null
        await loadDocentes()
    } catch (error) {
        console.error('Error al actualizar docente:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el docente',
            life: 3000
        })
    }
}

const handleCancelEditDocente = () => {
    showEditDocenteModal.value = false
    docenteToEdit.value = null
    formData.value = {
        id_persona: null,
        tutoria: true,
        tipotutoria: null,
        modalidad: props.modalidad,
        descripcion: null
    }
}

onMounted(async () => {
    await loadDocentes()
})
</script>
