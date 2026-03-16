const prisma = require('../db');


const getAllDesgloseAreasProfesionales = async (req, res) => {
  try {
    const { id_area } = req.query;
    
    let whereClause = {};
    if (id_area) {
      whereClause.id_area = parseInt(id_area);
    }

    const desgloses = await prisma.desgloseAreasProfesionales.findMany({
      where: whereClause,
      include: false
    });
    res.json(desgloses);
  } catch (error) {
    console.error('Error al obtener desgloses de áreas profesionales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const getDesgloseById = async (req, res) => {
  try {
    const { id } = req.params;
    const desglose = await prisma.desgloseAreasProfesionales.findUnique({
      where: { id_desglose: parseInt(id) },
      include: {
        areaProfesional: true,
        accionesFormativas: {
          include: {
            plan: true,
            grupos: {
              include: {
                alumnosPersonaGrupo: {
                  include: {
                    persona: true
                  }
                },
                docentesPersonaGrupo: {
                  include: {
                    persona: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!desglose) {
      return res.status(404).json({ error: 'Desglose no encontrado' });
    }

    res.json(desglose);
  } catch (error) {
    console.error('Error al obtener desglose:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const createDesglose = async (req, res) => {
  try {
    const { id_area, codigo_grupo, desglose } = req.body;

    const areaProfesional = await prisma.areaProfesional.findUnique({
      where: { id_area: parseInt(id_area) }
    });

    if (!areaProfesional) {
      return res.status(400).json({ error: 'El área profesional especificada no existe' });
    }

    const nuevoDesglose = await prisma.desgloseAreasProfesionales.create({
      data: {
        id_area: parseInt(id_area),
        codigo_grupo,
        desglose
      },
      include: {
        areaProfesional: true
      }
    });

    res.status(201).json(nuevoDesglose);
  } catch (error) {
    console.error('Error al crear desglose:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const updateDesglose = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_area, codigo_grupo, desglose } = req.body;


    if (id_area) {
      const areaProfesional = await prisma.areaProfesional.findUnique({
        where: { id_area: parseInt(id_area) }
      });

      if (!areaProfesional) {
        return res.status(400).json({ error: 'El área profesional especificada no existe' });
      }
    }

    const desgloseActualizado = await prisma.desgloseAreasProfesionales.update({
      where: { id_desglose: parseInt(id) },
      data: {
        id_area: id_area ? parseInt(id_area) : undefined,
        codigo_grupo,
        desglose
      },
      include: {
        areaProfesional: true
      }
    });

    res.json(desgloseActualizado);
  } catch (error) {
    console.error('Error al actualizar desglose:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Desglose no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const deleteDesglose = async (req, res) => {
  try {
    const { id } = req.params;


    const accionesFormativas = await prisma.accionesFormativas.findMany({
      where: { id_desglose: parseInt(id) }
    });

    if (accionesFormativas.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el desglose porque tiene acciones formativas asociadas' 
      });
    }

    await prisma.desgloseAreasProfesionales.delete({
      where: { id_desglose: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar desglose:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Desglose no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllDesgloseAreasProfesionales,
  getDesgloseById,
  createDesglose,
  updateDesglose,
  deleteDesglose
};
