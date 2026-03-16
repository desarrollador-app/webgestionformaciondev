<template>
    <div class="modal-content">
        <div>
        <!-- Campos básicos -->
            <div v-if="isEditingMode === 'general'" class="form">
                <div class="form-group">
                    <label for="plan" class="form-label required">Plan</label>
                    <Select 
                        id="plan" 
                        v-model="formData.id_plan" 
                        :options="planes" 
                        optionLabel="nombre"
                        optionValue="id_plan"
                        showClear
                        :required="true"

                    />
                </div>
                <div class="form-group">
                    <label for="accionFormativa" class="form-label required">Acción Formativa</label>
                    <Select 
                        id="accionFormativa" 
                        v-model="formData.id_accion" 
                        :options="accionesFormativas" 
                        optionLabel="denominacion"
                        optionValue="id_accion"
                        :disabled="isEditingGrupo"
                        showClear
                        :required="true"
                    />
                </div>
                <div class="form-group">
                    <label for="estado" class="form-label">Estado</label>
                    <Select 
                        id="estado" 
                        v-model="formData.estado" 
                        :options="estadosGrupo" 
                        optionLabel="label"
                        optionValue="value"
                        showClear
                    />
                </div>
<!-- Creación de apartado Código Grupo -->
                <div class="form-group">
                    <label for="codigoGrupo">Código del Grupo</label>
                    <InputText 
                        id="codigoGrupo" 
                        v-model="codigoGrupo" 
                        @blur="validarCodigoUnico" 
                        :class="{ 'p-invalid': errorCodigo }" 
                        placeholder="Ej: 2.1"
                    />
                    <small v-if="errorCodigo" class="p-error" style="display: block; margin-top: 5px;">
                        {{ errorCodigo }}
                    </small>
                </div>

                <div class="form-group">
                    <label for="denominacion" class="form-label required">Denominación</label>
                    <InputText 
                        id="denominacion" 
                        v-model="formData.denominacion" 
                        :required="true"
                        :class="{ 'p-invalid': errors.denominacion }"
                    />
                    <small v-if="errors.denominacion" class="p-error">{{ errors.denominacion }}</small>
                </div>
                <div class="form-group">
                    <label for="responsable" class="form-label required">Responsable</label>
                    <Select 
                        id="responsable" 
                        v-model="formData.responsable" 
                        :options="responsables" 
                        optionLabel="label"
                        optionValue="value"
                        :disabled="loadingUsers"
                        :loading="loadingUsers"
                        showClear
                        :required="true"
                    />
                    <small v-if="usersError" class="error-message">
                        Error al cargar responsables: {{ usersError }}
                    </small>
                </div>
                <div class="form-group">
                    <label for="telefonoResponsable" class="form-label required">Teléfono Responsable</label>
                    <InputText 
                        id="telefonoResponsable" 
                        v-model="formData.telefono_responsable" 
                        :required="true"
                        :class="{ 'p-invalid': errors.telefono_responsable }"
                    />
                    <small v-if="errors.telefono_responsable" class="p-error">{{ errors.telefono_responsable }}</small>
                </div>
                <!-- Añadimos los apartados de tipo_bonificacion y max_alumnos -->
                <div class="form-group">
                    <label for="tipo_bonificacion" class="block">Tipo de Bonificación</label>
                    <Dropdown 
                        id="tipo_bonificacion" 
                        v-model="formData.tipo_bonificacion" 
                        :options="bonificacionOptions" 
                        optionLabel="label" 
                        optionValue="value" 
                        placeholder="Seleccione un tipo" 
                        class="w-full"
                    />
                </div>

                <div class="form-group">
                    <label for="max_alumnos" class="block">Límite manual de alumnos (opcional)</label>
                    <InputNumber 
                        id="max_alumnos" 
                        v-model="formData.max_alumnos" 
                        :min="0" 
                        class="w-full" 
                        placeholder="Ej: 25"
                    />
                    <small class="block text-secondary">Si se deja vacío, se aplicará el límite por tipo (30 o 80).</small>
            </div>
                <div class="form-group">
                        <label for="fechaInicio" class="form-label required">Fecha Inicio</label>
                        <Datepicker 
                            id="fechaInicio" 
                            v-model="fechaInicioLocal" 
                            showIcon
                            dateFormat="dd/mm/yy"
                            :required="true"
                            :showOnFocus="false"
                        />
                </div>
                <div class="form-group">
                    <label for="fechaFin" class="form-label required">Fecha Fin</label>
                    <Datepicker 
                        id="fechaFin" 
                        v-model="fechaFinLocal" 
                        showIcon
                        dateFormat="dd/mm/yy"
                        :required="true"
                        :showOnFocus="false"
                    />
                </div>
                <div class="form-group">
                    <label for="observaciones" class="form-label">Observaciones</label>
                    <Textarea
                        id="observaciones" 
                        v-model="formData.observaciones" 
                        rows="3"
                    />
                </div>
                <div class="form-group">
                    <label for="moodleId" class="form-label">ID Curso en Moodle</label>
                    <InputText 
                        id="moodleId" 
                        v-model="formData.moodle_grupo_id" 
                    />
                </div>
                <div class="form-group" v-if="esSeguridadPrivada">
                    <label for="numHomologacionSeguridad" class="form-label">Nº Homologación Seguridad</label>
                    <InputText 
                        id="numHomologacionSeguridad" 
                        v-model="formData.num_homologacion_seguridad" 
                    />
                </div>
                <div class="form-group">
                    <label for="lugarFechaDiploma" class="form-label">Lugar y fecha diploma</label>
                    <InputText 
                        id="lugarFechaDiploma" 
                        v-model="formData.lugar_fecha_diploma" 
                    />
                </div>
            </div>

            <!-- Sección de Presencial -->
            <div v-if="isEditingMode === 'presencial'" class="form">
                <div class="form-group">
                    <label for="centroCif" class="form-label required">CIF Centro</label>
                    <InputText 
                        id="centroCif" 
                        v-model="formData.centro_cif" 
                        :required="true"
                        :class="{ 'p-invalid': errors.centro_cif }"
                    />
                    <small v-if="errors.centro_cif" class="p-error">{{ errors.centro_cif }}</small>
                </div>
                <div class="form-group">
                    <label for="centroNombre" class="form-label required">Nombre Centro</label>
                    <InputText 
                        id="centroNombre" 
                        v-model="formData.centro_nombre" 
                        :required="true"
                        :class="{ 'p-invalid': errors.centro_nombre }"
                    />
                    <small v-if="errors.centro_nombre" class="p-error">{{ errors.centro_nombre }}</small>
                </div>
                <div class="form-group">
                    <label for="centroDireccion" class="form-label required">Dirección Centro</label>
                    <InputText 
                        id="centroDireccion" 
                        v-model="formData.centro_direccion" 
                        :required="true"
                        :class="{ 'p-invalid': errors.centro_direccion }"
                    />
                    <small v-if="errors.centro_direccion" class="p-error">{{ errors.centro_direccion }}</small>
                </div>
                <div class="form-group">
                        <label for="centroCodPostal" class="form-label required">Código Postal Centro</label>
                        <InputText 
                            id="centroCodPostal" 
                            v-model="formData.centro_codPostal" 
                            :required="true"
                            :class="{ 'p-invalid': errors.centro_codPostal }"
                        />
                        <small v-if="errors.centro_codPostal" class="p-error">{{ errors.centro_codPostal }}</small>
                </div>
                <div class="form-group">
                    <label for="centroLocalidad" class="form-label required">Localidad Centro</label>
                    <InputText 
                        id="centroLocalidad" 
                        v-model="formData.centro_localidad" 
                        :required="true"
                        :class="{ 'p-invalid': errors.centro_localidad }"
                    />
                    <small v-if="errors.centro_localidad" class="p-error">{{ errors.centro_localidad }}</small>
                </div>
				<div class="form-group">
                    <label for="lugarImparticionCif" class="form-label">CIF Lugar de impartición</label>
                    <InputText 
                        id="lugarImparticionCif" 
                        v-model="formData.lugar_imparticion_cif" 
                        :class="{ 'p-invalid': errors.lugar_imparticion_cif }"
                    />
                    <small v-if="errors.lugar_imparticion_cif" class="p-error">{{ errors.lugar_imparticion_cif }}</small>
                </div>
                <div class="form-group">
                    <label for="lugarImparticionNombre" class="form-label required">Nombre Lugar de impartición</label>
                    <InputText 
                        id="lugarImparticionNombre" 
                        v-model="formData.lugar_imparticion_nombre" 
                        :required="true"
                        :class="{ 'p-invalid': errors.lugar_imparticion_nombre }"
                    />
                    <small v-if="errors.lugar_imparticion_nombre" class="p-error">{{ errors.lugar_imparticion_nombre }}</small>
                </div>
                <div class="form-group">
                    <label for="lugarImparticionDireccion" class="form-label required">Dirección Lugar de impartición</label>
                    <InputText 
                        id="lugarImparticionDireccion" 
                        v-model="formData.lugar_imparticion_direccion" 
                        :required="true"
                        :class="{ 'p-invalid': errors.lugar_imparticion_direccion }"
                    />
                    <small v-if="errors.lugar_imparticion_direccion" class="p-error">{{ errors.lugar_imparticion_direccion }}</small>
                </div>
                <div class="form-group">
                    <label for="lugarImparticionCodPostal" class="form-label required">Código Postal Lugar de impartición</label>
                    <InputText 
                        id="lugarImparticionCodPostal" 
                        v-model="formData.lugar_imparticion_codPostal" 
                        :required="true"
                        :class="{ 'p-invalid': errors.lugar_imparticion_codPostal }"
                    />
                    <small v-if="errors.lugar_imparticion_codPostal" class="p-error">{{ errors.lugar_imparticion_codPostal }}</small>
                </div>
                <div class="form-group">
                    <label for="lugarImparticionLocalidad" class="form-label required">Localidad Lugar de impartición</label>
                    <InputText 
                        id="lugarImparticionLocalidad" 
                        v-model="formData.lugar_imparticion_localidad" 
                        :required="true"
                        :class="{ 'p-invalid': errors.lugar_imparticion_localidad }"
                    />
                    <small v-if="errors.lugar_imparticion_localidad" class="p-error">{{ errors.lugar_imparticion_localidad }}</small>
                </div>
                
                <div class="form-group">
                    <label for="horaInicioTramo1PresencialHorario" class="form-label">Hora Inicio Tramo 1</label>
                    <Datepicker 
                        id="horaInicioTramo1PresencialHorario" 
                        v-model="formData.hora_inicio_tramo1_presencial_horario" 
                        timeOnly
                        hourFormat="24"
                        showIcon
                        :showOnFocus="false"
                    />
                </div>
                
                <div class="form-group">
                    <label for="horaFinTramo1PresencialHorario" class="form-label">Hora Fin Tramo 1</label>
                    <Datepicker 
                        id="horaFinTramo1PresencialHorario" 
                        v-model="formData.hora_fin_tramo1_presencial_horario" 
                        timeOnly
                        hourFormat="24"
                        showIcon
                        :showOnFocus="false"
                    />
                </div>
                
                <div class="form-group">
                    <label for="horaInicioTramo2PresencialHorario" class="form-label">Hora Inicio Tramo 2</label>
                    <Datepicker 
                        id="horaInicioTramo2PresencialHorario" 
                        v-model="formData.hora_inicio_tramo2_presencial_horario" 
                        timeOnly
                        hourFormat="24"
                        showIcon
                        :showOnFocus="false"
                    />
                </div>
                
                <div class="form-group">
                    <label for="horaFinTramo2PresencialHorario" class="form-label">Hora Fin Tramo 2</label>
                    <Datepicker 
                        id="horaFinTramo2PresencialHorario" 
                        v-model="formData.hora_fin_tramo2_presencial_horario" 
                        timeOnly
                        hourFormat="24"
                        showIcon
                        :showOnFocus="false"
                    />
                </div>
                
                <div class="form-container add-session-form">
                    <div class="form-group">
                        <label class="form-label required">Días Presencial</label>
                        <div class="days-checkboxes">
                            <div class="checkbox-item">
                                <Checkbox v-model="diasPresencialSeleccionados" value="L" inputId="diasPresencial-l" />
                                <label for="diasPresencial-l" class="checkbox-label">L</label>
                            </div>
                            <div class="checkbox-item">
                                <Checkbox v-model="diasPresencialSeleccionados" value="M" inputId="diasPresencial-m" />
                                <label for="diasPresencial-m" class="checkbox-label">M</label>
                            </div>
                            <div class="checkbox-item">
                                <Checkbox v-model="diasPresencialSeleccionados" value="X" inputId="diasPresencial-x" />
                                <label for="diasPresencial-x" class="checkbox-label">X</label>
                            </div>
                            <div class="checkbox-item">
                                <Checkbox v-model="diasPresencialSeleccionados" value="J" inputId="diasPresencial-j" />
                                <label for="diasPresencial-j" class="checkbox-label">J</label>
                            </div>
                            <div class="checkbox-item">
                                <Checkbox v-model="diasPresencialSeleccionados" value="V" inputId="diasPresencial-v" />
                                <label for="diasPresencial-v" class="checkbox-label">V</label>
                            </div>
                            <div class="checkbox-item">
                                <Checkbox v-model="diasPresencialSeleccionados" value="S" inputId="diasPresencial-s" />
                                <label for="diasPresencial-s" class="checkbox-label">S</label>
                            </div>
                            <div class="checkbox-item">
                                <Checkbox v-model="diasPresencialSeleccionados" value="D" inputId="diasPresencial-d" />
                                <label for="diasPresencial-d" class="checkbox-label">D</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Sección de Aula Virtual -->
                <div class="form-group">
                    <div class="checkbox-group">
                        <Checkbox 
                            id="aulaVirtual" 
                            v-model="formData.aula_virtual" 
                            :binary="true"
                        />
                        <label for="aulaVirtual" class="checkbox-label">Aula Virtual</label>
                    </div>
                </div>
                
                <!-- Campos de aula virtual (solo visibles si aula_virtual está activado) -->
                <div v-if="formData.aula_virtual" class="aula-virtual-section">
                    <div class="form-group">
                        <label for="medioAulaVirtual" class="form-label">Medio Aula Virtual</label>
                        <InputText 
                            id="medioAulaVirtual" 
                            v-model="formData.medio_aula_virtual" 
                            :class="{ 'p-invalid': errors.medio_aula_virtual }"
                        />
                        <small v-if="errors.medio_aula_virtual" class="p-error">{{ errors.medio_aula_virtual }}</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="conexionAulaVirtual" class="form-label">Conexión Aula Virtual</label>
                        <InputText 
                            id="conexionAulaVirtual" 
                            v-model="formData.conexion_aula_virtual" 
                            :class="{ 'p-invalid': errors.conexion_aula_virtual }"
                        />
                        <small v-if="errors.conexion_aula_virtual" class="p-error">{{ errors.conexion_aula_virtual }}</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="contactoAulaVirtual" class="form-label">Contacto Aula Virtual</label>
                        <InputText 
                            id="contactoAulaVirtual" 
                            v-model="formData.contacto_aula_virtual" 
                            :class="{ 'p-invalid': errors.contacto_aula_virtual }"
                        />
                        <small v-if="errors.contacto_aula_virtual" class="p-error">{{ errors.contacto_aula_virtual }}</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="telefonoAulaVirtual" class="form-label">Teléfono Aula Virtual</label>
                        <InputText 
                            id="telefonoAulaVirtual" 
                            v-model="formData.telefono_aula_virtual" 
                            :class="{ 'p-invalid': errors.telefono_aula_virtual }"
                        />
                        <small v-if="errors.telefono_aula_virtual" class="p-error">{{ errors.telefono_aula_virtual }}</small>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <Checkbox 
                                id="bimodalAulaVirtual" 
                                v-model="formData.bimodal_aula_virtual" 
                                :binary="true"
                            />
                            <label for="bimodalAulaVirtual" class="checkbox-label">Bimodal Aula Virtual</label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <Checkbox 
                                id="sinParticipantesEnCentroAulaVirtual" 
                                v-model="formData.sin_participantes_en_centro_aula_virtual" 
                                :binary="true"
                            />
                            <label for="sinParticipantesEnCentroAulaVirtual" class="checkbox-label">Sin Participantes en Centro</label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <Checkbox 
                                id="sinDocentesEnCentroAulaVirtual" 
                                v-model="formData.sin_docentes_en_centro_aula_virtual" 
                                :binary="true"
                            />
                            <label for="sinDocentesEnCentroAulaVirtual" class="checkbox-label">Sin Docentes en Centro</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="isEditingMode === 'teleformacion'" class="form">
            <div class="form-group">
                <label for="teleCentroCif" class="form-label required">CIF Telecentro</label>
                    <InputText 
                        id="teleCentroCif" 
                        v-model="formData.tele_centro_cif" 
                        :required="true"
                        :class="{ 'p-invalid': errors.tele_centro_cif }"
                    />
                    <small v-if="errors.tele_centro_cif" class="p-error">{{ errors.tele_centro_cif }}</small>
            </div>
            <div class="form-group">
                <label for="teleCentroNombre" class="form-label required">Nombre Telecentro</label>
                    <InputText 
                        id="teleCentroNombre" 
                        v-model="formData.tele_centro_nombre" 
                        :required="true"
                        :class="{ 'p-invalid': errors.tele_centro_nombre }"
                    />
                    <small v-if="errors.tele_centro_nombre" class="p-error">{{ errors.tele_centro_nombre }}</small>
            </div>
            <div class="form-group">
                <label for="teleCentroDireccion" class="form-label required">Dirección Telecentro</label>
                    <InputText 
                        id="teleCentroDireccion" 
                        v-model="formData.tele_centro_direccion" 
                        :required="true"
                        :class="{ 'p-invalid': errors.tele_centro_direccion }"
                    />
                    <small v-if="errors.tele_centro_direccion" class="p-error">{{ errors.tele_centro_direccion }}</small>
            </div>
            <div class="form-group">
                <label for="teleCentroCodPostal" class="form-label required">Código Postal</label>
                    <InputText 
                        id="teleCentroCodPostal" 
                        v-model="formData.tele_centro_codPostal" 
                        :required="true"
                        :class="{ 'p-invalid': errors.tele_centro_codPostal }"
                    />
                    <small v-if="errors.tele_centro_codPostal" class="p-error">{{ errors.tele_centro_codPostal }}</small>
            </div>
            <div class="form-group">
                <label for="teleCentroLocalidad" class="form-label required">Localidad</label>
                    <InputText 
                        id="teleCentroLocalidad" 
                        v-model="formData.tele_centro_localidad" 
                        :required="true"
                        :class="{ 'p-invalid': errors.tele_centro_localidad }"
                    />
                    <small v-if="errors.tele_centro_localidad" class="p-error">{{ errors.tele_centro_localidad }}</small>
            </div>
            <div class="form-group">
                <label for="teleTelefono" class="form-label required">Teléfono</label>
                    <InputText 
                        id="teleTelefono" 
                        v-model="formData.tele_telefono" 
                        :required="true"
                        :class="{ 'p-invalid': errors.tele_telefono }"
                    />
                    <small v-if="errors.tele_telefono" class="p-error">{{ errors.tele_telefono }}</small>
            </div>  
            <div class="form-group">
                <label for="horaInicioTramo1Tele" class="form-label">Hora Inicio Tramo 1</label>
                    <Datepicker 
                        id="horaInicioTramo1Tele" 
                        v-model="formData.hora_inicio_tramo1_tele" 
                        timeOnly
                        hourFormat="24"
                        showIcon
                        :showOnFocus="false"
                    />
            </div>          
            <div class="form-group">
                <label for="horaFinTramo1Tele" class="form-label">Hora Fin Tramo 1</label>
                    <Datepicker 
                        id="horaFinTramo1Tele" 
                        v-model="formData.hora_fin_tramo1_tele" 
                        timeOnly
                        hourFormat="24"
                        showIcon
                        :showOnFocus="false"
                    />
            </div>
            
            <div class="form-group">
                <label for="horaInicioTramo2Tele" class="form-label">Hora Inicio Tramo 2</label>
                    <Datepicker 
                        id="horaInicioTramo2Tele" 
                        v-model="formData.hora_inicio_tramo2_tele" 
                        timeOnly
                        hourFormat="24"
                        showIcon
                        :showOnFocus="false"
                    />
            </div>
            
            <div class="form-group">
                <label for="horaFinTramo2Tele" class="form-label">Hora Fin Tramo 2</label>
                    <Datepicker 
                        id="horaFinTramo2Tele" 
                        v-model="formData.hora_fin_tramo2_tele" 
                        timeOnly
                        hourFormat="24"
                        showIcon
                        :showOnFocus="false"
                    />
            </div>         
            <div class="form-container add-session-form">
                <div class="form-group">
                    <label class="form-label required">Días Teleformación</label>
                    <div class="days-checkboxes">
                        <div class="checkbox-item">
                            <Checkbox v-model="diasTeleSeleccionados" value="L" inputId="diasTele-l" />
                            <label for="diasTele-l" class="checkbox-label">L</label>
                        </div>
                        <div class="checkbox-item">
                            <Checkbox v-model="diasTeleSeleccionados" value="M" inputId="diasTele-m" />
                            <label for="diasTele-m" class="checkbox-label">M</label>
                        </div>
                        <div class="checkbox-item">
                            <Checkbox v-model="diasTeleSeleccionados" value="X" inputId="diasTele-x" />
                            <label for="diasTele-x" class="checkbox-label">X</label>
                        </div>
                        <div class="checkbox-item">
                            <Checkbox v-model="diasTeleSeleccionados" value="J" inputId="diasTele-j" />
                            <label for="diasTele-j" class="checkbox-label">J</label>
                        </div>
                        <div class="checkbox-item">
                            <Checkbox v-model="diasTeleSeleccionados" value="V" inputId="diasTele-v" />
                            <label for="diasTele-v" class="checkbox-label">V</label>
                        </div>
                        <div class="checkbox-item">
                            <Checkbox v-model="diasTeleSeleccionados" value="S" inputId="diasTele-s" />
                            <label for="diasTele-s" class="checkbox-label">S</label>
                        </div>
                        <div class="checkbox-item">
                            <Checkbox v-model="diasTeleSeleccionados" value="D" inputId="diasTele-d" />
                            <label for="diasTele-d" class="checkbox-label">D</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Datepicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import { getAllPlans } from '@/services/plansService.js'
