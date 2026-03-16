import { ref } from 'vue'
import { getGroupUsers } from '../services/msGraphService.js'

export function useMsGraph() {
    const users = ref([])
    const groupInfo = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const fetchGroupUsers = async () => {
        loading.value = true
        error.value = null
        
        try {
            const response = await getGroupUsers()
            
            if (response.success) {
                users.value = response.data.users
                groupInfo.value = {
                    groupId: response.data.groupId,
                    totalUsers: response.data.totalUsers
                }
            } else {
                throw new Error(response.message || 'Error al obtener usuarios del grupo')
            }
        } catch (err) {
            error.value = err.message || 'Error al cargar usuarios del grupo'
            console.error('Error fetching group users:', err)
        } finally {
            loading.value = false
        }
    }

    return {
        users,
        groupInfo,
        loading,
        error,
        fetchGroupUsers
    }
}
