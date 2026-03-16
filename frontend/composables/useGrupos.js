import { ref, onMounted, computed } from 'vue'
import { getAllGrupos } from '../services/gruposService.js'

export function useGrupos() {
    const grupos = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchGrupos = async () => {
        loading.value = true
        error.value = null
        
        try {
            const data = await getAllGrupos()
            grupos.value = data
        } catch (err) {
            error.value = err.message || 'Error al cargar los grupos'
            console.error('Error fetching grupos:', err)
        } finally {
            loading.value = false
        }
    }

    const gruposActivos = computed(() => {
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        
        return grupos.value.filter(grupo => {
            if (!grupo.fecha_inicio || !grupo.fecha_fin) {
                return false
            }
            
            const fechaInicio = new Date(grupo.fecha_inicio)
            const fechaFin = new Date(grupo.fecha_fin)
            
            fechaInicio.setHours(0, 0, 0, 0)
            fechaFin.setHours(0, 0, 0, 0)
            
            return hoy >= fechaInicio && hoy <= fechaFin
        })
    })

    onMounted(() => {
        fetchGrupos()
    })

    return {
        grupos,
        gruposActivos,
        loading,
        error,
        fetchGrupos
    }
}
