const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const multer = require('multer');
const { 
  uploadFile, 
  getFileInfo, 
  deleteFile, 
  listFiles, 
  checkFileExists 
} = require('../controllers/filesController');

const router = express.Router();

/**
 * Configuración de multer para manejo de archivos
 * - Almacena archivos en memoria como Buffer
 * - Limita el tamaño máximo a 50MB
 * - Filtra tipos de archivo permitidos
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1 // Solo un archivo por request
  },
  fileFilter: fileFilter
});

/**
 * Middleware para manejo de errores de multer
 */
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'El archivo es demasiado grande. Tamaño máximo: 50MB' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Solo se permite un archivo por request' 
      });
    }
  }
  
  if (error.message === 'Tipo de archivo no permitido') {
    return res.status(400).json({ 
      error: 'Tipo de archivo no permitido. Tipos permitidos: PDF, imágenes, documentos de Office, texto plano, ZIP' 
    });
  }
  
  next(error);
};

// Aplicar middleware de manejo de errores de multer
router.use(handleMulterError);

/**
 * @route POST /api/files/upload
 * @desc Sube un archivo al contenedor de Azure Blob Storage
 * @access Private
 * @body {file} file - Archivo a subir
 * @body {string} prefix - Prefijo opcional para organizar archivos
 * @body {string} tipo_documento - Tipo de documento (opcional)
 * @body {number} id_persona - ID de la persona (opcional)
 */
router.post('/upload', requireAuth, upload.single('file'), uploadFile);


/**
 * @route GET /api/files
 * @desc Lista archivos en el contenedor
 * @access Private
 * @query {string} prefix - Prefijo para filtrar archivos (opcional)
 */
router.get('/', requireAuth, listFiles);

/**
 * @route GET /api/files/:fileName
 * @desc Obtiene información de un archivo específico
 * @access Private
 * @param {string} fileName - Nombre del archivo en el contenedor
 */
router.get('/:fileName', requireAuth, getFileInfo);

/**
 * @route HEAD /api/files/:fileName
 * @desc Verifica si un archivo existe
 * @access Private
 * @param {string} fileName - Nombre del archivo en el contenedor
 */
router.head('/:fileName', requireAuth, checkFileExists);

/**
 * @route DELETE /api/files/:fileName
 * @desc Elimina un archivo del contenedor
 * @access Private
 * @param {string} fileName - Nombre del archivo a eliminar
 */
router.delete('/:fileName', requireAuth, deleteFile);

module.exports = router;
