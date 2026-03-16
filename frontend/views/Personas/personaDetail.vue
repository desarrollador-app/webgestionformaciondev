<template>
    <section v-if="persona">
        <div class="section-header">
            <div class="section-header__main section-main">
                <h1 class="section-main__title">{{ persona.nombre }} {{ persona.apellido1 }} {{ persona.apellido2 || '' }}</h1>
            </div>
        </div>

        <ReusableArticle 
            title="Datos de la persona" 
            :list-data="allData"
        >
            <template #header-action>
                <Button label="Editar" @click="showEditModal = true" />
            </template>
        </ReusableArticle>

        <ReusableArticle 
            title="Cursos en los que ha participado"
        >
        <template #table>
            <DataTable :value="persona.alumnosPersonaGrupo" v-if="persona.alumnosPersonaGrupo && persona.alumnosPersonaGrupo.length > 0">
                <Column field="grupo.denominacion" header="Denominación" sortable></Column>
                <Column field="grupo.fecha_inicio" header="Inicio" sortable>
                    <template #body="slotProps">
                        {{ slotProps.data.grupo.fecha_inicio ? formatDateToDDMMYYYY(slotProps.data.grupo.fecha_inicio) : '-' }}
                    </template>
                </Column>
                <Column field="grupo.fecha_fin" header="Fin" sortable>
                    <template #body="slotProps">
                        {{ slotProps.data.grupo.fecha_fin ? formatDateToDDMMYYYY(slotProps.data.grupo.fecha_fin) : '-' }}
                    </template>
                </Column>
                <Column field="grupo.codigo" header="Código" sortable></Column>
                <Column field="grupo.estado" header="Estado" sortable></Column>
                <Column header="">
                    <template #body="slotProps">
                        <Button label="Ver" @click="viewCurso(slotProps.data.grupo.id_grupo)" outlined />
                    </template>
                </Column>
            </DataTable>
            <div v-else class="empty-state">
                No hay cursos en los que haya participado.
            </div>
        </template>
    </ReusableArticle>

    <ReusableArticle 
        title="Cursos que ha impartido"
    >
        <template #table>
            <DataTable :value="persona.docentesPersonaGrupo" v-if="persona.docentesPersonaGrupo && persona.docentesPersonaGrupo.length > 0">
                <Column field="grupo.denominacion" header="Denominación" sortable></Column>
                <Column field="grupo.fecha_inicio" header="Inicio" sortable>
                    <template #body="slotProps">
                        {{ slotProps.data.grupo.fecha_inicio ? formatDateToDDMMYYYY(slotProps.data.grupo.fecha_inicio) : '-' }}
                    </template>
                </Column>
                <Column field="grupo.fecha_fin" header="Fin" sortable>
                    <template #body="slotProps">
                        {{ slotProps.data.grupo.fecha_fin ? formatDateToDDMMYYYY(slotProps.data.grupo.fecha_fin) : '-' }}
                    </template>
                </Column>
                <Column field="grupo.codigo" header="Código" sortable></Column>
                <Column field="grupo.estado" header="Estado" sortable></Column>
                <Column header="">
                    <template #body="slotProps">
                        <Button label="Ver" @click="viewCurso(slotProps.data.grupo.id_grupo)" outlined />
                    </template>
                </Column>
            </DataTable>
            <div v-else class="empty-state">
                No hay cursos que haya impartido.
            </div>
        </template>
    </ReusableArticle>
        
        <!-- Documentación del alumno -->
        <DocumentacionAlumno 
            v-if="persona.es_alumno"
            :persona-id="persona.id_persona"
        />

        <!-- Documentación del docente -->
        <DocumentacionDocente 
            v-if="persona.es_docente"
            :persona-id="persona.id_persona"
        />

        <ReusableDialog 
            v-model:visible="showEditModal" 
            title="Editar persona"
            :form-component="PersonaForm"
            :form-data="persona"
            @save="handleUpdatePersona"
            @cancel="handleCancelEdit"
        />
    </section>

    <div v-else-if="loading" class="loading">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Cargando persona...</p>
    </div>

    <div v-else class="not-found">
        <h2>Persona no encontrada</h2>
        <p>La persona que buscas no existe o ha sido eliminada.</p>
        <Button label="Volver a personas" @click="$router.push('/personas')" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '@/stores/main.js'
