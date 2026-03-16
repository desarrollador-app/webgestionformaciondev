const prisma = require('../db');


const getAllDocentesPersonaGrupo = async (req, res) => {
  try {
    const { id_persona, id_grupo, tutoria, modalidad } = req.query;
    
    let whereClause = {};
    if (id_persona) whereClause.id_persona = parseInt(id_persona);
    if (id_grupo) whereClause.id_grupo = parseInt(id_grupo);
    if (tutoria !== undefined) whereClause.tutoria = tutoria === 'true';
    if (modalidad) whereClause.modalidad = modalidad;

    const docentes = await prisma.docentesPersonaGrupo.findMany({
      where: whereClause,
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
        }
      }
    });
    res.json(docentes);
  } catch (error) {
    console.error('Error al obtener docentes en grupos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const getDocentePersonaGrupoById = async (req, res) => {
  try {
    const { id } = req.params;
    const docente = await prisma.docentesPersonaGrupo.findUnique({
      where: { id_docente_grupo: parseInt(id) },
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
      }
    });

    if (!docente) {
      return res.status(404).json({ error: 'Docente en grupo no encontrado' });
    }

    res.json(docente);
  } catch (error) {
    console.error('Error al obtener docente en grupo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const createDocentePersonaGrupo = async (req, res) => {
  try {
    const {
      id_persona,
      id_grupo,
      fecha_asignacion,
      tutoria,
      tipotutoria,
      descripcion,
      modalidad
    } = req.body;

    const [persona, grupo] = await Promise.all([
      prisma.personas.findUnique({ where: { id_persona: parseInt(id_persona) } }),
      prisma.grupos.findUnique({ where: { id_grupo: parseInt(id_grupo) } })
    ]);

    if (!persona) {
      return res.status(400).json({ error: 'La persona especificada no existe' });
    }
    if (!grupo) {
      return res.status(400).json({ error: 'El grupo especificado no existe' });
    }

    const docente = await prisma.docentesPersonaGrupo.create({
      data: {
        id_persona: parseInt(id_persona),
        id_grupo: parseInt(id_grupo),
        fecha_asignacion: fecha_asignacion ? new Date(fecha_asignacion) : null,
        tutoria: tutoria !== undefined ? tutoria : true,
        tipotutoria,
        descripcion,
        modalidad
      },
      include: {
        persona: true,
        grupo: {
          include: {
            accionFormativa: true
          }
        }
      }
    });

    res.status(201).json(docente);
  } catch (error) {
    console.error('Error al crear docente en grupo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const updateDocentePersonaGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;


    if (updateData.fecha_asignacion) {
      updateData.fecha_asignacion = new Date(updateData.fecha_asignacion);
    }
    if (updateData.id_persona) {
      updateData.id_persona = parseInt(updateData.id_persona);
    }
    if (updateData.id_grupo) {
      updateData.id_grupo = parseInt(updateData.id_grupo);
    }

    const docente = await prisma.docentesPersonaGrupo.update({
      where: { id_docente_grupo: parseInt(id) },
      data: updateData,
      include: {
        persona: true,
        grupo: {
          include: {
            accionFormativa: true
          }
        }
      }
    });

    res.json(docente);
  } catch (error) {
    console.error('Error al actualizar docente en grupo:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Docente en grupo no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const deleteDocentePersonaGrupo = async (req, res) => {
  try {
    const { id } = req.params;


    // Ya no verificamos documentación asociada porque ahora se relaciona directamente con la persona

    await prisma.docentesPersonaGrupo.delete({
      where: { id_docente_grupo: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar docente de grupo:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Docente en grupo no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Endpoint para obtener docentes con cálculo de horas totales
const getDocentesConHoras = async (req, res) => {
  try {
    const { id_grupo, id_persona, modalidad } = req.query;
    
    let whereClause = {};
    if (id_grupo) whereClause.id_grupo = parseInt(id_grupo);
    if (id_persona) whereClause.id_persona = parseInt(id_persona);
    if (modalidad) whereClause.modalidad = modalidad;

    const docentes = await prisma.docentesPersonaGrupo.findMany({
      where: whereClause,
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
        sesiones: {
          include: {
            diaTeleformacion: true,
            diaPresencial: true
          }
        }
      }
    });

    // Calcular horas totales para cada docente
    const docentesConHoras = docentes.map(docente => {
      let horasTotales = 0;
      let horasPresenciales = 0;
      let horasTeleformacion = 0;

      // Calcular horas por sesión
      docente.sesiones.forEach(sesion => {
        if (sesion.horario_inicio && sesion.horario_fin) {
          const inicio = new Date(sesion.horario_inicio);
          const fin = new Date(sesion.horario_fin);
          const horasSesion = (fin - inicio) / (1000 * 60 * 60); // Convertir a horas
          
          horasTotales += horasSesion;
          
          // Clasificar por modalidad
          if (sesion.diaPresencial) {
            horasPresenciales += horasSesion;
          } else if (sesion.diaTeleformacion) {
            horasTeleformacion += horasSesion;
          }
        }
      });

      return {
        ...docente,
        horas_totales: Math.round(horasTotales * 100) / 100, // Redondear a 2 decimales
        horas_presenciales: Math.round(horasPresenciales * 100) / 100,
        horas_teleformacion: Math.round(horasTeleformacion * 100) / 100,
        numero_sesiones: docente.sesiones.length
      };
    });

    res.json(docentesConHoras);
  } catch (error) {
    console.error('Error al obtener docentes con horas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Endpoint específico para obtener docentes de un grupo con horas para XML
const getDocentesGrupoConHoras = async (req, res) => {
  try {
    const { id_grupo } = req.params;
    const { modalidad } = req.query;
    
    if (!id_grupo) {
      return res.status(400).json({ error: 'ID de grupo requerido' });
    }

    let whereClause = { id_grupo: parseInt(id_grupo) };
    if (modalidad) {
      whereClause.modalidad = modalidad;
    }

    const docentes = await prisma.docentesPersonaGrupo.findMany({
      where: whereClause,
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
        sesiones: {
          include: {
            diaTeleformacion: true,
            diaPresencial: true
          }
        }
      }
    });

    if (docentes.length === 0) {
      return res.json([]);
    }

    // Calcular horas totales para cada docente
    const docentesConHoras = docentes.map(docente => {
      let horasTotales = 0;
      let horasPresenciales = 0;
      let horasTeleformacion = 0;

      // Calcular horas por sesión
      docente.sesiones.forEach(sesion => {
        if (sesion.horario_inicio && sesion.horario_fin) {
          const inicio = new Date(sesion.horario_inicio);
          const fin = new Date(sesion.horario_fin);
          const horasSesion = (fin - inicio) / (1000 * 60 * 60); // Convertir a horas
          
          horasTotales += horasSesion;
          
          // Clasificar por modalidad
          if (sesion.diaPresencial) {
            horasPresenciales += horasSesion;
          } else if (sesion.diaTeleformacion) {
            horasTeleformacion += horasSesion;
          }
        }
      });

      return {
        id_docente_grupo: docente.id_docente_grupo,
        id_persona: docente.id_persona,
        id_grupo: docente.id_grupo,
        fecha_asignacion: docente.fecha_asignacion,
        tutoria: docente.tutoria,
        tipotutoria: docente.tipotutoria,
        descripcion: docente.descripcion,
        modalidad: docente.modalidad,
        persona: docente.persona,
        grupo: docente.grupo,
        horas_totales: Math.round(horasTotales * 100) / 100,
        horas_presenciales: Math.round(horasPresenciales * 100) / 100,
        horas_teleformacion: Math.round(horasTeleformacion * 100) / 100,
        numero_sesiones: docente.sesiones.length
      };
    });

    res.json(docentesConHoras);
  } catch (error) {
    console.error('Error al obtener docentes del grupo con horas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllDocentesPersonaGrupo,
  getDocentePersonaGrupoById,
  createDocentePersonaGrupo,
  updateDocentePersonaGrupo,
  deleteDocentePersonaGrupo,
  getDocentesConHoras,
  getDocentesGrupoConHoras
};
