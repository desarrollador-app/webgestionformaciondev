const prisma = require('../db');
const azureBlobService = require('../services/azureBlobService');
const multer = require('multer');
const path = require('path');


const getAllDocumentacionAdjGrupo = async (req, res) => {
  try {
    const { id_grupo, tipo_documento } = req.query;
    
    let whereClause = {};
    if (id_grupo) whereClause.id_grupo = parseInt(id_grupo);
    if (tipo_documento) whereClause.tipo_documento = tipo_documento;

    const documentacion = await prisma.documentacionAdjGrupo.findMany({
      where: whereClause,
      include: {
        grupo: true
      },
      orderBy: {
        fecha_subida: 'desc'
      }
    });
    res.json(documentacion);
  } catch (error) {
    console.error('Error al obtener documentación de grupos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const getDocumentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const documento = await prisma.documentacionAdjGrupo.findUnique({
      where: { id_documento: parseInt(id) },
      include: {
        grupo: true
      }
    });

    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.json(documento);
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const createDocumento = async (req, res) => {
  try {
    const {
      id_grupo,
      tipo_documento,
      observaciones
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const grupo = await prisma.grupos.findUnique({
      where: { id_grupo: parseInt(id_grupo) }
    });

    if (!grupo) {
      return res.status(400).json({ error: 'El grupo especificado no existe' });
    }

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    
    const contentType = 'application/pdf';
    
    const prefix = `grupos/${id_grupo}/`;

    const uploadResult = await azureBlobService.uploadFile(
      fileBuffer,
      originalName,
      contentType,
      prefix
    );

    const documento = await prisma.documentacionAdjGrupo.create({
      data: {
        id_grupo: parseInt(id_grupo),
        tipo_documento,
        nombre_archivo: originalName,
        nombre_archivo_blob: uploadResult.fileName,
        url_blob: uploadResult.url,
        observaciones: observaciones || null
      },
      include: {
        grupo: true
      }
    });

    res.status(201).json(documento);
  } catch (error) {
    console.error('Error al crear documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const updateDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_documento, nombre_archivo, url_blob } = req.body;

    const documento = await prisma.documentacionAdjGrupo.update({
      where: { id_documento: parseInt(id) },
      data: {
        tipo_documento,
        nombre_archivo,
        url_blob
      },
      include: {
        grupo: true
      }
    });

    res.json(documento);
  } catch (error) {
    console.error('Error al actualizar documento:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const deleteDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await prisma.documentacionAdjGrupo.findUnique({
      where: { id_documento: parseInt(id) }
    });

    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    if (documento.nombre_archivo_blob) {
      try {
        await azureBlobService.deleteFile(documento.nombre_archivo_blob);
      } catch (azureError) {
        console.error('Error al eliminar archivo de Azure:', azureError);
      }
    }
    await prisma.documentacionAdjGrupo.delete({
      where: { id_documento: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getSignedUrl = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await prisma.documentacionAdjGrupo.findUnique({
      where: { id_documento: parseInt(id) }
    });

    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    if (!documento.nombre_archivo_blob) {
      return res.status(404).json({ error: 'Archivo no disponible' });
    }

    const signedUrl = azureBlobService.generateSignedUrl(documento.nombre_archivo_blob, 60);

    res.json({ 
      signedUrl: signedUrl,
      fileName: documento.nombre_archivo,
      expiresIn: 60
    });
  } catch (error) {
    console.error('Error al generar URL firmada:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllDocumentacionAdjGrupo,
  getDocumentoById,
  createDocumento,
  updateDocumento,
  deleteDocumento,
  getSignedUrl
};
