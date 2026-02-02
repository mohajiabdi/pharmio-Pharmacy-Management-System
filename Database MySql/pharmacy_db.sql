-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 02, 2026 at 10:44 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pharmacy_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `medicines`
--

CREATE TABLE `medicines` (
  `id` int(11) NOT NULL,
  `brand_name` varchar(150) NOT NULL,
  `generic_name` varchar(150) DEFAULT NULL,
  `form` enum('Tablet','Capsule','Syrup','Injection','Drops','Cream','Other') NOT NULL,
  `strength` varchar(50) NOT NULL,
  `category` enum('Pain Relief','Antibiotics','Allergy','Gastro','Diabetes','Cardio','Vitamins','Other') NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `buy_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sell_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `expiry_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `medicines`
--

INSERT INTO `medicines` (`id`, `brand_name`, `generic_name`, `form`, `strength`, `category`, `supplier_id`, `quantity`, `buy_price`, `sell_price`, `expiry_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Paracetmol', NULL, 'Tablet', '200mg', 'Pain Relief', 1, 294, 0.40, 0.50, '2028-06-02', 1, '2026-01-31 19:11:34', '2026-01-31 20:43:04'),
(2, 'IV', NULL, 'Injection', '100ml', 'Vitamins', 3, 188, 1.00, 2.00, '2027-11-25', 1, '2026-01-31 19:13:02', '2026-01-31 21:19:41'),
(3, 'Ibubrofin', NULL, 'Capsule', '200mg', 'Antibiotics', 20, 10, 0.50, 0.60, '2026-02-06', 1, '2026-01-31 19:15:26', '2026-01-31 19:15:52'),
(4, 'Sharoobo', NULL, 'Syrup', '500ml', 'Vitamins', 2, 10, 1.00, 2.00, '2026-02-02', 1, '2026-01-31 19:17:25', '2026-01-31 19:18:06');

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `sale_no` varchar(30) NOT NULL,
  `customer_name` varchar(150) DEFAULT NULL,
  `payment_method` enum('cash','card','mobile') NOT NULL DEFAULT 'cash',
  `status` enum('Paid','Pending') NOT NULL DEFAULT 'Paid',
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `change_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_by` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `sale_no`, `customer_name`, `payment_method`, `status`, `subtotal`, `discount`, `tax_rate`, `tax_amount`, `total`, `paid`, `balance`, `change_amount`, `created_by`, `is_active`, `created_at`) VALUES
(1, 'ORD-20260131-0001', NULL, 'cash', 'Paid', 1.00, 0.00, 0.00, 0.00, 1.00, 1.00, 0.00, 0.00, 1, 1, '2026-01-31 20:08:43'),
(2, 'ORD-20260131-0002', NULL, 'cash', 'Paid', 10.00, 0.00, 0.00, 0.00, 10.00, 10.00, 0.00, 0.00, 1, 1, '2026-01-31 20:09:30'),
(3, 'ORD-20260131-0003', NULL, 'cash', 'Paid', 10.00, 1.00, 5.00, 0.45, 9.45, 10.00, 0.00, 0.55, 1, 1, '2026-01-31 20:30:39'),
(4, 'ORD-20260131-0004', NULL, 'cash', 'Paid', 2.00, 0.00, 5.00, 0.10, 2.10, 3.00, 0.00, 0.90, 1, 1, '2026-01-31 20:43:04'),
(5, 'ORD-20260201-0001', NULL, 'cash', 'Paid', 4.00, 0.00, 5.00, 0.20, 4.20, 5.00, 0.00, 0.80, 1, 1, '2026-01-31 21:19:41');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `medicine_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `line_total` decimal(10,2) NOT NULL DEFAULT 0.00
) ;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `medicine_id`, `qty`, `unit_price`, `line_total`) VALUES
(1, 1, 1, 2, 0.50, 1.00),
(2, 2, 2, 5, 2.00, 10.00),
(3, 3, 2, 5, 2.00, 10.00),
(4, 4, 1, 4, 0.50, 2.00),
(5, 5, 2, 2, 2.00, 4.00);

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `is_active`, `created_at`) VALUES
(1, 'SomPharma', 1, '2026-01-31 17:22:34'),
(2, 'HealthLink', 1, '2026-01-31 17:22:34'),
(3, 'Mogadishu Medical Supplies', 1, '2026-01-31 17:22:34'),
(4, 'East Africa Pharma', 1, '2026-01-31 17:22:34'),
(5, 'Global Med Traders', 1, '2026-01-31 17:22:34'),
(6, 'CityCare Distributors', 1, '2026-01-31 17:22:34'),
(7, 'BlueCross Supplies', 1, '2026-01-31 17:22:34'),
(8, 'Prime Pharma Import', 1, '2026-01-31 17:22:34'),
(9, 'Sunrise Medical', 1, '2026-01-31 17:22:34'),
(10, 'MedPoint Wholesale', 1, '2026-01-31 17:22:34'),
(11, 'Hodan Pharma', 1, '2026-01-31 17:22:34'),
(12, 'Banadir Pharma', 1, '2026-01-31 17:22:34'),
(13, 'Sahal Medical', 1, '2026-01-31 17:22:34'),
(14, 'Daryeel Distributors', 1, '2026-01-31 17:22:34'),
(15, 'Golis Med', 1, '2026-01-31 17:22:34'),
(16, 'Horn of Africa Pharma', 1, '2026-01-31 17:22:34'),
(17, 'Somali Health Supplies', 1, '2026-01-31 17:22:34'),
(18, 'Nabad Medical', 1, '2026-01-31 17:22:34'),
(19, 'Barwaaqo Pharma', 1, '2026-01-31 17:22:34'),
(20, 'Hilaac Medical', 1, '2026-01-31 17:22:34');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','pharmacist','cashier') NOT NULL DEFAULT 'pharmacist',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `theme_mode` varchar(10) DEFAULT 'system',
  `palette_key` varchar(30) DEFAULT 'indigo-sky'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `is_active`, `created_at`, `theme_mode`, `palette_key`) VALUES
