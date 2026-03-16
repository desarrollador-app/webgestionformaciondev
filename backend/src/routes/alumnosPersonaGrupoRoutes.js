const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllAlumnosPersonaGrupo,
  getAlumnoPersonaGrupoById,
  createAlumnoPersonaGrupo,
  updateAlumnoPersonaGrupo,
  deleteAlumnoPersonaGrupo
} = require('../controllers/alumnosPersonaGrupoController');

router.get('/', requireAuth, getAllAlumnosPersonaGrupo);
router.get('/:id', requireAuth, getAlumnoPersonaGrupoById);
router.post('/', requireAuth, createAlumnoPersonaGrupo);
router.put('/:id', requireAuth, updateAlumnoPersonaGrupo);
router.delete('/:id', requireAuth, deleteAlumnoPersonaGrupo);

module.exports = router;
