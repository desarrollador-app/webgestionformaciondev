// Enumeraciones para los campos de AlumnoGrupo


export const ESTADOS_PLAN = {
  SOLICITADO: 'Solicitado',
  CONCEDIDO: 'Concedido',
  RECONFIGURADO: 'Reconfigurado',
  CERRADO: 'Cerrado'
}

export const ESTADO_CURSO = {
  FINALIZADO: 'Finalizado',
  NO_PARTICIPA: 'No Participa',
  ABANDONO: 'Abandono'
}

export const ESTADO_TAREA = {
  PENDIENTE: 'Pendiente',
  COMPLETA: 'Completada'
}

export const ESTADO_GRUPO = {
  EJECUTADO: 'Ejecutado',
  EN_EJECUCION: 'En Ejecucion',
  EN_PROYECTO: 'En Proyecto',
  CANCELADO: 'Cancelado',
  CERTIFICADO: 'Certificado'
}

export const TIPO_BONIFICACION = {
  FUNDAE: 'Fundae'
}

export const PROGRESO_CURSO = {
  FINALIZA_APTO: 'Finaliza Apto',
  FINALIZA_NO_APTO: 'Finaliza No Apto',
  BAJA_VOLUNTARIA: 'Baja Voluntaria',
  FINALIZA_PERO_NO_CERTIFICA: 'Finaliza Pero No Certifica'
}

export const TIPO_DIPLOMA = {
  DIPLOMA: 'Diploma',
  CERTIFICADO_ASISTENCIA: 'Certificado de Asistencia'
}

export const CATEGORIA_PROFESIONAL = {
  DIRECTIVO: 'Directivo',
  MANDO_INTERMEDIO: 'Mando Intermedio',
  TECNICO: 'Técnico',
  ADMINISTRATIVO: 'Administrativo',
  AUXILIAR: 'Auxiliar',
  SUBALTERNO: 'Subalterno',
  OBRERO: 'Obrero'
}

export const MODALIDAD_SESIONES = {
  TELEFORMACION: 'Teleformacion',
  PRESENCIAL: 'Presencial',
  MIXTA: 'Mixta'
}

export const NIVEL_FORMACION = {
  BASICO: 'BASICO',
  SUPERIOR: 'SUPERIOR'
}

export const MODALIDAD_DOCENTE = {
  TELEFORMACION: 'Teleformacion',
  PRESENCIAL: 'Presencial'
}

export const TIPO_TUTORIA = {
  CORREO_ELECTRONICO: 'Correo electrónico (1)',
  VIDEOCONFERENCIA: 'Videoconferencia (2)',
  FORO: 'Foro (3)',
  OTRAS: 'Otras (4)'
}

export const INFORMA_RLT = {
  SI: 'Sí',
  NO: 'No',
  PENDIENTE: 'Pendiente'
}

export const RESUELTO = {
  SI: 'Sí',
  NO: 'No'
}

export const VALOR_INFORME = {
  B: 'B',
  N: 'N',
  F: 'F',
  D: 'D'
}

// Opciones para los formularios (label, value)
export const ESTADO_CURSO_OPTIONS = [
  { label: 'Finalizado', value: ESTADO_CURSO.FINALIZADO },
  { label: 'No participa', value: ESTADO_CURSO.NO_PARTICIPA },
  { label: 'Abandono', value: ESTADO_CURSO.ABANDONO }
]

export const PROGRESO_CURSO_OPTIONS = [
  { label: 'Finaliza apto', value: PROGRESO_CURSO.FINALIZA_APTO },
  { label: 'Finaliza no apto', value: PROGRESO_CURSO.FINALIZA_NO_APTO },
  { label: 'Baja voluntaria', value: PROGRESO_CURSO.BAJA_VOLUNTARIA },
  { label: 'Finaliza pero no certifica', value: PROGRESO_CURSO.FINALIZA_PERO_NO_CERTIFICA }
]

export const TIPO_DIPLOMA_OPTIONS = [
  { label: 'Diploma', value: TIPO_DIPLOMA.DIPLOMA },
  { label: 'Certificado de asistencia', value: TIPO_DIPLOMA.CERTIFICADO_ASISTENCIA }
]

export const CATEGORIA_PROFESIONAL_OPTIONS = [
  { label: 'Directivo', value: CATEGORIA_PROFESIONAL.DIRECTIVO },
  { label: 'Mando Intermedio', value: CATEGORIA_PROFESIONAL.MANDO_INTERMEDIO },
  { label: 'Técnico', value: CATEGORIA_PROFESIONAL.TECNICO },
  { label: 'Administrativo', value: CATEGORIA_PROFESIONAL.ADMINISTRATIVO },
  { label: 'Auxiliar', value: CATEGORIA_PROFESIONAL.AUXILIAR },
  { label: 'Subalterno', value: CATEGORIA_PROFESIONAL.SUBALTERNO },
  { label: 'Obrero', value: CATEGORIA_PROFESIONAL.OBRERO }
]

