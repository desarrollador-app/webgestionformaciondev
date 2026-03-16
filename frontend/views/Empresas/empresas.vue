<template>
    <section>
        <div class="section-header">
            <div class="section-header__main section-main">
                <h1 class="section-main__title">Empresas</h1>
            </div>
            <div class="section-header__actions">
                <Button label="Añadir empresa" @click="showModal = true"/>
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
        </div>

        <div v-if="error" class="error-message">
            <p>Error al cargar las empresas: {{ error }}</p>
            <Button label="Reintentar" @click="fetchEmpresas" />
        </div>

        <DataTable 
            :value="empresas" 
            :paginator="empresas.length > 25"
            :rows="25"
            v-model:filters="filters"
            :globalFilterFields="['razon_social', 'CIF', 'persona_contacto', 'correo_electronico']"
            dataKey="id_empresa"
            :loading="loading"
        >
            <Column field="razon_social" header="Razón Social" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.razon_social }}</span>
                </template>
            </Column>
            
            <Column field="CIF" header="CIF" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.CIF || '-' }}</span>
                </template>
            </Column>
            
            <Column field="persona_contacto" header="Persona Contacto" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.persona_contacto || '-' }}</span>
                </template>
            </Column>
            
            <Column field="correo_electronico" header="Email" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.correo_electronico || '-' }}</span>
                </template>
            </Column>
            
            <Column field="telefono1" header="Teléfono" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.telefono1 || '-' }}</span>
                </template>
            </Column>
            
            <Column header="" :exportable="false">
                <template #body="slotProps">
                    <div class="table-actions">
                        <a :href="`/empresas/${slotProps.data.id_empresa}`">
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

        <ReusableDialog 
            v-model:visible="showModal" 
            title="Nueva empresa"
            :form-component="EmpresaForm"
            @save="handleSaveEmpresa"
            @cancel="handleCancelEmpresa"
        />
    </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores/main.js'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import EmpresaForm from './EmpresaForm.vue'
import { useEmpresas } from '@/composables/useEmpresas.js'
import { createEmpresa } from '@/services/empresasService.js'
import { useToast } from 'primevue/usetoast'


const router = useRouter()
const store = useStore()
const toast = useToast()

const { empresas, loading, error, fetchEmpresas } = useEmpresas()

const showModal = ref(false)

const filters = ref({
    global: { value: null },
})

const handleSaveEmpresa = async (empresaData) => {
    try {
        const newEmpresa = await createEmpresa(empresaData)
        showModal.value = false
        toast.add({
            severity: 'success',
            summary: 'Empresa creada',
            detail: 'La empresa se ha creado exitosamente',
            life: 3000
        })
        empresas.value.unshift(newEmpresa)
    } catch (error) {
        console.error('Error al crear la empresa:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al crear la empresa',
            detail: 'Error al crear la empresa',
            life: 3000
        })
    }
}

const handleCancelEmpresa = () => {
    showModal.value = false
}

const viewEmpresa = (empresaId) => {
    const empresa = empresas.value.find(e => e.id_empresa === empresaId)
    if (empresa) {
        store.setActiveEmpresa(empresa)
    }
    router.push(`/empresas/${empresaId}`)
}
</script>