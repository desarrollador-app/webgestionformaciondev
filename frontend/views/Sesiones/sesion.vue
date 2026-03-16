<template>
    <section v-if="grupo">
        <div class="section-header">
            <div class="section-header__main section-main">
                <h1 class="section-main__title">Sesiones de formación {{ store.tipoModalidadSesiones }}</h1>
            </div>
        </div>
        <ul class="section-content__list">
            <li v-for="(value, key) in grupoData" :key="key">
                <span class="label">{{ formatLabel(key) }}:</span> <span>{{ value }}</span>
            </li>
        </ul>
        <ReusableArticle 
            title="" 
        >
            <template #misc>
                    <div class="form-container add-session-form">
                        <div class="form-group">
                            <label class="form-label">Días de impartición</label>
                            <div class="days-checkboxes">
                                <div class="checkbox-item">
                                    <Checkbox v-model="newSession.days" value="L" inputId="day-l" />
                                    <label for="day-l" class="checkbox-label">L</label>
                                </div>
                                <div class="checkbox-item">
                                    <Checkbox v-model="newSession.days" value="M" inputId="day-m" />
                                    <label for="day-m" class="checkbox-label">M</label>
                                </div>
                                <div class="checkbox-item">
                                    <Checkbox v-model="newSession.days" value="X" inputId="day-x" />
                                    <label for="day-x" class="checkbox-label">X</label>
                                </div>
                                <div class="checkbox-item">
                                    <Checkbox v-model="newSession.days" value="J" inputId="day-j" />
                                    <label for="day-j" class="checkbox-label">J</label>
                                </div>
                                <div class="checkbox-item">
                                    <Checkbox v-model="newSession.days" value="V" inputId="day-v" />
                                    <label for="day-v" class="checkbox-label">V</label>
                                </div>
                                <div class="checkbox-item">
                                    <Checkbox v-model="newSession.days" value="S" inputId="day-s" />
                                    <label for="day-s" class="checkbox-label">S</label>
                                </div>
                                <div class="checkbox-item">
                                    <Checkbox v-model="newSession.days" value="D" inputId="day-d" />
                                    <label for="day-d" class="checkbox-label">D</label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Modifico el apartado de poner la hora por la mañana para no dejar poner una hora mas de las 15:00 por la mañana -->
                        <div class="form-group">
                            <label class="form-label">Horario de mañana</label>
                                <div class="time-inputs">
                                    <InputText 
                                        v-model="newSession.morningStart" 
                                        type="time" 
                                        class="time-input"
                                    />
                                    <span class="time-separator">-</span>
                                    <InputText 
                                        v-model="newSession.morningEnd" 
                                        type="time" 
                                        class="time-input"
                                        :class="{'p-invalid': newSession.morningEnd > '15:00'}" 
                                    />
                                </div>
                                    <small v-if="newSession.morningEnd > '15:00'" class="p-error block mt-1">
                                        La hora fin de mañana no puede ser superior a las 15:00
                                    </small>
                                </div>
                        
                        <div class="form-group">
                            <label class="form-label">Horario de tarde</label>
                            <div class="time-inputs">
                                <InputText 
                                    v-model="newSession.afternoonStart" 
                                    type="time" 
                                    class="time-input"
                                />
                                <span class="time-separator">-</span>
                                <InputText 
                                    v-model="newSession.afternoonEnd" 
                                    type="time" 
                                    class="time-input"
                                />
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Docente</label>
                            <Select 
                                v-model="newSession.teacher" 
                                :options="docentes" 
                                :optionLabel="getNombreCompletoDocente"
                                optionValue="id_docente_grupo"
                                class="teacher-select"
                            >
                                <template #option="{ option }">
                                    {{ getNombreCompletoDocente(option) }}
                                </template>
                            </Select>
                        </div>
                        
                        <Button 
                            label="Asignar" 
                            @click="addSession"
                            class="assign-button"
                            :disabled="!isFormValid"
                            :loading="loading"
                        />
                    </div>
                <div class="sesiones-container">
                <!-- Añadimos la propiedad defaultCalendarDate -->
                    <DatePicker 
                        v-model="selectedDates" 
                        inline 
                        :dateFormat="'dd/mm/yy'"
                        selectionMode="multiple"
                        @update:modelValue="onDateSelect"
                        defaultCalendarDate
                    >
                        <template #date="slotProps">
                            <div 
                                :class="{ 
                                    'has-sessions': isDateWithSessions(slotProps.date),
                                    'selected-day': isDateSelected(slotProps.date)
                                }"
                                :data-date="formatDateForComparison(slotProps.date)"
                                class="date-cell"
                            >
                                <span class="date-number">{{ slotProps.date.day }}</span>
                                <span 
                                    v-if="isDateWithSessions(slotProps.date)" 
                                    class="session-count"
                                >
                                    {{ getSessionCountForDate(slotProps.date) }} sesiones
                                </span>
                            </div>
                        </template>
                    </DatePicker>
                    <div class="horarios-form">
                        <div class="horarios-section">
                            <h4 class="horarios-section__title">Mañana</h4>
                            <div class="horarios-slots">
                                <div v-for="(slot, index) in morningSlots" :key="`morning-${index}`" class="horario-slot">
                                    <div class="horario-slot__time">
                                        <div class="form-group">
                                            <label for="uri" class="form-label">Horario</label>
                                            <InputText
                                                v-model="slot.startTime" 
                                                type="time" 
                                            />
                                        </div>
                                    </div>
                                    <span class="time-separator">-</span>
                                    <div class="form-group">
                                        <label for="uri" class="form-label">Horario</label>
                                        <InputText
                                            v-model="slot.endTime" 
                                            type="time"
                                            :class="{'p-invalid': slot.endTime > '15:00'}"
                                        />
                                        <small v-if="slot.endTime > '15:00'" class="p-error">Máx. 15:00</small> // Añadimos el limite de las 15:00
                                    </div>
                                    <div class="horario-slot__teacher">
                                        <div class="form-group">
                                            <label for="uri" class="form-label">Docente</label>
                                            <Select 
                                                v-model="slot.teacher" 
                                                :options="docentes" 
                                                :optionLabel="getNombreCompletoDocente"
                                                optionValue="id_docente_grupo"
                                                class="teacher-select"
                                            >
                                                <template #option="{ option }">
                                                    {{ getNombreCompletoDocente(option) }}
                                                </template>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button variant="text" @click="deleteSlot(slot, 'morning', index)">
                                        <template #icon>
                                            <Icon icon="delete" size="24px"/>
                                        </template>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div class="horarios-section">
                            <h4 class="horarios-section__title">Tarde</h4>
                            <div class="horarios-slots">
                                <div v-for="(slot, index) in afternoonSlots" :key="`morning-${index}`" class="horario-slot">
                                    <div class="horario-slot__time">
                                        <div class="form-group">
                                            <label for="uri" class="form-label">Horario</label>
                                            <InputText
                                                v-model="slot.startTime" 
                                                type="time" 
                                            />
                                        </div>
                                    </div>
                                    <span class="time-separator">-</span>
                                    <div class="form-group">
                                        <label for="uri" class="form-label">Horario</label>
                                        <InputText
                                            v-model="slot.endTime" 
                                            type="time" 
                                        />
                                    </div>
                                    <div class="horario-slot__teacher">
                                        <div class="form-group">
                                        <label for="uri" class="form-label">Docente</label>
                                        <Select 
                                            v-model="slot.teacher" 
                                            :options="docentes" 
                                            :optionLabel="getNombreCompletoDocente"
                                            optionValue="id_docente_grupo"
                                            class="teacher-select"
                                        >
                                            <template #option="{ option }">
                                                {{ getNombreCompletoDocente(option) }}
                                            </template>
                                        </Select>
                                    </div>

                                    </div>
                                    <Button variant="text" @click="deleteSlot(slot, 'afternoon', index)">
                                        <template #icon>
                                            <Icon icon="delete" size="24px"/>
                                        </template>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div class="horarios-form__buttons">
                            <Button 
                            label="Modificar los días seleccionados" 
                            @click="saveHorarios" 
                            :disabled="!canSaveHorarios"
                            :loading="loading"
                            />
                            <Button 
                            label="Borrar los días seleccionados"
                            severity="secondary"
                            @click="deleteHorarios" 
                            :disabled="!canDeleteHorarios"
                            :loading="loading"
                            />
                        </div>
                    </div>
                </div>
            </template>
        </ReusableArticle>
    </section>
    <div v-else-if="loading">
        <p>Cargando grupo...</p>
    </div>
    <div v-else>
        <p>Grupo no encontrado</p>
    </div>
    
    <!-- Diálogo de confirmación para borrar días seleccionados -->
    <ReusableDialog
        v-model:visible="showDeleteConfirmDialog"
        title="Confirmar eliminación"
        :dialog-type="'confirmation'"
        :message="`¿Estás seguro de que quieres eliminar todas las sesiones de los días seleccionados?`"
        :details="`Se eliminarán todas las sesiones de ${selectedDates?.length || 0} día(s) seleccionado(s). Esta acción no se puede deshacer.`"
        :confirm-label="'Eliminar'"
        :cancel-label="'Cancelar'"
        :confirm-severity="'danger'"
        :confirm-loading="loading"
        @confirm="confirmDeleteSesiones"
        @cancel="cancelDeleteHorarios"
    />
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '@/stores/main.js'
import { getGrupoById } from '@/services/gruposService.js'
import { useDocentesGrupo } from '@/composables/useDocentesGrupo.js'
import { useDiasImparticionTeleformacion } from '@/composables/useDiasImparticionTeleformacion.js'
import { useDiasImparticionPresencial } from '@/composables/useDiasImparticionPresencial.js'
import { useSesiones } from '@/composables/useSesiones.js'
import { getHorasTotalesGrupo } from '@/services/sesionesService.js'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import ReusableArticle from '@/components/Layout/PageSection/ReusableArticle.vue'
import ReusableDialog from '@/components/ReusableDialog/ReusableDialog.vue'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { MODALIDAD_SESIONES } from '@/utils/enums.js'
import { formatDateToDDMMYYYY, formatLabel } from '@/utils/functions.js'
import { useToast } from 'primevue/usetoast'
import { useMultipleDateUTC } from '@/composables/useDateUTC.js'
import Icon from '@/components/Icon/Icon.vue'

