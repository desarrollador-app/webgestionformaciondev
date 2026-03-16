const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  getAllDocumentacionAdjAlumnoPersona,
  getDocumentoById,
  createDocumento,
  updateDocumento,
  deleteDocumento,
  getSignedUrl
} = require('../controllers/documentacionAdjAlumnoPersonaController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  }
});

router.get('/', requireAuth, getAllDocumentacionAdjAlumnoPersona);
router.get('/:id', requireAuth, getDocumentoById);
router.get('/:id/signed-url', requireAuth, getSignedUrl);
router.post('/', requireAuth, upload.single('archivo'), createDocumento);
router.put('/:id', requireAuth, updateDocumento);
router.delete('/:id', requireAuth, deleteDocumento);

module.exports = router;
