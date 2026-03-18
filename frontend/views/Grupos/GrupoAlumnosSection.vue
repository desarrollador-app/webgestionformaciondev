<template>
  
    <ReusableArticle 
        title="Alumnos"
    >
        <template #header-action>
            <!-- Button Añadir alumno -->
            <Button label="Añadir alumno" @click="showAddAlumnoModal = true" />

            <!-- Button Matricular Todos  -->
            <Button label="Matricular todos en Moodle" @click="matricularTodosAlumnosMoodle()" outlined/>

            <!-- Button Correo Bienvenida  -->
            <a :href="`/grupos/${props.grupoId}/correo-bienvenida`">
             <Button label="Correo de bienvenida" outlined />
            </a>
            <!-- Button Correo de diploma  -->
            <a :href="`/grupos/${props.grupoId}/correo-diploma`">
            <Button label="Correo de diploma" outlined />
            </a>
        </template>
        
        <!-- Añado la función sortField y :sortOrder= para que salga ordenado direntamente la tabla apellido1 -->
        <template #table id="tablaDatosAlumnos">
            <DataTable 
                :value="alumnos" 
                sortField="persona.apellido1"
                :sortOrder="1"
                :paginator="true" 
                :rows="filasVisibles"
                dataKey="id_alumno_grupo"
                :loading="alumnosLoading"
                emptyMessage="No hay alumnos en este grupo"
            >
            <!-- Creamos una columna para poner un número para facilitar el conteo -->
                <Column header="Nº"><template #body="slotProps">{{ slotProps.index + 1 }}</template></Column>
            <Column field="persona.apellido1" header="Primer Apellido" sortable></Column>
               <Column field="persona.apellido2" header="Segundo Apellido" sortable></Column>
                <Column field="persona.nombre" header="Nombre" sortable></Column>

    

             
                
                
                <Column field="persona.documento" header="Documento" sortable>
                    <template #body="slotProps">
                        <span>{{ slotProps.data.persona?.documento || '-' }}</span>
                    </template>
                </Column>
                
                <Column field="centro.empresa.razon_social" header="Centro de trabajo" sortable>
                    <template #body="slotProps">
                        <span>{{ slotProps.data.centro?.empresa?.razon_social + ' - ' + slotProps.data.centro?.nombre || '-' }}</span>
                    </template>
                </Column>
                
                <Column field="estado_curso" header="Estado en el curso" sortable>
                    <template #body="slotProps">
                        <Tag 
                            :value="getEstadoCursoLabel(slotProps.data.estado_curso)" 
                            :severity="getEstadoCursoColor(slotProps.data.estado_curso)" 
                        />
                    </template>
                </Column>
                
                <Column field="progreso_curso" header="Progreso en el curso" sortable>
                    <template #body="slotProps">
                        <span>{{ getProgresoCursoLabel(slotProps.data.progreso_curso) }}</span>
                    </template>
                </Column>
                
                <Column field="diploma" header="Diploma" sortable>
                    <template #body="slotProps">
                        <span>{{ getTipoDiplomaLabel(slotProps.data.diploma) }}</span>
                    </template>
                </Column>
                
                <Column field="jornada_laboral" header="Jornada laboral" sortable>
                    <template #body="slotProps">
                        <span>{{ slotProps.data.jornada_laboral ? 'Sí' : 'No' }}</span>
                    </template>
                </Column>
                
                <Column field="categoria_profesional" header="Categoría profesional" sortable>
                    <template #body="slotProps">
                        <span>{{ getCategoriaProfesionalLabel(slotProps.data.categoria_profesional) }}</span>
                    </template>
                </Column>
                
                <Column header="" :exportable="false">
                    <template #body="slotProps">
                        <div class="table-actions">
                             <Button 
                                label="Diploma" 
                                size="small" 
                                outlined
                                @click="() => descargarDiplomaIndividual(slotProps.data)"
                            />
                            <Button 
                                label="Eliminar" 
                                size="small" 
                                outlined
                                @click="() => confirmDelete(slotProps.data)"
                            />
                            <Button 
                                label="Editar" 
                                size="small" 
                                outlined 
                                @click="() => editAlumnoHandler(slotProps.data)"
                            />
                            <Button 
                                label="Matricular" 
                                size="small" 
                                outlined 
                                @click="() => matricularAlumno(slotProps.data)"
                            />
                            <a :href="`/personas/${slotProps.data.persona.id_persona}`">
                                <Button 
                                    label="Ver" 
                                    size="small" 
                                    outlined
                                />
                            </a>
                            
                        </div>
                    </template>
                </Column>
                <!-- Creamos un footer para poner los botones de ver 25 o ver todos -->
                    <template #footer>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
            <Button 
                label="Ver 25" 
                @click="filasVisibles = 25" 
                :severity="filasVisibles === 25 ? 'primary' : 'secondary'" 
                class="p-button-sm"
            />
            <Button 
                label="Ver Todos" 
                @click="filasVisibles = 9999" 
                :severity="filasVisibles > 25 ? 'primary' : 'secondary'" 
                class="p-button-sm"
            />
            <!-- Button para exportar a Excel -->
            <Button 
                label="Exportar Excel"
                style="margin-left: auto;"
                class="p-button-sm"
                @click="exportToExcel"
            />
             <Button 
                                    label="Descargar diplomas" 
                                    @click="descargarDiplomasMasivo"
                                    :loading ="descargandoDiplomas"
                                    size="small" 
                                    outlined
                                />
        </div>
    </template>
            </DataTable>
        </template>
    </ReusableArticle>

    <!-- Diálogo para añadir alumno -->
    <ReusableDialog 
        v-model:visible="showAddAlumnoModal" 
        title="Añadir alumno al grupo"
        :form-component="GrupoAlumnosForm"
        :form-data="formData"
        @save="handleSaveAlumno"
        @cancel="handleCancelAlumno"
    />

    <!-- Diálogo para editar alumno -->
    <ReusableDialog 
        v-model:visible="showEditAlumnoModal" 
        title="Editar alumno del grupo"
        :form-component="GrupoAlumnosForm"
        :form-data="formData"
        @save="handleUpdateAlumno"
        @cancel="handleCancelEditAlumno"
    />

    <!-- Diálogo de confirmación para eliminar -->
    <ReusableDialog
        v-model:visible="showDeleteDialog"
        title="Confirmar eliminación"
        :dialog-type="'confirmation'"
        :message="`¿Estás seguro de que quieres eliminar a ${alumnoToDelete?.persona?.nombre} ${alumnoToDelete?.persona?.apellido1} del grupo?`"
        :confirm-label="'Eliminar'"
        :cancel-label="'Cancelar'"
        :confirm-severity="'danger'"
        :confirm-loading="alumnosLoading"
        @confirm="deleteAlumno"
        @cancel="cancelarDeleteAlumno"
    />

    <!-- Diálogo de confirmación para matricular alumno individual -->
    <ReusableDialog
        v-model:visible="showMatricularDialog"
        title="Matricular alumno en Moodle"
        :dialog-type="'confirmation'"
        :confirm-label="'Matricular en Moodle'"
        :cancel-label="'Cancelar'"
        :confirm-severity="'primary'"
        :confirm-loading="moodleLoading"
        @confirm="confirmarMatricularAlumno"
        @cancel="cancelarMatricularAlumno"
    >
        <template #content>
            <p>¿Estás seguro de que quieres matricular a <strong>{{ alumnoToMatricular?.persona?.nombre }} {{ alumnoToMatricular?.persona?.apellido1 }}</strong> en el curso de Moodle?</p>
            <p><strong>NIF:</strong> {{ alumnoToMatricular?.persona?.documento }}</p>
            <p class="p-text-secondary">Se creará un usuario en Moodle con las credenciales generadas automáticamente.</p>
        </template>
    </ReusableDialog>

    <!-- Diálogo de confirmación para matricular todos los alumnos -->
    <ReusableDialog
        v-model:visible="showMatricularTodosDialog"
        title="Matricular todos los alumnos en Moodle"
        :dialog-type="'confirmation'"
        :confirm-label="'Matricular todos en Moodle'"
        :cancel-label="'Cancelar'"
        :confirm-severity="'primary'"
        :confirm-loading="moodleLoading"
        :confirm-disabled="!isConfiguracionValida()"
        @confirm="confirmarMatricularTodos"
        @cancel="cancelarMatricularTodos"
    >
        <template #content>
            <p>¿Estás seguro de que quieres matricular a <strong>todos los alumnos</strong> de este grupo en el curso de Moodle?</p>
            <p><strong>Total de alumnos:</strong> {{ alumnos.length }}</p>
            <p class="p-text-secondary">Se crearán usuarios en Moodle para los alumnos que no existan, con credenciales generadas automáticamente.</p>
            <div v-if="!isConfiguracionValida()">
                <div class="p-message p-message-warn">
                    <div class="p-message-wrapper">
                        <div class="p-message-text">
                            <strong>Configuración incompleta:</strong>
                            <ul>
                                <li v-for="error in getMensajesErrorConfiguracion()" :key="error">{{ error }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </ReusableDialog>

    <!-- Diálogo de resultados de matriculación -->
    <ReusableDialog
        v-model:visible="showResultadosDialog"
        title="Resultados de matriculación en Moodle"
        :width="'80vw'"
        :confirm-label="'Cerrar'"
        :confirm-severity="'primary'"
        :show-cancel="false"
        @confirm="cerrarResultadosDialog"
    >
        <template #content>
            <div v-if="resultados">
                <div class="p-mb-3">
                    <h4>Estadísticas</h4>
                    <div class="p-grid">
                        <div class="p-col-3">
                            <div class="p-card">
                                <div class="p-card-body">
                                    <h5>Total</h5>
                                    <p class="p-text-2xl p-mb-0">{{ resultados.estadisticas.total }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="p-col-3">
                            <div class="p-card">
                                <div class="p-card-body">
                                    <h5>Exitosos</h5>
                                    <p class="p-text-2xl p-mb-0 p-text-green-500">{{ resultados.estadisticas.exitosos }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="p-col-3">
                            <div class="p-card">
                                <div class="p-card-body">
                                    <h5>Fallidos</h5>
                                    <p class="p-text-2xl p-mb-0 p-text-red-500">{{ resultados.estadisticas.fallidos }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="p-col-3">
                            <div class="p-card">
                                <div class="p-card-body">
                                    <h5>Usuarios nuevos</h5>
                                    <p class="p-text-2xl p-mb-0 p-text-blue-500">{{ resultados.estadisticas.usuariosNuevos }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="resultados.resultados && resultados.resultados.length > 0" class="p-mb-3">
                    <h4>Resultados detallados</h4>
                    <DataTable :value="resultados.resultados" :paginator="resultados.resultados.length > 25" :rows="10">
                        <Column field="nombre" header="Alumno" />
                        <Column field="documento" header="NIF" />
                        <Column field="username" header="Usuario Moodle" />
                        <Column field="action" header="Acción">
                            <template #body="slotProps">
                                <Tag 
                                    :value="slotProps.data.action === 'new_user' ? 'Usuario creado' : 'Usuario existente'" 
                                    :severity="slotProps.data.action === 'new_user' ? 'success' : 'info'" 
                                />
                            </template>
                        </Column>
                        <Column field="message" header="Resultado" />
                    </DataTable>
                </div>

                <div v-if="resultados.errores && resultados.errores.length > 0">
                    <h4>Errores</h4>
                    <DataTable :value="resultados.errores" :paginator="resultados.errores.length > 25" :rows="10">
                        <Column field="nombre" header="Alumno" />
                        <Column field="error" header="Error" />
                    </DataTable>
                </div>
            </div>
        </template>
    </ReusableDialog>
</template>

<script setup>
import axios from 'axios'
import * as XLSX from "xlsx"; //importación de xlsx para btn de exportación a excel 
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAlumnosGrupo } from '@/composables/useAlumnosGrupo.js'
import { useMoodle } from '@/composables/useMoodle.js'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Menu from 'primevue/menu'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import GrupoAlumnosForm from './GrupoAlumnosForm.vue'
import { useToast } from 'primevue/usetoast'
import { 
    getEstadoCursoLabel,
    getProgresoCursoLabel,
    getTipoDiplomaLabel,
    getCategoriaProfesionalLabel,
    getEstadoCursoColor
} from '@/utils/enums.js'

const props = defineProps({
    grupoId: {
        type: [String, Number],
        required: true
    }
})

const router = useRouter()
const toast = useToast()

// Estados para alumnos
const { alumnos, loading: alumnosLoading, error: alumnosError, fetchAlumnos, removeAlumno, addAlumno, editAlumno: updateAlumno } = useAlumnosGrupo()

// Estados para Moodle
const { 
    loading: moodleLoading, 
    error: moodleError, 
    configuracion, 
    resultados, 
    verificarConfiguracion, 
    matricularTodosAlumnos: matricularTodosAlumnosMoodle, 
    matricularAlumno: matricularAlumnoMoodle, 
    isConfiguracionValida, 
    getMensajesErrorConfiguracion 
} = useMoodle()
const showAddAlumnoModal = ref(false)
const showEditAlumnoModal = ref(false)
const showDeleteDialog = ref(false)
const showMatricularDialog = ref(false)
const showMatricularTodosDialog = ref(false)
const showResultadosDialog = ref(false)
const alumnoToDelete = ref(null)
const alumnoToEdit = ref(null)
const alumnoToMatricular = ref(null)
const menu = ref()

const formData = ref({
    id_persona: null,
    id_centro: null,
    fecha_inscripcion: null,
    estado_curso: null,
    progreso_curso: null,
    diploma: null,
    jornada_laboral: false,
    fijo_discontinuo: false,
    categoria_profesional: null,
    ERTE: false
})

const loadAlumnos = async () => {
    if (!props.grupoId) return
    try {
        await fetchAlumnos(props.grupoId)
    } catch (error) {
        console.error('Error al cargar alumnos:', error)
    }
}
//NUEVAS FUNCIONES:DESCARGA DE DIPLOMAS
/**
 * Estado reactivo para controlar el "spinner" o indicador de carga
 * en el botón de descarga masiva
 */
const descargandoDiplomas = ref(false);
/**
 * Descarga el diploma de un alumno especifico en formato PDF
 * @param {Object} alumno - Datos del alumno seleccionado en la fila de la tabla.
 */
const descargarDiplomaIndiividual = async(alumno) => {
    try{
        //Solicitamos el archivo al backend indicando explicitamente que la respuesta será un Blob(achivo binario)
        const response =await axios.get(
            '/api/grupos/${props.grupoId}/alumnos/`${alumno.id_alumno_grupo}`/diploma',
            
            { responseType:'blob'}
        );
        //Covertimos los datos binarios en un objeto PDF reconocible por el navegador
        const blob = new Blob([response.data], {type: 'application/pdf'});
        const url = window.URL.createObjectURL(blob);
    
        //Construimos el nombre del archivo dinámicamente usando los datos del alumno
        const nombreAlumno = alumno.persona?.nombre || 'Alumno';
        const apellidoAlumno = alumno.persona?.apellido1 || '';
        //Reemplazamos los espacios por barras bajas para evitar nombres de archivo problemáticos
        const nombreArchivo ='Diploma_${nombrealumno}_${apellidoAlumno}.pdf'.replace(/\s+/g,'_');

        //Creamos un enlace <a> invisible, le asignamos la URL y forzamos el clic para iniciar la descarga
            const link = document.createElement('a');
            link.href = url;
            link.download =nombreArchivo;
            document.body.appendChild(link);
            link.click();

            //Borramos el enlace y liberamos la memoria del navegador
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            //Notificamos al usuario que la operacion ha sido un exito
            toast.add({
                severity:'success',
                summary:'Éxito',
                detail: 'Diploma descargado correctamente',
                life: 3000
            });

    }catch(error){
        console.error('Error al descargar diploma:',error);
        toast.add({
            severity:'error',
            summary:'error',
            detail:'No se pudo descargar el diploma',
            life:4000
        });
    }
};
/**
 * Validos (no dados de baja) del grupo actual
 */
const  descargarDiplomasMasivo = async () =>{
    //Activamos el estado de carga para bloquear el botón visualmente
    descargandoDiplomas.value = true;
    try{
        //Solicitamos el archivo comprimido al backend
        const response = await axios.get(
            '/api/grupos/${props.grupoId}/diplomas/masivo',
            {responseType:'blob'}
        );
        //En este caso convertimos la respuesta en un objeto ZIP
        const blob =new Blob([response.data],{type:'application/zip'});
        const url = window.URL.createObjectURL(blob);

        //Forzamos la descarga mediante el enlace <a> invisible
            const link =document.createElement('a');
            link.href= url;
            link.download ='Diplomas_grupo_${props.grupoId}.zip';

            document.body.appendChild(link);
            link.click();
            //limpieza de memoria
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.add({
                severity:'success',
                summary:'Exito',
                detail: 'Todos los diplomas fueron descargados correctamente',
                life:3000
            });
    }catch(error){
        console.error('Error al descargar diplomas masivos:', error);
        toast.add({
          severity:'error',
          summary:'Error',
          detail: 'No se pudieron descargar los diplomas del grupo',
          life:4000
        });
    }finally{
        //Ocurra lo que ocurra(éxito o error de red), nos aseguramos de apagar el spinner de carga
        descargandoDiplomas.value =false;

    }
};

const getNombreCompleto = (persona) => {
    if (!persona) return '-'
    const nombre = persona.nombre || ''
    const apellido1 = persona.apellido1 || ''
    const apellido2 = persona.apellido2 || ''
    return `${nombre} ${apellido1} ${apellido2}`.trim() || '-'
}

// La función getEstadoColor ahora se importa desde enums.js

const toggleMenu = (event) => {
    menu.value.toggle(event)
}

const confirmDelete = (alumno) => {
    alumnoToDelete.value = alumno
    showDeleteDialog.value = true
}

const deleteAlumno = async () => {
    if (!alumnoToDelete.value) return
    
    try {
        await removeAlumno(alumnoToDelete.value.id_alumno_grupo)
        toast.add({
            severity: 'success',
            summary: 'Alumno eliminado',
            detail: 'El alumno ha sido eliminado del grupo correctamente',
            life: 3000
        })
        showDeleteDialog.value = false
        alumnoToDelete.value = null
    } catch (error) {
        console.error('Error al eliminar alumno:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el alumno del grupo',
            life: 3000
        })
    }
}

const cancelarDeleteAlumno = () => {
    showDeleteDialog.value = false
    alumnoToDelete.value = null
}

const editAlumnoHandler = (alumno) => {
    console.log('Editando alumno:', alumno)
    console.log('ID del alumno:', alumno.id_alumno_grupo)
    console.log('Nombre del alumno:', alumno.persona?.nombre, alumno.persona?.apellido1)
    
    alumnoToEdit.value = alumno
    // Preparar los datos del formulario con los datos del alumno
    formData.value = {
        id_persona: alumno.id_persona,
        id_centro: alumno.id_centro,
        fecha_inscripcion: alumno.fecha_inscripcion ? new Date(alumno.fecha_inscripcion) : null,
        estado_curso: alumno.estado_curso,
        progreso_curso: alumno.progreso_curso,
        diploma: alumno.diploma,
        jornada_laboral: alumno.jornada_laboral,
        fijo_discontinuo: alumno.fijo_discontinuo,
        categoria_profesional: alumno.categoria_profesional,
        ERTE: alumno.ERTE
    }
    console.log('Datos del formulario preparados:', formData.value)
    showEditAlumnoModal.value = true
}

const matricularAlumno = async (alumno) => {
    alumnoToMatricular.value = alumno
    showMatricularDialog.value = true
}

const confirmarMatricularAlumno = async () => {
    if (!alumnoToMatricular.value) return
    
    try {
        await verificarConfiguracion(props.grupoId)

        const resultado = await matricularAlumnoMoodle(
            alumnoToMatricular.value.id_alumno_grupo
        )
        
        toast.add({
            severity: 'success',
            summary: 'Alumno matriculado',
            detail: resultado.message,
            life: 5000
        })
        
        showMatricularDialog.value = false
        alumnoToMatricular.value = null

    }catch (error) {
        console.error('Error al matricular alumno:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo matricular el alumno en el curso de Moodle',
            life: 5000
        })
    }
}

const cancelarMatricularAlumno = () => {
    showMatricularDialog.value = false
    alumnoToMatricular.value = null
}

const matricularTodosAlumnos = async () => {
    showMatricularTodosDialog.value = true
    await verificarConfiguracion(props.grupoId)
}

const confirmarMatricularTodos = async () => {
    try {
        // Verificar configuración de Moodle antes de proceder
        await verificarConfiguracion(props.grupoId)
        const resultado = await matricularTodosAlumnosMoodle(props.grupoId)
        
        toast.add({
            severity: 'success',
            summary: 'Matriculación completada',
            detail: resultado.message,
            life: 5000
        })
        
        showMatricularTodosDialog.value = false
        showResultadosDialog.value = true
    } catch (error) {
        console.error('Error al matricular alumnos:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron matricular los alumnos en el curso de Moodle',
            life: 5000
        })
    }
}

const cancelarMatricularTodos = () => {
    showMatricularTodosDialog.value = false
}

const cerrarResultadosDialog = () => {
    showResultadosDialog.value = false
}

const viewAlumno = (alumno) => {
    router.push(`/personas/${alumno.persona.id_persona}`)
}

const handleSaveAlumno = async (alumnoData) => {
    try {
        const alumnoToCreate = {
            id_persona: alumnoData.id_persona,
            id_grupo: props.grupoId,
            id_centro: alumnoData.id_centro,
            fecha_inscripcion: alumnoData.fecha_inscripcion,
            estado_curso: alumnoData.estado_curso,
            progreso_curso: alumnoData.progreso_curso,
            diploma: alumnoData.diploma,
            jornada_laboral: alumnoData.jornada_laboral,
            fijo_discontinuo: alumnoData.fijo_discontinuo,
            categoria_profesional: alumnoData.categoria_profesional,
            ERTE: alumnoData.ERTE
        }
        
        await addAlumno(alumnoToCreate)
        
        toast.add({
            severity: 'success',
            summary: 'Alumno añadido',
            detail: 'El alumno ha sido añadido al grupo correctamente',
            life: 3000
        })
        
        showAddAlumnoModal.value = false
        await loadAlumnos()

    } catch (error) {
        console.error('Error al guardar alumno:', error)

        const esDuplicado = error.status === 409 || error.response?.status === 409

        toast.add({
            severity: esDuplicado ? 'warn' : 'error',
            summary: esDuplicado ? 'Alumno ya matriculado' : 'Error',
            detail: esDuplicado
                ? 'Este alumno ya está matriculado en el grupo'
                : 'No se pudo añadir el alumno al grupo',
            life: 4000
        })
    }
}

const handleCancelAlumno = () => {
    showAddAlumnoModal.value = false
    formData.value = {
        id_persona: null,
        id_centro: null,
        fecha_inscripcion: null,
        estado_curso: null,
        progreso_curso: null,
        diploma: null,
        jornada_laboral: false,
        fijo_discontinuo: false,
        categoria_profesional: null,
        ERTE: false
    }
}

const handleUpdateAlumno = async (alumnoData) => {
    if (!alumnoToEdit.value) return
    
    try {
        const alumnoToUpdate = {
            id_persona: alumnoData.id_persona,
            id_centro: alumnoData.id_centro,
            fecha_inscripcion: alumnoData.fecha_inscripcion,
            estado_curso: alumnoData.estado_curso,
            progreso_curso: alumnoData.progreso_curso,
            diploma: alumnoData.diploma,
            jornada_laboral: alumnoData.jornada_laboral,
            fijo_discontinuo: alumnoData.fijo_discontinuo,
            categoria_profesional: alumnoData.categoria_profesional,
            ERTE: alumnoData.ERTE
        }
        
        await updateAlumno(alumnoToEdit.value.id_alumno_grupo, alumnoToUpdate)
        
        toast.add({
            severity: 'success',
            summary: 'Alumno actualizado',
            detail: 'El alumno ha sido actualizado correctamente',
            life: 3000
        })
        
        showEditAlumnoModal.value = false
        alumnoToEdit.value = null
        await loadAlumnos()
    } catch (error) {
        console.error('Error al actualizar alumno:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el alumno',
            life: 3000
        })
    }
}

