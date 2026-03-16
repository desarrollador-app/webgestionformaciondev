const prisma = require('../db');


const getAllCentrosTrabajo = async (req, res) => {
  try {
    const { id_empresa } = req.query;
    
    let whereClause = {};
    if (id_empresa) {
      whereClause.id_empresa = parseInt(id_empresa);
    }

    const centros = await prisma.centrosTrabajo.findMany({
      where: whereClause,
      include: false
    });
    res.json(centros);
  } catch (error) {
    console.error('Error al obtener centros de trabajo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const getCentroTrabajoById = async (req, res) => {
  try {
    const { id } = req.params;
    const centro = await prisma.centrosTrabajo.findUnique({
      where: { id_centro: parseInt(id) },
      include: {
        empresa: true,
        alumnosPersonaGrupo: {
          include: {
            persona: true,
            grupo: {
              include: {
                accionFormativa: {
                  include: {
                    plan: true,
                    areaProfesional: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!centro) {
      return res.status(404).json({ error: 'Centro de trabajo no encontrado' });
    }

    res.json(centro);
  } catch (error) {
    console.error('Error al obtener centro de trabajo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const createCentroTrabajo = async (req, res) => {
  try {
    const {
      nombre,
      NSS,
      direccion,
      persona_contacto,
      telefono1,
      telefono2,
      fax,
      correo_electronico,
      cuenta_bancaria,
      IBAN,
      BIC,
      id_empresa
    } = req.body;

    if (id_empresa) {
      const empresa = await prisma.empresas.findUnique({
        where: { id_empresa: parseInt(id_empresa) }
      });

      if (!empresa) {
        return res.status(400).json({ error: 'La empresa especificada no existe' });
      }
    }

    const centro = await prisma.centrosTrabajo.create({
      data: {
        nombre,
        NSS,
        direccion,
        persona_contacto,
        telefono1,
        telefono2,
        fax,
        correo_electronico,
        cuenta_bancaria,
        IBAN,
        BIC,
        id_empresa: id_empresa ? parseInt(id_empresa) : null
      },
      include: {
        empresa: true
      }
    });

    res.status(201).json(centro);
  } catch (error) {
    console.error('Error al crear centro de trabajo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const updateCentroTrabajo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      NSS,
      direccion,
      persona_contacto,
      telefono1,
      telefono2,
      fax,
      correo_electronico,
      cuenta_bancaria,
      IBAN,
      BIC,
      id_empresa
    } = req.body;


    if (id_empresa) {
      const empresa = await prisma.empresas.findUnique({
        where: { id_empresa: parseInt(id_empresa) }
      });

      if (!empresa) {
        return res.status(400).json({ error: 'La empresa especificada no existe' });
      }
    }

    const centro = await prisma.centrosTrabajo.update({
      where: { id_centro: parseInt(id) },
      data: {
        nombre,
        NSS,
        direccion,
        persona_contacto,
        telefono1,
        telefono2,
        fax,
        correo_electronico,
        cuenta_bancaria,
        IBAN,
        BIC,
        id_empresa: id_empresa ? parseInt(id_empresa) : undefined
      },
      include: {
        empresa: true
      }
    });

    res.json(centro);
  } catch (error) {
    console.error('Error al actualizar centro de trabajo:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Centro de trabajo no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const deleteCentroTrabajo = async (req, res) => {
  try {
    const { id } = req.params;


    const alumnos = await prisma.alumnosPersonaGrupo.findMany({
      where: { id_centro: parseInt(id) }
    });

    if (alumnos.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el centro de trabajo porque tiene alumnos asociados' 
      });
    }

    await prisma.centrosTrabajo.delete({
      where: { id_centro: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar centro de trabajo:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Centro de trabajo no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllCentrosTrabajo,
  getCentroTrabajoById,
  createCentroTrabajo,
  updateCentroTrabajo,
  deleteCentroTrabajo
};
