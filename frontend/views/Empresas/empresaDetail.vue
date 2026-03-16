<template>
    <section v-if="empresa">
        <div class="section-header">
            <div class="section-header__main section-main">
                <h1 class="section-main__title">{{ empresa.razon_social }}</h1>
                <div class="section-main__tags">
                    <Tag :value="empresa.resuelto ? 'Resuelto' : 'Pendiente'" :severity="empresa.resuelto ? 'success' : 'warning'" />
                </div>
            </div>
        </div>
        
        <ReusableArticle 
            title="Datos de la empresa" 
            :list-data="transformEmpresaData()"
        >
            <template #header-action>
                <Button label="Editar" @click="showEditModal = true" />
            </template>
        </ReusableArticle>
        
        <ReusableArticle 
            title="Listado de centros de trabajo de la empresa"
        >
            <template #header-action>
                <Button label="Crear centro" @click="showCentroModal = true" />
            </template>
            
            <template #table>
                <div v-if="centrosLoading" class="loading-message">
                    Cargando centros de trabajo...
                </div>
                <div v-else-if="centrosError" class="error-message">
                    <p>Error al cargar los centros de trabajo: {{ centrosError }}</p>
                    <Button label="Reintentar" @click="loadCentros" />
                </div>
                <div v-else-if="centros.length === 0" class="empty-state">
                    No hay centros de trabajo asociados a esta empresa
                </div>
                <div v-else>
                    <DataTable 
                        :value="centros" 
                        :paginator="centros.length > 25"
                        :rows="25"
                        dataKey="id_centro"
                        :loading="centrosLoading"
                    >
                        <Column field="nombre" header="Nombre" sortable>
                            <template #body="slotProps">
                                <span>{{ slotProps.data.nombre || '-' }}</span>
                            </template>
                        </Column>
                        
                        <Column field="direccion" header="Dirección" sortable>
                            <template #body="slotProps">
                                <span>{{ slotProps.data.direccion || '-' }}</span>
                            </template>
                        </Column>
                        
                        <Column field="persona_contacto" header="Contacto" sortable>
                            <template #body="slotProps">
                                <span>{{ slotProps.data.persona_contacto || '-' }}</span>
                            </template>
                        </Column>
                        
                        <Column header="" :exportable="false">
                            <template #body="slotProps">
                                <div class="table-actions">
                                    <Button 
                                        label="Editar" 
                                        size="small"
                                        outlined
                                        @click="editCentro(slotProps.data)"
                                    />
                                   
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </ReusableArticle>

        <ReusableDialog 
            v-model:visible="showEditModal" 
            title="Editar empresa"
            :form-component="EmpresaForm"
            :form-data="empresa"
            @save="handleUpdateEmpresa"
            @cancel="handleCancelEdit"
        />

        <!-- Documentación de la empresa -->
        <DocumentacionEmpresa 
            :empresa-id="empresa.id_empresa"
        />

        <ReusableDialog 
            v-model:visible="showCentroModal" 
            title="Crear centro de trabajo"
            :form-component="CentroTrabajoForm"
            :form-data="{}"
            @save="handleCreateCentro"
            @cancel="handleCancelCentro"
        />

        <ReusableDialog 
            v-model:visible="showEditCentroModal" 
            title="Editar centro de trabajo"
            :form-component="CentroTrabajoForm"
            :form-data="editCentroData"
            @save="handleUpdateCentro"
            @cancel="handleCancelEditCentro"
        />
    </section>
    <div v-else-if="loading">
        <p>Cargando empresa...</p>
    </div>
    <div v-else>
        <p>Empresa no encontrada</p>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '@/stores/main.js'
import { getEmpresaById, updateEmpresa } from '@/services/empresasService.js'
import { createCentroTrabajo, getAllCentrosTrabajo, updateCentroTrabajo } from '@/services/centrosTrabajoService.js'
import Tag from 'primevue/tag'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import EmpresaForm from './EmpresaForm.vue'
import CentroTrabajoForm from './CentroTrabajoForm.vue'
import DocumentacionEmpresa from './DocumentacionEmpresa/DocumentacionEmpresa.vue'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const store = useStore()
const toast = useToast()

const empresa = ref(null)
const loading = ref(false)
const error = ref(null)
const showEditModal = ref(false)
const showCentroModal = ref(false)
const showEditCentroModal = ref(false)
const editCentroData = ref({})

// Estados para la tabla de centros de trabajo
const centros = ref([])
const centrosLoading = ref(false)
const centrosError = ref(null)

