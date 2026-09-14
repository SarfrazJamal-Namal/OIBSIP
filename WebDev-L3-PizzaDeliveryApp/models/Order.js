const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        default: 'guest_user'
    },
    base: {
        type: String,
        required: true,
        enum: ['Thin Crust', 'Cheese Burst', 'Pan Crust', 'Wheat Base']
    },
    sauce: {
        type: String,
        required: true,
        enum: ['Marinara', 'BBQ', 'Garlic Ranch', 'Spicy Schezwan']
    },
    cheese: {
        type: String,
        required: true,
        enum: ['Mozzarella', 'Cheddar', 'Parmesan', 'Gouda']
    },
    veggies: {
        type: [String],
        default: []
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'],
        default: 'Order Received'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Completed'
    },
    paymentMethod: {
        type: String,
        enum: ['Razorpay', 'Cash on Delivery'],
        default: 'Razorpay'
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Order', orderSchema);