const route = useRoute()
const store = useStore()
const toast = useToast()
const grupo = ref(null)
const loading = ref(false)
const error = ref(null)
const horasConsumidas = ref(0) // Para almacenar las horas consumidas del backend

// Usar el composable para fechas múltiples
const { localDates: selectedDatesLocal, utcDates: selectedDatesUTC } = useMultipleDateUTC()
const selectedDates = selectedDatesLocal // Para mantener compatibilidad con el código existente
const selectedDay = ref(null)
const existingSessions = ref([]) // Para rastrear las sesiones existentes que se están editando
const showDeleteConfirmDialog = ref(false)

const { docentes, loading: docentesLoading, fetchDocentes } = useDocentesGrupo()
const { 
    dias: diasTeleformacion, 
    loading: diasTeleformacionLoading, 
    fetchDias: fetchDiasTeleformacion,
    createDia: createDiaTeleformacion,
    updateDia: updateDiaTeleformacion
} = useDiasImparticionTeleformacion()
const { 
    dias: diasPresencial, 
    loading: diasPresencialLoading, 
    fetchDias: fetchDiasPresencial,
    createDia: createDiaPresencial,
    updateDia: updateDiaPresencial
} = useDiasImparticionPresencial()
const { 
    sesiones, 
    loading: sesionesLoading, 
    fetchSesiones,
    createSesion: createSesionService,
    updateSesion: updateSesionService,
    deleteSesion: deleteSesionService
} = useSesiones()

const morningSlots = reactive([
    { startTime: '', endTime: '', teacher: '', id_sesion: null },
    { startTime: '', endTime: '', teacher: '', id_sesion: null },
    { startTime: '', endTime: '', teacher: '', id_sesion: null }
])

const afternoonSlots = reactive([
    { startTime: '', endTime: '', teacher: '', id_sesion: null },
    { startTime: '', endTime: '', teacher: '', id_sesion: null },
    { startTime: '', endTime: '', teacher: '', id_sesion: null }
])

// Formulario para nueva sesión
const newSession = reactive({
    days: [],
    morningStart: '',
    morningEnd: '',
    afternoonStart: '',
    afternoonEnd: '',
    teacher: ''
})

const grupoData = computed(() => {
    if (!grupo.value) return {}


    const data = {
        'Grupo': grupo.value.denominacion || '-',
        'Fecha inicio': formatDateToDDMMYYYY(grupo.value.fecha_inicio, '-'),
        'Fecha fin': formatDateToDDMMYYYY(grupo.value.fecha_fin, '-'),
    }
    if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL) {
        data['Horas presenciales'] = grupo.value.accionFormativa?.horas_modalidad_presencial || 0
    }
    if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
        data['Horas teleformación'] = grupo.value.accionFormativa?.horas_modalidad_teleformacion || 0
    }

    data['Horas consumidas'] = horasConsumidas.value

    return data
})

const calcularHorasConsumidas = async () => {
    if (!grupo.value || !store.tipoModalidadSesiones) {
        horasConsumidas.value = 0
        return
    }
    
    try {
        // En modalidad mixta, sumar las horas de ambas modalidades
        if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.MIXTA) {
            const resultadoTele = await getHorasTotalesGrupo(grupo.value.id_grupo, MODALIDAD_SESIONES.TELEFORMACION)
            const resultadoPres = await getHorasTotalesGrupo(grupo.value.id_grupo, MODALIDAD_SESIONES.PRESENCIAL)
            horasConsumidas.value = resultadoTele.horas_totales + resultadoPres.horas_totales
        } else {
            const modalidad = store.tipoModalidadSesiones
            const resultado = await getHorasTotalesGrupo(grupo.value.id_grupo, modalidad)
            horasConsumidas.value = resultado.horas_totales
        }
    } catch (error) {
        console.error('Error al calcular horas consumidas:', error)
        horasConsumidas.value = 0
    }
}

// Función para calcular horas de un string de tiempo (HH:MM)
const calcularHorasDeTiempo = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return 0
    
    const [hInicio, mInicio] = horaInicio.split(':').map(Number)
    const [hFin, mFin] = horaFin.split(':').map(Number)
    
    const minutosInicio = hInicio * 60 + mInicio
    const minutosFin = hFin * 60 + mFin
    
    const minutosDiferencia = minutosFin - minutosInicio
    
    if (minutosDiferencia < 0) return 0
    
    return minutosDiferencia / 60
}

// Función para validar si las horas a añadir no exceden las totales
const validarHorasDisponibles = () => {
    if (!grupo.value || !store.tipoModalidadSesiones) return { valid: true }
    
    // Obtener horas totales según la modalidad
    let horasTotales = 0
    if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
        horasTotales = grupo.value.accionFormativa?.horas_modalidad_teleformacion || 0
    } else if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL) {
        horasTotales = grupo.value.accionFormativa?.horas_modalidad_presencial || 0
    } else if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.MIXTA) {
        // En modalidad mixta, sumar ambas
        horasTotales = (grupo.value.accionFormativa?.horas_modalidad_teleformacion || 0) + 
                       (grupo.value.accionFormativa?.horas_modalidad_presencial || 0)
    }
    
    return {
        horasTotales,
        horasConsumidas: horasConsumidas.value,
        horasDisponibles: horasTotales - horasConsumidas.value,
        valid: (horasTotales - horasConsumidas.value) > 0
    }
}


