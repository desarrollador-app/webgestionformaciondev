<template>
    <section>
        <div class="section-header">
            <div class="section-header__main section-main">
                <h1 class="section-main__title">Personas</h1>
            </div>
            <div class="section-header__actions">
                <Button label="Subida masiva" @click="showImportDialog = true" outlined/>
                <Button label="Añadir persona" @click="showModal = true"/>
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
                <label for="alumno-filter">Es Alumno</label>
                <Select 
                    id="alumno-filter"
                    v-model="filters['es_alumno'].value" 
                    :options="alumnoOptions"
                    optionLabel="label"
                    optionValue="value"
                    showClear
                />
            </div>
            <div class="table-filters__group filter">
                <label for="docente-filter">Es Docente</label>
                <Select 
                    id="docente-filter"
                    v-model="filters['es_docente'].value" 
                    :options="docenteOptions"
                    optionLabel="label"
                    optionValue="value"
                    showClear
                />
            </div>
        </div>

        <div v-if="error" class="error-message">
            <p>Error al cargar las personas: {{ error }}</p>
            <Button label="Reintentar" @click="fetchPersonas" />
        </div>

        <!-- Añado la función sortField y :sortOrder= para que salga ordenado direntamente la tabla apellido1 -->
        <DataTable 
            :value="personas" 
            sortField="apellido1"
            :sortOrder="1"
            :paginator="personas.length > 25"
            :rows="25"
            v-model:filters="filters"
            :globalFilterFields="['nombre', 'apellido1', 'apellido2', 'documento', 'NSS', 'es_docente', 'es_alumno']"
            dataKey="id_persona"
            :loading="loading"
        >
            <Column field="nombre" header="Nombre" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.nombre }}</span>
                </template>
            </Column>
            
            <Column field="apellido1" header="Apellido 1" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.apellido1 }}</span>
                </template>
            </Column>
            
            <Column field="apellido2" header="Apellido 2" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.apellido2 || '-' }}</span>
                </template>
            </Column>
            
            <Column field="documento" header="Documento" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.documento }}</span>
                </template>
            </Column>
            
            <Column field="NSS" header="NSS" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.NSS || '-' }}</span>
                </template>
            </Column>
            
            <Column field="es_alumno" header="Alumno" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.es_alumno ? 'Sí' : 'No' }}</span>
                </template>
            </Column>
            
            <Column field="es_docente" header="Docente" sortable>
                <template #body="slotProps">
                    <span>{{ slotProps.data.es_docente ? 'Sí' : 'No' }}</span>
                </template>
            </Column>
            
            <Column header="" :exportable="false">
                <template #body="slotProps">
                    <div class="table-actions">
                       <a :href="`/personas/${slotProps.data.id_persona}`">
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
            v-model:visible="showImportDialog" 
            title="Subida masiva de personas"
            dialog-type="confirmation"
            confirm-label="Importar"
            cancel-label="Cancelar"
            :confirm-disabled="!selectedFile || importing"
            :confirm-loading="importing"
            @confirm="importExcel"
            @cancel="closeImportDialog"
        >
            <template #content>
                <div>
                    <div>
                        <h4>Instrucciones:</h4>
                        <p>
                            El archivo debe ser un Excel (.xls o .xlsx)<br/>
                            Debe contener las siguientes columnas: nif, nss, nombre, apellido1, apellido2, nacimiento, sexo, correo_electronico, estudios, discapacidad, telefono fijo, telefono movil, dirección, localidad, codigo postal<br/>
                            Los campos obligatorios son: nif, nombre, apellido1<br/>
                            Tamaño máximo: 10MB<br/>
                        </p>
                    </div>

                    <div>
                        <FileUpload 
                            name="excelFile"
                            accept=".xls,.xlsx"
                            :maxFileSize="10000000"
                            :auto="false"
                            chooseLabel="Seleccionar Excel"
                            uploadLabel="Subir Excel"
                            cancelLabel="Cancelar"
                            removeLabel="Eliminar"
                            clearLabel="Limpiar"
                            browseLabel="Explorar"
                            @select="onFileSelect"
                            :showUploadButton="false"
                            :showCancelButton="false"
                        >
                            <template #empty>
                                <span>No se ha seleccionado ningún archivo</span>
                            </template>
                        </FileUpload>
                    </div>

                    <div v-if="importResult">
                        <h4>Resultado de la importación:</h4>
                        <div>
                            <div>
                                <span>Total filas: {{ importResult.estadisticas.totalFilas }}</span>
                            </div>
                            <div>
                                <span>Personas creadas: {{ importResult.estadisticas.personasCreadas }}</span>
                            </div>
                            <div>
                                <span>Duplicadas: {{ importResult.estadisticas.personasDuplicadas }}</span>
                            </div>
                            <div v-if="importResult.estadisticas.errores > 0">
                                <span>Errores: {{ importResult.estadisticas.errores }}</span>
                            </div>
                        </div>

                        <div v-if="importResult.errores && importResult.errores.length > 0">
                            <h5>Errores encontrados:</h5>
                            <div>
                                <div v-for="error in importResult.errores" :key="error.fila || error.documento">
                                    <strong>Fila {{ error.fila || error.documento }}:</strong>
                                    <ul>
                                        <li v-for="err in error.errores" :key="err">{{ err }}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </ReusableDialog>

        <ReusableDialog 
            v-model:visible="showModal" 
            title="Nueva persona"
            :form-component="PersonaForm"
            @save="handleSavePersona"
            @cancel="handleCancelPersona"
        />
    </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import FileUpload from 'primevue/fileupload'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import PersonaForm from './PersonaForm.vue'
