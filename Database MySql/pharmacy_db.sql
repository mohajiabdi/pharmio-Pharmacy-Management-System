-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 02, 2026 at 12:09 PM
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
(3, 'Ibubrofin', NULL, 'Capsule', '200mg', 'Antibiotics', 20, 0, 0.50, 0.60, '2026-02-06', 1, '2026-01-31 19:15:26', '2026-02-02 11:04:54'),
(4, 'Sharoobo', NULL, 'Syrup', '500ml', 'Vitamins', 2, 10, 1.00, 2.00, '2026-02-01', 1, '2026-01-31 19:17:25', '2026-02-02 11:07:45'),
(5, 'Somacet Rapid', 'Paracetamol', 'Tablet', '500mg', 'Pain Relief', 1, 180, 0.05, 0.10, '2027-10-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(6, 'IbuRelief Max', 'Ibuprofen', 'Tablet', '400mg', 'Pain Relief', 2, 140, 0.06, 0.12, '2027-08-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(7, 'AmoxiCure', 'Amoxicillin', 'Capsule', '500mg', 'Antibiotics', 3, 120, 0.09, 0.18, '2027-06-15', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(8, 'CetiClear', 'Cetirizine', 'Tablet', '10mg', 'Allergy', 4, 160, 0.04, 0.09, '2028-02-28', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(9, 'OmeGuard', 'Omeprazole', 'Capsule', '20mg', 'Gastro', 5, 110, 0.07, 0.15, '2027-12-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(10, 'MetraGain', 'Metformin', 'Tablet', '500mg', 'Diabetes', 6, 130, 0.06, 0.13, '2028-05-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(11, 'Amlotone', 'Amlodipine', 'Tablet', '5mg', 'Cardio', 7, 90, 0.08, 0.16, '2028-03-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(12, 'VitaC Shine', 'Ascorbic Acid (Vitamin C)', 'Tablet', '1000mg', 'Vitamins', 8, 200, 0.05, 0.11, '2029-01-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(13, 'DoloEase Gel', 'Diclofenac', 'Cream', '1%', 'Pain Relief', 9, 70, 0.25, 0.45, '2027-09-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(14, 'AzithroWin', 'Azithromycin', 'Tablet', '500mg', 'Antibiotics', 10, 85, 0.18, 0.30, '2027-07-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(15, 'LoraBreeze', 'Loratadine', 'Tablet', '10mg', 'Allergy', 11, 150, 0.05, 0.10, '2028-04-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(16, 'RaniSafe', 'Ranitidine', 'Tablet', '150mg', 'Gastro', 12, 100, 0.06, 0.12, '2027-11-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(17, 'GlucoSense', 'Gliclazide', 'Tablet', '80mg', 'Diabetes', 13, 95, 0.10, 0.20, '2028-06-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(18, 'AtenoCalm', 'Atenolol', 'Tablet', '50mg', 'Cardio', 14, 105, 0.07, 0.14, '2028-01-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(19, 'MultiVita Daily', 'Multivitamin', 'Capsule', '1 cap', 'Vitamins', 15, 160, 0.08, 0.17, '2029-02-28', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(20, 'CoughRel Syr', 'Dextromethorphan', 'Syrup', '15mg/5ml', 'Other', 16, 60, 0.35, 0.60, '2027-05-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(21, 'NasoFresh', 'Xylometazoline', 'Drops', '0.1%', 'Allergy', 17, 80, 0.22, 0.40, '2027-10-15', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(22, 'CiproNova', 'Ciprofloxacin', 'Tablet', '500mg', 'Antibiotics', 18, 90, 0.14, 0.25, '2027-12-15', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(23, 'Pantofix', 'Pantoprazole', 'Tablet', '40mg', 'Gastro', 19, 120, 0.09, 0.18, '2028-08-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(24, 'InsuQuick', 'Insulin Regular', 'Injection', '100IU/ml', 'Diabetes', 20, 40, 2.50, 3.20, '2026-12-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(25, 'PainLess SR', 'Naproxen', 'Tablet', '250mg', 'Pain Relief', 1, 110, 0.09, 0.16, '2027-08-15', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(26, 'KetoRelief', 'Ketoprofen', 'Capsule', '100mg', 'Pain Relief', 2, 95, 0.12, 0.22, '2027-06-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(27, 'ClindaPro', 'Clindamycin', 'Capsule', '300mg', 'Antibiotics', 3, 80, 0.20, 0.34, '2027-09-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(28, 'FexoFree', 'Fexofenadine', 'Tablet', '120mg', 'Allergy', 4, 90, 0.11, 0.20, '2028-09-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(29, 'Gavisoothe', 'Alginic Acid + Antacid', 'Syrup', '200ml', 'Gastro', 5, 55, 0.70, 1.10, '2027-11-15', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(30, 'MetraPlus XR', 'Metformin', 'Tablet', '850mg', 'Diabetes', 6, 120, 0.08, 0.16, '2028-10-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(31, 'LosarEase', 'Losartan', 'Tablet', '50mg', 'Cardio', 7, 100, 0.10, 0.20, '2028-07-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(32, 'VitaD Boost', 'Cholecalciferol (Vitamin D3)', 'Capsule', '50000IU', 'Vitamins', 8, 75, 0.20, 0.35, '2029-03-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(33, 'BactoShield', 'Co-trimoxazole', 'Tablet', '800/160mg', 'Antibiotics', 9, 110, 0.09, 0.17, '2027-07-15', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(34, 'AntiItch Derm', 'Hydrocortisone', 'Cream', '1%', 'Other', 10, 65, 0.30, 0.55, '2028-02-15', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(35, 'AllerStop', 'Chlorpheniramine', 'Tablet', '4mg', 'Allergy', 11, 160, 0.03, 0.07, '2028-01-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(36, 'OmeGuard Plus', 'Omeprazole', 'Capsule', '40mg', 'Gastro', 12, 95, 0.10, 0.19, '2028-05-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(37, 'GlucoFine', 'Glimepiride', 'Tablet', '2mg', 'Diabetes', 13, 85, 0.12, 0.22, '2028-12-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(38, 'ClopiSafe', 'Clopidogrel', 'Tablet', '75mg', 'Cardio', 14, 70, 0.25, 0.40, '2028-06-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(39, 'IronMax', 'Ferrous Sulfate', 'Tablet', '200mg', 'Vitamins', 15, 140, 0.05, 0.10, '2029-01-15', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(40, 'ZincGuard', 'Zinc Sulfate', 'Tablet', '20mg', 'Vitamins', 16, 150, 0.04, 0.09, '2029-04-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(41, 'SaliNeb', 'Sodium Chloride', 'Drops', '0.9%', 'Other', 17, 130, 0.10, 0.18, '2028-03-15', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(42, 'DoxySure', 'Doxycycline', 'Capsule', '100mg', 'Antibiotics', 18, 90, 0.13, 0.24, '2027-10-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(43, 'EsomeSecure', 'Esomeprazole', 'Capsule', '20mg', 'Gastro', 19, 100, 0.12, 0.22, '2028-09-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(44, 'GlucoTest Strips', 'Glucose Test Strips', 'Other', '50 strips', 'Diabetes', 20, 60, 2.20, 3.50, '2028-07-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(45, 'Paracare Syr', 'Paracetamol', 'Syrup', '120mg/5ml', 'Pain Relief', 1, 75, 0.35, 0.55, '2027-08-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(46, 'BrufenKids', 'Ibuprofen', 'Syrup', '100mg/5ml', 'Pain Relief', 2, 70, 0.40, 0.65, '2027-12-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(47, 'CefaPrime', 'Cefalexin', 'Capsule', '500mg', 'Antibiotics', 3, 80, 0.16, 0.28, '2027-11-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(48, 'MontelAir', 'Montelukast', 'Tablet', '10mg', 'Allergy', 4, 85, 0.14, 0.26, '2028-08-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(49, 'MeboGastro', 'Aluminium Hydroxide + Magnesium', 'Syrup', '200ml', 'Gastro', 5, 50, 0.65, 1.00, '2027-09-15', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(50, 'SitaGlu', 'Sitagliptin', 'Tablet', '100mg', 'Diabetes', 6, 60, 0.50, 0.75, '2028-11-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(51, 'BisoproCalm', 'Bisoprolol', 'Tablet', '5mg', 'Cardio', 7, 90, 0.14, 0.26, '2028-10-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(52, 'B-Complex Pro', 'Vitamin B Complex', 'Capsule', '1 cap', 'Vitamins', 8, 120, 0.07, 0.14, '2029-05-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(53, 'DicloMove', 'Diclofenac', 'Tablet', '50mg', 'Pain Relief', 9, 110, 0.08, 0.15, '2027-06-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(54, 'LevoCure', 'Levofloxacin', 'Tablet', '500mg', 'Antibiotics', 10, 70, 0.25, 0.40, '2027-09-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(55, 'Levocet Fresh', 'Levocetirizine', 'Tablet', '5mg', 'Allergy', 11, 120, 0.06, 0.12, '2028-06-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(56, 'SucralHeal', 'Sucralfate', 'Tablet', '1g', 'Gastro', 12, 95, 0.12, 0.22, '2028-02-28', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(57, 'GlucoFast', 'Insulin Glargine', 'Injection', '100IU/ml', 'Diabetes', 13, 35, 6.00, 7.50, '2026-11-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(58, 'RosuCare', 'Rosuvastatin', 'Tablet', '10mg', 'Cardio', 14, 80, 0.28, 0.45, '2029-01-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(59, 'FolicPlus', 'Folic Acid', 'Tablet', '5mg', 'Vitamins', 15, 160, 0.02, 0.06, '2029-06-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(60, 'CalciStrong', 'Calcium Carbonate', 'Tablet', '500mg', 'Vitamins', 16, 140, 0.06, 0.12, '2029-03-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(61, 'AntiseptX', 'Povidone Iodine', 'Other', '100ml', 'Other', 17, 55, 0.45, 0.75, '2028-01-15', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(62, 'MetroCure', 'Metronidazole', 'Tablet', '400mg', 'Antibiotics', 18, 120, 0.06, 0.12, '2027-10-15', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(63, 'LansoGuard', 'Lansoprazole', 'Capsule', '30mg', 'Gastro', 19, 90, 0.10, 0.20, '2028-07-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(64, 'GlucoCheck', 'Glucometer', 'Other', '1 device', 'Diabetes', 20, 20, 7.00, 9.50, '2026-02-05', 1, '2026-02-02 11:03:22', '2026-02-02 11:08:15'),
(65, 'PainAway Patch', 'Menthol + Camphor', 'Other', 'Patch', 'Pain Relief', 1, 60, 0.20, 0.35, '2028-12-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(66, 'MefenEase', 'Mefenamic Acid', 'Capsule', '250mg', 'Pain Relief', 2, 100, 0.07, 0.14, '2027-07-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(67, 'AugmentaCare', 'Amoxicillin + Clavulanate', 'Tablet', '625mg', 'Antibiotics', 3, 70, 0.22, 0.36, '2027-08-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(68, 'AllerNose', 'Fluticasone', 'Drops', '50mcg', 'Allergy', 4, 55, 0.60, 0.95, '2028-09-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(69, 'DompiMove', 'Domperidone', 'Tablet', '10mg', 'Gastro', 5, 120, 0.05, 0.11, '2027-11-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(70, 'GlucoMet Plus', 'Metformin', 'Tablet', '1000mg', 'Diabetes', 6, 80, 0.10, 0.18, '2028-04-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(71, 'Enalapril Guard', 'Enalapril', 'Tablet', '10mg', 'Cardio', 7, 100, 0.06, 0.13, '2028-03-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(72, 'Omega3 Daily', 'Omega-3 Fish Oil', 'Capsule', '1000mg', 'Vitamins', 8, 90, 0.15, 0.28, '2029-07-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(73, 'DicloGel Cool', 'Diclofenac', 'Cream', '1%', 'Pain Relief', 9, 75, 0.24, 0.42, '2028-05-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(74, 'Ceftriax Shot', 'Ceftriaxone', 'Injection', '1g', 'Antibiotics', 10, 45, 0.80, 1.20, '2027-06-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(75, 'AllerEye', 'Olopatadine', 'Drops', '0.1%', 'Allergy', 11, 60, 0.55, 0.90, '2028-02-28', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(76, 'ORS ReHydra', 'Oral Rehydration Salts', 'Other', '1 sachet', 'Gastro', 12, 220, 0.03, 0.07, '2028-08-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(77, 'GlucoIns Mix', 'Insulin 70/30', 'Injection', '100IU/ml', 'Diabetes', 13, 30, 3.50, 4.60, '2026-10-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(78, 'AtorvaCare', 'Atorvastatin', 'Tablet', '20mg', 'Cardio', 14, 85, 0.18, 0.30, '2029-02-28', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(79, 'VitaA Vision', 'Vitamin A', 'Capsule', '10000IU', 'Vitamins', 15, 70, 0.10, 0.18, '2029-08-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(80, 'MagniPlus', 'Magnesium', 'Tablet', '250mg', 'Vitamins', 16, 110, 0.06, 0.12, '2029-05-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(81, 'Clotrim Skin', 'Clotrimazole', 'Cream', '1%', 'Other', 17, 85, 0.22, 0.40, '2028-06-30', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(82, 'ErythroCare', 'Erythromycin', 'Tablet', '500mg', 'Antibiotics', 18, 75, 0.16, 0.28, '2027-12-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(83, 'FamotiShield', 'Famotidine', 'Tablet', '20mg', 'Gastro', 19, 110, 0.06, 0.12, '2028-01-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:03:22'),
(84, 'Lancet Pack', 'Sterile Lancets', 'Other', '100 pcs', 'Diabetes', 20, 1, 1.80, 2.70, '2029-12-31', 1, '2026-02-02 11:03:22', '2026-02-02 11:07:06');

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
(5, 'ORD-20260201-0001', NULL, 'cash', 'Paid', 4.00, 0.00, 5.00, 0.20, 4.20, 5.00, 0.00, 0.80, 1, 1, '2026-01-31 21:19:41'),
(6, 'ORD-20260202-0001', NULL, 'cash', 'Paid', 141.00, 0.00, 5.00, 7.05, 148.05, 149.00, 0.00, 0.95, 1, 1, '2026-02-02 11:04:54');

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
(5, 5, 2, 2, 2.00, 4.00),
(6, 6, 3, 10, 0.60, 6.00),
(7, 6, 84, 50, 2.70, 135.00);

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
(1, 'Mohamed Mahad Abdi', 'admin@pharmacy.com', '$2b$10$NxM/fYpKgq7IMzlYT/efiuAONKEZ0jZRhLLjgLQRtFCO9kuci8Foy', 'admin', 1, '2026-01-31 17:04:00', 'light', 'indigo-sky'),
(2, 'Sheyma', 'sheyma@gmail.com', '$2b$10$XSKqIc0Y5JAJ1fFwTVL4g.sB5IUuewp6jNTP6Z5bwBsRxj7TEG34a', 'pharmacist', 1, '2026-02-01 01:39:33', 'light', 'amber-orange'),
(3, 'Maher Mahad', 'maher.mahad@gmail.com', '$2b$10$.BCkHocehaGx4t8yFXFWhenlnLHUP3zyTt9NzXyerDdVOca4r9ITS', 'cashier', 1, '2026-02-01 01:50:02', 'light', 'indigo-sky'),
(4, 'Mohamed Mahad', 'mo.haji.abdi1@gmail.com', '$2b$10$uUNNtBu0esKrKlKwYmnQ6u30Sr1dmjaBdFE//QptnqcKV1.YkG8by', 'pharmacist', 1, '2026-02-02 10:10:47', 'system', 'indigo-sky');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