import { getAllAccionesFormativas } from '@/services/accionesFormativasService.js'
import { useStore } from '@/stores/main.js'
import { useAuthStore } from '@/stores/auth'
import { loadResponsablesForSelect, validateCifNif, validateCodigoPostal, validateTelefono, validateTelefonoAulaVirtual, validateFieldLength } from '@/utils/functions.js'
import { ESTADO_GRUPO } from '@/utils/enums.js'
import { useDateUTC } from '@/composables/useDateUTC.js'
// Creamos el import
import { useGrupos } from '@/composables/useGrupos.js';
// Creamos los import para la parte del formulario de tipo_bonificacion
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';

// Llamamos al composable y sacamos la lista maestra
const { grupos } = useGrupos();
console.log("useGrupos:", useGrupos());

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    },
    isEditingMode: {
        type: String,
        default: null
    },
    isEditingGrupo: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue'])

const store = useStore()
const authStore = useAuthStore()
const planes = ref([])
const accionesFormativas = ref([])
const responsables = ref([])
const loadingUsers = ref(false)
const usersError = ref(null)

// Días de la semana para checkboxes
const diasSemana = [
    { label: 'L', value: 'L', name: 'Lunes' },
    { label: 'M', value: 'M', name: 'Martes' },
    { label: 'X', value: 'X', name: 'Miércoles' },
    { label: 'J', value: 'J', name: 'Jueves' },
    { label: 'V', value: 'V', name: 'Viernes' },
    { label: 'S', value: 'S', name: 'Sábado' },
    { label: 'D', value: 'D', name: 'Domingo' }
]

