const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllSesiones,
  getSesionById,
  createSesion,
  updateSesion,
  deleteSesion,
  getHorasTotalesGrupo
} = require('../controllers/sesionesController');

router.get('/', requireAuth, getAllSesiones);
router.get('/horas-totales', requireAuth, getHorasTotalesGrupo);
router.post('/', requireAuth, createSesion);
router.get('/:id', requireAuth, getSesionById);
router.put('/:id', requireAuth, updateSesion);
router.delete('/:id', requireAuth, deleteSesion);

module.exports = router;
