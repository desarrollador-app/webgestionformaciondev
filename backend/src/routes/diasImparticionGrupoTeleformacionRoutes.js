const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllDiasImparticionTeleformacion,
  getDiaImparticionTeleformacionById,
  createDiaImparticionTeleformacion,
  updateDiaImparticionTeleformacion,
  deleteDiaImparticionTeleformacion
} = require('../controllers/diasImparticionGrupoTeleformacionController');

router.get('/', requireAuth, getAllDiasImparticionTeleformacion);
router.post('/', requireAuth, createDiaImparticionTeleformacion);
router.get('/:id', requireAuth, getDiaImparticionTeleformacionById);
router.put('/:id', requireAuth, updateDiaImparticionTeleformacion);
router.delete('/:id', requireAuth, deleteDiaImparticionTeleformacion);

module.exports = router;
