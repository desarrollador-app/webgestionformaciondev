const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllDesgloseAreasProfesionales,
  getDesgloseById,
  createDesglose,
  updateDesglose,
  deleteDesglose
} = require('../controllers/desgloseAreasProfesionalesController');

router.get('/', requireAuth, getAllDesgloseAreasProfesionales);
router.get('/:id', requireAuth, getDesgloseById);
router.post('/', requireAuth, createDesglose);
router.put('/:id', requireAuth, updateDesglose);
router.delete('/:id', requireAuth, deleteDesglose);

module.exports = router;
