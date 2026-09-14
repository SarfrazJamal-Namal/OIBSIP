const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id
// @access  Admin
router.put('/orders/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated',
            data: order
        });
    } catch (error) {
        console.error('[ERROR] Update Order Status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
});

module.exports = router;
