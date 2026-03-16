<template>
    <section>
        <div class="section-header">
            <div class="section-header__main section-main">
                <h1 class="section-main__title">Planes</h1>
            </div>
            <div class="section-header__actions">
                <Button label="Nuevo Plan" @click="showModal = true" />
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
            <div class="table-filters__group filter">
                <label for="estado-select">Estado</label>
                <Select 
                    id="estado-select"
                    v-model="filters['estado'].value" 
                    :options="estados" 
                    showClear
                >
                    <template #option="slotProps">
                        <Tag :value="slotProps.option" :severity="getPlanStatusColor(slotProps.option)" />
                    </template>
                </Select>
            </div>
            <div class="table-filters__group filter">
                <label for="nombre-search">Nombre</label>
                <InputText 
                    id="nombre-search"
                    v-model="filters['nombre'].value" 
                    type="text" 
                    autocomplete="off"
                />
            </div>
            <div class="table-filters__group filter">
                <label for="solicitante-search">Solicitante</label>
                <InputText 
                    id="solicitante-search"
                    v-model="filters['solicitante'].value" 
                    type="text" 
                    autocomplete="off"
                />
            </div>
        </div>

        <div v-if="error" class="error-message">
            <p>Error al cargar los planes: {{ error }}</p>
            <Button label="Reintentar" @click="fetchPlans" />
        </div>

        <DataTable 
            :value="planes" 
            :paginator="planes.length > 25"
            :rows="25"
            v-model:filters="filters"
            :globalFilterFields="['expediente','estado', 'nombre', 'solicitante']"
            dataKey="expediente"
            :loading="loading"
        >
            <Column field="expediente" header="Expediente" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.expediente }}</span>
                </template>
            </Column>
            
            <Column field="estado" header="Estado" sortable>
                <template #body="slotProps">
                    <Tag 
                        :value="slotProps.data.estado" 
                        :severity="getPlanStatusColor(slotProps.data.estado)"
                    />
                </template>
            </Column>
            
            <Column field="nombre" header="Nombre" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.nombre }}</span>
                </template>
            </Column>
            
            <Column field="solicitante" header="Solicitante" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.solicitante }}</span>
                </template>
            </Column>
            
            <Column header="" :exportable="false">
                <template #body="slotProps">
                    <div class="table-actions">
                        <!-- BTN. con opción de abrir en nueva pestaña -->
                        <a href="/acciones-formativas" @click="store.setActivePlan(slotProps.data)">
                            <Button 
                                label="Acciones" 
                                size="small" 
                                outlined 
                            />
                        </a>
                        <!-- BTN. con opción de abrir en nueva pestaña -->
                        <a href="/grupos" @click="store.setActivePlan(slotProps.data)">
                            <Button 
                                label="Grupos" 
                                size="small" 
                                outlined 
                            />
                        </a>
                        <!-- BTN. con opción de abrir en nueva pestaña -->
                        <a :href="`/planes/${slotProps.data.id_plan}`">
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

        <!-- BTN. para abrir formulario -->
        <ReusableDialog 
            v-model:visible="showModal" 
            title="Nuevo plan"
            :form-component="PlanForm"
            @save="handleSavePlan"
            @cancel="handleCancelPlan"
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
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import PlanForm from './PlanForm.vue'
import { planEstadoMixin } from '@/utils/mixins.js'
import { usePlans } from '@/composables/usePlans.js'
import { createPlan } from '@/services/plansService.js'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const store = useStore()
const toast = useToast()

const { planes, loading, error, fetchPlans } = usePlans()

const showModal = ref(false)

const filters = ref({
    global: { value: null },
    estado: { value: null },
    nombre: { value: null },
    solicitante: { value: null }
})

const estados = ref(['Concedido', 'Solicitado', 'Cerrado', 'Reconfigurado'])

const handleSavePlan = async (planData) => {
    try {
        const newPlan = await createPlan(planData)
        showModal.value = false
        //Todo: reset form data
        toast.add({
            severity: 'success',
            summary: 'Plan creado',
            detail: 'El plan se ha creado exitosamente',
            life: 3000
        })
        planes.value.unshift(newPlan)
    } catch (error) {
        console.error('Error al crear el plan:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al crear el plan',
            detail: 'Error al crear el plan',
            life: 3000
        })
    }
}

const handleCancelPlan = () => {
    showModal.value = false
    //Todo: reset form data
}

const viewPlan = (planId) => {
    const plan = planes.value.find(p => p.id_plan === planId)
    if (plan) {
        store.setActivePlan(plan)
    }
    router.push(`/planes/${planId}`)
}

const viewAcciones = (plan) => {
    store.setActivePlan(plan)
    router.push('/acciones-formativas')
}

const viewGrupos = (plan) => {
    store.setActivePlan(plan)
    router.push('/grupos')
}

const { getPlanStatusColor } = planEstadoMixin.methods
</script>
