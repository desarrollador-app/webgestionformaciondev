const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllTareas,
  getTareaById,
  createTarea,
  updateTarea,
  completeTarea,
  deleteTarea,
  createDefaultGrupoTareas
} = require('../controllers/tareasController');

router.get('/', requireAuth, getAllTareas);
router.post('/', requireAuth, createTarea);
router.post('/default', requireAuth, createDefaultGrupoTareas);
router.get('/:id', requireAuth, getTareaById);
router.put('/:id', requireAuth, updateTarea);
router.patch('/:id/complete', requireAuth, completeTarea);
router.delete('/:id', requireAuth, deleteTarea);

module.exports = router;
