const prisma = require('../db');

const getAllDiasImparticionPresencial = async (req, res) => {
  try {
    const { id_grupo, fecha_desde, fecha_hasta } = req.query;

    let whereClause = {};
    if (id_grupo) {
      whereClause.id_grupo = parseInt(id_grupo);
    }
    if (fecha_desde || fecha_hasta) {
      whereClause.fecha_imparticion = {};
      if (fecha_desde) {
        whereClause.fecha_imparticion.gte = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        whereClause.fecha_imparticion.lte = new Date(fecha_hasta);
      }
    }

    const dias = await prisma.diasImparticionGrupoPresencial.findMany({
      where: whereClause,
      include: {
        grupo: {
          select: {
            id_grupo: true,
            denominacion: true,
            codigo: true
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
        },
        sesiones: {
          include: {
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
          orderBy: {
            horario_inicio: 'asc'
          }
        }
      },
      orderBy: {
        fecha_imparticion: 'asc'
      }
    });
    res.json(dias);
  } catch (error) {
    console.error('Error al obtener días de impartición presenciales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getDiaImparticionPresencialById = async (req, res) => {
  try {
    const { id } = req.params;
    const dia = await prisma.diasImparticionGrupoPresencial.findUnique({
      where: { id_dia_pres: parseInt(id) },
      include: {
        grupo: {
          select: {
            id_grupo: true,
            denominacion: true,
            codigo: true
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
        },
        sesiones: {
          include: {
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
          orderBy: {
            horario_inicio: 'asc'
          }
        }
      }
    });

    if (!dia) {
      return res.status(404).json({ error: 'Día de impartición presencial no encontrado' });
    }

    res.json(dia);
  } catch (error) {
    console.error('Error al obtener día de impartición presencial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createDiaImparticionPresencial = async (req, res) => {
  try {
    const {
      id_grupo,
      id_docente,
      fecha_imparticion,
      horario_inicio_tramo1,
      horario_fin_tramo1,
      horario_inicio_tramo2,
      horario_fin_tramo2
    } = req.body;

    const grupo = await prisma.grupos.findUnique({
      where: { id_grupo: parseInt(id_grupo) }
    });

    if (!grupo) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const dia = await prisma.diasImparticionGrupoPresencial.create({
      data: {
        id_grupo: parseInt(id_grupo),
        id_docente: id_docente ? parseInt(id_docente) : null,
        fecha_imparticion: new Date(fecha_imparticion),
        horario_inicio_tramo1: horario_inicio_tramo1 ? new Date(`1970-01-01T${horario_inicio_tramo1}`) : null,
        horario_fin_tramo1: horario_fin_tramo1 ? new Date(`1970-01-01T${horario_fin_tramo1}`) : null,
        horario_inicio_tramo2: horario_inicio_tramo2 ? new Date(`1970-01-01T${horario_inicio_tramo2}`) : null,
        horario_fin_tramo2: horario_fin_tramo2 ? new Date(`1970-01-01T${horario_fin_tramo2}`) : null
      },
      include: {
        grupo: {
          select: {
            id_grupo: true,
            denominacion: true,
            codigo: true
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
        },
        sesiones: {
          include: {
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
          orderBy: {
            horario_inicio: 'asc'
          }
        }
      }
    });

    res.status(201).json(dia);
  } catch (error) {
    console.error('Error al crear día de impartición presencial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateDiaImparticionPresencial = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_grupo,
      id_docente,
      fecha_imparticion,
      horario_inicio_tramo1,
      horario_fin_tramo1,
      horario_inicio_tramo2,
      horario_fin_tramo2
    } = req.body;

    const dia = await prisma.diasImparticionGrupoPresencial.update({
      where: { id_dia_pres: parseInt(id) },
      data: {
        id_grupo: id_grupo ? parseInt(id_grupo) : undefined,
        id_docente: id_docente ? parseInt(id_docente) : null,
        fecha_imparticion: fecha_imparticion ? new Date(fecha_imparticion) : undefined,
        horario_inicio_tramo1: horario_inicio_tramo1 ? new Date(`1970-01-01T${horario_inicio_tramo1}`) : null,
        horario_fin_tramo1: horario_fin_tramo1 ? new Date(`1970-01-01T${horario_fin_tramo1}`) : null,
        horario_inicio_tramo2: horario_inicio_tramo2 ? new Date(`1970-01-01T${horario_inicio_tramo2}`) : null,
        horario_fin_tramo2: horario_fin_tramo2 ? new Date(`1970-01-01T${horario_fin_tramo2}`) : null
      },
      include: {
        grupo: {
          select: {
            id_grupo: true,
            denominacion: true,
            codigo: true
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
        },
        sesiones: {
          include: {
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
          orderBy: {
            horario_inicio: 'asc'
          }
        }
      }
    });

    res.json(dia);
  } catch (error) {
    console.error('Error al actualizar día de impartición presencial:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Día de impartición presencial no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteDiaImparticionPresencial = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.diasImparticionGrupoPresencial.delete({
      where: { id_dia_pres: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar día de impartición presencial:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Día de impartición presencial no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllDiasImparticionPresencial,
  getDiaImparticionPresencialById,
  createDiaImparticionPresencial,
  updateDiaImparticionPresencial,
  deleteDiaImparticionPresencial
};
