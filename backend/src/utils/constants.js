// Constantes para el backend - Enumeraciones y valores fijos

// Estados de Planes
const ESTADOS_PLAN = {
  SOLICITADO: 'Solicitado',
  CONCEDIDO: 'Concedido',
  RECONFIGURADO: 'Reconfigurado',
  CERRADO: 'Cerrado'
}

// Estados de Grupos
const ESTADOS_GRUPO = {
  EJECUTADO: 'Ejecutado',
  EN_EJECUCION: 'En Ejecucion',
  EN_PROYECTO: 'En Proyecto',
  CANCELADO: 'Cancelado',
  CERTIFICADO: 'Certificado'
}

// Estados de Curso (Alumnos)
const ESTADO_CURSO = {
  FINALIZADO: 'Finalizado',
  NO_PARTICIPA: 'No Participa',
  ABANDONO: 'Abandono'
}

// Estados de Tareas
const ESTADO_TAREA = {
  PENDIENTE: 'Pendiente',
  COMPLETA: 'Completada'
}

// Progreso de Curso
const PROGRESO_CURSO = {
  FINALIZA_APTO: 'Finaliza Apto',
  FINALIZA_NO_APTO: 'Finaliza No Apto',
  BAJA_VOLUNTARIA: 'Baja Voluntaria',
  FINALIZA_PERO_NO_CERTIFICA: 'Finaliza Pero No Certifica'
}

// Tipos de Diploma
const TIPO_DIPLOMA = {
  DIPLOMA: 'Diploma',
  CERTIFICADO_ASISTENCIA: 'Certificado de Asistencia'
}

// Categorías Profesionales
const CATEGORIA_PROFESIONAL = {
  DIRECTIVO: 'Directivo',
  MANDO_INTERMEDIO: 'Mando Intermedio',
  TECNICO: 'Técnico',
  ADMINISTRATIVO: 'Administrativo',
  AUXILIAR: 'Auxiliar',
  SUBALTERNO: 'Subalterno',
  OBRERO: 'Obrero'
}

// Modalidades de Sesiones
const MODALIDAD_SESIONES = {
  TELEFORMACION: 'Teleformacion',
  PRESENCIAL: 'Presencial',
  MIXTA: 'Mixta'
}

// Modalidades de Docente
const MODALIDAD_DOCENTE = {
  TELEFORMACION: 'Teleformacion',
  PRESENCIAL: 'Presencial'
}

// Tipos de Tutoría
const TIPO_TUTORIA = {
  CORREO_ELECTRONICO: 'Correo Electronico (1)',
  VIDEOCONFERENCIA: 'Videoconferencia (2)',
  FORO: 'Foro (3)',
  OTRAS: 'Otras (4)'
}

// Tipos de Bonificación
const TIPO_BONIFICACION = {
  FUNDAE: 'Fundae'
}

// Niveles de Formación
const NIVEL_FORMACION = {
  BASICO: 'BASICO',
  SUPERIOR: 'SUPERIOR'
}

// Valores de Informe
const VALOR_INFORME = {
  BUENO: 'B',
  NORMAL: 'N',
  FALTA: 'F',
  DEFICIENTE: 'D'
}

// Tipos de Documento
const TIPO_DOCUMENTO = {
  NIF: 'NIF',
  NIE: 'NIE',
  PASAPORTE: 'Pasaporte'
}

// Sexos
const SEXO = {
  HOMBRE: 'H',
  MUJER: 'M',
  OTRO: 'O'
}

// Niveles de Estudios (valores numéricos usados en frontend/backend)
const NIVEL_ESTUDIOS = {
  SIN_ESTUDIOS: 0,
  PRIMARIA: 1,
  ESO: 2,
  BACHILLERATO: 3,
  FP_GRADO_MEDIO: 4,
  FP_GRADO_SUPERIOR: 5,
  GRADO_UNIVERSITARIO: 6,
  MASTER: 7,
  DOCTORADO: 8
}

// Tipos de Envío de Email
const TIPO_ENVIO_EMAIL = {
  BIENVENIDA: 'bienvenida',
  DIPLOMA: 'diploma',
  RECORDATORIO: 'recordatorio'
}

module.exports = {
  ESTADOS_PLAN,
  ESTADOS_GRUPO,
  ESTADO_CURSO,
  ESTADO_TAREA,
  PROGRESO_CURSO,
  TIPO_DIPLOMA,
  CATEGORIA_PROFESIONAL,
  MODALIDAD_SESIONES,
  MODALIDAD_DOCENTE,
  TIPO_TUTORIA,
  TIPO_BONIFICACION,
  NIVEL_FORMACION,
  NIVEL_ESTUDIOS,
  VALOR_INFORME,
  TIPO_DOCUMENTO,
  SEXO,
  TIPO_ENVIO_EMAIL
}
