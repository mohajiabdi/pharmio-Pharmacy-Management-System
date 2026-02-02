# Pharmio – Pharmacy Management System 💊

A modern **Pharmacy Management System** built as a university project after learning **Node.js** and the **MERN stack**, using **MySQL**, **Express.js**, **React**, and **Node.js**.
This system is designed to handle real pharmacy workflows such as medicine management, sales (POS), reporting, and user settings.

---

## 📌 Project Overview

**Pharmio** is a full‑stack web application that helps pharmacies manage their daily operations efficiently. The system focuses on clarity, speed, and clean data handling while remaining simple enough for learning and demonstration purposes.

This project was developed by **students of Jamhuriya University** as part of practical learning in backend and frontend web development.

---

## ✨ Features

* 🔐 Authentication & Authorization (Admin / Staff)
* 💊 Medicines Management (CRUD + stock tracking)
* 🏪 Sales / POS module
* 📊 Reports & Analytics
* 📁 Export reports as **PDF, CSV, XLSX**
* 🎨 User Settings (Theme & Brand Palette per user)
* 🧾 Invoice generation (Printable)
* 🛡️ Secure API with protected routes

> ❌ WhatsApp receipt sharing and online payments are **not included** in this project.

---

## 🧰 Tech Stack

### Frontend

* React
* React Router
* Tailwind CSS
* Lucide Icons
* Axios

### Backend

* Node.js
* Express.js
* MySQL
* JWT Authentication

### Tools

* phpMyAdmin (Database management)
* Postman (API testing)
* Git & GitHub

---

## 🗂️ Project Structure

```
pharmio/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── config/
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Design (MySQL)

Key tables used in the system:

* `users`
* `medicines`
* `suppliers`
* `sales`
* `sale_items`

### Example: `medicines` Table

```sql
CREATE TABLE medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand_name VARCHAR(150) NOT NULL,
  generic_name VARCHAR(150),
  form ENUM('Tablet','Capsule','Syrup','Injection','Drops','Cream','Other') NOT NULL,
  strength VARCHAR(50) NOT NULL,
  category ENUM('Pain Relief','Antibiotics','Allergy','Gastro','Diabetes','Cardio','Vitamins','Other') NOT NULL,
  supplier_id INT,
  quantity INT DEFAULT 0,
  buy_price DECIMAL(10,2) DEFAULT 0.00,
  sell_price DECIMAL(10,2) DEFAULT 0.00,
  expiry_date DATE NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
```

---

## 🔑 Authentication Flow

* User logs in using email and password
* Backend validates credentials
* JWT token is generated
* Token is stored on the client (localStorage)
* Protected routes require a valid token

---

## 📡 API Documentation

Base URL:

```
/api
```

### 🔐 Auth Routes

#### Login

```
POST /api/auth/login
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Register (Admin only)

```
POST /api/auth/register
```

---

### 👤 User Routes

#### Get Current User

```
GET /api/users/me
```

#### Update Profile

```
PATCH /api/users/me/profile
```

#### Update Preferences

```
PATCH /api/users/me/preferences
```

---

### 💊 Medicines Routes

#### Get All Medicines

```
GET /api/medicines
```

#### Create Medicine

```
POST /api/medicines
```

#### Update Medicine

```
PUT /api/medicines/:id
```

#### Deactivate Medicine

```
PATCH /api/medicines/:id/active
```

---

### 🏪 Sales Routes

#### Create Sale

```
POST /api/sales
```

#### Get Sales Report

```
GET /api/reports/sales
```

---

## ▶️ Getting Started

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/pharmio.git
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4️⃣ Database

* Import SQL file into MySQL using phpMyAdmin
* Update database credentials in backend config

---

## 👨‍🎓 About the Team

This project was developed by **Jamhuriya University students** as part of hands‑on learning in:

* Node.js
* Express.js
* React
* MySQL
* Full‑stack application design

---

## 📄 License

This project is for **educational purposes only**.

---

## 📬 Contact

📧 Email: `admin@pharmacy.local`

---

⭐ If you find this project helpful, consider starring the repository!
