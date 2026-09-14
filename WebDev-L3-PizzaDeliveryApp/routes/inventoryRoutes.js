const express = require('express');
const router = express.Router();
const {
    getAllInventory,
    addInventoryItem,
    updateInventoryStock,
    deleteInventoryItem
} = require('../controllers/inventoryController');

// Inventory routes
router.route('/')
    .get(getAllInventory)
    .post(addInventoryItem);

router.route('/:id')
    .patch(updateInventoryStock)
    .delete(deleteInventoryItem);

module.exports = router;
