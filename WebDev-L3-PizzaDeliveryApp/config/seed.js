const mongoose = require('mongoose');
require('dotenv').config();
const Inventory = require('../models/Inventory');

const inventoryData = [
    // Bases
    { item: 'Thin Crust', category: 'Base', stock: 50, lowStockThreshold: 10 },
    { item: 'Cheese Burst', category: 'Base', stock: 30, lowStockThreshold: 10 },
    { item: 'Pan Crust', category: 'Base', stock: 40, lowStockThreshold: 10 },
    { item: 'Wheat Base', category: 'Base', stock: 25, lowStockThreshold: 10 },
    
    // Sauces
    { item: 'Marinara', category: 'Sauce', stock: 60, lowStockThreshold: 15 },
    { item: 'BBQ', category: 'Sauce', stock: 45, lowStockThreshold: 15 },
    { item: 'Garlic Ranch', category: 'Sauce', stock: 35, lowStockThreshold: 15 },
    { item: 'Spicy Schezwan', category: 'Sauce', stock: 30, lowStockThreshold: 15 },
    
    // Cheese
    { item: 'Mozzarella', category: 'Cheese', stock: 70, lowStockThreshold: 20 },
    { item: 'Cheddar', category: 'Cheese', stock: 50, lowStockThreshold: 15 },
    { item: 'Parmesan', category: 'Cheese', stock: 40, lowStockThreshold: 15 },
    { item: 'Gouda', category: 'Cheese', stock: 35, lowStockThreshold: 10 },
    
    // Veggies
    { item: 'Jalapenos', category: 'Veggies', stock: 45, lowStockThreshold: 10 },
    { item: 'Mushrooms', category: 'Veggies', stock: 40, lowStockThreshold: 10 },
    { item: 'Onions', category: 'Veggies', stock: 55, lowStockThreshold: 15 },
    { item: 'Olives', category: 'Veggies', stock: 35, lowStockThreshold: 10 },
    { item: 'Capsicum', category: 'Veggies', stock: 50, lowStockThreshold: 15 }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 75000,
            family: 4
        });

        console.log('[SUCCESS] Connected to MongoDB');

        // Clear existing inventory
        await Inventory.deleteMany({});
        console.log('[INFO] Cleared existing inventory data');

        // Insert new inventory data
        const inserted = await Inventory.insertMany(inventoryData);
        console.log(`[SUCCESS] Inserted ${inserted.length} inventory items`);

        console.log('\n📦 Inventory seeded successfully!');
        console.log('='.repeat(50));
        
        process.exit(0);
    } catch (error) {
        console.error('[ERROR] Seed failed:', error);
        process.exit(1);
    }
};

// Run seed
seedDatabase();
