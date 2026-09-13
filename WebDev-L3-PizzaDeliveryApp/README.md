# Web Development — Level 3 Task 1: Pizza Delivery Full-Stack Application

## Project Overview
A robust full-stack pizza ordering platform featuring a dynamic multi-step custom pizza builder on the frontend connected to an Express backend API with dynamic stock management.

## Tech Stack & Architecture
- **Frontend:** React.js (Vite)
- **Backend:** Node.js, Express.js (CommonJS, Node v24 compatible)
- **State & Data Management:** RESTful JSON API Communication

## Feature Checklist Compliance
- [x] Multi-step custom pizza selection flow (Base, Sauce, Cheese, Veggies)
- [x] Backend Express API listening on local environment (`http://127.0.0.1:5000`)
- [x] Dynamic inventory state updates upon order dispatch
- [x] Order tracking confirmation state with unique generated Order ID

## Project Structure
```
WebDev-L3-PizzaDeliveryApp/
├── server.js                 # Express backend server
├── package.json              # Backend dependencies
├── client/                   # React frontend
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   ├── PizzaBuilder.jsx # Pizza customization component
│   │   └── main.jsx         # React entry point
│   └── package.json         # Frontend dependencies
└── README.md                # Project documentation
```

## Installation & Setup

### Backend Setup
```bash
cd C:\Users\DELL\Desktop\OIBSIP\WebDev-L3-PizzaDeliveryApp
npm install
node server.js
```
Backend will run on: `http://127.0.0.1:5000`

### Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend will run on: `http://localhost:5173`

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status

### Get Inventory
- **GET** `/api/inventory`
- Returns available ingredients with stock levels

### Place Order
- **POST** `/api/orders`
- Body: `{ base, sauce, cheese, veggies, amount }`
- Returns order confirmation with unique ID

### Get Orders
- **GET** `/api/orders`
- Returns all placed orders

## Features

### Multi-Step Pizza Builder
1. **Step 1**: Select Base (Thin Crust, Cheese Burst, Pan Crust, Wheat Base)
2. **Step 2**: Select Sauce (Marinara, BBQ, Garlic Ranch, Spicy Schezwan)
3. **Step 3**: Select Cheese (Mozzarella, Cheddar, Parmesan, Gouda)
4. **Step 4**: Select Vegetables (Jalapenos, Mushrooms, Onions, Olives, Capsicum)

### Order Management
- Real-time order placement
- Unique order ID generation
- Order status tracking
- Dynamic inventory updates

## Technologies Used
- **React 19** - Frontend framework
- **Vite 8** - Build tool
- **Express.js** - Backend framework
- **Node.js v24** - Runtime environment
- **CORS** - Cross-origin resource sharing
- **Fetch API** - HTTP client

## Author
**Sarfraz Jamal**  
Web Development & Designing Intern  
Oasis Infobyte

## License
This project is part of the Oasis Infobyte internship program.