const getNombreCompletoDocente = (docente) => {
    if (!docente || !docente.persona) return ''
    const nombre = docente.persona.nombre || ''
    const apellido1 = docente.persona.apellido1 || ''
    const apellido2 = docente.persona.apellido2 || ''
    return `${nombre} ${apellido1} ${apellido2}`.trim()
}

// Validación del formulario
const isFormValid = computed(() => {
    // Si hay hora de fin en mañana, debe ser <= 15:00
    const morningTimeOk = !newSession.morningEnd || newSession.morningEnd <= '15:00';

    return newSession.days.length > 0 && 
           newSession.teacher && 
           (newSession.morningStart || newSession.afternoonStart) &&
           morningTimeOk; // Solo se pondra el botón activo si se cumple la condición 
})

// Validación para guardar horarios
const canSaveHorarios = computed(() => {
    // 1. Debe haber fechas seleccionadas
    if (!selectedDates.value || selectedDates.value.length === 0) {
        return false
    }

    // 2. Bloqueo de horario de mañana > 15:00
    // Comprobamos que todos los slots de mañana cumplan el límite si tienen hora fin
    const areMorningSlotsValid = morningSlots.every(slot => {
        if (!slot.endTime) return true; // Si no hay hora todavía, es válido
        return slot.endTime <= '15:00';
    });

    // Si algún slot de mañana se pasa de las 15:00, bloqueamos el botón devolviendo false
    if (!areMorningSlotsValid) {
        return false
    }
    
    // 3. Debe haber al menos un slot configurado (mañana o tarde)
    const hasMorningSlots = morningSlots.some(slot => slot.startTime && slot.endTime && slot.teacher)
    const hasAfternoonSlots = afternoonSlots.some(slot => slot.startTime && slot.endTime && slot.teacher)
    
    return hasMorningSlots || hasAfternoonSlots
})

// Validación para borrar días (solo necesita fechas seleccionadas)
const canDeleteHorarios = computed(() => {
    return selectedDates.value && selectedDates.value.length > 0
})

// Función para calcular días de la semana entre dos fechas
const calculateWeekdaysBetweenDates = (startDate, endDate, weekdays) => {
    const dates = []
    const currentDate = new Date(startDate)
    const finalDate = new Date(endDate)

// Controla exclusivamente el mes/año en el que se abre el DatePicker visualmente.
// Si el grupo tiene fecha de inicio, el calendario viaja directamente a ese mes.
// Nota: Se crea una variable independiente para no interferir con la constante 'currentDate'
    const defaultCalendarDate = computed(() => {
    return grupo.value?.fecha_inicio ? new Date(grupo.value.fecha_inicio) : new Date();
    });
    
    // Mapeo de días de la semana (L=1, M=2, X=3, J=4, V=5, S=6, D=0)
    const weekdayMap = {
        'L': 1, 'M': 2, 'X': 3, 'J': 4, 'V': 5, 'S': 6, 'D': 0
    }
    
    // Convertir los weekdays seleccionados a números
    const selectedWeekdays = weekdays.map(day => weekdayMap[day])
    
    // Iterar día por día desde la fecha de inicio hasta la fecha de fin
    while (currentDate <= finalDate) {
        const dayOfWeek = currentDate.getDay()
        
        // Si el día de la semana está en los seleccionados, agregarlo
        if (selectedWeekdays.includes(dayOfWeek)) {
            dates.push(new Date(currentDate))
        }
        
        // Avanzar al siguiente día
        currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return dates
}

// Añadir nueva sesión
const addSession = async () => {
    if (!isFormValid.value) return
    
    // Verificar que el grupo tenga fechas de inicio y fin
    if (!grupo.value.fecha_inicio || !grupo.value.fecha_fin) {
        toast.add({
            severity: 'warn',
            summary: 'Fechas requeridas',
            detail: 'El grupo debe tener fechas de inicio y fin definidas',
            life: 3000
        })
        return
    }
    
    // Verificar que se haya seleccionado una modalidad
    if (!store.tipoModalidadSesiones) {
        toast.add({
            severity: 'warn',
            summary: 'Modalidad requerida',
            detail: 'No se ha seleccionado una modalidad de sesión',
            life: 3000
        })
        return
    }
    
    try {
        loading.value = true
        
        // Calcular las fechas que corresponden a los días seleccionados
        const calculatedDates = calculateWeekdaysBetweenDates(
            grupo.value.fecha_inicio,
            grupo.value.fecha_fin,
            newSession.days
        )
        
        console.log('Fechas calculadas:', calculatedDates.map(date => date.toLocaleDateString('es-ES')))
        
        // Calcular horas que se van a añadir
        const horasManana = calcularHorasDeTiempo(newSession.morningStart, newSession.morningEnd)
        const horasTarde = calcularHorasDeTiempo(newSession.afternoonStart, newSession.afternoonEnd)
        const horasPorFecha = horasManana + horasTarde
        
        // Validar horas disponibles
        const validation = validarHorasDisponibles()
        
        // Calcular cuántas fechas se pueden procesar completas
        let fechasAProcesar = calculatedDates
        
        if (validation.horasDisponibles < horasPorFecha) {
            toast.add({
                severity: 'error',
                summary: 'Horas insuficientes',
                detail: `No se pueden añadir sesiones. Cada sesión requiere ${horasPorFecha.toFixed(2)} horas y solo quedan ${validation.horasDisponibles.toFixed(2)} horas disponibles.`,
                life: 5000
            })
            return
        }
        
        if (horasPorFecha * calculatedDates.length > validation.horasDisponibles) {
            // Calcular cuántas fechas completas se pueden guardar
            const fechasPosibles = Math.floor(validation.horasDisponibles / horasPorFecha)
            fechasAProcesar = calculatedDates.slice(0, fechasPosibles)
            
            toast.add({
                severity: 'warn',
                summary: 'Horas limitadas',
                detail: `Se han generado sesiones hasta consumir el límite de horas de la formación.`,
                life: 5000
            })
        }
        
        // Contar sesiones por fecha
        let sesionesPorFecha = 0
        if (newSession.morningStart && newSession.morningEnd) sesionesPorFecha++
        if (newSession.afternoonStart && newSession.afternoonEnd) sesionesPorFecha++
        const totalSesiones = sesionesPorFecha * fechasAProcesar.length
        
        // Procesar cada fecha calculada
        for (const fecha of fechasAProcesar) {
            let diaImparticionId = null
            
            // 1. Crear entrada en DiasImparticionGrupoTeleformacion o DiasImparticionGrupoPresencial
            const diaData = {
                id_grupo: grupo.value.id_grupo,
                id_docente: newSession.teacher ? parseInt(newSession.teacher) : null,
                fecha_imparticion: fecha, // Formato YYYY-MM-DD
                horario_inicio_tramo1: newSession.morningStart || null,
                horario_fin_tramo1: newSession.morningEnd || null,
                horario_inicio_tramo2: newSession.afternoonStart || null,
                horario_fin_tramo2: newSession.afternoonEnd || null
            }

            console.log('Dia data:', diaData)
            
            if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
                const diaCreado = await createDiaTeleformacion(diaData)
                diaImparticionId = diaCreado.id_dia_tele
            } else if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL) {
                const diaCreado = await createDiaPresencial(diaData)
                diaImparticionId = diaCreado.id_dia_pres
            }
            
            // 2. Crear sesiones para mañana si tiene horario
            if (newSession.morningStart && newSession.morningEnd) {
                const sesionManana = {
                    id_dia_tele: store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION ? diaImparticionId : null,
                    id_dia_pres: store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL ? diaImparticionId : null,
                    id_docente: newSession.teacher ? parseInt(newSession.teacher) : null,
                    es_manana: true,
                    horario_inicio: newSession.morningStart,
                    horario_fin: newSession.morningEnd
                }
                
                await createSesionService(sesionManana)
            }
            
            // 3. Crear sesiones para tarde si tiene horario
            if (newSession.afternoonStart && newSession.afternoonEnd) {
                const sesionTarde = {
                    id_dia_tele: store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION ? diaImparticionId : null,
                    id_dia_pres: store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL ? diaImparticionId : null,
                    id_docente: newSession.teacher ? parseInt(newSession.teacher) : null,
                    es_manana: false,
                    horario_inicio: newSession.afternoonStart,
                    horario_fin: newSession.afternoonEnd
                }
                
                await createSesionService(sesionTarde)
            }
        }
        
        toast.add({
            severity: 'success',
            summary: 'Sesiones creadas',
            detail: `Sesiones creadas correctamente. Se procesaron ${totalSesiones} sesiones en ${fechasAProcesar.length} fecha(s).`,
            life: 3000
        })
        
        // Fuerza a recargar los datos para actualizar el calendario
        await loadDatosSesiones(grupo.value.id_grupo)
        
        // Limpiar formulario
        resetNewSessionForm()
        
    } catch (error) {
        console.error('Error al crear las sesiones:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al crear sesiones',
            detail: 'Error al crear las sesiones. Por favor, inténtalo de nuevo.',
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

// Resetear formulario
const resetNewSessionForm = () => {
    newSession.days = []
    newSession.morningStart = ''
    newSession.morningEnd = ''
    newSession.afternoonStart = ''
    newSession.afternoonEnd = ''
    newSession.teacher = ''
}

// Función para formatear el tiempo para inputs de tipo time (HH:MM)
const formatTimeForInput = (time) => {
    if (!time) return ''
    
    console.log('Formateando tiempo:', { time, type: typeof time })
    
    // Si ya es un string en formato HH:MM, devolverlo tal como está
    if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
        console.log('String HH:MM directo:', time)
        return time
    }
    
    // Si es un string de tiempo (HH:MM:SS o HH:MM), extraer directamente
    if (typeof time === 'string' && /^\d{1,2}:\d{2}(:\d{2})?/.test(time)) {
        const timeParts = time.split(':')
        const hours = timeParts[0].padStart(2, '0')
        const minutes = timeParts[1].padStart(2, '0')
        console.log('String de tiempo extraído:', `${hours}:${minutes}`)
        return `${hours}:${minutes}`
    }
    
    // Si es un objeto Date, usar métodos UTC para evitar conversión de timezone
    if (time instanceof Date) {
        const hours = time.getUTCHours().toString().padStart(2, '0')
        const minutes = time.getUTCMinutes().toString().padStart(2, '0')
        console.log('Date object UTC:', `${hours}:${minutes}`)
        return `${hours}:${minutes}`
    }
    
    // Si es un string de fecha completa, extraer la parte de tiempo directamente
    if (typeof time === 'string' && time.includes('T')) {
        // Extraer la parte de tiempo del string ISO (después de la T)
        const timePart = time.split('T')[1]
        if (timePart) {
            // Remover la parte de timezone si existe (Z o +XX:XX)
            const timeOnly = timePart.split(/[Z+-]/)[0]
            const timeParts = timeOnly.split(':')
            const hours = timeParts[0].padStart(2, '0')
            const minutes = timeParts[1].padStart(2, '0')
            console.log('String ISO extraído:', `${hours}:${minutes}`)
            return `${hours}:${minutes}`
        }
    }
    
    // Fallback: crear Date y usar UTC
    const date = new Date(time)
    if (isNaN(date.getTime())) {
        console.warn('Fecha inválida para formatear:', time)
        return ''
    }
    
    // Usar UTC para evitar problemas de timezone
    const hours = date.getUTCHours().toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    console.log('Fallback UTC:', `${hours}:${minutes}`)
    
    return `${hours}:${minutes}`
}

// Computed para obtener los días existentes según la modalidad
const diasExistentes = computed(() => {
    if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
        return diasTeleformacion.value || []
    } else if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL) {
        return diasPresencial.value || []
    }
    return []
})

