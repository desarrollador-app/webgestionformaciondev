const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const {
	sendEmail,
	getEmailLogs,
	getEmailStatsByGroup,
	getEmailStatsByPerson,
	getGroupStudentsWithEmailStatus,
	sendWelcomeEmail,
	sendDiplomaEmail,
	downloadDiploma
} = require('../controllers/emailController');

const router = express.Router();

/**
 * @route POST /api/emails/send
 * @desc Envía un email
 * @access Private
 * @body {string} to - Dirección de email del destinatario
 * @body {string} subject - Asunto del email
 * @body {string} textContent - Contenido en texto plano
 * @body {number} idGrupo - ID del grupo (opcional)
 * @body {number} idPersona - ID de la persona (opcional)
 * @body {string} tipoEnvio - Tipo de envío (opcional)
 */
router.post('/send', requireAuth, sendEmail);

/**
 * @route GET /api/emails/logs
 * @desc Obtiene el historial de emails enviados
 * @access Private
 * @query {number} idGrupo - Filtrar por grupo
 * @query {number} idPersona - Filtrar por persona
 * @query {string} tipoEnvio - Filtrar por tipo de envío
 * @query {boolean} enviado - Filtrar por estado de envío (true/false)
 * @query {string} fechaDesde - Fecha desde (YYYY-MM-DD)
 * @query {string} fechaHasta - Fecha hasta (YYYY-MM-DD)
 * @query {number} page - Página (default: 1)
 * @query {number} limit - Límite por página (default: 50)
 */
router.get('/logs', getEmailLogs);

/**
 * @route GET /api/emails/stats/group/:idGrupo
 * @desc Obtiene estadísticas de emails por grupo
 * @access Private
 */
router.get('/stats/group/:idGrupo', getEmailStatsByGroup);

/**
 * @route GET /api/emails/stats/person/:idPersona
 * @desc Obtiene estadísticas de emails por persona
 * @access Private
 */
router.get('/stats/person/:idPersona', getEmailStatsByPerson);

/**
 * @route GET /api/emails/group/:idGrupo/students
 * @desc Obtiene los alumnos de un grupo con su estado de emails (bienvenida y diploma)
 * @access Private
 */
router.get('/group/:idGrupo/students', getGroupStudentsWithEmailStatus);

/**
 * @route POST /api/emails/send/welcome
 * @desc Envía email de bienvenida a un alumno específico
 * @access Private
 * @body {number} idGrupo - ID del grupo
 * @body {number} idPersona - ID de la persona
 * @body {string} email - Email del destinatario
 * @body {string} nombre - Nombre del destinatario
 */
router.post('/send/welcome', requireAuth, sendWelcomeEmail);

/**
 * @route POST /api/emails/send/diploma
 * @desc Envía email de diploma a un alumno específico
 * @access Private
 * @body {number} idGrupo - ID del grupo
 * @body {number} idPersona - ID de la persona
 * @body {string} email - Email del destinatario
 * @body {string} nombre - Nombre del destinatario
 */
router.post('/send/diploma', requireAuth, sendDiplomaEmail);

/**
 * @route GET /api/emails/diploma/:idGrupo/:idPersona
 * @desc Descarga un diploma generado para un alumno específico
 * @access Private
 * @param {number} idGrupo - ID del grupo
 * @param {number} idPersona - ID de la persona
 */
router.get('/diploma/:idGrupo/:idPersona', requireAuth, downloadDiploma);

module.exports = router;