(1, 'Mohamed Mahad Abdi', 'admin@pharmacy.com', '$2b$10$25dW8iNZRxk9JHgdaAxDuuXvkGDklQRTMygmEfhxrn4s0N2ISRogG', 'admin', 1, '2026-01-31 17:04:00', 'light', 'slate-cyan'),
(2, 'Sheyma', 'sheyma@gmail.com', '$2b$10$XSKqIc0Y5JAJ1fFwTVL4g.sB5IUuewp6jNTP6Z5bwBsRxj7TEG34a', 'pharmacist', 1, '2026-02-01 01:39:33', 'light', 'amber-orange'),
(3, 'Mo Haji Abdi', 'maher.mahad@gmail.com', '$2b$10$.BCkHocehaGx4t8yFXFWhenlnLHUP3zyTt9NzXyerDdVOca4r9ITS', 'pharmacist', 1, '2026-02-01 01:50:02', 'light', 'indigo-sky');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `medicines`
--
ALTER TABLE `medicines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_meds_active` (`is_active`),
  ADD KEY `idx_meds_category` (`category`),
  ADD KEY `idx_meds_expiry` (`expiry_date`),
  ADD KEY `idx_meds_supplier` (`supplier_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_sales_sale_no` (`sale_no`),
  ADD KEY `idx_sales_created_at` (`created_at`),
  ADD KEY `idx_sales_created_by` (`created_by`),
  ADD KEY `idx_sales_active` (`is_active`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sale_items_sale` (`sale_id`),
  ADD KEY `idx_sale_items_medicine` (`medicine_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_suppliers_name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `uq_users_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `medicines`
--
ALTER TABLE `medicines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `medicines`
--
ALTER TABLE `medicines`
  ADD CONSTRAINT `fk_medicines_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `fk_sales_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `fk_sale_items_medicine` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sale_items_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
