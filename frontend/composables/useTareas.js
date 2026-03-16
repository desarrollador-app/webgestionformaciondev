import { ref, onMounted } from 'vue'
import { getAllTareas, deleteTarea, updateTarea } from '../services/tareasService.js'
import { ESTADO_TAREA } from '../utils/enums.js'

export function useTareas() {
    const tareas = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchTareas = async () => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getAllTareas()
            tareas.value = data
        } catch (err) {
            error.value = err.message || 'Error al cargar las tareas'
            console.error('Error fetching tareas:', err)
        } finally {
            loading.value = false
        }
    }

    const removeTarea = async (id) => {
        try {
            await deleteTarea(id)
            await fetchTareas()
        } catch (err) {
            error.value = err.message || 'Error al eliminar la tarea'
            console.error('Error deleting tarea:', err)
            throw err
        }
    }

    const completeTarea = async (id) => {
        try {
            await updateTarea(id, { estado: ESTADO_TAREA.COMPLETA })
            await fetchTareas()
        } catch (err) {
            error.value = err.message || 'Error al completar la tarea'
            console.error('Error completing tarea:', err)
            throw err
        }
    }

    const updateTareaData = async (id, tareaData) => {
        try {
            await updateTarea(id, tareaData)
            await fetchTareas()
        } catch (err) {
            error.value = err.message || 'Error al actualizar la tarea'
            console.error('Error updating tarea:', err)
            throw err
        }
    }

    onMounted(() => {
        fetchTareas()
    })

    return {
        tareas,
        loading,
        error,
        fetchTareas,
        removeTarea,
        completeTarea,
        updateTareaData
    }
}
