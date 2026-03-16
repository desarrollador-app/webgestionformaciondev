const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllAreasProfesionales,
  getAreasProfesionalesConDesgloses,
  getAreaProfesionalById,
  createAreaProfesional,
  updateAreaProfesional,
  deleteAreaProfesional
} = require('../controllers/areaProfesionalController');

router.get('/', requireAuth, getAllAreasProfesionales);
router.get('/con-desgloses', requireAuth, getAreasProfesionalesConDesgloses);
router.get('/:id', requireAuth, getAreaProfesionalById);
router.post('/', requireAuth, createAreaProfesional);
router.put('/:id', requireAuth, updateAreaProfesional);
router.delete('/:id', requireAuth, deleteAreaProfesional);

module.exports = router;
