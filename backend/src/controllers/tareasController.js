const prisma = require('../db');
const tareaModel = require('../models/tareaModel');

/**
 * Filtra los datos de actualización basándose en los campos permitidos
 * @param {Object} data - Datos a filtrar
 * @returns {Object} Datos filtrados
 */
const filterUpdateData = (data) => {
  const updatableFields = tareaModel.getUpdatableFields();
  const filteredData = {};

  updatableFields.forEach(field => {
    if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  });

  return filteredData;
};


const getAllTareas = async (req, res) => {
  try {
    const { estado, autor_azure_id, responsable_azure_id, id_grupo } = req.query;

    let whereClause = {};
    if (id_grupo) {
      whereClause.id_grupo = parseInt(id_grupo);
    }
    if (estado) {
      whereClause.estado = estado;
    }
    if (autor_azure_id) {
      whereClause.autor_azure_id = autor_azure_id;
    }
    if (responsable_azure_id) {
      whereClause.responsable_azure_id = responsable_azure_id;
    }

    const tareas = await prisma.tareas.findMany({
      where: whereClause,
      include: {
        grupo: {
          select: {
            id_grupo: true,
            codigo: true,
            denominacion: true,
            accionFormativa: {
              select: {
                id_accion: true,
                denominacion: true,
                modalidad: true,
                plan: {
                  select: {
                    id_plan: true,
                    expediente: true,
                    nombre: true
                  }
                }
              }
            }
          }
        }
      },
      // Cambio el orderBy para que sea por fecha_vencimiento y id_tarea
      orderBy: [
        { fecha_vencimiento: 'asc' },
        { id_tarea: 'asc' }
      ]
    });
    res.json(tareas);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const getTareaById = async (req, res) => {
  try {
    const { id } = req.params;
    const tarea = await prisma.tareas.findUnique({
      where: { id_tarea: parseInt(id) },
      include: {
        grupo: {
          select: {
            id_grupo: true,
            codigo: true,
            denominacion: true,
            accionFormativa: {
              select: {
                id_accion: true,
                denominacion: true,
                modalidad: true,
                plan: {
                  select: {
                    id_plan: true,
                    expediente: true,
                    nombre: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json(tarea);
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createDefaultGrupoTareas = async (req, res) => {
  try {
    const { id_grupo } = req.body;
    const nombresTareas = [
      'Comprobar si las empresas participantes tienen Adhesión y LPD firmada',
      'Envío de presupuesto',
      'Confirmación de presupuesto aceptado',
      'Realizar diseño y desarrollo',
      'Realizar creatividades para las Redes Sociales',
      'Campaña de e-mail marketing',
      'Clonar plataforma',
      'Comunicación de traslado de requisitos a proveedores',
      'Comunicar grupo en Fundae',
      'Comunicación especial (SP, Cap,...)',
      'Contratación de seguros',
      'Parte de asistencia',
      'Recepción material',
      'Recepción de diploma',
      'Generación/envío diplomas',
      'Encuestas calidad',
      'Comunicación finalización de curso (SP, Cap,...)'
    ];

  // Añado la sección de fecha_vencimiento y color
    const tareas = await prisma.tareas.createMany({
      data: nombresTareas.map(nombre => ({
        nombre_tarea: nombre,
        id_grupo,
        estado: 'Pendiente',
        observaciones: '',
        autor_azure_id: null,
        responsable_azure_id: null,
        fecha_vencimiento: null,
        color: 'azul'
      }))
    });
    res.status(201).json(tareas);
  } catch (error) {
    console.error('Error al crear tareas por defecto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createTarea = async (req, res) => {
  try {

    const validation = tareaModel.validate(req.body)
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: validation.errors
      })
    }

    const filteredData = filterUpdateData(req.body)

    // estado por defecto
    if (!filteredData.estado) {
      filteredData.estado = 'Pendiente'
    }

    // permitir grupo opcional
    if (!filteredData.id_grupo) {
      filteredData.id_grupo = null
    }

    // ignorar usuarios (modo pruebas)
    filteredData.autor_azure_id = null
    filteredData.responsable_azure_id = null

    const tarea = await prisma.tareas.create({
      data: filteredData
    })

    res.status(201).json(tarea)

  } catch (error) {
    console.error('Error al crear tarea:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}



const updateTarea = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar datos
    const validation = tareaModel.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.errors 
      });
    }

    const filteredData = filterUpdateData(req.body);

    const tarea = await prisma.tareas.update({
      where: { id_tarea: parseInt(id) },
      data: filteredData
    });

    res.json(tarea);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const completeTarea = async (req, res) => {
  try {
    const { id } = req.params;

    const tarea = await prisma.tareas.update({
      where: { id_tarea: parseInt(id) },
      data: {
        estado: 'Completada'
      }
    });

    res.json(tarea);
  } catch (error) {
    console.error('Error al completar tarea:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const deleteTarea = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tareas.delete({
      where: { id_tarea: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllTareas,
  getTareaById,
  createTarea,
  updateTarea,
  completeTarea,
  deleteTarea,
  createDefaultGrupoTareas
};
