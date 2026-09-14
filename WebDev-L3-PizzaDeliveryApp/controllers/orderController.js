const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('[ERROR] Get Orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
    try {
        const { base, sauce, cheese, veggies, amount } = req.body;

        // Validate required fields
        if (!base || !sauce || !cheese) {
            return res.status(400).json({
                success: false,
                message: 'Base, sauce, and cheese are required'
            });
        }

        // Create order
        const order = await Order.create({
            userId: req.body.userId || 'guest_user',
            base,
            sauce,
            cheese,
            veggies: veggies || [],
            amount: amount || 14.99,
            status: 'Order Received'
        });

        // Update inventory stock (if inventory items exist in DB)
        const itemsToUpdate = [base, sauce, cheese, ...(veggies || [])];
        
        for (const item of itemsToUpdate) {
            const inventoryItem = await Inventory.findOne({ item });
            if (inventoryItem) {
                await inventoryItem.decrementStock(1);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order
        });

    } catch (error) {
        console.error('[ERROR] Create Order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Public
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('[ERROR] Get Order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
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
        console.error('[ERROR] Update Order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order',
            error: error.message
        });
    }
};