// Checkboxes para días presenciales
const diasPresencialSeleccionados = ref([])

// Checkboxes para días teleformación
const diasTeleSeleccionados = ref([])

// Función para convertir string de días a array de checkboxes
const stringToDaysArray = (diasString) => {
    if (!diasString) return []
    return diasString.split('').filter(dia => diasSemana.some(d => d.value === dia))
}

// Función para convertir array de checkboxes a string de días
const daysArrayToString = (diasArray) => {
    return diasArray.sort().join('')
}

// Watchers para actualizar automáticamente los campos del formulario
watch(diasPresencialSeleccionados, (newValue) => {
    formData.value.dias_presencial_horario = daysArrayToString(newValue)
}, { deep: true })

watch(diasTeleSeleccionados, (newValue) => {
    formData.value.dias_tele = daysArrayToString(newValue)
}, { deep: true })

// Usar el composable useDateUTC para las fechas
const { localValue: fechaInicioLocal, utcValue: fechaInicioUTC } = useDateUTC()
const { localValue: fechaFinLocal, utcValue: fechaFinUTC } = useDateUTC()

const estadosGrupo = ref(Object.values(ESTADO_GRUPO).map(estado => ({ label: estado, value: estado })))

// Computed para verificar si la acción formativa seleccionada es de seguridad privada
const esSeguridadPrivada = computed(() => {
    if (!formData.value.id_accion) return false
    const accion = accionesFormativas.value.find(a => a.id_accion === formData.value.id_accion)
    return accion?.es_seguridad_privada || false
})

