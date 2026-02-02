# Pharmio – Pharmacy Management System 💊

A modern **Pharmacy Management System** built as a **student project** at **Jamhuriya University**, designed to manage medicines, suppliers, sales (POS), users, and reports using a clean and practical workflow.

This project was developed after learning **Node.js** and the **MERN stack**, while using **MySQL** as the database.

---

## 📌 Project Overview

**Pharmio** helps pharmacies manage daily operations such as:
- Medicine inventory
- Sales / POS
- User roles (Admin, Pharmacist, Cashier)
- Reports and exports
- System preferences (theme & UI settings)

The system focuses on **clarity, speed, and real-world pharmacy workflows**.

---

## 🧰 Tech Stack

### Backend
- **Node.js**
- **Express.js**
- **MySQL**
- **JWT Authentication**
- **bcrypt.js** (password hashing)

### Frontend
- **React.js**
- **React Router**
- **Tailwind CSS**
- **Lucide Icons**

### Tools & Formats
- **CSV / XLSX / PDF exports**
- RESTful API design

---

## 👥 User Roles

| Role        | Permissions |
|-------------|------------|
| **Admin**       | Full access, manage users, reports |
| **Pharmacist**  | Manage medicines, sales |
| **Cashier**     | Sales / POS only |

---

## 📦 Core Features

- 🔐 Secure authentication (JWT)
- 👤 User management (Admin only)
- 💊 Medicine inventory (CRUD)
- 🏷 Supplier management
- 🧾 Sales / POS system
- 📊 Reports & analytics
- 🎨 User preferences (theme & palette)
- 📁 Export reports as **PDF, CSV, XLSX**

> ❌ WhatsApp receipt sending is **not included**

---

## 🗂 Database Structure (MySQL)

Main tables used:
- `users`
- `medicines`
- `suppliers`
- `sales`
- `sale_items`

Foreign key relationships are enforced for data integrity.

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/pharmio.git
cd pharmio
