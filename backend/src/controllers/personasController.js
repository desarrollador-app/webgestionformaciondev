const prisma = require('../db');
const xlsx = require('xlsx');
const fs = require('fs');
const personaModel = require('../models/personaModel');
const { NIVEL_ESTUDIOS } = require('../utils/constants');

const normalizarTexto = (texto) => {
  if (!texto) return texto;

  return texto
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "");
};

// Tipos de documento reconocidos
const TIPO_DOCUMENTO = {
  NIF: 'NIF',
  NIE: 'NIE',
  PASAPORTE: 'Pasaporte'
};

/**
 * Detecta el tipo de documento a partir del valor del documento.
 * - NIE: empieza por X, Y o Z
 * - NIF: 8 dígitos + letra
 * - Pasaporte: cualquier otro formato alfanumérico
 */
const detectarTipoDocumento = (documento) => {
  if (!documento) return TIPO_DOCUMENTO.NIF;
  const doc = documento.toString().trim().toUpperCase();
  if (/^[XYZ][0-9]{7}[A-Z]$/.test(doc)) return TIPO_DOCUMENTO.NIE;
  if (/^[0-9]{8}[A-Z]$/.test(doc)) return TIPO_DOCUMENTO.NIF;
  return TIPO_DOCUMENTO.PASAPORTE;
};

/**
 * Filtra los datos de actualización basándose en los campos permitidos
 * @param {Object} data - Datos a filtrar
 * @returns {Object} Datos filtrados
 */
const filterUpdateData = (data) => {
  const updatableFields = personaModel.getUpdatableFields();
  const filteredData = {};

  updatableFields.forEach(field => {
    if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  });

  return filteredData;
};