// Función para crear una fecha UTC desde los componentes del DatePicker
const createUTCDate = (year, month, day) => {
    return new Date(Date.UTC(year, month, day))
}

// Función para obtener la fecha en formato string YYYY-MM-DD sin problemas de timezone
const formatDateToString = (date) => {
    if (!date) return ''
    if (date instanceof Date) {
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
    return ''
}

// Función para verificar si una fecha tiene sesiones
const isDateWithSessions = (date) => {
    if (!date || !diasExistentes.value.length || !sesiones.value.length) return false
    
    const dateString = formatDateToString(createUTCDate(date.year, date.month, date.day))
    
    // Buscar el día de impartición para esta fecha
    const dia = diasExistentes.value.find(dia => {
        const diaDate = formatDateToString(new Date(dia.fecha_imparticion))
        return diaDate === dateString
    })
    
    if (!dia) return false
    
    // Obtener el ID del día según la modalidad
    const diaId = store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION 
        ? dia.id_dia_tele 
        : dia.id_dia_pres
    
    // Verificar si hay sesiones asociadas a este día
    const hasSessions = sesiones.value.some(sesion => {
        if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
            return sesion.id_dia_tele === diaId
        } else {
            return sesion.id_dia_pres === diaId
        }
    })
    
    return hasSessions
}

// Función para obtener el número de sesiones de una fecha
const getSessionCountForDate = (date) => {
    if (!date || !diasExistentes.value.length || !sesiones.value.length) return 0
    
    const dateString = formatDateToString(createUTCDate(date.year, date.month, date.day))
    
    // Buscar el día de impartición para esta fecha
    const dia = diasExistentes.value.find(dia => {
        const diaDate = formatDateToString(new Date(dia.fecha_imparticion))
        return diaDate === dateString
    })
    
    if (!dia) return 0
    
    // Obtener el ID del día según la modalidad
    const diaId = store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION 
        ? dia.id_dia_tele 
        : dia.id_dia_pres
    
    // Contar las sesiones que pertenecen a este día
    const count = sesiones.value.filter(sesion => {
        if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
            return sesion.id_dia_tele === diaId
        } else {
            return sesion.id_dia_pres === diaId
        }
    }).length
    
    return count
}

// Función para formatear la fecha para comparación
const formatDateForComparison = (date) => {
    if (!date) return ''
    return formatDateToString(createUTCDate(date.year, date.month, date.day))
}

