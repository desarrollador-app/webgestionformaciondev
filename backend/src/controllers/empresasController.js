const prisma = require('../db');
const empresaModel = require('../models/empresaModel');

/**
 * Filtra los datos de actualización basándose en los campos permitidos
 * @param {Object} data - Datos a filtrar
 * @returns {Object} Datos filtrados
 */
const filterUpdateData = (data) => {
  const updatableFields = empresaModel.getUpdatableFields();
  const filteredData = {};

  updatableFields.forEach(field => {
    if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  });

  return filteredData;
};


const getAllEmpresas = async (req, res) => {
  try {
    const empresas = await prisma.empresas.findMany({
      include: {
        centrosTrabajo: true
      }
    });
    res.json(empresas);
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const getEmpresaById = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await prisma.empresas.findUnique({
      where: { id_empresa: parseInt(id) },
      include: {
        centrosTrabajo: {
          include: {
            alumnosPersonaGrupo: {
              include: {
                persona: true,
                grupo: {
                  include: {
                    accionFormativa: true
                  }
                }
              }
            }
          }
        },
        documentacionAdjEmpresa: true
      }
    });

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    res.json(empresa);
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const createEmpresa = async (req, res) => {
  try {
    // Validar datos
    const validation = empresaModel.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.errors 
      });
    }

    const filteredData = filterUpdateData(req.body);

    // Procesar fechas
    if (filteredData.fecha_discrepancia) {
      filteredData.fecha_discrepancia = new Date(filteredData.fecha_discrepancia);
    }

    // Procesar booleanos
    if (filteredData.resuelto !== undefined) {
      filteredData.resuelto = Boolean(filteredData.resuelto);
    }

    const empresa = await prisma.empresas.create({
      data: filteredData
    });

    res.status(201).json(empresa);
  } catch (error) {
    console.error('Error al crear empresa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const updateEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar datos
    const validation = empresaModel.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.errors 
      });
    }

    const filteredData = filterUpdateData(req.body);

    // Procesar fechas
    if (filteredData.fecha_discrepancia) {
      filteredData.fecha_discrepancia = new Date(filteredData.fecha_discrepancia);
    }

    // Procesar booleanos
    if (filteredData.resuelto !== undefined) {
      // Convertir string a boolean: 'Sí' -> true, otros valores -> false
      filteredData.resuelto = filteredData.resuelto === 'Sí' || filteredData.resuelto === true;
    }

    const empresa = await prisma.empresas.update({
      where: { id_empresa: parseInt(id) },
      data: filteredData
    });

    res.json(empresa);
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const deleteEmpresa = async (req, res) => {
  try {
    const { id } = req.params;


    const centrosTrabajo = await prisma.centrosTrabajo.findMany({
      where: { id_empresa: parseInt(id) }
    });

    if (centrosTrabajo.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la empresa porque tiene centros de trabajo asociados' 
      });
    }

    await prisma.empresas.delete({
      where: { id_empresa: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa
};