const getAllPersonas = async (req, res) => {
  try {
    const { es_docente, es_alumno } = req.query;
    
    let whereClause = {};
    if (es_docente !== undefined) {
      whereClause.es_docente = es_docente === 'true';
    }
    if (es_alumno !== undefined) {
      whereClause.es_alumno = es_alumno === 'true';
    }

    const personas = await prisma.personas.findMany({
      where: whereClause
    });
    res.json(personas);
  } catch (error) {
    console.error('Error al obtener personas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const getPersonaById = async (req, res) => {
  try {
    const { id } = req.params;
    const persona = await prisma.personas.findUnique({
      where: { id_persona: parseInt(id) },
      include: {
        alumnosPersonaGrupo: {
          include: {
            grupo: {
              include: {
                accionFormativa: {
                  include: {
                    plan: true
                  }
                }
              }
            },
            centro: {
              include: {
                empresa: true
              }
            }
          }
        },
        docentesPersonaGrupo: {
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
        }
      }
    });

    if (!persona) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    res.json(persona);
  } catch (error) {
    console.error('Error al obtener persona:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const createPersona = async (req, res) => {
  try {
    const validation = personaModel.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.errors 
      });
    }

    const filteredData = filterUpdateData(req.body);

    // Procesar fechas
    if (filteredData.fecha_nacimiento) {
      filteredData.fecha_nacimiento = new Date(filteredData.fecha_nacimiento);
    }

    // Procesar booleanos
    if (filteredData.es_docente !== undefined) {
      filteredData.es_docente = Boolean(filteredData.es_docente);
    }
    if (filteredData.es_alumno !== undefined) {
      filteredData.es_alumno = Boolean(filteredData.es_alumno);
    }
    if (filteredData.discapacidad !== undefined) {
      filteredData.discapacidad = Boolean(filteredData.discapacidad);
    }
    if (filteredData.afectadosTerrorismo !== undefined) {
      filteredData.afectadosTerrorismo = Boolean(filteredData.afectadosTerrorismo);
    }
    if (filteredData.afectadosViolenciaGenero !== undefined) {
      filteredData.afectadosViolenciaGenero = Boolean(filteredData.afectadosViolenciaGenero);
    }

    // Procesar nivel_estudios
    if (filteredData.nivel_estudios) {
      filteredData.nivel_estudios = parseInt(filteredData.nivel_estudios);
    }

    const persona = await prisma.personas.create({
      data: filteredData
    });

    res.status(201).json(persona);
  } catch (error) {
    console.error('Error al crear persona:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe una persona con este documento' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const updatePersona = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar datos
    const validation = personaModel.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validation.errors 
      });
    }

    const filteredData = filterUpdateData(req.body);

    // Procesar fechas
    if (filteredData.fecha_nacimiento) {
      filteredData.fecha_nacimiento = new Date(filteredData.fecha_nacimiento);
    }

    // Procesar nivel_estudios
    if (filteredData.nivel_estudios) {
      filteredData.nivel_estudios = parseInt(filteredData.nivel_estudios);
    }

    const persona = await prisma.personas.update({
      where: { id_persona: parseInt(id) },
      data: filteredData
    });

    res.json(persona);
  } catch (error) {
    console.error('Error al actualizar persona:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe una persona con este documento' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const deletePersona = async (req, res) => {
  try {
    const { id } = req.params;


    const [alumnos, docentes] = await Promise.all([
      prisma.alumnosPersonaGrupo.findMany({
        where: { id_persona: parseInt(id) }
      }),
      prisma.docentesPersonaGrupo.findMany({
        where: { id_persona: parseInt(id) }
      })
    ]);

    if (alumnos.length > 0 || docentes.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la persona porque tiene registros como alumno o docente' 
      });
    }

    await prisma.personas.delete({
      where: { id_persona: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar persona:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



const importarPersonasXLS = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo Excel' });
    }

    const filePath = req.file.path;
    const personas = [];
    const errores = [];
    let filaActual = 0;

    // Función para mapear campos del Excel al modelo de Personas
    const mapearPersona = (row) => {
      // Función para convertir número de Excel a fecha
      const excelDateToJSDate = (excelDate) => {
        if (!excelDate || isNaN(excelDate)) return null;
        // Excel cuenta días desde 1900-01-01, pero hay un bug de 1900 que es año bisiesto
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        return isNaN(date.getTime()) ? null : date;
      };

      // Función para validar nivel de estudios
      const validarNivelEstudios = (estudios) => {
        if (!estudios) return NIVEL_ESTUDIOS.SIN_ESTUDIOS; // 0
        
        const nivel = parseInt(estudios);
        // Verificar si el nivel está en la enumeración válida
        const nivelesValidos = Object.values(NIVEL_ESTUDIOS);
        return nivelesValidos.includes(nivel) ? nivel : NIVEL_ESTUDIOS.SIN_ESTUDIOS; // 0
      };

      const documento = row.nif?.toString().trim().toUpperCase();

      return {
        tipoDocumento: detectarTipoDocumento(documento),
        documento: documento,
        nombre: row.nombre?.toString().trim(),
        apellido1: row.apellido1?.toString().trim(),
        apellido2: row.apellido2?.toString().trim() || null,
        telefono: row['telefono movil']?.toString().trim() || row['telefono fijo']?.toString().trim() || null,
        correoElectronico: row.correo_electronico?.toString().trim() || null,
        NSS: row.nss?.toString().trim() || null,
        es_docente: false,
        es_alumno: false,
        fecha_nacimiento: excelDateToJSDate(row.nacimiento),
        sexo: row.sexo?.toString().trim() || null,
        domicilio: [
          row.dirección?.toString().trim(),
          row.localidad?.toString().trim(),
          row['codigo postal']?.toString().trim()
        ].filter(Boolean).join(', ') || null,
        discapacidad: row.discapacidad === 1 || row.discapacidad === '1' || row.discapacidad?.toString().toLowerCase() === 'si' || row.discapacidad?.toString().toLowerCase() === 'sí',
        nivel_estudios: validarNivelEstudios(row.estudios),
        comentarios: `Importado desde Excel`
      };
    };

    // Función para validar una persona
    const validarPersona = (persona, fila) => {
      const errores = [];
      
      if (!persona.documento) {
        errores.push('Documento es obligatorio');
        return errores;
      }

      const doc = persona.documento.toUpperCase();

      if (persona.tipoDocumento === TIPO_DOCUMENTO.NIF) {
        const regex = /^[0-9]{8}[A-Z]$/;
        if (!regex.test(doc)) {
          errores.push('NIF no válido (debe ser exactamente 8 dígitos seguidos de una letra, ej: 12345678A)');
        }
      } else if (persona.tipoDocumento === TIPO_DOCUMENTO.NIE) {
        const regex = /^[XYZ][0-9]{7}[A-Z]$/;
        if (!regex.test(doc)) {
          errores.push('NIE no válido (debe ser X/Y/Z + exactamente 7 dígitos + letra, ej: X1234567A)');
        }
      } else if (persona.tipoDocumento === TIPO_DOCUMENTO.PASAPORTE) {
        // Rechazar documentos que parecen NIF/NIE mal formados antes de aceptarlos como pasaporte:
        // - Solo dígitos (con o sin letra final)  → NIF con número de dígitos incorrecto
        // - Empieza por X/Y/Z seguido de dígitos  → NIE mal formado
        // - 9 caracteres alfanuméricos acabados en letra (ej: A4839201T) → NIF con letra inicial errónea
        const pareceNIF = /^[0-9]+[A-Z]?$/.test(doc);
        const pareceNIE = /^[XYZ][0-9]+[A-Z]?$/.test(doc);
        const parece9CaracteresConLetra = /^[A-Z0-9]{8}[A-Z]$/.test(doc);

        if (pareceNIF || pareceNIE || parece9CaracteresConLetra) {
          errores.push(
            `El documento "${doc}" parece un NIF o NIE con formato incorrecto. ` +
            `Formato esperado — NIF: 8 dígitos + letra (ej: 12345678A); NIE: X/Y/Z + 7 dígitos + letra (ej: X1234567A)`
          );
        } else {
          // Pasaporte real: alfanumérico, entre 6 y 15 caracteres
          const regexPasaporte = /^[A-Z0-9]{6,15}$/;
          if (!regexPasaporte.test(doc)) {
            errores.push('Pasaporte no válido (debe ser alfanumérico, entre 6 y 15 caracteres)');
          }
        }
      }
      
      return errores;
    };

    // Procesar el archivo Excel
    try {
      const workbook = xlsx.readFile(filePath, {
        raw: true,
        cellDates: true
      });
      const sheetName = workbook.SheetNames[0]; // Tomar la primera hoja
      const worksheet = workbook.Sheets[sheetName];
      // convertir excel a json
      const jsonData = xlsx.utils.sheet_to_json(worksheet);

      // normalizar headers
      const jsonNormalizado = jsonData.map(row => {
        const nuevaFila = {};

        Object.keys(row).forEach(key => {
          const keyNormalizada = normalizarTexto(key);
          nuevaFila[keyNormalizada] = row[key];
        });

        return nuevaFila;
      });

      // Procesar cada fila del Excel
      jsonNormalizado.forEach((row, index) => {
        filaActual = index + 1; // +1 porque las filas empiezan en 1
        
        try {
          const persona = mapearPersona(row);
          const erroresValidacion = validarPersona(persona, filaActual);
          
          if (erroresValidacion.length > 0) {
            errores.push({
              fila: filaActual,
              errores: erroresValidacion,
              datos: row
            });
          } else {
            personas.push(persona);
          }
        } catch (error) {
          errores.push({
            fila: filaActual,
            errores: [`Error al procesar fila: ${error.message}`],
            datos: row
          });
        }
      });

    } catch (error) {
      // Limpiar archivo temporal
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        error: 'Error al leer el archivo Excel', 
        detalles: error.message 
      });
    }

    // Si hay errores de validación, devolverlos sin procesar
    if (errores.length > 0) {
      // Limpiar archivo temporal
      fs.unlinkSync(filePath);
      
      return res.status(400).json({
        error: 'Errores de validación encontrados',
        errores,
        totalErrores: errores.length,
        totalFilas: filaActual
      });
    }

    // Insertar personas en la base de datos
    const personasCreadas = [];
    const personasDuplicadas = [];
    
    for (const persona of personas) {
      try {
        // Verificar si ya existe una persona con el mismo documento
        const personaExistente = await prisma.personas.findUnique({
          where: { documento: persona.documento }
        });

        if (personaExistente) {
          personasDuplicadas.push({
            documento: persona.documento,
            nombre: persona.nombre,
            apellido1: persona.apellido1
          });
        } else {
          const personaCreada = await prisma.personas.create({
            data: persona
          });
          personasCreadas.push(personaCreada);
        }
      } catch (error) {
        errores.push({
          documento: persona.documento,
          errores: [`Error al insertar en BD: ${error.message}`]
        });
      }
    }

    // Limpiar archivo temporal
    fs.unlinkSync(filePath);

    res.json({
      mensaje: 'Importación completada',
      estadisticas: {
        totalFilas: filaActual,
        personasCreadas: personasCreadas.length,
        personasDuplicadas: personasDuplicadas.length,
        errores: errores.length
      },
      personasCreadas,
      personasDuplicadas,
      errores: errores.length > 0 ? errores : undefined
    });

  } catch (error) {
    console.error('Error al importar Excel:', error);
    
    // Limpiar archivo temporal si existe
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error al limpiar archivo temporal:', cleanupError);
      }
    }
    
    res.status(500).json({ error: 'Error interno del servidor durante la importación' });
  }
};

module.exports = {
  getAllPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
  importarPersonasXLS
};