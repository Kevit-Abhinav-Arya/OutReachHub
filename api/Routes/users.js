const express = require('express');
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignUserToWorkspace,
  removeUserFromWorkspace
} = require('../Controllers/userController');

const router = express.Router();

router.use(verifyToken, requireAdmin);

// User CRUD operations
router.post('/', createUser);                   
router.get('/', getAllUsers);                   
router.get('/:userId', getUserById);            
router.put('/:userId', updateUser);              
router.delete('/:userId', deleteUser);          

router.post('/:userId/workspaces/:workspaceId', assignUserToWorkspace);  
router.delete('/:userId/workspaces/:workspaceId', removeUserFromWorkspace); 

module.exports = router;