// Función para convertir fecha del calendario a string YYYY-MM-DD local
const formatCalendarDateToString = (date) => {
    if (!date) return ''
    // Si date tiene year, month, day (componentes del DatePicker)
    if (date.year !== undefined) {
        const year = date.year
        const month = String(date.month + 1).padStart(2, '0')
        const day = String(date.day).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
    // Si es un objeto Date local (del v-model)
    if (date instanceof Date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
    return ''
}

// Función para verificar si una fecha está seleccionada
const isDateSelected = (date) => {
    if (!date || !selectedDates.value) return false
    
    const dateString = formatCalendarDateToString(date)
    
    // Si selectedDates es un array
    if (Array.isArray(selectedDates.value)) {
        return selectedDates.value.some(selectedDate => {
            const selectedDateString = formatCalendarDateToString(selectedDate)
            return selectedDateString === dateString
        })
    }
    
    // Si selectedDates es un objeto con start y end
    if (selectedDates.value && typeof selectedDates.value === 'object' && selectedDates.value.start) {
        const startDate = formatCalendarDateToString(selectedDates.value.start)
        const endDate = selectedDates.value.end ? formatCalendarDateToString(selectedDates.value.end) : startDate
        
        return dateString >= startDate && dateString <= endDate
    }
    
    // Si selectedDates es una fecha única
    if (selectedDates.value instanceof Date) {
        const selectedDateString = formatCalendarDateToString(selectedDates.value)
        return selectedDateString === dateString
    }
    
    return false
}



// Manejar selección de fecha en el calendario
const onDateSelect = (value) => {
    console.log('Rango seleccionado:', value)
    
    if (value) {
        // Si es un objeto con start y end (rango)
        if (typeof value === 'object' && value.start) {
            selectedDay.value = value.start
        } 
        // Si es una fecha directa (selección simple)
        else if (value instanceof Date) {
            selectedDay.value = value
        }
        // Si es un array con fechas
        else if (Array.isArray(value) && value.length > 0) {
            selectedDay.value = value[0]
            
            // Si solo hay una fecha seleccionada, cargar sus sesiones
            if (value.length === 1) {
                loadSessionsForSelectedDay(value[0])
            } else {
                // Si hay múltiples fechas, limpiar los inputs
                clearForm()
            }
        }
    } else {
        // Si no hay selección, limpiar selectedDay y formulario
        selectedDay.value = null
        clearForm()
    }
    
    console.log('selectedDay actualizado:', selectedDay.value)
}

// Cargar sesiones existentes para el día seleccionado
const loadSessionsForSelectedDay = (selectedDate) => {
    if (!selectedDate || !sesiones.value.length) {
        clearForm()
        return
    }

    // Convertir la fecha seleccionada (local) a UTC para comparar con las fechas del backend
    const selectedDateUTC = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
    ))
    const fechaString = formatDateToString(selectedDateUTC)
    console.log('Cargando sesiones para fecha:', fechaString)
    
    // Buscar el día de impartición para esta fecha
    const diaExistente = diasExistentes.value.find(dia => {
        const diaFecha = formatDateToString(new Date(dia.fecha_imparticion))
        return diaFecha === fechaString
    })
    
    if (!diaExistente) {
        console.log('No se encontró día de impartición para esta fecha')
        clearForm()
        return
    }

    // Obtener el ID del día según la modalidad
    const diaId = store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION 
        ? diaExistente.id_dia_tele 
        : diaExistente.id_dia_pres
    
    // Filtrar sesiones para este día
    const sesionesDelDia = sesiones.value.filter(sesion => {
        if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
            return sesion.id_dia_tele === diaId
        } else {
            return sesion.id_dia_pres === diaId
        }
    })
    
    console.log('Sesiones encontradas para el día:', sesionesDelDia)
    
    // Separar sesiones de mañana y tarde
    const sesionesManana = sesionesDelDia.filter(sesion => sesion.es_manana)
    const sesionesTarde = sesionesDelDia.filter(sesion => !sesion.es_manana)
    
    console.log('Sesiones de mañana:', sesionesManana)
    console.log('Sesiones de tarde:', sesionesTarde)
    
    // Guardar las sesiones existentes para poder actualizarlas después
    existingSessions.value = [...sesionesManana, ...sesionesTarde]
    console.log('Sesiones existentes guardadas para edición:', existingSessions.value)
    
    // Limpiar formulario primero
    clearForm()
    
    // Cargar sesiones de mañana en los slots
    sesionesManana.forEach((sesion, index) => {
        if (index < morningSlots.length) {
            console.log(`Cargando sesión mañana ${index}:`, {
                horario_inicio_original: sesion.horario_inicio,
                horario_fin_original: sesion.horario_fin,
                horario_inicio_formateado: formatTimeForInput(sesion.horario_inicio),
                horario_fin_formateado: formatTimeForInput(sesion.horario_fin),
                docente: sesion.id_docente
            })
            
            morningSlots[index].startTime = formatTimeForInput(sesion.horario_inicio)
            morningSlots[index].endTime = formatTimeForInput(sesion.horario_fin)
            morningSlots[index].teacher = sesion.id_docente
            morningSlots[index].id_sesion = sesion.id_sesion
        }
    })
    
    // Cargar sesiones de tarde en los slots
    sesionesTarde.forEach((sesion, index) => {
        if (index < afternoonSlots.length) {
            console.log(`Cargando sesión tarde ${index}:`, {
                horario_inicio_original: sesion.horario_inicio,
                horario_fin_original: sesion.horario_fin,
                horario_inicio_tipo: typeof sesion.horario_inicio,
                horario_fin_tipo: typeof sesion.horario_fin,
                horario_inicio_formateado: formatTimeForInput(sesion.horario_inicio),
                horario_fin_formateado: formatTimeForInput(sesion.horario_fin),
                docente: sesion.id_docente
            })
            
            afternoonSlots[index].startTime = formatTimeForInput(sesion.horario_inicio)
            afternoonSlots[index].endTime = formatTimeForInput(sesion.horario_fin)
            afternoonSlots[index].teacher = sesion.id_docente
            afternoonSlots[index].id_sesion = sesion.id_sesion
        }
    })
    
    console.log('Formulario cargado con sesiones existentes')
}

