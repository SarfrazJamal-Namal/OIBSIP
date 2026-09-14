const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    createOrder,
    getOrderById,
    updateOrderStatus
} = require('../controllers/orderController');

// Order routes
router.route('/')
    .get(getAllOrders)
    .post(createOrder);

router.route('/:id')
    .get(getOrderById)
    .patch(updateOrderStatus);

module.exports = router;
