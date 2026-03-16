const prisma = require('../db');


const getAllAreasProfesionales = async (req, res) => {
  try {
    const areas = await prisma.areaProfesional.findMany({
      include: false
    });
    res.json(areas);
  } catch (error) {
    console.error('Error al obtener áreas profesionales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAreasProfesionalesConDesgloses = async (req, res) => {
  try {
    const areas = await prisma.areaProfesional.findMany({
      where: {
        desgloseAreasProfesionales: {
          some: {}
        }
      },
      include: {
        desgloseAreasProfesionales: true
      }
    });
    res.json(areas);
  } catch (error) {
    console.error('Error al obtener áreas profesionales con desgloses:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const getAreaProfesionalById = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await prisma.areaProfesional.findUnique({
      where: { id_area: parseInt(id) },
      include: {
        desgloseAreasProfesionales: {
          include: {
            accionesFormativas: {
              include: {
                plan: true,
                grupos: true
              }
            }
          }
        },
        accionesFormativas: {
          include: {
            plan: true,
            grupos: true
          }
        }
      }
    });

    if (!area) {
      return res.status(404).json({ error: 'Área profesional no encontrada' });
    }

    res.json(area);
  } catch (error) {
    console.error('Error al obtener área profesional:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const createAreaProfesional = async (req, res) => {
  try {
    const { abreviatura, nombre } = req.body;


    const area = await prisma.areaProfesional.create({
      data: {
        abreviatura,
        nombre
      }
    });

    res.status(201).json(area);
  } catch (error) {
    console.error('Error al crear área profesional:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const updateAreaProfesional = async (req, res) => {
  try {
    const { id } = req.params;
    const { abreviatura, nombre } = req.body;

    const area = await prisma.areaProfesional.update({
      where: { id_area: parseInt(id) },
      data: {
        abreviatura,
        nombre
      }
    });

    res.json(area);
  } catch (error) {
    console.error('Error al actualizar área profesional:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Área profesional no encontrada' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const deleteAreaProfesional = async (req, res) => {
  try {
    const { id } = req.params;


    const [desgloses, acciones] = await Promise.all([
      prisma.desgloseAreasProfesionales.findMany({
        where: { id_area: parseInt(id) }
      }),
      prisma.accionesFormativas.findMany({
        where: { id_area: parseInt(id) }
      })
    ]);

    if (desgloses.length > 0 || acciones.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el área profesional porque tiene desgloses o acciones formativas asociadas' 
      });
    }

    await prisma.areaProfesional.delete({
      where: { id_area: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar área profesional:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Área profesional no encontrada' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllAreasProfesionales,
  getAreasProfesionalesConDesgloses,
  getAreaProfesionalById,
  createAreaProfesional,
  updateAreaProfesional,
  deleteAreaProfesional
};
