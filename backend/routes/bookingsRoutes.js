const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');

router.post('/', bookingsController.create);
router.get('/', bookingsController.findAll);
router.get('/:id', bookingsController.findOne);
router.patch('/:id/status', bookingsController.updateStatus);
router.delete('/:id', bookingsController.remove);
router.get('/stats/:userId', bookingsController.getUserStats);

module.exports = router;