import { getPersonaById, updatePersona } from '@/services/personasService.js'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import PersonaForm from './PersonaForm.vue'
import DocumentacionAlumno from './DocumentacionAlumno/DocumentacionAlumno.vue'
import  DocumentacionDocente from './DocumentacionDocente/DocumentacionDocente.vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'
import { formatDateToDDMMYYYY } from '@/utils/functions.js'

const route = useRoute()
const store = useStore()
const toast = useToast()

const persona = ref(null)
const loading = ref(true)
const showEditModal = ref(false)

const allData = computed(() => {
    if (!persona.value) return {}
    
    return {
        'Tipo de documento': persona.value.tipoDocumento || '-',
        'Documento': persona.value.documento || '-',
        'Nombre completo': `${persona.value.nombre || ''} ${persona.value.apellido1 || ''} ${persona.value.apellido2 || ''}`.trim(),
        'Teléfono': persona.value.telefono || '-',
        'Correo electrónico': persona.value.correoElectronico || '-',
        'NSS': persona.value.NSS || '-',
        'Fecha de nacimiento': persona.value.fecha_nacimiento ? new Date(persona.value.fecha_nacimiento).toLocaleDateString('es-ES') : '-',
        'Sexo': persona.value.sexo || '-',
        'Domicilio': persona.value.domicilio || '-',
        'Nivel de estudios': getNivelEstudiosLabel(persona.value.nivel_estudios),
        'Es docente': persona.value.es_docente ? 'Sí' : 'No',
        'Es alumno': persona.value.es_alumno ? 'Sí' : 'No',
        'Discapacidad': persona.value.discapacidad ? 'Sí' : 'No',
        'Afectados por terrorismo': persona.value.afectadosTerrorismo ? 'Sí' : 'No',
        'Afectados por violencia de género': persona.value.afectadosViolenciaGenero ? 'Sí' : 'No',
        'Comentarios': persona.value.comentarios || 'No especificados'
    }
})

const getNivelEstudiosLabel = (nivel) => {
    const niveles = {
        0: 'Sin estudios',
        1: 'Educación Primaria',
        2: 'Educación Secundaria Obligatoria',
        3: 'Bachillerato',
        4: 'Formación Profesional Grado Medio',
        5: 'Formación Profesional Grado Superior',
        6: 'Grado Universitario',
        7: 'Máster',
        8: 'Doctorado'
    }
    return nivel !== null && nivel !== undefined ? niveles[nivel] || '-' : '-'
}

const fetchPersona = async () => {
    try {
        loading.value = true
        const data = await getPersonaById(route.params.id)
        console.log('Datos de persona recibidos:', data)
        console.log('alumnosPersonaGrupo:', data.alumnosPersonaGrupo)
        console.log('docentesPersonaGrupo:', data.docentesPersonaGrupo)
        persona.value = data
        store.setActivePersona(data)
    } catch (error) {
        console.error('Error al cargar la persona:', error)
    } finally {
        loading.value = false
    }
}

const handleUpdatePersona = async (personaData) => {
    try {        
        const updatedPersona = await updatePersona(persona.value.id_persona, personaData)
        persona.value = updatedPersona
        store.setActivePersona(updatedPersona)
        showEditModal.value = false
        
        toast.add({
            severity: 'success',
            summary: 'Persona actualizada',
            detail: 'La persona se ha actualizado exitosamente',
            life: 3000
        })
    } catch (error) {
        console.error('Error al actualizar la persona:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al actualizar la persona',
            detail: 'Error al actualizar la persona',
            life: 3000
        })
    }
}

const handleCancelEdit = () => {
    showEditModal.value = false
}

const viewCurso = (grupoId) => {
    // Navegar al detalle del grupo
    window.open(`/grupos/${grupoId}`, '_blank')
}

onMounted(() => {
    fetchPersona()
})
</script>