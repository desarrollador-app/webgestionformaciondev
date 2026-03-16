const express = require('express');
const router = express.Router();

// Importar todas las rutas
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const planesRoutes = require('./planesRoutes');
const accionesFormativasRoutes = require('./accionesFormativasRoutes');
const gruposRoutes = require('./gruposRoutes');
const personasRoutes = require('./personasRoutes');
const empresasRoutes = require('./empresasRoutes');
const areaProfesionalRoutes = require('./areaProfesionalRoutes');
const tareasRoutes = require('./tareasRoutes');
const desgloseAreasProfesionalesRoutes = require('./desgloseAreasProfesionalesRoutes');
const centrosTrabajoRoutes = require('./centrosTrabajoRoutes');
const alumnosPersonaGrupoRoutes = require('./alumnosPersonaGrupoRoutes');
const docentesPersonaGrupoRoutes = require('./docentesPersonaGrupoRoutes');
const documentacionAdjAlumnoPersonaRoutes = require('./documentacionAdjAlumnoPersonaRoutes');
const documentacionAdjDocentePersonaRoutes = require('./documentacionAdjDocentePersonaRoutes');
const documentacionAdjEmpresaRoutes = require('./documentacionAdjEmpresaRoutes');
const documentacionAdjGrupoRoutes = require('./documentacionAdjGrupoRoutes');
const diasImparticionGrupoTeleformacionRoutes = require('./diasImparticionGrupoTeleformacionRoutes');
const diasImparticionGrupoPresencialRoutes = require('./diasImparticionGrupoPresencialRoutes');
const sesionesRoutes = require('./sesionesRoutes');
const costesGrupoRoutes = require('./costesGrupoRoutes');
const msGraphRoutes = require('./msGraphRoutes');
const moodleRoutes = require('./moodleRoutes');
const filesRoutes = require('./filesRoutes');
const emailRoutes = require('./emailRoutes');

// Configurar las rutas con prefijo /api
router.use('/api/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/api/planes', planesRoutes);
router.use('/api/acciones-formativas', accionesFormativasRoutes);
router.use('/api/grupos', gruposRoutes);
router.use('/api/personas', personasRoutes);
router.use('/api/empresas', empresasRoutes);
router.use('/api/areas-profesionales', areaProfesionalRoutes);
router.use('/api/tareas', tareasRoutes);
router.use('/api/desglose-areas-profesionales', desgloseAreasProfesionalesRoutes);
router.use('/api/centros-trabajo', centrosTrabajoRoutes);
router.use('/api/alumnos-persona-grupo', alumnosPersonaGrupoRoutes);
router.use('/api/docentes-persona-grupo', docentesPersonaGrupoRoutes);
router.use('/api/documentacion-alumno-persona', documentacionAdjAlumnoPersonaRoutes);
router.use('/api/documentacion-docente-persona', documentacionAdjDocentePersonaRoutes);
router.use('/api/documentacion-empresa', documentacionAdjEmpresaRoutes);
router.use('/api/documentacion-grupo', documentacionAdjGrupoRoutes);
router.use('/api/dias-imparticion-grupo-teleformacion', diasImparticionGrupoTeleformacionRoutes);
router.use('/api/dias-imparticion-grupo-presencial', diasImparticionGrupoPresencialRoutes);
router.use('/api/sesiones', sesionesRoutes);
router.use('/api/costes-grupo', costesGrupoRoutes);
router.use('/api/ms-graph', msGraphRoutes);
router.use('/api/moodle', moodleRoutes);
router.use('/api/files', filesRoutes);
router.use('/api/emails', emailRoutes);

// Ruta de health check
router.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