// Objeto para almacenar errores de validación
const errors = ref({})



// Validación del formulario
const isFormValid = computed(() => {
    // 1. Validación visual previa:
    // Comprueba si la función asíncrona (validarCodigoUnico) ya detectó un error 
    // al salir del campo (evento @blur) y lo está mostrando en pantalla.
    if (errorCodigo.value !== '') {
        return false;
    }

    // 2. Campo obligatorio:
    // Evita el envío si el usuario ha borrado el código autogenerado y el campo está vacío.
    if (!codigoGrupo.value) {
        return false;
    }

// 3. Doble validación de seguridad (Prevención de envíos rápidos):
    // Reevalúa en tiempo real si el código está duplicado en la Acción Formativa actual.
    // Esto evita que se guarde un código repetido si el usuario pulsa "Guardar" 
    // inmediatamente después de escribir, sin disparar el evento @blur.
    const lista = grupos.value || [];
    const estaRepetidoInstantaneo = lista.some(grupo => 
        grupo.codigo === codigoGrupo.value && 
        // Comprobamos el ID de la acción cubriendo los distintos formatos en los que puede llegar del backend
        (grupo.accionFormativa?.id_accion_formativa == formData.value.id_accion || 
            grupo.id_accion == formData.value.id_accion ||
            grupo.id_accion_formativa == formData.value.id_accion)
    );
    
    // Si la doble validación encuentra una coincidencia, bloquea el guardado internamente.
    if (estaRepetidoInstantaneo) {
        return false;
    }

    // Validación según el modo de edición
    if (props.isEditingMode === 'general') {
        // Campos requeridos solo para modo general
        const requiredFields = {
            id_plan: formData.value.id_plan,
            id_accion: formData.value.id_accion,
            denominacion: formData.value.denominacion,
            responsable: formData.value.responsable,
            telefono_responsable: formData.value.telefono_responsable,
            fecha_inicio: fechaInicioUTC.value,
            fecha_fin: fechaFinUTC.value,
            codigo_grupo: codigoGrupo.value // Lo añadimos para que tenga que estar cubierto
        }
        
        // Verificar que todos los campos requeridos estén llenos
        const requiredFieldsValid = Object.values(requiredFields).every(value => 
            value !== null && value !== undefined && value !== ''
        )
        
        // Validación de fechas: si ambas fechas están presentes, fecha fin debe ser posterior a fecha inicio
        let datesValid = true
        if (fechaInicioUTC.value && fechaFinUTC.value) {
            const fechaInicio = new Date(fechaInicioUTC.value)
            const fechaFin = new Date(fechaFinUTC.value)
            datesValid = fechaFin >= fechaInicio
        }
        
        // Validaciones de longitud máxima solo para campos generales
        const lengthValidations = [
            validateFieldLength(errors.value, 'denominacion', formData.value.denominacion, 100),
            validateFieldLength(errors.value, 'observaciones', formData.value.observaciones, 4000),
        ]
        
        // Validaciones de patrones solo para campos generales
        const patternValidations = [
            validateTelefono(errors.value, 'telefono_responsable', formData.value.telefono_responsable),
        ]
        
        const allLengthValid = lengthValidations.every(valid => valid)
        const allPatternValid = patternValidations.every(valid => valid)
        
        return requiredFieldsValid && datesValid && allLengthValid && allPatternValid
    }
    
    if (props.isEditingMode === 'presencial') {
        // Campos requeridos para modo presencial
        const requiredFields = {
            centro_cif: formData.value.centro_cif,
            centro_nombre: formData.value.centro_nombre,
            centro_direccion: formData.value.centro_direccion,
            centro_codPostal: formData.value.centro_codPostal,
            centro_localidad: formData.value.centro_localidad,
            lugar_imparticion_nombre: formData.value.lugar_imparticion_nombre,
            lugar_imparticion_direccion: formData.value.lugar_imparticion_direccion,
            lugar_imparticion_codPostal: formData.value.lugar_imparticion_codPostal,
            lugar_imparticion_localidad: formData.value.lugar_imparticion_localidad,
        }
        
        // Verificar que todos los campos requeridos estén llenos
        const requiredFieldsValid = Object.values(requiredFields).every(value => 
            value !== null && value !== undefined && value !== ''
        )
        
        // Validaciones de longitud máxima para campos presenciales
        const lengthValidations = [
            validateFieldLength(errors.value, 'centro_nombre', formData.value.centro_nombre, 100),
            validateFieldLength(errors.value, 'centro_direccion', formData.value.centro_direccion, 100),
            validateFieldLength(errors.value, 'centro_localidad', formData.value.centro_localidad, 75),
            validateFieldLength(errors.value, 'lugar_imparticion_nombre', formData.value.lugar_imparticion_nombre, 100),
            validateFieldLength(errors.value, 'lugar_imparticion_direccion', formData.value.lugar_imparticion_direccion, 100),
            validateFieldLength(errors.value, 'lugar_imparticion_localidad', formData.value.lugar_imparticion_localidad, 75),
            validateFieldLength(errors.value, 'medio_aula_virtual', formData.value.medio_aula_virtual, 100),
            validateFieldLength(errors.value, 'conexion_aula_virtual', formData.value.conexion_aula_virtual, 100),
            validateFieldLength(errors.value, 'contacto_aula_virtual', formData.value.contacto_aula_virtual, 100),
        ]
        
        // Validaciones de patrones para campos presenciales
        const patternValidations = [
            validateCifNif(errors.value, 'centro_cif', formData.value.centro_cif),
            validateCifNif(errors.value, 'lugar_imparticion_cif', formData.value.lugar_imparticion_cif),
            validateCodigoPostal(errors.value, 'centro_codPostal', formData.value.centro_codPostal),
            validateCodigoPostal(errors.value, 'lugar_imparticion_codPostal', formData.value.lugar_imparticion_codPostal),
            validateTelefonoAulaVirtual(errors.value, 'telefono_aula_virtual', formData.value.telefono_aula_virtual),
        ]
        
        const allLengthValid = lengthValidations.every(valid => valid)
        const allPatternValid = patternValidations.every(valid => valid)
        
        // Validar días de impartición: en modo presencial, debe haber al menos un día seleccionado
        const diasPresencialValid = diasPresencialSeleccionados.value.length > 0
        
        return requiredFieldsValid && allLengthValid && allPatternValid && diasPresencialValid
    }
    
    if (props.isEditingMode === 'teleformacion') {
        // Campos requeridos para modo teleformación
        const requiredFields = {
            tele_centro_cif: formData.value.tele_centro_cif,
            tele_centro_nombre: formData.value.tele_centro_nombre,
            tele_centro_direccion: formData.value.tele_centro_direccion,
            tele_centro_codPostal: formData.value.tele_centro_codPostal,
            tele_centro_localidad: formData.value.tele_centro_localidad,
            tele_telefono: formData.value.tele_telefono,
        }
        
        // Verificar que todos los campos requeridos estén llenos
        const requiredFieldsValid = Object.values(requiredFields).every(value => 
            value !== null && value !== undefined && value !== ''
        )
        
        // Validaciones de longitud máxima para campos de teleformación
        const lengthValidations = [
            validateFieldLength(errors.value, 'tele_centro_nombre', formData.value.tele_centro_nombre, 100),
            validateFieldLength(errors.value, 'tele_centro_direccion', formData.value.tele_centro_direccion, 100),
            validateFieldLength(errors.value, 'tele_centro_localidad', formData.value.tele_centro_localidad, 75),
        ]
        
        // Validaciones de patrones para campos de teleformación
        const patternValidations = [
            validateCifNif(errors.value, 'tele_centro_cif', formData.value.tele_centro_cif),
            validateCodigoPostal(errors.value, 'tele_centro_codPostal', formData.value.tele_centro_codPostal),
            validateTelefono(errors.value, 'tele_telefono', formData.value.tele_telefono),
        ]
        
        const allLengthValid = lengthValidations.every(valid => valid)
        const allPatternValid = patternValidations.every(valid => valid)
        
        // Validar días de teleformación: en modo teleformación, debe haber al menos un día seleccionado
        const diasTeleValid = diasTeleSeleccionados.value.length > 0
        
        return requiredFieldsValid && allLengthValid && allPatternValid && diasTeleValid
    }
    
    // Si no hay modo de edición definido, retornar true por defecto
    return true
})

