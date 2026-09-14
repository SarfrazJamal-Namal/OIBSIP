const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    item: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Base', 'Sauce', 'Cheese', 'Veggies']
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual property to check if stock is low
inventorySchema.virtual('isLowStock').get(function() {
    return this.stock <= this.lowStockThreshold;
});

// Method to decrement stock
inventorySchema.methods.decrementStock = async function(quantity = 1) {
    this.stock = Math.max(0, this.stock - quantity);
    if (this.stock === 0) {
        this.isAvailable = false;
    }
    return this.save();
};

module.exports = mongoose.model('Inventory', inventorySchema);
