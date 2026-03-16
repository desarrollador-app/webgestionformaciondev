const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

//router.get('/login', authController.getAuthUrl);
//router.get('/callback', authController.handleCallback);
//router.get('/logout', authController.logout);
//router.get('/check', authController.checkAuth);

router.get("/login", authController.login);
router.get("/callback", authController.callback);

module.exports = router;