const formData = ref({
    id_plan: null,
    id_accion: null,
    estado: null,
    codigo: '',
    denominacion: '',
    responsable: null,
    telefono_responsable: '',
    observaciones: '',
    fecha_inicio: null,
    fecha_fin: null,
    centro_cif: '',
    centro_nombre: '',
    centro_direccion: '',
    centro_codPostal: '',
    centro_localidad: '',
	lugar_imparticion_cif: '',
    lugar_imparticion_nombre: '',
    lugar_imparticion_direccion: '',
    lugar_imparticion_codPostal: '',
    lugar_imparticion_localidad: '',
    horas_totales_presencial_horario: null,
    hora_inicio_tramo1_presencial_horario: null,
    hora_fin_tramo1_presencial_horario: null,
    hora_inicio_tramo2_presencial_horario: null,
    hora_fin_tramo2_presencial_horario: null,
    dias_presencial_horario: '',
    aula_virtual: false,
    medio_aula_virtual: '',
    conexion_aula_virtual: '',
    contacto_aula_virtual: '',
    telefono_aula_virtual: '',
    bimodal_aula_virtual: false,
    sin_participantes_en_centro_aula_virtual: false,
    sin_docentes_en_centro_aula_virtual: false,
    tele_centro_cif: '',
    tele_centro_nombre: '',
    tele_centro_direccion: '',
    tele_centro_codPostal: '',
    tele_centro_localidad: '',
    tele_telefono: '',
    horas_totales_teleformacion: null,
    hora_inicio_tramo1_tele: null,
    hora_fin_tramo1_tele: null,
    hora_inicio_tramo2_tele: null,
    hora_fin_tramo2_tele: null,
    dias_tele: '',
    moodle_grupo_id: '',
    num_homologacion_seguridad: '',
    lugar_fecha_diploma: '',
    tipo_bonificacion: null, // Añadimos el campo tipo_bonificación
    max_alumnos: null,       // Añadimos el campo max_alumnos
    ...props.modelValue
})


