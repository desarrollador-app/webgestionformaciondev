import { ref } from 'vue'
import { getAlumnosByGrupo, createAlumnoPersonaGrupo, updateAlumnoPersonaGrupo, deleteAlumnoPersonaGrupo } from '@/services/alumnosPersonaGrupoService.js'

export const useAlumnosGrupo = () => {
    const alumnos = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchAlumnos = async (grupoId) => {
        loading.value = true
        error.value = null
        
        try {
            const alumnosData = await getAlumnosByGrupo(grupoId)
            alumnos.value = alumnosData
        } catch (err) {
            error.value = 'Error al cargar los alumnos'
            console.error('Error loading alumnos:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const addAlumno = async (alumnoData) => {
        try {
            //comprobar si ya está matriculado
            const yaMatriculado = alumnos.value.some(
                alumno => alumno.id_persona === alumnoData.id_persona
            )
            //Si ya está matriculado -> ERROR 409    
            if (yaMatriculado) {
                const error = new Error("Este alumno ya está matriculado")
                error.status = 409
                throw error
            }

            //Si no, añadir alumno
            const newAlumno = await createAlumnoPersonaGrupo(alumnoData)
            alumnos.value.push(newAlumno)

            return newAlumno

        } catch (err) {
            console.error('Error al añadir alumno:', err)
            throw err
        }
    }

    const editAlumno = async (id, alumnoData) => {
        try {
            const updatedAlumno = await updateAlumnoPersonaGrupo(id, alumnoData)
            const index = alumnos.value.findIndex(alumno => alumno.id_alumno_grupo === id)
            if (index !== -1) {
                alumnos.value[index] = updatedAlumno
            }
            return updatedAlumno
        } catch (err) {
            console.error('Error al editar alumno:', err)
            throw err
        }
    }

    const removeAlumno = async (id) => {
        try {
            await deleteAlumnoPersonaGrupo(id)
            alumnos.value = alumnos.value.filter(alumno => alumno.id_alumno_grupo !== id)
        } catch (err) {
            console.error('Error al eliminar alumno:', err)
            throw err
        }
    }

    return {
        alumnos,
        loading,
        error,
        fetchAlumnos,
        addAlumno,
        editAlumno,
        removeAlumno
    }
}
