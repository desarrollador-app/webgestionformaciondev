const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllDocentesPersonaGrupo,
  getDocentePersonaGrupoById,
  createDocentePersonaGrupo,
  updateDocentePersonaGrupo,
  deleteDocentePersonaGrupo,
  getDocentesConHoras,
  getDocentesGrupoConHoras
} = require('../controllers/docentesPersonaGrupoController');

router.get('/', requireAuth, getAllDocentesPersonaGrupo);
router.get('/horas', requireAuth, getDocentesConHoras);
router.get('/grupo/:id_grupo/horas', requireAuth, getDocentesGrupoConHoras);
router.get('/:id', requireAuth, getDocentePersonaGrupoById);
router.post('/', requireAuth, createDocentePersonaGrupo);
router.put('/:id', requireAuth, updateDocentePersonaGrupo);
router.delete('/:id', requireAuth, deleteDocentePersonaGrupo);

module.exports = router;
