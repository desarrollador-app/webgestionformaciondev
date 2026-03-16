const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
    matricularAlumnosGrupo,
    matricularAlumnoIndividual,
    verificarConfiguracionMoodle,
    obtenerCredencialesMoodle
} = require('../controllers/moodleController');

// Matricular todos los alumnos de un grupo
router.post('/grupo/:grupoId/matricular-alumnos', requireAuth, matricularAlumnosGrupo);

// Matricular un alumno específico
router.post('/alumno/:alumnoId/matricular', requireAuth, matricularAlumnoIndividual);

// Verificar configuración de Moodle para un grupo
router.get('/grupo/:grupoId/configuracion', requireAuth, verificarConfiguracionMoodle);

// Obtener credenciales generadas para un NIF
router.get('/credenciales/:nif', requireAuth, obtenerCredencialesMoodle);

// Endpoint de prueba para verificar conexión con Moodle
router.get('/test-conexion', requireAuth, async (req, res) => {
    try {
        const moodleService = require('../services/moodleService');
        
        // Verificar configuración básica
        const config = {
            url: process.env.MOODLE_URL || 'No configurado',
            token: process.env.MOODLE_TOKEN ? 'Configurado' : 'No configurado',
            apiUrl: moodleService.apiUrl
        };
        
        res.json({
            success: true,
            message: 'Configuración de Moodle',
            config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