export const TIPO_TUTORIA_OPTIONS = [
  { label: 'Correo electrónico', value: TIPO_TUTORIA.CORREO_ELECTRONICO },
  { label: 'Videoconferencia', value: TIPO_TUTORIA.VIDEOCONFERENCIA },
  { label: 'Foro', value: TIPO_TUTORIA.FORO },
  { label: 'Otras', value: TIPO_TUTORIA.OTRAS }
]

export const INFORMA_RLT_OPTIONS = [
  { label: 'Sí', value: INFORMA_RLT.SI },
  { label: 'No', value: INFORMA_RLT.NO },
  { label: 'Pendiente', value: INFORMA_RLT.PENDIENTE }
]

export const RESUELTO_OPTIONS = [
  { label: 'Sí', value: RESUELTO.SI },
  { label: 'No', value: RESUELTO.NO }
]

export const VALOR_INFORME_OPTIONS = [
  { label: 'B - No aporta información', value: VALOR_INFORME.B },
  { label: 'N - No informa', value: VALOR_INFORME.N },
  { label: 'F - Favorable', value: VALOR_INFORME.F },
  { label: 'D - Discrepancia', value: VALOR_INFORME.D }
]

// Funciones de mapeo para convertir entre valores de BD y etiquetas
export const getEstadoCursoLabel = (value) => {
  const option = ESTADO_CURSO_OPTIONS.find(opt => opt.value === value)
  return option ? option.label : value || '-'
}

export const getProgresoCursoLabel = (value) => {
  const option = PROGRESO_CURSO_OPTIONS.find(opt => opt.value === value)
  return option ? option.label : value || '-'
}

export const getTipoDiplomaLabel = (value) => {
  const option = TIPO_DIPLOMA_OPTIONS.find(opt => opt.value === value)
  return option ? option.label : value || '-'
}

export const getCategoriaProfesionalLabel = (value) => {
  const option = CATEGORIA_PROFESIONAL_OPTIONS.find(opt => opt.value === value)
  return option ? option.label : value || '-'
}

export const getTipoTutoriaLabel = (value) => {
  const option = TIPO_TUTORIA_OPTIONS.find(opt => opt.value === value)
  return option ? option.label : value || '-'
}

// Función para obtener el color del estado del curso
export const getEstadoCursoColor = (estado) => {
  const colors = {
    [ESTADO_CURSO.FINALIZADO]: 'success',
    [ESTADO_CURSO.NO_PARTICIPA]: 'danger',
    [ESTADO_CURSO.ABANDONO]: 'warning'
  }
  return colors[estado] || 'secondary'
}

// Patrones de validación según XSD
// CIF según XSD InicioGrupos: [AaBbCcDdEeFfGgHhKkLlMmNnPpQqSsJjUuVvWwRr][0-9]{7}[AaBbCcDdEeFfGgHhIiJj0123456789]
export const PATTERN_CIF = /^[AaBbCcDdEeFfGgHhKkLlMmNnPpQqSsJjUuVvWwRr][0-9]{7}[AaBbCcDdEeFfGgHhIiJj0123456789]$/

// NIF/DNI: exactamente 8 dígitos seguidos de una letra
export const PATTERN_NIF = /^[0-9]{8}[A-Za-z]$/

// NIE: empieza por X, Y o Z + 7 dígitos + letra
export const PATTERN_NIE = /^[XxYyZz][0-9]{7}[A-Za-z]$/

// CIF según XSD AAFF_Inicio: (([a-zA-Z]{1}\d{7}[a-zA-Z0-9]{1})|(\d{8}[a-zA-Z]{1}))
export const PATTERN_CIF_AAFF = /^(([a-zA-Z]{1}\d{7}[a-zA-Z0-9]{1})|(\d{8}[a-zA-Z]{1}))$/

// Código postal: 5 dígitos
export const PATTERN_CODIGO_POSTAL = /^[0-9]{5}$/

// Teléfono: 9-12 dígitos
export const PATTERN_TELEFONO = /^[0-9]{9,12}$/

// Teléfono aula virtual: 9 dígitos exactos
export const PATTERN_TELEFONO_AULA_VIRTUAL = /^[0-9]{9}$/

// Longitudes según XSD
export const LENGTH_CIF_NIF = 9
export const LENGTH_CODIGO_POSTAL = 5
export const MIN_LENGTH_TELEFONO = 9
export const MAX_LENGTH_TELEFONO = 12
export const LENGTH_TELEFONO_AULA_VIRTUAL = 9
export const MIN_LENGTH_DOCUMENTO = 9
export const MAX_LENGTH_DOCUMENTO = 15