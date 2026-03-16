const prisma = require('../db');
const moodleService = require('../services/moodleService');

/**
 * Matricula todos los alumnos de un grupo en Moodle
 */
const matricularAlumnosGrupo = async (req, res) => {
    try {
        const { grupoId } = req.params;
        
        // Validar que el grupo existe
        const grupo = await prisma.grupos.findUnique({
            where: { id_grupo: parseInt(grupoId) },
            include: {
                accionFormativa: true
            }
        });

        if (!grupo) {
            return res.status(404).json({ 
                error: 'Grupo no encontrado' 
            });
        }

        // Verificar que el grupo tiene un ID de Moodle
        if (!grupo.moodle_grupo_id) {
            return res.status(400).json({ 
                error: 'El grupo no tiene configurado un ID de curso en Moodle' 
            });
        }

        // Obtener todos los alumnos del grupo
        const alumnos = await prisma.alumnosPersonaGrupo.findMany({
            where: { id_grupo: parseInt(grupoId) },
            include: {
                persona: true,
                grupo: {
                    include: {
                        accionFormativa: true
                    }
                }
            }
        });

        if (alumnos.length === 0) {
            return res.status(400).json({ 
                error: 'No hay alumnos en este grupo' 
            });
        }

        // Verificar que el curso existe en Moodle
        try {
            const curso = await moodleService.getCourse(grupo.moodle_grupo_id);
            if (!curso) {
                return res.status(400).json({ 
                    error: 'El curso no existe en Moodle' 
                });
            }
        } catch (error) {
            return res.status(400).json({ 
                error: 'Error al verificar el curso en Moodle: ' + error.message 
            });
        }

        // Procesar cada alumno
        const resultados = [];
        const errores = [];

        for (const alumno of alumnos) {
            try {
                // Validar que el alumno tiene NIF
                if (!alumno.persona.documento) {
                    errores.push({
                        alumnoId: alumno.id_alumno_grupo,
                        nombre: `${alumno.persona.nombre} ${alumno.persona.apellido1}`,
                        error: 'El alumno no tiene NIF configurado'
                    });
                    continue;
                }

                const resultado = await moodleService.processStudentEnrollment(
                    alumno, 
                    grupo.moodle_grupo_id
                );
                
                resultados.push(resultado);
            } catch (error) {
                errores.push({
                    alumnoId: alumno.id_alumno_grupo,
                    nombre: `${alumno.persona.nombre} ${alumno.persona.apellido1}`,
                    error: error.message
                });
            }
        }

        // Estadísticas del proceso
        const exitosos = resultados.filter(r => r.success).length;
        const fallidos = errores.length;
        const usuariosNuevos = resultados.filter(r => r.action === 'new_user').length;
        const usuariosExistentes = resultados.filter(r => r.action === 'existing_user').length;

        res.json({
            success: true,
            message: `Proceso completado. ${exitosos} alumnos matriculados exitosamente, ${fallidos} errores`,
            estadisticas: {
                total: alumnos.length,
                exitosos,
                fallidos,
                usuariosNuevos,
                usuariosExistentes
            },
            resultados,
            errores
        });

    } catch (error) {
        console.error('Error en matricularAlumnosGrupo:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

/**
 * Matricula un alumno específico en Moodle
 */
const matricularAlumnoIndividual = async (req, res) => {
    try {
        const { alumnoId } = req.params;
        
        // Obtener el alumno con sus relaciones
        const alumno = await prisma.alumnosPersonaGrupo.findUnique({
            where: { id_alumno_grupo: parseInt(alumnoId) },
            include: {
                persona: true,
                grupo: {
                    include: {
                        accionFormativa: true
                    }
                }
            }
        });

        if (!alumno) {
            return res.status(404).json({ 
                error: 'Alumno no encontrado' 
            });
        }

        // Verificar que el grupo tiene un ID de Moodle
        if (!alumno.grupo.moodle_grupo_id) {
            return res.status(400).json({ 
                error: 'El grupo no tiene configurado un ID de curso en Moodle' 
            });
        }

        // Validar que el alumno tiene NIF
        if (!alumno.persona.documento) {
            return res.status(400).json({ 
                error: 'El alumno no tiene NIF configurado' 
            });
        }

        // Verificar que el curso existe en Moodle
        try {
            const curso = await moodleService.getCourse(alumno.grupo.moodle_grupo_id);
            if (!curso) {
                return res.status(400).json({ 
                    error: 'El curso no existe en Moodle' 
                });
            }
        } catch (error) {
            return res.status(400).json({ 
                error: 'Error al verificar el curso en Moodle: ' + error.message 
            });
        }

        // Procesar la matriculación
        const resultado = await moodleService.processStudentEnrollment(
            alumno, 
            alumno.grupo.moodle_grupo_id
        );

        if (resultado.success) {
            res.json({
                success: true,
                message: 'Alumno matriculado exitosamente en Moodle',
                resultado
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Error al matricular el alumno',
                resultado
            });
        }

    } catch (error) {
        console.error('Error en matricularAlumnoIndividual:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

/**
 * Verifica la configuración de Moodle
 */
const verificarConfiguracionMoodle = async (req, res) => {
    try {
        const { grupoId } = req.params;
        
        // Obtener el grupo
        const grupo = await prisma.grupos.findUnique({
            where: { id_grupo: parseInt(grupoId) },
            include: {
                accionFormativa: true
            }
        });

        if (!grupo) {
            return res.status(404).json({ 
                error: 'Grupo no encontrado' 
            });
        }

        const configuracion = {
            grupo: {
                id: grupo.id_grupo,
                denominacion: grupo.denominacion,
                moodle_grupo_id: grupo.moodle_grupo_id
            },
            accionFormativa: grupo.accionFormativa ? {
                id: grupo.accionFormativa.id_accion,
                denominacion: grupo.accionFormativa.denominacion
            } : null,
            moodle: {
                url: process.env.MOODLE_URL || 'No configurado',
                token: process.env.MOODLE_TOKEN ? 'Configurado' : 'No configurado'
            }
        };

        // Verificar si el curso existe en Moodle
        if (grupo.moodle_grupo_id) {
            try {
                const curso = await moodleService.getCourse(grupo.moodle_grupo_id);
                configuracion.cursoMoodle = curso ? {
                    id: curso.id,
                    nombre: curso.fullname,
                    existe: true
                } : {
                    id: grupo.moodle_grupo_id,
                    existe: false
                };
            } catch (error) {
                configuracion.cursoMoodle = {
                    id: grupo.moodle_grupo_id,
                    existe: false,
                    error: error.message
                };
            }
        } else {
            configuracion.cursoMoodle = {
                existe: false,
                mensaje: 'No hay ID de curso configurado'
            };
        }

        res.json(configuracion);

    } catch (error) {
        console.error('Error en verificarConfiguracionMoodle:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

/**
 * Obtiene las credenciales generadas para un NIF (función interna)
 * @param {string} nif - NIF del alumno
 * @returns {Object} - Credenciales generadas
 */
const getCredencialesMoodle = (nif) => {
    if (!nif) {
        throw new Error('NIF es requerido');
    }

    const username = moodleService.generateUsername(nif);
    const password = moodleService.generatePassword(nif);

    return {
        nif,
        username,
        password
    };
};

/**
 * Obtiene las credenciales generadas para un NIF
 */
const obtenerCredencialesMoodle = async (req, res) => {
    try {
        const { nif } = req.params;
        
        if (!nif) {
            return res.status(400).json({ 
                error: 'NIF es requerido' 
            });
        }

        const credenciales = getCredencialesMoodle(nif);
        res.json(credenciales);

    } catch (error) {
        console.error('Error en obtenerCredencialesMoodle:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
};

module.exports = {
    matricularAlumnosGrupo,
    matricularAlumnoIndividual,
    verificarConfiguracionMoodle,
    obtenerCredencialesMoodle,
    getCredencialesMoodle
};