import { usePersonas } from '@/composables/usePersonas.js'
import { createPersona, importarPersonasExcel } from '@/services/personasService.js'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const { personas, loading, error, fetchPersonas } = usePersonas()
const toast = useToast()

const showModal = ref(false)

const filters = ref({
    global: { value: null },
    es_alumno: { value: null },
    es_docente: { value: null }
})

const alumnoOptions = ref([
    { label: 'Sí', value: true },
    { label: 'No', value: false }
])

const docenteOptions = ref([
    { label: 'Sí', value: true },
    { label: 'No', value: false }
])

const showImportDialog = ref(false)
const selectedFile = ref(null)
const importing = ref(false)
const importResult = ref(null)

const viewPersona = (personaId) => {
    router.push(`/personas/${personaId}`)
}

const handleSavePersona = async (personaData) => {
    try {        
        const newPersona = await createPersona(personaData)
        showModal.value = false
        toast.add({
            severity: 'success',
            summary: 'Persona creada',
            detail: 'La persona se ha creado exitosamente',
            life: 3000
        })
        personas.value.unshift(newPersona)
    } catch (error) {
        console.error('Error al crear la persona:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al crear la persona',
            detail: 'Error al crear la persona',
            life: 3000
        })
    }
}

const handleCancelPersona = () => {
    showModal.value = false
}

const onFileSelect = (event) => {
    selectedFile.value = event.files[0]
    importResult.value = null
}

const importExcel = async () => {
    if (!selectedFile.value) return

    importing.value = true
    importResult.value = null

    try {
        const result = await importarPersonasExcel(selectedFile.value)
        
        importResult.value = result
        toast.add({
            severity: 'success',
            summary: 'Importación exitosa',
            detail: `Se importaron ${result.estadisticas.personasCreadas} personas correctamente`,
            life: 5000
        })
        
        await fetchPersonas()
        
        // Cerrar el diálogo solo si la importación fue exitosa
        showImportDialog.value = false
    } catch (error) {
        console.error('Error al importar Excel:', error)
        
        // Manejar errores del backend
        if (error.response && error.response.data) {
            const errorData = error.response.data
            importResult.value = errorData
            
            toast.add({
                severity: 'error',
                summary: 'Error en la importación',
                detail: errorData.error || 'Error desconocido durante la importación',
                life: 5000
            })
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error de conexión',
                detail: error.message || 'No se pudo conectar con el servidor',
                life: 5000
            })
        }
        // No cerrar el diálogo si hay errores para que el usuario pueda ver los detalles
    } finally {
        importing.value = false
    }
}

const closeImportDialog = () => {
    showImportDialog.value = false
    selectedFile.value = null
    importResult.value = null
}
</script>