// Borrar sesiones existentes y crear nuevas
const deleteAndCreateSessions = async (fechasSeleccionadas) => {
    console.log('Iniciando proceso de borrado y creación de sesiones')
    
    // Obtener los días de impartición existentes para este grupo
    const diasExistentes = store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION 
        ? diasTeleformacion.value 
        : diasPresencial.value
    
    console.log('Días existentes:', diasExistentes)
    
    // Procesar cada fecha seleccionada
    for (const fecha of fechasSeleccionadas) {
        const fechaString = formatDateToString(fecha)
        console.log(`Procesando fecha: ${fechaString}`)
        
        // Buscar si ya existe un día de impartición para esta fecha
        const diaExistente = diasExistentes.find(dia => {
            const diaFecha = formatDateToString(new Date(dia.fecha_imparticion))
            return diaFecha === fechaString
        })
        
        let diaImparticionId = null
        
        if (diaExistente) {
            // Si existe, obtener su ID
            diaImparticionId = store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION 
                ? diaExistente.id_dia_tele 
                : diaExistente.id_dia_pres
            console.log(`Usando día existente para ${fechaString}:`, diaImparticionId)
            
            // BORRAR todas las sesiones existentes para este día
            const sesionesDelDia = sesiones.value.filter(sesion => {
                if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
                    return sesion.id_dia_tele === diaImparticionId
                } else {
                    return sesion.id_dia_pres === diaImparticionId
                }
            })
            
            console.log(`Borrando ${sesionesDelDia.length} sesiones existentes para ${fechaString}`)
            for (const sesion of sesionesDelDia) {
                await deleteSesionService(sesion.id_sesion)
                console.log(`Sesión eliminada: ${sesion.id_sesion}`)
            }
            
            // Recargar los días de impartición para verificar si el día aún existe
            // (el backend puede haberlo borrado si era la última sesión)
            if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
                await fetchDiasTeleformacion({ id_grupo: grupo.value.id_grupo })
            } else if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL) {
                await fetchDiasPresencial({ id_grupo: grupo.value.id_grupo })
            }
            
            // Verificar si el día aún existe después de borrar las sesiones
            const diasActualizados = store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION 
                ? diasTeleformacion.value 
                : diasPresencial.value
            
            const diaAunExiste = diasActualizados.find(dia => {
                const diaFecha = formatDateToString(new Date(dia.fecha_imparticion))
                return diaFecha === fechaString
            })
            
            // Calcular horarios de tramos basándose en las sesiones que se van a guardar
            const slotsManana = morningSlots.filter(slot => slot.startTime && slot.endTime && slot.teacher)
            const slotsTarde = afternoonSlots.filter(slot => slot.startTime && slot.endTime && slot.teacher)
            
            // Calcular horario tramo 1 (mañana)
            let horarioInicioTramo1 = null
            let horarioFinTramo1 = null
            if (slotsManana.length > 0) {
                const horariosInicio = slotsManana.map(slot => slot.startTime).filter(time => time)
                const horariosFin = slotsManana.map(slot => slot.endTime).filter(time => time)
                
                if (horariosInicio.length > 0) {
                    horarioInicioTramo1 = horariosInicio.sort()[0] // Hora más temprana
                }
                if (horariosFin.length > 0) {
                    horarioFinTramo1 = horariosFin.sort().reverse()[0] // Hora más tardía
                }
            }
            
            // Calcular horario tramo 2 (tarde)
            let horarioInicioTramo2 = null
            let horarioFinTramo2 = null
            if (slotsTarde.length > 0) {
                const horariosInicio = slotsTarde.map(slot => slot.startTime).filter(time => time)
                const horariosFin = slotsTarde.map(slot => slot.endTime).filter(time => time)
                
                if (horariosInicio.length > 0) {
                    horarioInicioTramo2 = horariosInicio.sort()[0] // Hora más temprana
                }
                if (horariosFin.length > 0) {
                    horarioFinTramo2 = horariosFin.sort().reverse()[0] // Hora más tardía
                }
            }
            
            // Obtener el docente del primer slot configurado (mañana o tarde)
            const primerDocente = (slotsManana.length > 0 && slotsManana[0].teacher) 
                ? parseInt(slotsManana[0].teacher)
                : (slotsTarde.length > 0 && slotsTarde[0].teacher) 
                    ? parseInt(slotsTarde[0].teacher)
                    : null
            
            if (diaAunExiste) {
                // Si el día aún existe, actualizarlo
                diaImparticionId = store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION 
                    ? diaAunExiste.id_dia_tele 
                    : diaAunExiste.id_dia_pres
                
                const updateData = {
                    id_docente: primerDocente,
                    horario_inicio_tramo1: horarioInicioTramo1,
                    horario_fin_tramo1: horarioFinTramo1,
                    horario_inicio_tramo2: horarioInicioTramo2,
                    horario_fin_tramo2: horarioFinTramo2
                }
                
                console.log('Actualizando horarios del día existente:', updateData)
                console.log('ID del día de impartición:', diaImparticionId)
                if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
                    await updateDiaTeleformacion(diaImparticionId, updateData)
                } else if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL) {
                    await updateDiaPresencial(diaImparticionId, updateData)
                }
            } else {
                // Si el día fue borrado, crear uno nuevo
                console.log(`El día fue borrado al eliminar las sesiones. Creando nuevo día para ${fechaString}`)
                
                const diaData = {
                    id_grupo: grupo.value.id_grupo,
                    id_docente: primerDocente,
                    fecha_imparticion: fechaString,
                    horario_inicio_tramo1: horarioInicioTramo1,
                    horario_fin_tramo1: horarioFinTramo1,
                    horario_inicio_tramo2: horarioInicioTramo2,
                    horario_fin_tramo2: horarioFinTramo2
                }
                
                console.log('Datos del día a crear:', diaData)
                if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
                    const diaCreado = await createDiaTeleformacion(diaData)
                    diaImparticionId = diaCreado.id_dia_tele
                } else if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL) {
                    const diaCreado = await createDiaPresencial(diaData)
                    diaImparticionId = diaCreado.id_dia_pres
                }
            }
        } else {
            // Si no existe, crear un nuevo día de impartición
            console.log(`Creando nuevo día de impartición para ${fechaString}`)
            
            // Obtener el primer docente disponible como docente por defecto
            const primerDocente = docentes.value && docentes.value.length > 0 
                ? docentes.value[0].id_docente_grupo 
                : null
            
            // Calcular horarios de tramos basándose en las sesiones que se van a guardar
            const slotsManana = morningSlots.filter(slot => slot.startTime && slot.endTime && slot.teacher)
            const slotsTarde = afternoonSlots.filter(slot => slot.startTime && slot.endTime && slot.teacher)
            
            // Calcular horario tramo 1 (mañana)
            let horarioInicioTramo1 = null
            let horarioFinTramo1 = null
            if (slotsManana.length > 0) {
                const horariosInicio = slotsManana.map(slot => slot.startTime).filter(time => time)
                const horariosFin = slotsManana.map(slot => slot.endTime).filter(time => time)
                
                if (horariosInicio.length > 0) {
                    horarioInicioTramo1 = horariosInicio.sort()[0] // Hora más temprana
                }
                if (horariosFin.length > 0) {
                    horarioFinTramo1 = horariosFin.sort().reverse()[0] // Hora más tardía
                }
            }
            
            // Calcular horario tramo 2 (tarde)
            let horarioInicioTramo2 = null
            let horarioFinTramo2 = null
            if (slotsTarde.length > 0) {
                const horariosInicio = slotsTarde.map(slot => slot.startTime).filter(time => time)
                const horariosFin = slotsTarde.map(slot => slot.endTime).filter(time => time)
                
                if (horariosInicio.length > 0) {
                    horarioInicioTramo2 = horariosInicio.sort()[0] // Hora más temprana
                }
                if (horariosFin.length > 0) {
                    horarioFinTramo2 = horariosFin.sort().reverse()[0] // Hora más tardía
                }
            }
            
            const diaData = {
                id_grupo: grupo.value.id_grupo,
                id_docente: primerDocente,
                fecha_imparticion: fechaString,
                horario_inicio_tramo1: horarioInicioTramo1,
                horario_fin_tramo1: horarioFinTramo1,
                horario_inicio_tramo2: horarioInicioTramo2,
                horario_fin_tramo2: horarioFinTramo2
            }
            
            console.log('Datos del día a crear:', diaData)
            
            if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
                const diaCreado = await createDiaTeleformacion(diaData)
                diaImparticionId = diaCreado.id_dia_tele
            } else if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL) {
                const diaCreado = await createDiaPresencial(diaData)
                diaImparticionId = diaCreado.id_dia_pres
            }
        }
        
        // CREAR nuevas sesiones para los slots de mañana
        const slotsManana = morningSlots.filter(slot => slot.startTime && slot.endTime && slot.teacher)
        console.log(`Creando ${slotsManana.length} sesiones de mañana para ${fechaString}`)
        for (const slot of slotsManana) {
            const sesionData = {
                id_dia_tele: store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION ? diaImparticionId : null,
                id_dia_pres: store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL ? diaImparticionId : null,
                id_docente: parseInt(slot.teacher),
                es_manana: true,
                horario_inicio: slot.startTime,
                horario_fin: slot.endTime
            }
            
            await createSesionService(sesionData)
            console.log('Sesión de mañana creada:', sesionData)
        }
        
        // CREAR nuevas sesiones para los slots de tarde
        const slotsTarde = afternoonSlots.filter(slot => slot.startTime && slot.endTime && slot.teacher)
        console.log(`Creando ${slotsTarde.length} sesiones de tarde para ${fechaString}`)
        for (const slot of slotsTarde) {
            const sesionData = {
                id_dia_tele: store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION ? diaImparticionId : null,
                id_dia_pres: store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL ? diaImparticionId : null,
                id_docente: parseInt(slot.teacher),
                es_manana: false,
                horario_inicio: slot.startTime,
                horario_fin: slot.endTime
            }
            
            await createSesionService(sesionData)
            console.log('Sesión de tarde creada:', sesionData)
        }
    }
    
    console.log('Proceso de borrado y creación completado')
}

