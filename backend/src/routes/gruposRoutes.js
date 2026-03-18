const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllGrupos,
  getGrupoById,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  getNextGroupCodeEndpoint,
  generateFundaeInicioGrupoXML,
  generateFundaeFinGrupoXML,
  downloadRecibiMaterial,
  downloadRecibiDiploma,
  downloadControlAsistencia,
  downloadDiplomasIndividual,
  downloadDiplomasMasivo
} = require('../controllers/gruposController');

router.get('/', requireAuth, getAllGrupos);
router.get('/next-code/:id_accion', requireAuth, getNextGroupCodeEndpoint);
router.get('/:id', requireAuth, getGrupoById);
router.get('/:id/fundae-inicio-xml', requireAuth, generateFundaeInicioGrupoXML);
router.get('/:id/fundae-fin-xml', requireAuth, generateFundaeFinGrupoXML);
router.get('/:id/recibi-material', requireAuth, downloadRecibiMaterial);
router.get('/:id/recibi-diploma', requireAuth, downloadRecibiDiploma);
router.get('/:id/control-asistencia', requireAuth, downloadControlAsistencia);
router.post('/', requireAuth, createGrupo);
router.put('/:id', requireAuth, updateGrupo);
router.delete('/:id', requireAuth, deleteGrupo);
router.get('/:id/alumnos/:id_alumno/diploma',requireAuth,downloadDiplomasIndividual);
router.get('/:id/diplomas/masivo',requireAuth,downloadDiplomasMasivo);

module.exports = router;
