const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const {
  getAllPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
  importarPersonasXLS
} = require('../controllers/personasController');

// Configuración de multer para archivos Excel
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Crear la carpeta uploads/ si no existe (ruta relativa al CWD del proceso)
    const uploadDir = path.resolve('uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xls' && ext !== '.xlsx') {
      return cb(new Error('Solo se permiten archivos Excel (.xls, .xlsx)'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

router.get('/', requireAuth, getAllPersonas);
// IMPORTANTE: /importar-excel debe ir ANTES de /:id
// o Express interpreta "importar-excel" como un parámetro de ID
router.post('/importar-excel', requireAuth, upload.single('excelFile'), importarPersonasXLS);
router.get('/:id', requireAuth, getPersonaById);
router.post('/', requireAuth, createPersona);
router.put('/:id', requireAuth, updatePersona);
router.delete('/:id', requireAuth, deletePersona);

module.exports = router;