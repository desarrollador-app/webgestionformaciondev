const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllDiasImparticionPresencial,
  getDiaImparticionPresencialById,
  createDiaImparticionPresencial,
  updateDiaImparticionPresencial,
  deleteDiaImparticionPresencial
} = require('../controllers/diasImparticionGrupoPresencialController');

router.get('/', requireAuth, getAllDiasImparticionPresencial);
router.post('/', requireAuth, createDiaImparticionPresencial);
router.get('/:id', requireAuth, getDiaImparticionPresencialById);
router.put('/:id', requireAuth, updateDiaImparticionPresencial);
router.delete('/:id', requireAuth, deleteDiaImparticionPresencial);

module.exports = router;
