const express = require('express');
const { 
  adminLogin, 
  userLogin,
  selectWorkspace,
  logout
} = require('../Controllers/authController');

const router = express.Router();

router.post('/admin/login', adminLogin);
router.post('/user/login', userLogin);
router.post('/user/select-workspace', selectWorkspace);
router.post('/logout', logout);


module.exports = router;