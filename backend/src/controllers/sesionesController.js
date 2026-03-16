const prisma = require('../db');
const { MODALIDAD_SESIONES } = require('../utils/constants');

const getAllSesiones = async (req, res) => {
  try {
    const { id_dia_tele, id_dia_pres, id_docente, es_manana } = req.query;

    let whereClause = {};
    if (id_dia_tele) {
      whereClause.id_dia_tele = parseInt(id_dia_tele);
    }
    if (id_dia_pres) {
      whereClause.id_dia_pres = parseInt(id_dia_pres);
    }
    if (id_docente) {
      whereClause.id_docente = parseInt(id_docente);
    }
    if (es_manana !== undefined) {
      whereClause.es_manana = es_manana === 'true';
    }

    const sesiones = await prisma.sesiones.findMany({
      where: whereClause,
      include: {
        diaTeleformacion: {
          include: {
            grupo: {
              select: {
                id_grupo: true,
                denominacion: true,
                codigo: true
              }
            }
          }
        },
        diaPresencial: {
          include: {
            grupo: {
              select: {
                id_grupo: true,
                denominacion: true,
                codigo: true
              }
            }
          }
        },
        docente: {
          include: {
            persona: {
              select: {
                id_persona: true,
                nombre: true,
                apellido1: true,
                apellido2: true
              }
            }
          }
        }
      },
      orderBy: [
        { horario_inicio: 'asc' }
      ]
    });
    res.json(sesiones);
  } catch (error) {
    console.error('Error al obtener sesiones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getSesionById = async (req, res) => {
  try {
    const { id } = req.params;
    const sesion = await prisma.sesiones.findUnique({
      where: { id_sesion: parseInt(id) },
      include: {
        diaTeleformacion: {
          include: {
            grupo: {
              select: {
                id_grupo: true,
                denominacion: true,
                codigo: true
              }
            }
          }
        },
        diaPresencial: {
          include: {
            grupo: {
              select: {
                id_grupo: true,
                denominacion: true,
                codigo: true
              }
            }
          }
        },
        docente: {
          include: {
            persona: {
              select: {
                id_persona: true,
                nombre: true,
                apellido1: true,
                apellido2: true
              }
            }
          }
        }
      }
    });

    if (!sesion) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    res.json(sesion);
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createSesion = async (req, res) => {
  try {
    const {
      id_dia_tele,
      id_dia_pres,
      id_docente,
      es_manana,
      horario_inicio,
      horario_fin
    } = req.body;

    if (!id_dia_tele && !id_dia_pres) {
      return res.status(400).json({ error: 'Debe proporcionar id_dia_tele o id_dia_pres' });
    }

    if (id_dia_tele && id_dia_pres) {
      return res.status(400).json({ error: 'No puede proporcionar tanto id_dia_tele como id_dia_pres' });
    }

    // --- NUEVO: VALIDACIÓN DE HORA DE MAÑANA (CREATE) ---
    const LIMITE_MANANA = '15:00';
    const toMinutes = (hora) => {
      if (!hora) return 0;
      const [h, m] = hora.substring(0, 5).split(':').map(Number);
      return h * 60 + m;
    };

    if (es_manana === true || es_manana === 'true') {
      if (horario_fin && toMinutes(horario_fin) > toMinutes(LIMITE_MANANA)) {
        return res.status(400).json({
          error: 'En horario de mañana la hora fin no puede ser superior a las 15:00'
        });
      }
    }

    const sesion = await prisma.sesiones.create({
      data: {
        id_dia_tele: id_dia_tele ? parseInt(id_dia_tele) : null,
        id_dia_pres: id_dia_pres ? parseInt(id_dia_pres) : null,
        id_docente: id_docente ? parseInt(id_docente) : null,
        es_manana: es_manana !== undefined ? es_manana : true,
        horario_inicio: new Date(`1970-01-01T${horario_inicio}`),
        horario_fin: new Date(`1970-01-01T${horario_fin}`)
      },
      include: {
        diaTeleformacion: {
          include: {
            grupo: {
              select: {
                id_grupo: true,
                denominacion: true,
                codigo: true
              }
            }
          }
        },
        diaPresencial: {
          include: {
            grupo: {
              select: {
                id_grupo: true,
                denominacion: true,
                codigo: true
              }
            }
          }
        },
        docente: {
          include: {
            persona: {
              select: {
                id_persona: true,
                nombre: true,
                apellido1: true,
                apellido2: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(sesion);
  } catch (error) {
    console.error('Error al crear sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_dia_tele,
      id_dia_pres,
      id_docente,
      es_manana,
      horario_inicio,
      horario_fin
    } = req.body;

    // --- NUEVO: VALIDACIÓN DE HORA DE MAÑANA ---
    // 1. Buscamos la sesión actual para saber si ya era de mañana
    const sesionExistente = await prisma.sesiones.findUnique({
      where: { id_sesion: parseInt(id) }
    });

    if (!sesionExistente) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    // 2. Comprobamos si es de mañana (la nueva que nos envían o la que ya tenía)
    const checkEsManana = es_manana !== undefined ? (es_manana === true || es_manana === 'true') : sesionExistente.es_manana;

    if (checkEsManana && horario_fin) {
      const LIMITE_MANANA = '15:00';
      const toMinutes = (hora) => {
        if (!hora) return 0;
        const [h, m] = hora.substring(0, 5).split(':').map(Number);
        return h * 60 + m;
      };

      if (toMinutes(horario_fin) > toMinutes(LIMITE_MANANA)) {
        return res.status(400).json({
          error: 'En horario de mañana la hora fin no puede ser superior a las 15:00'
        });
      }
    }

    const sesion = await prisma.sesiones.update({
      where: { id_sesion: parseInt(id) },
      data: {
        id_dia_tele: id_dia_tele !== undefined ? (id_dia_tele ? parseInt(id_dia_tele) : null) : undefined,
        id_dia_pres: id_dia_pres !== undefined ? (id_dia_pres ? parseInt(id_dia_pres) : null) : undefined,
        id_docente: id_docente !== undefined ? (id_docente ? parseInt(id_docente) : null) : undefined,
        es_manana: es_manana !== undefined ? es_manana : undefined,
        horario_inicio: horario_inicio ? new Date(`1970-01-01T${horario_inicio}`) : undefined,
        horario_fin: horario_fin ? new Date(`1970-01-01T${horario_fin}`) : undefined
      },
      include: {
        diaTeleformacion: {
          include: {
            grupo: {
              select: {
                id_grupo: true,
                denominacion: true,
                codigo: true
              }
            }
          }
        },
        diaPresencial: {
          include: {
            grupo: {
              select: {
                id_grupo: true,
                denominacion: true,
                codigo: true
              }
            }
          }
        },
        docente: {
          include: {
            persona: {
              select: {
                id_persona: true,
                nombre: true,
                apellido1: true,
                apellido2: true
              }
            }
          }
        }
      }
    });

    res.json(sesion);
  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteSesion = async (req, res) => {
  try {
    const { id } = req.params;

    const sesion = await prisma.sesiones.findUnique({
      where: { id_sesion: parseInt(id) },
      select: {
        id_dia_tele: true,
        id_dia_pres: true
      }
    });

    if (!sesion) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    await prisma.sesiones.delete({
      where: { id_sesion: parseInt(id) }
    });

    // Verificar si el día de impartición queda sin sesiones y borrarlo si está vacío
    if (sesion.id_dia_tele) {
      const sesionesRestantes = await prisma.sesiones.count({
        where: { id_dia_tele: sesion.id_dia_tele }
      });

      if (sesionesRestantes === 0) {
        await prisma.diasImparticionGrupoTeleformacion.delete({
          where: { id_dia_tele: sesion.id_dia_tele }
        });
      }
    } else if (sesion.id_dia_pres) {
      const sesionesRestantes = await prisma.sesiones.count({
        where: { id_dia_pres: sesion.id_dia_pres }
      });

      if (sesionesRestantes === 0) {
        await prisma.diasImparticionGrupoPresencial.delete({
          where: { id_dia_pres: sesion.id_dia_pres }
        });
      }
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Endpoint para obtener las horas totales de todas las sesiones de un grupo
const getHorasTotalesGrupo = async (req, res) => {
  try {
    const { id_grupo, modalidad } = req.query;

    if (!id_grupo) {
      return res.status(400).json({ error: 'ID de grupo requerido' });
    }

    if (!modalidad) {
      return res.status(400).json({ error: 'Modalidad requerida' });
    }

    let sesiones = [];
    let tipoModalidad = '';

    // Obtener sesiones según la modalidad
    if (modalidad === MODALIDAD_SESIONES.PRESENCIAL) {
      sesiones = await prisma.sesiones.findMany({
        where: {
          diaPresencial: {
            id_grupo: parseInt(id_grupo)
          }
        },
        select: {
          horario_inicio: true,
          horario_fin: true,
          es_manana: true
        }
      });
      tipoModalidad = 'presencial';
    } else if (modalidad === MODALIDAD_SESIONES.TELEFORMACION) {
      sesiones = await prisma.sesiones.findMany({
        where: {
          diaTeleformacion: {
            id_grupo: parseInt(id_grupo)
          }
        },
        select: {
          horario_inicio: true,
          horario_fin: true,
          es_manana: true
        }
      });
      tipoModalidad = 'teleformacion';
    } else {
      return res.status(400).json({ 
        error: `Modalidad no válida. Use ${MODALIDAD_SESIONES.PRESENCIAL} o ${MODALIDAD_SESIONES.TELEFORMACION}` 
      });
    }

    // Calcular horas totales
    let horasTotales = 0;

    sesiones.forEach(sesion => {
      if (sesion.horario_inicio && sesion.horario_fin) {
        const inicio = new Date(sesion.horario_inicio);
        const fin = new Date(sesion.horario_fin);
        const horasSesion = (fin - inicio) / (1000 * 60 * 60); // Convertir a horas
        horasTotales += horasSesion;
      }
    });

    res.json({
      horas_totales: Math.round(horasTotales * 100) / 100,
      modalidad: tipoModalidad,
      numero_sesiones: sesiones.length
    });
  } catch (error) {
    console.error('Error al calcular horas totales del grupo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllSesiones,
  getSesionById,
  createSesion,
  updateSesion,
  deleteSesion,
  getHorasTotalesGrupo
};