const handleCancelEditAlumno = () => {
    showEditAlumnoModal.value = false
    alumnoToEdit.value = null
    formData.value = {
        id_persona: null,
        id_centro: null,
        fecha_inscripcion: null,
        estado_curso: null,
        progreso_curso: null,
        diploma: null,
        jornada_laboral: false,
        fijo_discontinuo: false,
        categoria_profesional: null,
        ERTE: false
    }
}

const navigateToCorreoBienvenida = () => {
    router.push(`/grupos/${props.grupoId}/correo-bienvenida`)
}

const navigateToCorreoDiploma = () => {
    router.push(`/grupos/${props.grupoId}/correo-diploma`)
}

// Añadimos la variable filasVisibles para forzar que se vea el número de alumnos que queremos
const filasVisibles = ref(25);

// Añadimos la variable alumnosMostrador para poder controlar los datos de la tabla sin que se rompa
const alumnosMostrados = computed(() => {
    // 1. Extraemos los datos
    const datosReales = alumnos.value || alumnos;

    // 2. Ponemos este Array como defensa para que la tabla si no carga los datos no explote y deje sin cargar la pagina 
    if (!datosReales || !Array.isArray(datosReales)) {
        return [];
    }
    
    // 3. Si pasamos el Array, significa que hay datos y los recortamos a la cantidad que queremos
    return datosReales.slice(0, filasVisibles.value);
});

