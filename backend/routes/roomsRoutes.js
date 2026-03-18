const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/roomsController');

router.post('/', roomsController.create);
router.get('/', roomsController.findAll);
router.get('/:id', roomsController.findOne);
router.patch('/:id', roomsController.update);
router.delete('/:id', roomsController.remove);

module.exports = router;
