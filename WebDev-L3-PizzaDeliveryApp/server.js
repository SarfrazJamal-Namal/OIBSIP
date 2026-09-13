const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Mock Data Store for Local Testing
let mockInventory = [
    { id: '1', item: 'Thin Crust', category: 'Base', stock: 50 },
    { id: '2', item: 'Cheese Burst', category: 'Base', stock: 15 },
    { id: '3', item: 'Marinara', category: 'Sauce', stock: 40 },
    { id: '4', item: 'Mozzarella', category: 'Cheese', stock: 35 },
    { id: '5', item: 'Jalapenos', category: 'Veggies', stock: 25 }
];

let mockOrders = [];

// Health-check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Pizza Delivery API is active', timestamp: new Date() });
});

// Fetch Inventory endpoint
app.get('/api/inventory', (req, res) => {
    res.json(mockInventory);
});

// Place Order endpoint
app.post('/api/orders', (req, res) => {
    const { base, sauce, cheese, veggies, amount } = req.body;
    
    const newOrder = {
        id: Date.now().toString(),
        userId: 'guest_user',
        base: base || 'Thin Crust',
        sauce: sauce || 'Marinara',
        cheese: cheese || 'Mozzarella',
        veggies: veggies || [],
        amount: amount || 12.99,
        status: 'Order Received',
        createdAt: new Date()
    };

    mockOrders.push(newOrder);

    // Auto-decrement inventory stock
    mockInventory = mockInventory.map(item => {
        if ([base, sauce, cheese].includes(item.item) || (veggies && veggies.includes(item.item))) {
            return { ...item, stock: Math.max(0, item.stock - 1) };
        }
        return item;
    });

    res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        order: newOrder
    });
});

// Fetch Orders endpoint
app.get('/api/orders', (req, res) => {
    res.json(mockOrders);
});

// Start Server on 127.0.0.1 for explicit Node v24 binding
const PORT = 5000;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`[SUCCESS] Backend Server running on http://127.0.0.1:${PORT}`);
});