onMounted(async () => {
    await loadAlumnos()
    // No verificar configuración de Moodle automáticamente
    // Solo se verificará cuando el usuario intente usar funciones de Moodle
})

//Exportar tabla alumnos a excel 
const exportToExcel = () => {
    //Transformación de datos a map para cada columna
    const datos = alumnos.value.map((a, index) => ({
        "Nº": index + 1,
              "Primer Apellido": a.persona?.apellido1 || "",
               "Segundo Apellido": a.persona?.apellido2 || "",
        "Nombre": a.persona?.nombre || "",
  
       
        "Documento": a.persona?.documento || "",
        "Centro de trabajo": a.centro?.empresa?.razon_social 
            ? a.centro.empresa.razon_social + " - " + (a.centro?.nombre || "")
            : "",
        "Estado en el curso": getEstadoCursoLabel(a.estado_curso),
        "Progreso en el curso": getProgresoCursoLabel(a.progreso_curso),
        "Diploma": getTipoDiplomaLabel(a.diploma),
        "Jornada laboral": a.jornada_laboral ? "Sí" : "No",
        "Categoría profesional": getCategoriaProfesionalLabel(a.categoria_profesional),

        "Es docente": a.persona?.es_docente == 1 ? "Sí" : "No",
        "Es alumno": a.persona?.es_alumno == 1 ? "Sí" : "No"
    }));

    const worksheet = XLSX.utils.json_to_sheet(datos); //Convertir JSON a Excel
    const workbook = XLSX.utils.book_new(); //Crea workbook (archivo Excel completo)

    XLSX.utils.book_append_sheet(workbook, worksheet, "Alumnos"); //Añadir hoja al archivo
    XLSX.writeFile(workbook, "alumnos.xlsx"); //Descargar el archivo
};

</script>
