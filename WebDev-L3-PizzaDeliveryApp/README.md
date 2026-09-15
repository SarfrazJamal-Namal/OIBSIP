# 🍕 Pizza Delivery Full-Stack Application

**OASIS INFOBYTE - Web Development Internship**  
**Level 3 - Task 1**

A professional MERN stack pizza delivery platform featuring real-time order management, email verification, payment integration, and admin dashboard.

---

## 🚀 Features

### **User Features:**
- ✅ **Secure registration with pre-verification** - No database writes until email is verified
- ✅ **6-digit OTP email verification** with in-memory storage
- ✅ Secure JWT-based authentication with bcrypt password hashing
- ✅ Interactive 4-step pizza customization
- ✅ Real-time inventory availability check
- ✅ Razorpay payment integration (test mode)
- ✅ Order confirmation with tracking

### **Admin Features:**
- ✅ Real-time order management dashboard
- ✅ Live order status updates (Order Received → In Kitchen → Sent to Delivery → Delivered)
- ✅ Inventory tracking with low-stock alerts
- ✅ Auto-refresh every 10 seconds
- ✅ Full user + admin capabilities

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Vanilla CSS (inline styles)

**Backend:**
- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- NodeMailer (Gmail SMTP)

**Database:**
- MongoDB Atlas (Cloud)
- Models: User, Order, Inventory

---

## 📋 Prerequisites