const transformEmpresaData = () => {
    if (!empresa.value) return {}
    return {
        'Razón social': empresa.value.razon_social,
        'CIF': empresa.value.CIF || '-',
        'NSS': empresa.value.NSS || '-',
        'Dirección': empresa.value.direccion || '-',
        'Persona de contacto': empresa.value.persona_contacto || '-',
        'Teléfono 1': empresa.value.telefono1 || '-',
        'Teléfono 2': empresa.value.telefono2 || '-',
        'Fax': empresa.value.fax || '-',
        'Correo electrónico': empresa.value.correo_electronico || '-',
        'Página web': empresa.value.pagina_web || '-',
        'Sector de actividad': empresa.value.sector_actividad || '-',
        'CNAE': empresa.value.CNAE || '-',
        'CNAE 2009': empresa.value.CNAE2009 || '-',
        'Nombre del representante': empresa.value.nombre_representante || '-',
        'NIF del representante': empresa.value.NIF_representante || '-',
        'Informa RLT': empresa.value.informa_RLT || '-',
        'Valor del informe': empresa.value.valor_informe || '-',
        'Fecha de discrepancia': empresa.value.fecha_discrepancia ? new Date(empresa.value.fecha_discrepancia).toLocaleDateString() : '-',
        'Resuelto': empresa.value.resuelto ? 'Sí' : 'No',
        'Comentarios': empresa.value.comentarios || 'No especificados'
    }
}

const loadEmpresa = async (empresaId) => {
    loading.value = true
    error.value = null
    
    try {
        const empresaData = await getEmpresaById(empresaId)
        empresa.value = empresaData
        store.setActiveEmpresa(empresaData)
        await loadCentros(empresaId)
    } catch (err) {
        error.value = 'Error al cargar la empresa'
        console.error('Error loading empresa:', err)
    } finally {
        loading.value = false
    }
}

const loadCentros = async (empresaId) => {
    if (!empresaId) return
    
    centrosLoading.value = true
    centrosError.value = null
    
    try {
        const centrosData = await getAllCentrosTrabajo(empresaId)
        centros.value = centrosData
    } catch (err) {
        centrosError.value = 'Error al cargar los centros de trabajo'
        console.error('Error loading centros:', err)
    } finally {
        centrosLoading.value = false
    }
}

const handleUpdateEmpresa = async (empresaData) => {
    try {
        const updatedEmpresa = await updateEmpresa(empresa.value.id_empresa, empresaData)
        
        empresa.value = updatedEmpresa
        store.setActiveEmpresa(updatedEmpresa)
        showEditModal.value = false
        
        toast.add({
            severity: 'success',
            summary: 'Empresa actualizada',
            detail: 'La empresa se ha actualizado exitosamente',
            life: 3000
        })
    } catch (error) {
        console.error('Error al actualizar la empresa:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al actualizar la empresa',
            detail: 'Error al actualizar la empresa',
            life: 3000
        })
    }
}

const handleCancelEdit = () => {
    showEditModal.value = false
}

const handleCreateCentro = async (centroData) => {
    try {
        const centroToCreate = {
            ...centroData,
            id_empresa: empresa.value.id_empresa
        }
        console.log(centroToCreate)
        const nuevoCentro = await createCentroTrabajo(centroToCreate)
        showCentroModal.value = false  
        centros.value.unshift(nuevoCentro)
        
        toast.add({
            severity: 'success',
            summary: 'Centro de trabajo creado',
            detail: 'El centro de trabajo se ha creado exitosamente',
            life: 3000
        })
        
    } catch (error) {
        console.error('Error al crear el centro de trabajo:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al crear centro',
            detail: 'No se pudo crear el centro de trabajo',
            life: 3000
        })
    }
}

const handleCancelCentro = () => {
    showCentroModal.value = false
}

const editCentro = (centroData) => {
    editCentroData.value = { ...centroData }
    showEditCentroModal.value = true
}

const handleUpdateCentro = async (centroData) => {
    try {
        const updatedCentro = await updateCentroTrabajo(editCentroData.value.id_centro, centroData)
        
        // Actualizar el centro en la lista local
        const index = centros.value.findIndex(c => c.id_centro === editCentroData.value.id_centro)
        if (index !== -1) {
            centros.value[index] = updatedCentro
        }
        
        showEditCentroModal.value = false
        editCentroData.value = {}
        
        toast.add({
            severity: 'success',
            summary: 'Centro actualizado',
            detail: 'El centro de trabajo se ha actualizado exitosamente',
            life: 3000
        })
    } catch (error) {
        console.error('Error al actualizar el centro de trabajo:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al actualizar centro',
            detail: 'No se pudo actualizar el centro de trabajo',
            life: 3000
        })
    }
}

const handleCancelEditCentro = () => {
    showEditCentroModal.value = false
    editCentroData.value = {}
}

onMounted(async () => {
    const empresaId = route.params.id
    if (store.activeEmpresa && store.activeEmpresa.id_empresa == empresaId) {
        empresa.value = store.activeEmpresa
        await loadCentros(empresaId)
    } else {
        await loadEmpresa(empresaId)
    }
})
</script>
