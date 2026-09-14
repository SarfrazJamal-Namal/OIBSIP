const Inventory = require('../models/Inventory');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Public
exports.getAllInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find();
        
        res.status(200).json({
            success: true,
            count: inventory.length,
            data: inventory
        });
    } catch (error) {
        console.error('[ERROR] Get Inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inventory',
            error: error.message
        });
    }
};

// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private (Admin)
exports.addInventoryItem = async (req, res) => {
    try {
        const { item, category, stock, lowStockThreshold } = req.body;

        // Check if item already exists
        const existingItem = await Inventory.findOne({ item });
        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'Item already exists in inventory'
            });
        }

        const inventoryItem = await Inventory.create({
            item,
            category,
            stock,
            lowStockThreshold: lowStockThreshold || 10
        });

        res.status(201).json({
            success: true,
            message: 'Inventory item added',
            data: inventoryItem
        });
    } catch (error) {
        console.error('[ERROR] Add Inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add inventory item',
            error: error.message
        });
    }
};

// @desc    Update inventory stock
// @route   PATCH /api/inventory/:id
// @access  Private (Admin)
exports.updateInventoryStock = async (req, res) => {
    try {
        const { stock } = req.body;

        const inventoryItem = await Inventory.findByIdAndUpdate(
            req.params.id,
            { 
                stock,
                isAvailable: stock > 0 
            },
            { new: true, runValidators: true }
        );

        if (!inventoryItem) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Stock updated',
            data: inventoryItem
        });
    } catch (error) {
        console.error('[ERROR] Update Inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update stock',
            error: error.message
        });
    }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin)
exports.deleteInventoryItem = async (req, res) => {
    try {
        const inventoryItem = await Inventory.findByIdAndDelete(req.params.id);

        if (!inventoryItem) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Inventory item deleted'
        });
    } catch (error) {
        console.error('[ERROR] Delete Inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete inventory item',
            error: error.message
        });
    }
};