const loadPlans = async () => {
    try {
        const plansData = await getAllPlans()
        planes.value = plansData
    } catch (error) {
        console.error('Error al cargar los planes:', error)
    }
}

const loadAccionesFormativas = async (planId) => {
    if (!planId) {
        accionesFormativas.value = []
        return
    }
    
    try {
        const accionesData = await getAllAccionesFormativas({ id_plan: planId })
        accionesFormativas.value = accionesData
    } catch (error) {
        console.error('Error al cargar las acciones formativas:', error)
        accionesFormativas.value = []
    }
}


// Generar código del grupo automáticamente
const generateGroupCode = async (accionFormativaId) => {
    try {
        const { getNextGroupCode } = await import('@/services/gruposService.js')
        const response = await getNextGroupCode(accionFormativaId)
        
        if (response && response.codigo) {
            formData.codigo = response.codigo
        }
    } catch (error) {
        console.error('Error al generar código del grupo:', error)
    }
}

watch(() => formData.value.id_plan, (newPlanId) => {
    if (newPlanId) {
        loadAccionesFormativas(newPlanId)
    } else {
        accionesFormativas.value = []
    }
    // Limpiar la acción formativa cuando cambia el plan
    formData.value.id_accion = null
})

watch(() => formData.value.id_accion, (newValue) => {
    // Generar código automáticamente cuando se selecciona una acción formativa
    if (newValue && !props.isEditingMode) {
        generateGroupCode(newValue)
    }
    
    // Pre-rellena el campo denominación con la denominación de la acción formativa seleccionada
    // Pero se permite seguir editando a mano
    if (newValue) {
        const accionFormativa = accionesFormativas.value.find(accion => accion.id_accion === newValue)
        if (accionFormativa && accionFormativa.denominacion) {
            formData.value.denominacion = accionFormativa.denominacion
        }
    }
})

