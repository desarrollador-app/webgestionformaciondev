const prisma = require('../db');
const accionFormativaModel = require('../models/accionFormativaModel');
const { truncateString } = require('../utils/utils');

/**
 * Filtra los datos de actualización basándose en los campos permitidos
 * @param {Object} data - Datos a filtrar
 * @returns {Object} Datos filtrados
 */
const filterUpdateData = (data) => {
  const updatableFields = accionFormativaModel.getUpdatableFields();
  const filteredData = {};

  updatableFields.forEach(field => {
    if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  });

  return filteredData;
};


const getAllAccionesFormativas = async (req, res) => {
  try {
    const { include, exact_match, ...filters } = req.query;
    
    // Construir opciones de include
    let includeOptions = false;
    if (include === 'plan') {
      includeOptions = {
        plan: true
      };
    }
    
    // Construir filtros dinámicos
    const whereClause = {
      fecha_borrado:null
    };
    
    // Filtros por campos específicos
    if (filters.id_plan) {
      whereClause.id_plan = parseInt(filters.id_plan);
    }
    if (filters.expediente_plan) {
      whereClause.plan = {
        expediente: filters.expediente_plan
      };
    }
    if (filters.id_area) {
      whereClause.id_area = parseInt(filters.id_area);
    }
    if (filters.id_desglose) {
      whereClause.id_desglose = parseInt(filters.id_desglose);
    }
    if (filters.modalidad) {
      whereClause.modalidad = filters.modalidad;
    }
    if (filters.nivel_formacion) {
      whereClause.nivel_formacion = filters.nivel_formacion;
    }
    
    // Filtros de texto (búsqueda parcial)
    if (filters.denominacion) {
      whereClause.denominacion = {
        contains: filters.denominacion,
        mode: 'insensitive'
      };
    }
    if (filters.numero_accion) {
      // Si se especifica exact_match=true, hacer búsqueda exacta (para validación de duplicados)
      if (exact_match === 'true') {
        whereClause.numero_accion = filters.numero_accion;
      } else {
        // Búsqueda parcial para filtros normales
        whereClause.numero_accion = {
          contains: filters.numero_accion,
          mode: 'insensitive'
        };
      }
    }
    
    // Filtros de rango numérico
    if (filters.horas_min) {
      whereClause.horas_modalidad_presencial = {
        ...whereClause.horas_modalidad_presencial,
        gte: parseInt(filters.horas_min)
      };
    }
    if (filters.horas_max) {
      whereClause.horas_modalidad_presencial = {
        ...whereClause.horas_modalidad_presencial,
        lte: parseInt(filters.horas_max)
      };
    }
    if (filters.participantes_min) {
      whereClause.participantes = {
        ...whereClause.participantes,
        gte: parseInt(filters.participantes_min)
      };
    }
    if (filters.participantes_max) {
      whereClause.participantes = {
        ...whereClause.participantes,
        lte: parseInt(filters.participantes_max)
      };
    }
    
    const acciones = await prisma.accionesFormativas.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: includeOptions
    });
    res.json(acciones);
  } catch (error) {
    console.error('Error al obtener acciones formativas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const getAccionFormativaById = async (req, res) => {
  try {
    const { id } = req.params;
    const accion = await prisma.accionesFormativas.findUnique({
      where: { id_accion: parseInt(id) },
      include: {
        plan: true,
        areaProfesional: true,
        desgloseAreasProfesionales: {
          include: {
            areaProfesional: true
          }
        },
        grupos: {
          include: {
            alumnosPersonaGrupo: {
              include: {
                persona: true,
                centro: true
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
    });

    if (!accion) {
      return res.status(404).json({ error: 'Acción formativa no encontrada' });
    }

    res.json(accion);
  } catch (error) {
    console.error('Error al obtener acción formativa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const createAccionFormativa = async (req, res) => {
  try {
    // Validar datos
    const validation = accionFormativaModel.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.errors 
      });
    }

    const filteredData = filterUpdateData(req.body);

    // Validar que el número de acción no esté duplicado dentro del mismo plan
    if (filteredData.numero_accion && filteredData.id_plan) {
      const accionExistente = await prisma.accionesFormativas.findFirst({
        where: { 
          numero_accion: filteredData.numero_accion,
          id_plan: filteredData.id_plan
        }
      });

      if (accionExistente) {
        return res.status(400).json({ 
          error: 'El número de acción ya existe en este plan', 
          details: [`Ya existe una acción formativa con el número ${filteredData.numero_accion} en el plan seleccionado`]
        });
      }
    }

    const accion = await prisma.accionesFormativas.create({
      data: filteredData
    });

    res.status(201).json(accion);
  } catch (error) {
    console.error('Error al crear acción formativa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const updateAccionFormativa = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar datos
    const validation = accionFormativaModel.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.errors 
      });
    }

    const filteredData = filterUpdateData(req.body);

    // Validar que el número de acción no esté duplicado dentro del mismo plan (si se está actualizando)
    if (filteredData.numero_accion) {
      // Si se está cambiando el plan, validar en el nuevo plan
      const planId = filteredData.id_plan || (await prisma.accionesFormativas.findUnique({
        where: { id_accion: parseInt(id) },
        select: { id_plan: true }
      }))?.id_plan;

      if (planId) {
        const accionExistente = await prisma.accionesFormativas.findFirst({
          where: { 
            numero_accion: filteredData.numero_accion,
            id_plan: planId,
            id_accion: { not: parseInt(id) } // Excluir la acción actual
          }
        });

        if (accionExistente) {
          return res.status(400).json({ 
            error: 'El número de acción ya existe en este plan', 
            details: [`Ya existe una acción formativa con el número ${filteredData.numero_accion} en el plan seleccionado`]
          });
        }
      }
    }

    const accion = await prisma.accionesFormativas.update({
      where: { id_accion: parseInt(id) },
      data: filteredData
    });

    res.json(accion);
  } catch (error) {
    console.error('Error al actualizar acción formativa:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Acción formativa no encontrada' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const deleteAccionFormativa = async (req, res) => {
  try {
    const { id } = req.params;
    const { borrado_por_azure_id } = req.body;


    const grupos = await prisma.grupos.findMany({
      where: { id_accion: parseInt(id) }
    });

    if (grupos.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la acción formativa porque tiene grupos asociados' 
      });
    }
    const usuarioIdStr = borrado_por_azure_id ? String(borrado_por_azure_id) :'Desconocido';

    await prisma.accionesFormativas.delete({
      where: { id_accion: parseInt(id) },
      data: {
 fecha_borrado:new Date(),
 borrado_por_azure_id:usuarioIdStr
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar acción formativa:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Acción formativa no encontrada' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función para generar XML AAFF - Acciones Formativas
const generateAAFFXML = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID de acción formativa requerido' });
    }

    // Obtener datos completos de la acción formativa con todas las relaciones
    const accionFormativa = await prisma.accionesFormativas.findUnique({
      where: { id_accion: parseInt(id) },
      include: {
        plan: true,
        areaProfesional: true,
        desgloseAreasProfesionales: true,
        grupos: {
          include: {
            costesGrupo: true,
            alumnosPersonaGrupo: {
              include: {
                centro: {
                  include: {
                    empresa: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!accionFormativa) {
      return res.status(404).json({ error: 'Acción formativa no encontrada' });
    }

    // Generar el XML
    const xml = generateAAFFXMLStructure(accionFormativa);
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="aaff_${accionFormativa.numero_accion || id}.xml"`);
    res.send(xml);
    
  } catch (error) {
    console.error('Error al generar XML AAFF:', error);
    // Si el error tiene un mensaje específico (validaciones), devolverlo
    if (error.message && error.message.includes('No se puede generar XML')) {
      return res.status(400).json({ 
        error: error.message,
        details: error.message
      });
    }
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

// Función auxiliar para generar la estructura XML AAFF
const generateAAFFXMLStructure = (accionFormativa) => {
  const mapNivelFormacion = (nivel) => {
    // 0 = BASICO, 1 = SUPERIOR
    return nivel === 'SUPERIOR' ? 1 : 0;
  };

  const mapModalidad = (modalidad) => {
    const mapping = {
      'Presencial': 'modalidadPresencial',
      'Teleformación': 'modalidadTeleformacion',
      'Mixta': 'modalidadMixta'
    };
    return mapping[modalidad] || 'modalidadPresencial';
  };

  let xml = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<AccionesFormativas>
  <AccionFormativa>
    <codAccion>${truncateString(String(accionFormativa.numero_accion || ''), 5)}</codAccion>
    <nombreAccion>${truncateString(accionFormativa.denominacion || '', 255)}</nombreAccion>
    <codGrupoAccion>${truncateString(accionFormativa.codigo_grupo_accion || '', 6)}</codGrupoAccion>`;

  // Código de área profesional
  if (accionFormativa.areaProfesional?.abreviatura) {
    xml += `
    <codAreaProfesional>${truncateString(accionFormativa.areaProfesional.abreviatura, 4)}</codAreaProfesional>`;
  }

  // Modalidad según el tipo
  const modalidadTipo = mapModalidad(accionFormativa.modalidad);
  
  if (modalidadTipo === 'modalidadPresencial') {
    xml += `
    <modalidadPresencial>
      <horasPr>${accionFormativa.horas_modalidad_presencial || 0}</horasPr>
    </modalidadPresencial>`;
  } else if (modalidadTipo === 'modalidadTeleformacion') {
    xml += `
    <modalidadTeleformacion>`;
    if (accionFormativa.horas_modalidad_presencial > 0) {
      xml += `
      <horasPr>${accionFormativa.horas_modalidad_presencial}</horasPr>`;
    }
    xml += `
      <horasTe>${accionFormativa.horas_modalidad_teleformacion || 0}</horasTe>
    </modalidadTeleformacion>`;
  } else if (modalidadTipo === 'modalidadMixta') {
    xml += `
    <modalidadMixta>
      <horasPr>${accionFormativa.horas_modalidad_presencial || 0}</horasPr>
      <horasTe>${accionFormativa.horas_modalidad_teleformacion || 0}</horasTe>
    </modalidadMixta>`;
  }

  // Datos de plataforma (solo para teleformación y mixta)
  if (accionFormativa.modalidad === 'Teleformación' || accionFormativa.modalidad === 'Mixta') {
    if (accionFormativa.cif_plataforma) {
      xml += `
    <cifPlataforma>${truncateString(accionFormativa.cif_plataforma, 9)}</cifPlataforma>`;
    }
    if (accionFormativa.razon_social_plataforma) {
      xml += `
    <razonSocialPlataforma>${truncateString(accionFormativa.razon_social_plataforma, 55)}</razonSocialPlataforma>`;
    }
    if (accionFormativa.uri) {
      xml += `
    <uri>${truncateString(accionFormativa.uri, 255)}</uri>`;
    }
    if (accionFormativa.usuario) {
      xml += `
    <usuario>${truncateString(accionFormativa.usuario, 50)}</usuario>`;
    }
    if (accionFormativa.password) {
      xml += `
    <password>${truncateString(accionFormativa.password, 50)}</password>`;
    }
  }

  // Observaciones
  if (accionFormativa.observaciones) {
    xml += `
    <observaciones>${accionFormativa.observaciones}</observaciones>`;
  }

  // Nivel de formación
  if (accionFormativa.nivel_formacion) {
    xml += `
    <nivelFormacion>${mapNivelFormacion(accionFormativa.nivel_formacion)}</nivelFormacion>`;
  }

  // Validar que objetivos y contenidos estén presentes (OBLIGATORIO según XSD)
  if (!accionFormativa.objetivos || !accionFormativa.objetivos.trim()) {
    throw new Error('No se puede generar XML: el campo objetivos es obligatorio.');
  }
  if (!accionFormativa.contenido || !accionFormativa.contenido.trim()) {
    throw new Error('No se puede generar XML: el campo contenidos es obligatorio.');
  }

  // Objetivos y contenidos
  xml += `
    <objetivos>${accionFormativa.objetivos}</objetivos>
    <contenidos>${accionFormativa.contenido}</contenidos>`;

  // Empresas participantes (empresas de los alumnos de los grupos)
  const empresasParticipantes = new Map();
  
  accionFormativa.grupos?.forEach(grupo => {
    grupo.alumnosPersonaGrupo?.forEach(alumno => {
      if (alumno.centro?.empresa) {
        const empresa = alumno.centro.empresa;
        empresasParticipantes.set(empresa.CIF, empresa);
      }
    });
  });

  empresasParticipantes.forEach(empresa => {
    xml += `
    <empParticipantes>
      <cif>${empresa.CIF}</cif>
      <infRLT>
        <informaRLT>${empresa.informa_RLT === 'Sí' ? 'S' : 'N'}</informaRLT>
        <informe>
          <valorinf>${empresa.valor_informe?.toLowerCase() || 'F'}</valorinf>`;
    
    // Agregar información de discrepancia si existe
    if (empresa.fecha_discrepancia && empresa.resuelto !== null) {
      const fechaDiscrepancia = new Date(empresa.fecha_discrepancia);
      const fechaFormateada = `${String(fechaDiscrepancia.getDate()).padStart(2, '0')}/${String(fechaDiscrepancia.getMonth() + 1).padStart(2, '0')}/${fechaDiscrepancia.getFullYear()}`;
      const resuelto15 = empresa.resuelto ? 'S' : 'N';
      
      xml += `
          <discrepancia>
            <fechaDis>${fechaFormateada}</fechaDis>
            <resuelto15>${resuelto15}</resuelto15>
          </discrepancia>`;
    }
    
    xml += `
        </informe>
      </infRLT>
    </empParticipantes>`;
  });

  xml += `
  </AccionFormativa>
</AccionesFormativas>`;

  return xml;
};


//funcion para ducplicar accion formativa
const duplicarAccionFormativa = async (req, res) => {
  try {
    const { id } = req.params

    const accionOriginal = await prisma.accionesFormativas.findUnique({
      where: { id_accion: Number(id) }
    })

    if (!accionOriginal) {
      return res.status(404).json({ error: 'Acción formativa no encontrada' })
    }

    const { id_accion, ...data } = accionOriginal

    const nuevaAccion = await prisma.accionesFormativas.create({
      data: {
        ...data,
        denominacion: `${accionOriginal.denominacion} (copia)`
      }
    })

    res.status(201).json(nuevaAccion)

  } catch (error) {
    console.error('Error duplicando acción formativa:', error)
    res.status(500).json({ error: 'Error al duplicar acción formativa' })
  }
}


module.exports = {
  getAllAccionesFormativas,
  getAccionFormativaById,
  createAccionFormativa,
  updateAccionFormativa,
  deleteAccionFormativa,
  generateAAFFXML,
  duplicarAccionFormativa
};
