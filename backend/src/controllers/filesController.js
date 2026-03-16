const azureBlobService = require('../services/azureBlobService');
const prisma = require('../db');

/**
 * Controlador para manejo de archivos en Azure Blob Storage
 * 
 * Este controlador proporciona endpoints para:
 * - Subir archivos al contenedor de Azure Blob Storage
 * - Obtener información de archivos subidos
 * - Eliminar archivos del contenedor
 * - Listar archivos del contenedor
 */

/**
 * Sube un archivo al contenedor de Azure Blob Storage
 * POST /api/files/upload
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No se ha proporcionado ningún archivo' 
      });
    }

    const { buffer, originalname, mimetype } = req.file;
    const { prefix = '', tipo_documento = '', id_persona = null } = req.body;

    // Generar prefijo basado en el tipo de documento y persona
    let filePrefix = prefix;
    if (tipo_documento && id_persona) {
      filePrefix = `${tipo_documento}/persona_${id_persona}/`;
    } else if (tipo_documento) {
      filePrefix = `${tipo_documento}/`;
    }

    // Subir archivo a Azure Blob Storage
    const uploadResult = await azureBlobService.uploadFile(
      buffer,
      originalname,
      mimetype,
      filePrefix
    );

    res.status(201).json({
      message: 'Archivo subido exitosamente',
      file: uploadResult
    });

  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al subir el archivo' 
    });
  }
};


/**
 * Obtiene información de un archivo
 * GET /api/files/:fileName
 */
const getFileInfo = async (req, res) => {
  try {
    const { fileName } = req.params;

    const fileInfo = await azureBlobService.getFileInfo(fileName);

    res.json(fileInfo);

  } catch (error) {
    console.error('Error al obtener información del archivo:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener información del archivo' 
    });
  }
};

/**
 * Elimina un archivo del contenedor
 * DELETE /api/files/:fileName
 */
const deleteFile = async (req, res) => {
  try {
    const { fileName } = req.params;

    const deleted = await azureBlobService.deleteFile(fileName);

    if (deleted) {
      res.json({ 
        message: 'Archivo eliminado exitosamente',
        fileName: fileName
      });
    } else {
      res.status(404).json({ 
        error: 'Archivo no encontrado' 
      });
    }

  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al eliminar el archivo' 
    });
  }
};

/**
 * Lista archivos en el contenedor
 * GET /api/files
 */
const listFiles = async (req, res) => {
  try {
    const { prefix = '' } = req.query;

    const files = await azureBlobService.listFiles(prefix);

    res.json({
      files: files,
      count: files.length
    });

  } catch (error) {
    console.error('Error al listar archivos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al listar archivos' 
    });
  }
};

/**
 * Verifica si un archivo existe
 * HEAD /api/files/:fileName
 */
const checkFileExists = async (req, res) => {
  try {
    const { fileName } = req.params;

    const exists = await azureBlobService.fileExists(fileName);

    if (exists) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }

  } catch (error) {
    console.error('Error al verificar existencia del archivo:', error);
    res.status(500).end();
  }
};

module.exports = {
  uploadFile,
  getFileInfo,
  deleteFile,
  listFiles,
  checkFileExists
};