Before setup, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB Atlas Account** - [Sign up](https://cloud.mongodb.com/)
- **Gmail Account** with App Password - [Generate](https://myaccount.google.com/apppasswords)

---

## ⚙️ Setup Instructions

### **1. Clone the Repository**

```bash
git clone https://github.com/SarfrazJamal-Namal/OIBSIP.git
cd OIBSIP/WebDev-L3-PizzaDeliveryApp
```

---

### **2. Backend Setup**

#### **Install Dependencies:**
```bash
npm install
```

#### **Create Environment File:**

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` with your credentials:

```env
PORT=5001

# MongoDB Atlas Connection String
MONGO_URI=mongodb://username:password@cluster.mongodb.net:27017/pizza_delivery?ssl=true&replicaSet=replica-set&authSource=admin

# JWT Secret (generate random string)
JWT_SECRET=your_secret_key_here

# Gmail SMTP for Email Verification
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password

# Frontend URL
APP_URL=http://localhost:5173
```

#### **Get MongoDB Connection String:**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster (Free M0 tier available)
3. Click **"Connect"** → **"Connect your application"**
4. Copy connection string
5. Replace `<username>`, `<password>`, and `<database_name>`

#### **Generate Gmail App Password:**

1. Enable 2-Factor Authentication on Gmail
2. Visit: https://myaccount.google.com/apppasswords
3. Select **"Mail"** → **"Other (Custom name)"** → Type: "Pizza App"
4. Click **"Generate"**
5. Copy 16-character password (format: `xxxx xxxx xxxx xxxx`)

#### **Seed Database:**

```bash
# Seed inventory (pizza ingredients)
node config/seed.js

# Create admin account
node config/seedUsers.js
```

**Admin Credentials:**
- Email: `sarfrazjamal56@gmail.com`
- Password: `S@rK!sh2639`

#### **Start Backend Server:**

```bash
node server.js
```

✅ Server running on: `http://127.0.0.1:5001`

---

### **3. Frontend Setup**

Open a **new terminal** window:

```bash
cd client
npm install
npm run dev
```

✅ Frontend running on: `http://localhost:5173`

---

## 🧪 Testing the Application

### **User Registration Flow:**

1. Open: http://localhost:5173
2. Click **"Register here"**
3. Enter email and password
4. ✅ **If email is valid:** Browser alert confirms "See your verification 6-digit code sent to your email"
5. ✅ **Check email inbox** (or spam folder) for 6-digit OTP
6. Enter OTP in verification modal
7. **User account created in database** after successful verification
8. Automatic login!

**Security Note:** If an invalid/non-existent email is entered, you'll see an error alert and NO verification modal will open. The registration form stays active to try again with a valid email.

### **Failed Email Scenarios:**

- ❌ **Invalid email address:** Alert shows "Failed to send verification email. Please check your email address and try again."
- ❌ **Non-existent email:** Same error message
- ❌ **No database entry:** User data is NEVER saved until OTP is verified
- ❌ **No admin notifications:** System does NOT send error emails to administrators

### **Admin Login:**

1. Select **"Admin"** tab
2. Email: `sarfrazjamal56@gmail.com`
3. Password: `S@rK!sh2639`
4. Access admin dashboard

### **Order Pizza:**

1. Login as user (or admin)
2. Select: Base → Sauce → Cheese → Veggies
3. Click **"Confirm & Place Order"**
4. Order confirmation displayed

### **Admin Dashboard:**

1. Login as admin
2. Toggle: **"Admin Panel"** button
3. View live orders
4. Update order status via dropdown
5. Monitor inventory levels

---

## 📁 Project Structure

```
WebDev-L3-PizzaDeliveryApp/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── App.jsx           # Main app with auth + admin
│   │   ├── PizzaBuilder.jsx  # Pizza customization
│   │   ├── VerifyEmail.jsx   # Email verification page
│   │   └── config/
│   │       └── api.js        # API endpoints
│   └── package.json
│
├── controllers/               # Backend logic
│   ├── authController.js     # Registration, login, verify
│   ├── orderController.js    # Order management
│   └── inventoryController.js
│
├── models/                    # MongoDB schemas
│   ├── User.js
│   ├── Order.js
│   └── Inventory.js
│
├── routes/                    # API routes
│   ├── authRoutes.js
│   ├── orderRoutes.js
│   ├── inventoryRoutes.js
│   └── adminRoutes.js
│
├── utils/
│   └── emailService.js       # NodeMailer email sender
│
├── config/
│   ├── database.js           # MongoDB connection
│   ├── seed.js               # Inventory seeder
│   └── seedUsers.js          # Admin account seeder
│
├── server.js                 # Express server
├── .env.example              # Environment template
└── README.md
```

---

## 🔐 Security Notes

### **Environment Variables:**

⚠️ **NEVER commit `.env` file to Git!**

The `.env.example` file is a template. Your actual `.env` file with real credentials should remain local only.

### **Exposed Secrets:**

If you accidentally push `.env`:

1. **Immediately change all passwords:**
   - MongoDB Atlas password
   - Gmail app password
   - JWT secret

2. **Remove from Git history:**
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
git push origin main --force
```

---

## 🌐 API Endpoints

### **Authentication:**
- `POST /api/auth/send-otp` - Send OTP for registration (validates email first)
- `POST /api/auth/verify-otp` - Verify OTP and create user account
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Legacy endpoint (redirects to send-otp)
- `POST /api/auth/verify-code` - Legacy endpoint (redirects to verify-otp)

### **Orders:**
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order

### **Admin:**
- `PUT /api/admin/orders/:id` - Update order status

### **Inventory:**
- `GET /api/inventory` - Get all inventory items

---

## 📧 Email Verification & Security

Users receive a **6-digit OTP** via email upon registration.

**Pre-Verification Security Features:**
- ✅ **No database writes** until OTP is successfully verified
- ✅ **Email deliverability check** using nodemailer SMTP validation
- ✅ **In-memory OTP storage** with 10-minute auto-expiration
- ✅ **Bcrypt password hashing** (salt rounds: 10)
- ✅ **No admin error emails** - failed registrations fail silently for the user

**Dual-Alert System:**
- ✅ **Success:** Browser alert + OTP verification modal opens
- ❌ **Failure:** Browser alert only (modal does NOT open, user stays on registration page)

**Note:** Emails may land in **spam folder** initially. Mark as "Not Spam" for future emails to reach inbox.

---

## 💳 Payment Integration

**Razorpay** payment modal (test mode) simulates payment flow. No real charges processed.

---

## 👨‍💼 Admin Account

**Pre-configured admin:**
- Email: `sarfrazjamal56@gmail.com`
- Password: `S@rK!sh2639`
- Role: `admin`
- Status: Pre-verified ✅

---

## 🐛 Troubleshooting

### **Backend won't start:**
- Check if MongoDB connection string is correct
- Verify port 5001 is not in use
- Run `npm install` in root directory

### **Frontend won't start:**
- Run `npm install` in `client/` directory
- Check port 5173 is available

### **Email not received:**
1. Check **spam/junk folder**
2. Verify Gmail app password is correct
3. Check backend logs for email send confirmation

### **MongoDB connection error:**
- Whitelist your IP in MongoDB Atlas
- Verify connection string format
- Check database user permissions

---

## 📝 License

This project is created for educational purposes as part of the OASIS INFOBYTE internship program.

---

## 👤 Author

**Sarfraz Jamal**  
- Email: sarfrazjamal56@gmail.com
- GitHub: [@SarfrazJamal-Namal](https://github.com/SarfrazJamal-Namal)

---

## 🙏 Acknowledgments

- **OASIS INFOBYTE** - Internship Program
- **MongoDB Atlas** - Cloud Database
- **NodeMailer** - Email Service
- **Razorpay** - Payment Gateway

---

**Made with ❤️ for OASIS INFOBYTE Internship - Level 3**
