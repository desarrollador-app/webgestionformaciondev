const prisma = require('../db');


const getAllAlumnosPersonaGrupo = async (req, res) => {
  try {
    const { id_persona, id_grupo, id_centro, estado_curso } = req.query;
    
    let whereClause = {};
    if (id_persona) whereClause.id_persona = parseInt(id_persona);
    if (id_grupo) whereClause.id_grupo = parseInt(id_grupo);
    if (id_centro) whereClause.id_centro = parseInt(id_centro);
    if (estado_curso) whereClause.estado_curso = estado_curso;

    // Primero probemos una consulta simple para verificar las relaciones
    const alumnos = await prisma.alumnosPersonaGrupo.findMany({
      where: whereClause,
      include: {
        persona: true,
        centro: {
          include: {
            empresa: true
          }
        }
      }
    });
    res.json(alumnos);
  } catch (error) {
    console.error('Error al obtener alumnos en grupos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const getAlumnoPersonaGrupoById = async (req, res) => {
  try {
    const { id } = req.params;
    const alumno = await prisma.alumnosPersonaGrupo.findUnique({
      where: { id_alumno_grupo: parseInt(id) },
      include: {
        persona: true,
        grupo: {
          include: {
            accionFormativa: {
              include: {
                plan: true,
                areaProfesional: true,
                desgloseAreasProfesionales: true
              }
            }
          }
        },
        centro: {
          include: {
            empresa: true
          }
        },
      }
    });

    if (!alumno) {
      return res.status(404).json({ error: 'Alumno en grupo no encontrado' });
    }

    res.json(alumno);
  } catch (error) {
    console.error('Error al obtener alumno en grupo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const createAlumnoPersonaGrupo = async (req, res) => {
  try {
    const {
      id_persona,
      id_grupo,
      id_centro,
      fecha_inscripcion,
      estado_curso,
      progreso_curso,
      diploma,
      jornada_laboral,
      fijo_discontinuo,
      categoria_profesional,
      ERTE
    } = req.body;

    // Buscamos la información, pero ahora añadimos la petición a Prisma que cuente los alumnos actuales del grupo
    const [persona, grupo, centro] = await Promise.all([
      prisma.personas.findUnique({ where: { id_persona: parseInt(id_persona) } }),
      prisma.grupos.findUnique({ 
        where: { id_grupo: parseInt(id_grupo) },
        include: {
          _count: {
            select: { alumnosPersonaGrupo: true }
          }
        }
      }),
      prisma.centrosTrabajo.findUnique({ where: { id_centro: parseInt(id_centro) } })
    ]);

    if (!persona) {
      return res.status(400).json({ error: 'La persona especificada no existe' });
    }
    if (!grupo) {
      return res.status(400).json({ error: 'El grupo especificado no existe' });
    }
    if (!centro) {
      return res.status(400).json({ error: 'El centro de trabajo especificado no existe' });
    }

    // Definimos los límites
    const limitesBonificacion = {
      presencial: 30,
      teleformacion: 80,
      mixta: 30
    };

    // Determinamos el máximo permitido (Prioridad: Campo manual > Tipo bonificación > Infinito)
    const tipo = grupo.tipo_bonificacion ? grupo.tipo_bonificacion.toLowerCase() : null;
    const maxAlumnos = grupo.max_alumnos || limitesBonificacion[tipo] || Infinity;

    // Obtenemos cuántos alumnos hay ya inscritos
    const alumnosActuales = grupo._count.alumnosPersonaGrupo;
    if (alumnosActuales >= maxAlumnos) {
      return res.status(400).json({ 
        error: `Límite alcanzado: Este grupo solo permite ${maxAlumnos} alumnos (Tipo: ${grupo.tipo_bonificacion || 'No definido'}).` 
      });
    }

    const alumno = await prisma.alumnosPersonaGrupo.create({
      data: {
        id_persona: parseInt(id_persona),
        id_grupo: parseInt(id_grupo),
        id_centro: parseInt(id_centro),
        fecha_inscripcion: fecha_inscripcion ? new Date(fecha_inscripcion) : null,
        estado_curso,
        progreso_curso,
        diploma,
        jornada_laboral: jornada_laboral || false,
        fijo_discontinuo: fijo_discontinuo || false,
        categoria_profesional,
        ERTE: ERTE || false
      },
      include: {
        persona: true,
        grupo: {
          include: {
            accionFormativa: true
          }
        },
        centro: {
          include: {
            empresa: true
          }
        }
      }
    });

    res.status(201).json(alumno);
  } catch (error) {
    console.error('Error al crear alumno en grupo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const updateAlumnoPersonaGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Procesar campos que necesitan conversión
    if (updateData.fecha_inscripcion) {
      updateData.fecha_inscripcion = new Date(updateData.fecha_inscripcion);
    }
    if (updateData.id_persona) {
      updateData.id_persona = parseInt(updateData.id_persona);
    }
    if (updateData.id_grupo) {
      updateData.id_grupo = parseInt(updateData.id_grupo);
    }
    if (updateData.id_centro) {
      updateData.id_centro = parseInt(updateData.id_centro);
    }

    const alumno = await prisma.alumnosPersonaGrupo.update({
      where: { id_alumno_grupo: parseInt(id) },
      data: updateData,
      include: {
        persona: true,
        grupo: {
          include: {
            accionFormativa: true
          }
        },
        centro: {
          include: {
            empresa: true
          }
        }
      }
    });

    res.json(alumno);
  } catch (error) {
    console.error('Error al actualizar alumno en grupo:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Alumno en grupo no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const deleteAlumnoPersonaGrupo = async (req, res) => {
  try {
    const { id } = req.params;


    // Ya no verificamos documentación asociada porque ahora se relaciona directamente con la persona

    await prisma.alumnosPersonaGrupo.delete({
      where: { id_alumno_grupo: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar alumno de grupo:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Alumno en grupo no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllAlumnosPersonaGrupo,
  getAlumnoPersonaGrupoById,
  createAlumnoPersonaGrupo,
  updateAlumnoPersonaGrupo,
  deleteAlumnoPersonaGrupo
};
