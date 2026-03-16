const { requireAuth } = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();
const {
  getAllPlanes,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} = require('../controllers/planesController');

router.get('/', requireAuth, getAllPlanes);
router.get('/:id', requireAuth, getPlanById);
router.post('/', requireAuth, createPlan);
router.put('/:id', requireAuth, updatePlan);
router.delete('/:id', requireAuth, deletePlan);

module.exports = router;