const emitFormData = () => {
    // Función para convertir Date a string de hora (HH:MM:SS) sin conversiones de timezone
    const formatTimeToString = (time) => {
        if (!time) return null;
        
        // Si ya es un string de hora válido (HH:MM o HH:MM:SS), devolverlo tal cual
        if (typeof time === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
            const timeParts = time.split(':');
            const hours = timeParts[0].padStart(2, '0');
            const minutes = timeParts[1].padStart(2, '0');
            const seconds = timeParts[2] ? timeParts[2].padStart(2, '0') : '00';
            return `${hours}:${minutes}:${seconds}`;
        }
        
        // Si es un string de fecha completa (ISO), extraer la parte de tiempo directamente
        if (typeof time === 'string' && time.includes('T')) {
            const timePart = time.split('T')[1];
            if (timePart) {
                // Remover la parte de timezone si existe (Z o +XX:XX)
                const timeOnly = timePart.split(/[Z+-]/)[0];
                const timeParts = timeOnly.split(':');
                const hours = timeParts[0].padStart(2, '0');
                const minutes = timeParts[1].padStart(2, '0');
                const seconds = timeParts[2] ? timeParts[2].split('.')[0].padStart(2, '0') : '00';
                return `${hours}:${minutes}:${seconds}`;
            }
        }
        
        // Si es un objeto Date, usar métodos locales porque el Datepicker muestra hora local
        if (time instanceof Date) {
            if (isNaN(time.getTime())) return null;
            const hours = String(time.getHours()).padStart(2, '0');
            const minutes = String(time.getMinutes()).padStart(2, '0');
            const seconds = String(time.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }
        
        return null;
    };

    const dataToEmit = {
        ...formData.value,
        fecha_inicio: fechaInicioUTC.value,
        fecha_fin: fechaFinUTC.value,
        // Convertir las horas a strings
        hora_inicio_tramo1_presencial_horario: formatTimeToString(formData.value.hora_inicio_tramo1_presencial_horario),
        hora_fin_tramo1_presencial_horario: formatTimeToString(formData.value.hora_fin_tramo1_presencial_horario),
        hora_inicio_tramo2_presencial_horario: formatTimeToString(formData.value.hora_inicio_tramo2_presencial_horario),
        hora_fin_tramo2_presencial_horario: formatTimeToString(formData.value.hora_fin_tramo2_presencial_horario),
        hora_inicio_tramo1_tele: formatTimeToString(formData.value.hora_inicio_tramo1_tele),
        hora_fin_tramo1_tele: formatTimeToString(formData.value.hora_fin_tramo1_tele),
        hora_inicio_tramo2_tele: formatTimeToString(formData.value.hora_inicio_tramo2_tele),
        hora_fin_tramo2_tele: formatTimeToString(formData.value.hora_fin_tramo2_tele)
    };
    emit('update:modelValue', dataToEmit);
};

// Referencias reactivas para gestionar el valor del código y su estado de validación visual
const codigoGrupo = ref(''); 
const errorCodigo = ref('');

/**
 * Valida de forma asíncrona que el código introducido no exista previamente en la misma Acción Formativa.
 * Se invoca en eventos de interfaz (como el @blur del input) para proporcionar feedback visual inmediato.
 */
const validarCodigoUnico = () => {
// 1. Limpiar cualquier estado de error previo antes de reevaluar
    errorCodigo.value = ''; 

// 2. Validación de campo obligatorio
    if (!codigoGrupo.value) {
        errorCodigo.value = 'El código es obligatorio.';
        return;
    }

// 3. Extraer de forma segura el listado de grupos cargados en memoria
    const lista = grupos.value || [];

// 4. Comprobar si existe alguna duplicidad cruzando el código introducido y la acción formativa seleccionada
    const estaRepetido = lista.some(grupo => {
        const mismoCodigo = grupo.codigo === codigoGrupo.value;
        
        // Normalización de la comprobación del ID de la Acción Formativa.
        // Se utilizan múltiples comparaciones lógicas para soportar las diferentes 
        // estructuras en las que el backend puede devolver este objeto (anidado o aplanado).
        const mismaAccion = 
            grupo.accionFormativa?.id_accion_formativa == formData.value.id_accion || 
            grupo.id_accion == formData.value.id_accion ||
            grupo.id_accion_formativa == formData.value.id_accion;
        
        return mismoCodigo && mismaAccion;
    });

// 5. Asignar el mensaje de error si se detecta un choque en la validación
    if (estaRepetido) {
        errorCodigo.value = 'Este código ya está en uso en esta acción formativa. Elige otro.';
    }
};

defineExpose({
    emitFormData,
    isFormValid
});

//Añadimos la variable de bonificacionOptions
const bonificacionOptions = [
    { label: 'Presencial', value: 'presencial' },
    { label: 'Teleformación', value: 'teleformacion' },
    { label: 'Mixta', value: 'mixta' }
];

watch(() => props.modelValue, async (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
        // Actualizar formData con todos los campos excepto fechas
        const { fecha_inicio, fecha_fin, ...otherData } = newValue;
        formData.value = { ...formData.value, ...otherData };
        
        // Manejar fechas UTC usando el composable
        if (fecha_inicio) {
            const fechaInicioDate = typeof fecha_inicio === 'string' ? new Date(fecha_inicio) : fecha_inicio;
            fechaInicioUTC.value = fechaInicioDate;
        }
        
        if (fecha_fin) {
            const fechaFinDate = typeof fecha_fin === 'string' ? new Date(fecha_fin) : fecha_fin;
            fechaFinUTC.value = fechaFinDate;
        }
        
        // Si hay una acción formativa con plan, cargar el plan y sus acciones formativas
        if (otherData.accionFormativa?.id_plan) {
            formData.value.id_plan = otherData.accionFormativa.id_plan;
            await loadAccionesFormativas(otherData.accionFormativa.id_plan);
            // Establecer la acción formativa después de cargar las opciones
            formData.value.id_accion = otherData.accionFormativa.id_accion;
        } else if (otherData.id_plan) {
            await loadAccionesFormativas(otherData.id_plan);
        }
    }
}, { immediate: true });


onMounted(async () => {
    await loadPlans()
    await loadResponsablesForSelect(authStore, {
        loadingRef: loadingUsers,
        errorRef: usersError,
        responsablesRef: responsables
    })
    
    // Inicializar checkboxes de días
    diasPresencialSeleccionados.value = stringToDaysArray(formData.value.dias_presencial_horario)
    diasTeleSeleccionados.value = stringToDaysArray(formData.value.dias_tele)
    
    if (!props.modelValue || Object.keys(props.modelValue).length === 0) {
        if (store.activePlan) {
            formData.value.id_plan = store.activePlan.id_plan
            await loadAccionesFormativas(store.activePlan.id_plan)
        }
    }
})

</script>

<style scoped>
.add-session-form {
    display: flex;
    justify-content: start;
    align-items: flex-end;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;

    .form-group:first-child {
        flex: 0;
    }
    
    .days-checkboxes {
        display: flex;
        gap: 0.5rem;
    }
}
</style>