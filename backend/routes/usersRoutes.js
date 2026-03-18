const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/isAuthenticated'); // <-- correct path

router.get('/', authMiddleware, usersController.findAll);
router.get('/:id', authMiddleware, usersController.findOne);
router.patch('/:id', authMiddleware, usersController.update);
router.delete('/:id', authMiddleware, usersController.remove);

module.exports = router;