// Guardar horarios
const saveHorarios = async () => {
    if (!selectedDates.value || selectedDates.value.length === 0) {
        toast.add({
            severity: 'warn',
            summary: 'Fechas requeridas',
            detail: 'Por favor, selecciona al menos una fecha',
            life: 3000
        })
        return
    }

    if (!store.tipoModalidadSesiones) {
        toast.add({
            severity: 'warn',
            summary: 'Modalidad requerida',
            detail: 'No se ha seleccionado una modalidad de sesión',
            life: 3000
        })
        return
    }

    try {
        loading.value = true
        
        // Asegurarse de que las horas consumidas estén actualizadas antes de validar
        await calcularHorasConsumidas()
        
        // Usar las fechas UTC para el procesamiento
        const fechasSeleccionadas = selectedDatesUTC.value
        
        console.log('Fechas seleccionadas:', fechasSeleccionadas.map(f => f.toLocaleDateString('es-ES')))
        
        // Calcular horas por fecha (de los slots configurados - nuevas sesiones)
        let horasPorFecha = 0
        let sesionesPorFecha = 0
        morningSlots.forEach(slot => {
            if (slot.startTime && slot.endTime) {
                horasPorFecha += calcularHorasDeTiempo(slot.startTime, slot.endTime)
                sesionesPorFecha++
            }
        })
        afternoonSlots.forEach(slot => {
            if (slot.startTime && slot.endTime) {
                horasPorFecha += calcularHorasDeTiempo(slot.startTime, slot.endTime)
                sesionesPorFecha++
            }
        })
        
        // Calcular horas de las sesiones existentes en los días seleccionados (que se van a eliminar)
        let horasExistentesTotal = 0
        const diasExistentes = store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION 
            ? diasTeleformacion.value 
            : diasPresencial.value
        
        for (const fecha of fechasSeleccionadas) {
            const fechaString = formatDateToString(fecha)
            
            // Buscar el día de impartición para esta fecha
            const diaExistente = diasExistentes.find(dia => {
                const diaFecha = formatDateToString(new Date(dia.fecha_imparticion))
                return diaFecha === fechaString
            })
            
            if (diaExistente) {
                // Obtener el ID del día según la modalidad
                const diaImparticionId = store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION 
                    ? diaExistente.id_dia_tele 
                    : diaExistente.id_dia_pres
                
                // Obtener todas las sesiones de este día
                const sesionesDelDia = sesiones.value.filter(sesion => {
                    if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
                        return sesion.id_dia_tele === diaImparticionId
                    } else {
                        return sesion.id_dia_pres === diaImparticionId
                    }
                })
                
                // Sumar las horas de las sesiones existentes que se van a eliminar
                sesionesDelDia.forEach(sesion => {
                    horasExistentesTotal += calcularHorasDeTiempo(sesion.horario_inicio, sesion.horario_fin)
                })
            }
        }
        
        // Calcular el cambio neto de horas (nuevas - existentes)
        const horasNuevasTotal = horasPorFecha * fechasSeleccionadas.length
        const cambioNetoHoras = horasNuevasTotal - horasExistentesTotal
        
        // Obtener horas totales según la modalidad
        let horasTotales = 0
        if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
            horasTotales = grupo.value.accionFormativa?.horas_modalidad_teleformacion || 0
        } else if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL) {
            horasTotales = grupo.value.accionFormativa?.horas_modalidad_presencial || 0
        } else if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.MIXTA) {
            horasTotales = (grupo.value.accionFormativa?.horas_modalidad_teleformacion || 0) + 
                           (grupo.value.accionFormativa?.horas_modalidad_presencial || 0)
        }
        
        // Calcular las horas que quedarían después del cambio
        const horasConsumidasDespues = horasConsumidas.value + cambioNetoHoras
        
        // Validar que las horas consumidas después del cambio no excedan las totales
        // Usar >= para ser más estricto y evitar problemas de redondeo
        if (horasConsumidasDespues > horasTotales) {
            const horasExcedidas = horasConsumidasDespues - horasTotales
            toast.add({
                severity: 'error',
                summary: 'Horas insuficientes',
                detail: `No se pueden reasignar las sesiones. El cambio resultaría en ${horasConsumidasDespues.toFixed(2)} horas consumidas, excediendo el límite de ${horasTotales.toFixed(2)} horas por ${horasExcedidas.toFixed(2)} horas.`,
                life: 5000
            })
            loading.value = false
            return
        }
        
        // Validación adicional: asegurar que no haya valores negativos o inválidos
        if (horasConsumidasDespues < 0) {
            toast.add({
                severity: 'error',
                summary: 'Error en el cálculo',
                detail: 'Se ha detectado un error en el cálculo de horas. Por favor, recarga la página e inténtalo de nuevo.',
                life: 5000
            })
            loading.value = false
            return
        }
        
        // Si el cambio es válido, procesar todas las fechas
        let fechasAProcesar = fechasSeleccionadas
        
        // Siempre borrar sesiones existentes y crear nuevas
        console.log('Borrando sesiones existentes y creando nuevas')
        await deleteAndCreateSessions(fechasAProcesar)
        
        // Recargar los datos para mostrar los cambios
        await loadDatosSesiones(grupo.value.id_grupo)
        
        // Limpiar formulario
        clearForm()
        selectedDatesLocal.value = []
        selectedDay.value = null
        existingSessions.value = []
        
        const totalSesionesGuardadas = sesionesPorFecha * fechasAProcesar.length
        
        toast.add({
            severity: 'success',
            summary: 'Horarios guardados',
            detail: `Horarios guardados correctamente. Se procesaron ${totalSesionesGuardadas} sesiones en ${fechasAProcesar.length} fecha(s).`,
            life: 3000
        })
        
    } catch (error) {
        console.error('Error al guardar los horarios:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al guardar',
            detail: 'Error al guardar los horarios. Por favor, inténtalo de nuevo.',
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

const clearForm = () => {
    morningSlots.forEach(slot => {
        slot.startTime = ''
        slot.endTime = ''
        slot.teacher = ''
        slot.id_sesion = null
    })
    afternoonSlots.forEach(slot => {
        slot.startTime = ''
        slot.endTime = ''
        slot.teacher = ''
        slot.id_sesion = null
    })
}

// Abrir diálogo de confirmación para borrar días seleccionados
const deleteHorarios = () => {
    if (!selectedDates.value || selectedDates.value.length === 0) {
        toast.add({
            severity: 'warn',
            summary: 'Fechas requeridas',
            detail: 'Por favor, selecciona al menos una fecha',
            life: 3000
        })
        return
    }
    showDeleteConfirmDialog.value = true
}

// Confirmar eliminación de sesiones
const confirmDeleteSesiones = async () => {
    if (!selectedDates.value || selectedDates.value.length === 0) {
        showDeleteConfirmDialog.value = false
        return
    }

    if (!store.tipoModalidadSesiones) {
        toast.add({
            severity: 'warn',
            summary: 'Modalidad requerida',
            detail: 'No se ha seleccionado una modalidad de sesión',
            life: 3000
        })
        showDeleteConfirmDialog.value = false
        return
    }

    try {
        loading.value = true
        
        // Usar las fechas UTC para el procesamiento
        const fechasSeleccionadas = selectedDatesUTC.value
        
        // Obtener los días de impartición existentes para este grupo
        const diasExistentes = store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION 
            ? diasTeleformacion.value 
            : diasPresencial.value
        
        let totalSesionesEliminadas = 0
        
        // Procesar cada fecha seleccionada
        for (const fecha of fechasSeleccionadas) {
            const fechaString = formatDateToString(fecha)
            
            // Buscar el día de impartición para esta fecha
            const diaExistente = diasExistentes.find(dia => {
                const diaFecha = formatDateToString(new Date(dia.fecha_imparticion))
                return diaFecha === fechaString
            })
            
            if (diaExistente) {
                // Obtener el ID del día según la modalidad
                const diaImparticionId = store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION 
                    ? diaExistente.id_dia_tele 
                    : diaExistente.id_dia_pres
                
                // Obtener todas las sesiones de este día
                const sesionesDelDia = sesiones.value.filter(sesion => {
                    if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
                        return sesion.id_dia_tele === diaImparticionId
                    } else {
                        return sesion.id_dia_pres === diaImparticionId
                    }
                })
                
                // Eliminar todas las sesiones del día
                for (const sesion of sesionesDelDia) {
                    await deleteSesionService(sesion.id_sesion)
                    totalSesionesEliminadas++
                }
            }
        }
        
        // Recargar los datos para mostrar los cambios
        await loadDatosSesiones(grupo.value.id_grupo)
        
        // Recalcular horas consumidas
        await calcularHorasConsumidas()
        
        // Limpiar formulario y selección
        clearForm()
        selectedDatesLocal.value = []
        selectedDay.value = null
        existingSessions.value = []
        
        toast.add({
            severity: 'success',
            summary: 'Sesiones eliminadas',
            detail: `Se eliminaron ${totalSesionesEliminadas} sesión(es) de ${fechasSeleccionadas.length} día(s).`,
            life: 3000
        })
        
        showDeleteConfirmDialog.value = false
        
    } catch (error) {
        console.error('Error al eliminar las sesiones:', error)
        toast.add({
            severity: 'error',
            summary: 'Error al eliminar',
            detail: 'Error al eliminar las sesiones. Por favor, inténtalo de nuevo.',
            life: 3000
        })
    } finally {
        loading.value = false
    }
}

// Cancelar eliminación
const cancelDeleteHorarios = () => {
    showDeleteConfirmDialog.value = false
}

// Eliminar slot de sesión
const deleteSlot = async (slot, tipo, index) => {
    // Si el slot tiene un id_sesion, significa que es una sesión existente que hay que eliminar de la BD
    if (slot.id_sesion) {
        try {
            loading.value = true
            
            // Eliminar la sesión de la base de datos
            await deleteSesionService(slot.id_sesion)
            
            // Eliminar de existingSessions si existe
            const sesionIndex = existingSessions.value.findIndex(s => s.id_sesion === slot.id_sesion)
            if (sesionIndex !== -1) {
                existingSessions.value.splice(sesionIndex, 1)
            }
            
            // Recargar los datos de sesiones para actualizar la vista
            await loadDatosSesiones(grupo.value.id_grupo)
            
            // Si había una fecha seleccionada, recargar sus sesiones para actualizar el formulario
            if (selectedDay.value) {
                loadSessionsForSelectedDay(selectedDay.value)
            }
            
            toast.add({
                severity: 'success',
                summary: 'Sesión eliminada',
                detail: 'La sesión se ha eliminado correctamente',
                life: 3000
            })
        } catch (error) {
            console.error('Error al eliminar la sesión:', error)
            toast.add({
                severity: 'error',
                summary: 'Error al eliminar',
                detail: 'No se pudo eliminar la sesión. Por favor, inténtalo de nuevo.',
                life: 3000
            })
        } finally {
            loading.value = false
        }
    } else {
        // Si no tiene id_sesion, simplemente limpiar el slot del formulario
        slot.startTime = ''
        slot.endTime = ''
        slot.teacher = ''
        slot.id_sesion = null
    }
}

const loadGrupo = async (grupoId) => {
    loading.value = true
    error.value = null
    
    try {
        const grupoData = await getGrupoById(grupoId)
        grupo.value = grupoData
        store.setActiveGrupo(grupoData)
        await fetchDocentes(grupoId, store.tipoModalidadSesiones)
    } catch (err) {
        error.value = 'Error al cargar el grupo'
        console.error('Error loading grupo:', err)
    } finally {
        loading.value = false
    }
}

const loadDatosSesiones = async (grupoId) => {
    try {
        // Cargar días de impartición según la modalidad
        if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.TELEFORMACION) {
            await fetchDiasTeleformacion({ id_grupo: grupoId })
        } else if (store.tipoModalidadSesiones === MODALIDAD_SESIONES.PRESENCIAL) {
            await fetchDiasPresencial({ id_grupo: grupoId })
        }
        
        // Cargar sesiones del grupo
        await fetchSesiones({ id_grupo: grupoId })
        
        // Calcular horas consumidas
        await calcularHorasConsumidas()
    } catch (err) {
        console.error('Error cargando datos de sesiones:', err)
    }
}

