# PayFlow — Razorpay Payment Integration

A full-stack eCommerce payment integration system built with **Spring Boot** + **React.js** + **Razorpay**.

---

## 🏗️ Project Structure

```
payment/
├── backend/                          # Spring Boot Backend
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/payment/
│       │   ├── PaymentApplication.java
│       │   ├── controller/
│       │   │   └── PaymentController.java
│       │   ├── service/
│       │   │   └── PaymentService.java
│       │   ├── repository/
│       │   │   ├── OrderRepository.java
│       │   │   └── PaymentRepository.java
│       │   ├── entity/
│       │   │   ├── OrderEntity.java
│       │   │   └── PaymentEntity.java
│       │   ├── dto/
│       │   │   ├── OrderRequest.java
│       │   │   ├── OrderResponse.java
│       │   │   ├── PaymentVerificationRequest.java
│       │   │   └── ApiResponse.java
│       │   ├── config/
│       │   │   ├── RazorpayConfig.java
│       │   │   └── CorsConfig.java
│       │   └── exception/
│       │       ├── PaymentException.java
│       │       └── GlobalExceptionHandler.java
│       └── resources/
│           └── application.properties    ← PASTE KEYS HERE
│
├── frontend/                         # React (Vite) Frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx / App.css
│       ├── index.css
│       ├── components/
│       │   ├── CheckoutPage.jsx / .css
│       │   ├── PaymentSuccess.jsx / .css
│       │   └── PaymentFailure.jsx / .css
│       └── services/
│           └── paymentService.js
│
├── schema.sql                        # MySQL schema
└── README.md
```

---

## 📋 Prerequisites

- **Java 17+** (JDK)
- **Maven 3.8+**
- **Node.js 18+** & npm
- **MySQL 8.x** running locally
- **Razorpay Account** — [Sign up here](https://dashboard.razorpay.com/signup)

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Create MySQL Database

```sql
CREATE DATABASE payment_db;
```

Or run the full schema:

```bash
mysql -u root -p < schema.sql
```

> **Note:** JPA `ddl-auto=update` will auto-create tables, but you can run `schema.sql` for indexed tables with foreign keys.

---

### Step 2: Configure Razorpay Keys

Open `backend/src/main/resources/application.properties` and replace:

```properties
razorpay.key.id=YOUR_RAZORPAY_KEY_ID
razorpay.key.secret=YOUR_RAZORPAY_KEY_SECRET
```

With your **test mode** keys from [Razorpay Dashboard → Settings → API Keys](https://dashboard.razorpay.com/app/website-app-settings/api-keys).

Also update MySQL credentials if needed:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

---

### Step 3: Start the Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on: **http://localhost:8080**

---

### Step 4: Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

### Step 5: Test the Payment

1. Open **http://localhost:5173** in your browser
2. Enter your name
3. Click **Pay ₹2,999**
4. Complete payment using test credentials (see below)
5. See the success page with transaction details

---

## 🧪 Test Payment Credentials

### Test Cards

| Card Network | Card Number | Expiry | CVV |
|---|---|---|---|
| Mastercard | `5267 3181 8797 5449` | Any future date | Any 3 digits |
| Visa | `4111 1111 1111 1111` | Any future date | Any 3 digits |

### Test UPI
- Use UPI ID: `success@razorpay` (auto-succeeds)
- Use UPI ID: `failure@razorpay` (auto-fails)

### Test Netbanking
- Select any bank → click "Success" on the test page

### Test Wallet
- Select any wallet → click "Success" on the test page

> ⚠️ These only work in **Test Mode**. Switch to Live keys for production.

---

## 🔌 API Reference

### Create Order
```http
POST /api/payment/create-order
Content-Type: application/json

{
  "customerName": "John Doe",
  "amount": 2999
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_xxxxx",
    "amount": 299900,
    "currency": "INR",
    "razorpayKeyId": "rzp_test_xxxxx",
    "customerName": "John Doe",
    "status": "CREATED"
  }
}
```

### Verify Payment
```http
POST /api/payment/verify
Content-Type: application/json

{
  "razorpayOrderId": "order_xxxxx",
  "razorpayPaymentId": "pay_xxxxx",
  "razorpaySignature": "signature_hash"
}
```

### Get Payment Status
```http
GET /api/payment/status/{orderId}
```

---

## 🔒 Security

- Razorpay `key_secret` is **never exposed** to the frontend
- Payment signatures are verified server-side using **HMAC SHA256**
- Input validation via `@Valid` + Jakarta Bean Validation
- CORS restricted to allowed origins
- Architecture is **JWT-ready** — add Spring Security filter chain

---

## 🚢 Production Deployment Guide

### Backend
1. Switch `razorpay.key.id` and `razorpay.key.secret` to **Live keys**
2. Set `spring.jpa.hibernate.ddl-auto=validate` (not `update`)
3. Use environment variables instead of hardcoded properties:
   ```bash
   export RAZORPAY_KEY_ID=rzp_live_xxxxx
   export RAZORPAY_KEY_SECRET=xxxxx
   ```
   Update `application.properties`:
   ```properties
   razorpay.key.id=${RAZORPAY_KEY_ID}
   razorpay.key.secret=${RAZORPAY_KEY_SECRET}
   ```
4. Build the JAR:
   ```bash
   mvn clean package -DskipTests
   java -jar target/payment-backend-1.0.0.jar
   ```

### Frontend
1. Build for production:
   ```bash
   npm run build
   ```
2. Deploy the `dist/` folder to Nginx, Vercel, or any static hosting
3. Update the API base URL in `paymentService.js` if backend is on a different domain

### Database
- Use a managed MySQL service (AWS RDS, PlanetScale, etc.)
- Run `schema.sql` manually on production instead of relying on `ddl-auto`
- Enable SSL for database connections

---

## 📝 License

MIT
