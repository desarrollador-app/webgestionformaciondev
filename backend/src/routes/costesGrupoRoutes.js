const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllCostesGrupo,
  getCosteGrupoById,
  createCosteGrupo,
  updateCosteGrupo,
  deleteCosteGrupo,
  getCostesByGrupo
} = require('../controllers/costesGrupoController');

router.get('/', requireAuth, getAllCostesGrupo);
router.get('/:id', requireAuth, getCosteGrupoById);
router.get('/grupo/:id_grupo', requireAuth, getCostesByGrupo);
router.post('/', requireAuth, createCosteGrupo);
router.put('/:id', requireAuth, updateCosteGrupo);
router.delete('/:id', requireAuth, deleteCosteGrupo);

module.exports = router;
