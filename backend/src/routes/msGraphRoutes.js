const express = require('express');
const router = express.Router();
const { getGroupUsers, getGroupUsersDetailed } = require('../controllers/msGraphController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/group-users', requireAuth, getGroupUsers);
router.get('/group-users-detailed', requireAuth, getGroupUsersDetailed);
module.exports = router;
