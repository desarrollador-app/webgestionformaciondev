const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllAccionesFormativas,
  getAccionFormativaById,
  createAccionFormativa,
  updateAccionFormativa,
  deleteAccionFormativa,
  duplicarAccionFormativa, 
  generateAAFFXML
} = require('../controllers/accionesFormativasController');

router.get('/', requireAuth, getAllAccionesFormativas);
router.get('/:id', requireAuth, getAccionFormativaById);
router.get('/:id/aaff-xml', requireAuth, generateAAFFXML);
router.post('/', requireAuth, createAccionFormativa);
router.put('/:id', requireAuth, updateAccionFormativa);
router.delete('/:id', requireAuth, deleteAccionFormativa);
router.post('/:id/duplicar', requireAuth, duplicarAccionFormativa)

module.exports = router;
