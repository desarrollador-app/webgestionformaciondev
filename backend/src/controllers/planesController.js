const prisma = require('../db');
const planModel = require('../models/planModel');

/**
 * Filtra los datos de actualización basándose en los campos permitidos
 * @param {Object} data - Datos a filtrar
 * @returns {Object} Datos filtrados
 */
const filterUpdateData = (data) => {
  const updatableFields = planModel.getUpdatableFields();
  const filteredData = {};

  updatableFields.forEach(field => {
    if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  });

  return filteredData;
};


/**
 *  //logs para pruebas  -------------
      const dbName = await prisma.$queryRaw`SELECT DB_NAME() as db`
      console.log("BASE ACTUAL:", dbName)

      const planes = await prisma.plan.findMany()
      

      res.json(planes)
9
 * 
 * 
 */
 


const getAllPlanes = async (req, res) => {
  try {
    const dbName = await prisma.$queryRaw`SELECT DB_NAME() as db` //prueba 
    console.log("BASE ACTUAL:", dbName) //log

    const planes = await prisma.planes.findMany({
      include: false
    });
    console.log("PLANES:", planes) //log prueba
    
    res.json(planes);
  } catch (error) {
    console.error('Error al obtener planes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await prisma.planes.findUnique({
      where: { id_plan: parseInt(id) },
      include: {
        accionesFormativas: {
          include: {
            areaProfesional: true,
            desgloseAreasProfesionales: true,
            grupos: true
          }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error al obtener plan:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createPlan = async (req, res) => {
  try {
    const validation = planModel.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.errors 
      });
    }

    const filteredData = filterUpdateData(req.body);
    
    const plan = await prisma.planes.create({
      data: filteredData
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error('Error al crear plan:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar datos
    const validation = planModel.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.errors 
      });
    }
    const filteredData = filterUpdateData(req.body);
    const plan = await prisma.planes.update({
      where: { id_plan: parseInt(id) },
      data: filteredData
    });

    res.json(plan);
  } catch (error) {
    console.error('Error al actualizar plan:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene acciones formativas asociadas
    const accionesFormativas = await prisma.accionesFormativas.findMany({
      where: { id_plan: parseInt(id) }
    });

    if (accionesFormativas.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el plan porque tiene acciones formativas asociadas' 
      });
    }

    await prisma.planes.delete({
      where: { id_plan: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar plan:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllPlanes,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
};
