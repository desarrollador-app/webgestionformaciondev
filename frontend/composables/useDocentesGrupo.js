import { ref } from 'vue'
import { getDocentesByGrupo, getDocentesGrupoConHoras, createDocentePersonaGrupo, updateDocentePersonaGrupo, deleteDocentePersonaGrupo } from '@/services/docentesPersonaGrupoService.js'

export const useDocentesGrupo = () => {
    const docentes = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchDocentes = async (grupoId, modalidad = null) => {
        loading.value = true
        error.value = null
        
        try {
            const docentesData = await getDocentesByGrupo(grupoId, modalidad)
            docentes.value = docentesData
        } catch (err) {
            error.value = 'Error al cargar los docentes'
            console.error('Error loading docentes:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchDocentesConHoras = async (grupoId, modalidad = null) => {
        loading.value = true
        error.value = null
        
        try {
            const docentesData = await getDocentesGrupoConHoras(grupoId, modalidad)
            docentes.value = docentesData
        } catch (err) {
            error.value = 'Error al cargar los docentes con horas'
            console.error('Error loading docentes con horas:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const addDocente = async (docenteData) => {
        try {
            const newDocente = await createDocentePersonaGrupo(docenteData)
            docentes.value.push(newDocente)
            return newDocente
        } catch (err) {
            console.error('Error al añadir docente:', err)
            throw err
        }
    }

    const editDocente = async (id, docenteData) => {
        try {
            const updatedDocente = await updateDocentePersonaGrupo(id, docenteData)
            const index = docentes.value.findIndex(docente => docente.id_docente_grupo === id)
            if (index !== -1) {
                docentes.value[index] = updatedDocente
            }
            return updatedDocente
        } catch (err) {
            console.error('Error al editar docente:', err)
            throw err
        }
    }

    const removeDocente = async (id) => {
        try {
            await deleteDocentePersonaGrupo(id)
            docentes.value = docentes.value.filter(docente => docente.id_docente_grupo !== id)
        } catch (err) {
            console.error('Error al eliminar docente:', err)
            throw err
        }
    }

    return {
        docentes,
        loading,
        error,
        fetchDocentes,
        fetchDocentesConHoras,
        addDocente,
        editDocente,
        removeDocente
    }
}
