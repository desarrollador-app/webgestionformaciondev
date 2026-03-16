const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa
} = require('../controllers/empresasController');

router.get('/', requireAuth, getAllEmpresas);
router.get('/:id', requireAuth, getEmpresaById);
router.post('/', requireAuth, createEmpresa);
router.put('/:id', requireAuth, updateEmpresa);
router.delete('/:id', requireAuth, deleteEmpresa);

module.exports = router;