onMounted(async () => {
    const grupoId = route.params.id
    if (store.activeGrupo && store.activeGrupo.id_grupo == grupoId) {
        grupo.value = store.activeGrupo
        await fetchDocentes(grupoId, store.tipoModalidadSesiones)
        await loadDatosSesiones(grupoId)
    } else {
        await loadGrupo(grupoId)
    }
})

// Watcher para recargar docentes cuando cambie la modalidad
watch(() => store.tipoModalidadSesiones, async (newModalidad) => {
    if (grupo.value && newModalidad) {
        await fetchDocentes(grupo.value.id_grupo, newModalidad)
        await loadDatosSesiones(grupo.value.id_grupo)
    }
})
</script>
<style scoped lang="scss">
@use '@/styles/abstracts/variables.scss' as *;
@use '@/styles/base/typography.scss' as typo;
@use '@/styles/abstracts/colors.scss' as *;
.sesiones-container {
    .p-datepicker { 
        width: 100%;
    }
    }
    
    :deep(.p-datepicker-calendar) {

        .p-datepicker-day {
        height: 100% !important;
        border-radius: 0px !important;
        min-width: 100px !important;
    }

    .p-datepicker-day.p-datepicker-day-selected {
        background-color: $color__secondary !important;
    }

    .p-datepicker-day:not(.p-datepicker-day-selected):not(.p-disabled):has(.has-sessions):hover {
        background-color: $color__accent-red-light !important;
    }

    .p-datepicker-day:not(.p-datepicker-day-selected):not(.p-disabled):not(:has(.has-sessions)):hover {
        background-color: $color__white !important;
    }

    .p-datepicker-day.p-datepicker-day-selected:not(.p-disabled):not(:has(.has-sessions)):not(.p-datepicker-day-selected):hover {
        background-color: $color__secondary !important;
    }


        .p-datepicker-day-cell.p-datepicker-today {
            .p-datepicker-day {
                background-color: transparent !important;
            }
        }

        td {
            height: 100px;
            padding: 0;

            span {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }

        td:has(.has-sessions) {
            background-color: $color__accent-red-light;  
            .date-cell {
                .date-number {
                    font-weight: 600;
                    color: $color__accent-red;
                }
                .session-count {
                    color: $color__black;
                    font-weight: 600;
                }
            }
        }
        
        td:has(.selected-day) {
            background-color: $color__secondary;
            .date-cell {
                .date-number {
                    font-weight: 700;
                    color: $color__primary;
                }
            }
        }
        
        // Si un día tiene tanto sesiones como está seleccionado
        td:has(.has-sessions.selected-day) {
            background-color: $color__secondary;
            .date-cell {
                .date-number {
                    font-weight: 700;
                    color: $color__primary;
                }
            }
        }
        
        .date-cell {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            justify-content: center;
        }
    }

.horarios-form {
    display: flex;
    flex-direction: column;
    gap: $spacing__12;

    .p-button {
        max-width: 300px;
    }

    .horarios-form__buttons {
        display: flex;
        gap: $spacing__12;
    }
}

.horarios-section {
    &__title {
        @include typo.title-large(600);
        color: $color__mid-grey;
        text-align: left;
    }
    .horario-slot {
        display: flex;
        gap: $spacing__12;
        align-items: flex-end;
        margin-bottom: $spacing__12;
        flex-wrap: wrap;
    }
}

.add-session-form {
    display: flex;
    justify-content: start;
    align-items: flex-end;
    gap: $spacing__12;
    margin-bottom: $spacing__24;
    flex-wrap: wrap;

    .form-group:first-child {
        flex: 0;
    }
    
    .days-checkboxes {
        display: flex;
        gap: $spacing__8;
    }

    .time-inputs {
        display: flex;
        align-items: center;
        gap: $spacing__8;
    }
}
</style>