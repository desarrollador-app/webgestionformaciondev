const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllCentrosTrabajo,
  getCentroTrabajoById,
  createCentroTrabajo,
  updateCentroTrabajo,
  deleteCentroTrabajo
} = require('../controllers/centrosTrabajoController');

router.get('/', requireAuth, getAllCentrosTrabajo);
router.get('/:id', requireAuth, getCentroTrabajoById);
router.post('/', requireAuth, createCentroTrabajo);
router.put('/:id', requireAuth, updateCentroTrabajo);
router.delete('/:id', requireAuth, deleteCentroTrabajo);

module.exports = router;
