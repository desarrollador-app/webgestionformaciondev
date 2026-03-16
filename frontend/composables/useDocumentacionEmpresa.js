import { ref, onMounted } from 'vue'
import { getAllDocumentacionEmpresa, createDocumento, deleteDocumento } from '../services/documentacionEmpresaService.js'

export function useDocumentacionEmpresa(empresaId = null) {
    const documentacion = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchDocumentacion = async (filters = {}) => {
        loading.value = true
        error.value = null
        
        try {
            const mergedFilters = { ...filters }
            if (empresaId) {
                mergedFilters.id_empresa = empresaId
            }
            const data = await getAllDocumentacionEmpresa(mergedFilters)
            documentacion.value = data
        } catch (err) {
            error.value = err.message || 'Error al cargar la documentación'
            console.error('Error fetching documentacion:', err)
        } finally {
            loading.value = false
        }
    }

    const addDocumento = async (documentoData) => {
        try {
            const newDocumento = await createDocumento(documentoData)
            documentacion.value.unshift(newDocumento)
            return newDocumento
        } catch (err) {
            error.value = err.message || 'Error al crear el documento'
            throw err
        }
    }

    const removeDocumento = async (documentoId) => {
        try {
            await deleteDocumento(documentoId)
            documentacion.value = documentacion.value.filter(doc => doc.id_documento !== documentoId)
        } catch (err) {
            error.value = err.message || 'Error al eliminar el documento'
            throw err
        }
    }

    onMounted(() => {
        if (empresaId) {
            fetchDocumentacion()
        }
    })

    return {
        documentacion,
        loading,
        error,
        fetchDocumentacion,
        addDocumento,
        removeDocumento
    }
}
