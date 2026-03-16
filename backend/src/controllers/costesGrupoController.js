const prisma = require('../db');
const costeGrupoModel = require('../models/costeGrupoModel');

const getAllCostesGrupo = async (req, res) => {
  try {
    const { id_grupo } = req.query;
    const whereClause = {};
    
    if (id_grupo) {
      whereClause.id_grupo = parseInt(id_grupo);
    }
    
    const costes = await prisma.costesGrupo.findMany({
      where: whereClause,
      include: {
        grupo: {
          include: {
            accionFormativa: {
              include: {
                plan: true
              }
            }
          }
        }
      }
    });
    res.json(costes);
  } catch (error) {
    console.error('Error al obtener costes de grupo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getCosteGrupoById = async (req, res) => {
  try {
    const { id } = req.params;
    const coste = await prisma.costesGrupo.findUnique({
      where: { id_coste: parseInt(id) },
      include: {
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

    if (!coste) {
      return res.status(404).json({ error: 'Coste de grupo no encontrado' });
    }

    res.json(coste);
  } catch (error) {
    console.error('Error al obtener coste de grupo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createCosteGrupo = async (req, res) => {
  try {
    const { id_grupo, ...costeData } = req.body;

    // Validar datos
    const validation = costeGrupoModel.validate(costeData);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.errors 
      });
    }

    // Validar que el grupo existe
    const grupo = await prisma.grupos.findUnique({
      where: { id_grupo: parseInt(id_grupo) }
    });

    if (!grupo) {
      return res.status(400).json({ error: 'El grupo especificado no existe' });
    }

    // Filtrar solo los campos actualizables
    const updatableFields = costeGrupoModel.getUpdatableFields();
    const filteredData = {};
    
    updatableFields.forEach(field => {
      if (costeData[field] !== undefined) {
        filteredData[field] = costeData[field];
      }
    });

    // Convertir valores numéricos
    const numericFields = [
      'directos', 'indirectos', 'organizacion', 'salariales',
      'periodos_enero', 'periodos_febrero', 'periodos_marzo', 'periodos_abril',
      'periodos_mayo', 'periodos_junio', 'periodos_julio', 'periodos_agosto',
      'periodos_septiembre', 'periodos_octubre', 'periodos_noviembre', 'periodos_diciembre'
    ];

    numericFields.forEach(field => {
      if (filteredData[field] !== undefined && filteredData[field] !== null) {
        filteredData[field] = parseFloat(filteredData[field]);
      }
    });

    const coste = await prisma.costesGrupo.create({
      data: {
        id_grupo: parseInt(id_grupo),
        ...filteredData
      }
    });

    res.status(201).json(coste);
  } catch (error) {
    console.error('Error al crear coste de grupo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateCosteGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validar datos
    const validation = costeGrupoModel.validate(updateData);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.errors 
      });
    }

    // Filtrar solo los campos actualizables
    const updatableFields = costeGrupoModel.getUpdatableFields();
    const filteredData = {};
    
    updatableFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Convertir valores numéricos
    const numericFields = [
      'directos', 'indirectos', 'organizacion', 'salariales',
      'periodos_enero', 'periodos_febrero', 'periodos_marzo', 'periodos_abril',
      'periodos_mayo', 'periodos_junio', 'periodos_julio', 'periodos_agosto',
      'periodos_septiembre', 'periodos_octubre', 'periodos_noviembre', 'periodos_diciembre'
    ];

    numericFields.forEach(field => {
      if (filteredData[field] !== undefined && filteredData[field] !== null) {
        filteredData[field] = parseFloat(filteredData[field]);
      }
    });

    const coste = await prisma.costesGrupo.update({
      where: { id_coste: parseInt(id) },
      data: filteredData
    });

    res.json(coste);
  } catch (error) {
    console.error('Error al actualizar coste de grupo:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Coste de grupo no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteCosteGrupo = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.costesGrupo.delete({
      where: { id_coste: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar coste de grupo:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Coste de grupo no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getCostesByGrupo = async (req, res) => {
  try {
    const { id_grupo } = req.params;
    
    const costes = await prisma.costesGrupo.findMany({
      where: { id_grupo: parseInt(id_grupo) },
      include: {
        grupo: {
          include: {
            accionFormativa: {
              include: {
                plan: true
              }
            }
          }
        }
      }
    });

    res.json(costes);
  } catch (error) {
    console.error('Error al obtener costes por grupo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllCostesGrupo,
  getCosteGrupoById,
  createCosteGrupo,
  updateCosteGrupo,
  deleteCosteGrupo,
  getCostesByGrupo
};
