-- ==========================================================
-- IT Asset Management Database Schema (MySQL / MariaDB)
-- Siap diimpor langsung via phpMyAdmin di cPanel
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `asset_maintenance`;
DROP TABLE IF EXISTS `asset_assignments`;
DROP TABLE IF EXISTS `asset_documents`;
DROP TABLE IF EXISTS `assets`;
DROP TABLE IF EXISTS `license_assignments`;
DROP TABLE IF EXISTS `software_licenses`;
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `locations`;
DROP TABLE IF EXISTS `asset_categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `company_settings`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Tabel Kategori Aset
CREATE TABLE `asset_categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `icon_name` VARCHAR(50) DEFAULT 'Laptop',
  `description` TEXT,
  `default_lifespan_years` INT DEFAULT 4,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel Lokasi & Ruangan
CREATE TABLE `locations` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `type` ENUM('Head Office', 'Branch Office', 'Warehouse', 'Server Room', 'Meeting Room', 'Data Center') NOT NULL DEFAULT 'Head Office',
  `address` TEXT,
  `building` VARCHAR(100) DEFAULT '',
  `floor` VARCHAR(50) DEFAULT '',
  `contact_person` VARCHAR(100) DEFAULT '',
  `phone` VARCHAR(30) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Karyawan / Pegawai
CREATE TABLE `employees` (
  `id` VARCHAR(50) NOT NULL,
  `employee_id` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) DEFAULT '',
  `department` VARCHAR(100) NOT NULL,
  `position` VARCHAR(100) NOT NULL,
  `location_id` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('active', 'on_leave', 'inactive') NOT NULL DEFAULT 'active',
  `avatar_url` TEXT,
  `joined_date` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_employee_id` (`employee_id`),
  KEY `fk_emp_location` (`location_id`),
  CONSTRAINT `fk_emp_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel Aset Hardware & Perangkat
CREATE TABLE `assets` (
  `id` VARCHAR(50) NOT NULL,
  `asset_tag` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `serial_number` VARCHAR(100) NOT NULL,
  `purchase_date` DATE NOT NULL,
  `purchase_price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `supplier` VARCHAR(150) DEFAULT '',
  `warranty_expiry_date` DATE NOT NULL,
  `status` ENUM('available', 'assigned', 'maintenance', 'reserved', 'lost', 'retired') NOT NULL DEFAULT 'available',
  `asset_condition` ENUM('excellent', 'good', 'fair', 'poor', 'damaged') NOT NULL DEFAULT 'good',
  `location_id` VARCHAR(50) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `assigned_to_employee_id` VARCHAR(50) DEFAULT NULL,
  `assigned_date` DATE DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `mac_address` VARCHAR(50) DEFAULT NULL,
  `os` VARCHAR(100) DEFAULT NULL,
  `processor` VARCHAR(100) DEFAULT NULL,
  `ram` VARCHAR(50) DEFAULT NULL,
  `storage` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT,
  `photo_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_asset_tag` (`asset_tag`),
  KEY `fk_asset_category` (`category_id`),
  KEY `fk_asset_location` (`location_id`),
  KEY `fk_asset_employee` (`assigned_to_employee_id`),
  CONSTRAINT `fk_asset_category` FOREIGN KEY (`category_id`) REFERENCES `asset_categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_asset_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_asset_employee` FOREIGN KEY (`assigned_to_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabel Lampiran / Dokumen Aset (Invoice, BAST, Kartu Garansi)
CREATE TABLE `asset_documents` (
  `id` VARCHAR(50) NOT NULL,
  `asset_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `type` ENUM('invoice', 'warranty_card', 'manual', 'handover_form', 'other') NOT NULL,
  `url` TEXT NOT NULL,
  `size` VARCHAR(50) DEFAULT '',
  `upload_date` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_doc_asset` (`asset_id`),
  CONSTRAINT `fk_doc_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabel Penugasan / Peminjaman Aset (Check-out & BAST)
CREATE TABLE `asset_assignments` (
  `id` VARCHAR(50) NOT NULL,
  `assignment_code` VARCHAR(50) NOT NULL,
  `asset_id` VARCHAR(50) NOT NULL,
  `employee_id` VARCHAR(50) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `assigned_date` DATE NOT NULL,
  `expected_return_date` DATE DEFAULT NULL,
  `actual_return_date` DATE DEFAULT NULL,
  `status` ENUM('active', 'transferred', 'returned', 'overdue') NOT NULL DEFAULT 'active',
  `condition_on_assign` ENUM('excellent', 'good', 'fair', 'poor', 'damaged') NOT NULL DEFAULT 'good',
  `condition_on_return` ENUM('excellent', 'good', 'fair', 'poor', 'damaged') DEFAULT NULL,
  `notes` TEXT,
  `assigned_by_user_id` VARCHAR(50) NOT NULL,
  `handover_doc_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_assignment_code` (`assignment_code`),
  KEY `fk_asg_asset` (`asset_id`),
  KEY `fk_asg_employee` (`employee_id`),
  CONSTRAINT `fk_asg_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_asg_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabel Tiket Pemeliharaan & Servis (Maintenance)
CREATE TABLE `asset_maintenance` (
  `id` VARCHAR(50) NOT NULL,
  `maintenance_id` VARCHAR(50) NOT NULL,
  `asset_id` VARCHAR(50) NOT NULL,
  `maintenance_type` ENUM('preventive', 'corrective', 'upgrade', 'inspection', 'repair') NOT NULL,
  `problem_description` TEXT NOT NULL,
  `maintenance_date` DATE NOT NULL,
  `completed_date` DATE DEFAULT NULL,
  `technician` VARCHAR(100) NOT NULL,
  `vendor` VARCHAR(150) DEFAULT NULL,
  `maintenance_cost` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  `notes` TEXT,
  `resolution_details` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_maintenance_id` (`maintenance_id`),
  KEY `fk_mnt_asset` (`asset_id`),
  CONSTRAINT `fk_mnt_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabel Lisensi Software
CREATE TABLE `software_licenses` (
  `id` VARCHAR(50) NOT NULL,
  `software_name` VARCHAR(150) NOT NULL,
  `license_key` VARCHAR(255) NOT NULL,
  `license_type` ENUM('perpetual', 'subscription_annual', 'subscription_monthly', 'per_user', 'volume') NOT NULL,
  `total_licenses` INT NOT NULL DEFAULT 1,
  `purchase_date` DATE NOT NULL,
  `expiration_date` DATE NOT NULL,
  `vendor` VARCHAR(150) NOT NULL,
  `license_cost` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('active', 'expiring_soon', 'expired', 'suspended') NOT NULL DEFAULT 'active',
  `category` VARCHAR(100) NOT NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tabel Relasi Lisensi ke Karyawan (Alokasi Seat)
CREATE TABLE `license_assignments` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `license_id` VARCHAR(50) NOT NULL,
  `employee_id` VARCHAR(50) NOT NULL,
  `assigned_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_license_employee` (`license_id`, `employee_id`),
  KEY `fk_la_license` (`license_id`),
  KEY `fk_la_employee` (`employee_id`),
  CONSTRAINT `fk_la_license` FOREIGN KEY (`license_id`) REFERENCES `software_licenses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_la_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Tabel Pengguna Sistem (Users / RBAC)
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) DEFAULT '',
  `role` ENUM('super_admin', 'it_admin', 'it_support', 'manager', 'employee') NOT NULL DEFAULT 'employee',
  `department` VARCHAR(100) NOT NULL,
  `employee_id` VARCHAR(50) DEFAULT NULL,
  `avatar_url` TEXT,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Tabel Log Aktivitas (Audit Trail)
CREATE TABLE `activity_logs` (
  `id` VARCHAR(50) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'RETURN', 'TRANSFER', 'MAINTENANCE', 'IMPORT', 'EXPORT', 'LOGIN', 'SYSTEM') NOT NULL,
  `entity_type` ENUM('ASSET', 'CATEGORY', 'EMPLOYEE', 'ASSIGNMENT', 'MAINTENANCE', 'LICENSE', 'LOCATION', 'USER', 'SETTINGS') NOT NULL,
  `entity_id` VARCHAR(50) DEFAULT NULL,
  `entity_name` VARCHAR(150) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `user_role` VARCHAR(50) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(50) DEFAULT '127.0.0.1',
  PRIMARY KEY (`id`),
  KEY `idx_log_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Tabel Pengaturan Perusahaan (Company Settings)
CREATE TABLE `company_settings` (
  `id` INT NOT NULL DEFAULT 1,
  `company_name` VARCHAR(150) NOT NULL DEFAULT 'PT Nusantara Solusi Teknologi',
  `company_address` TEXT,
  `company_email` VARCHAR(100) DEFAULT 'it-support@nusantara-tech.co.id',
  `company_phone` VARCHAR(30) DEFAULT '+62 21 555-0199',
  `currency` VARCHAR(10) DEFAULT 'IDR',
  `asset_tag_prefix` VARCHAR(20) DEFAULT 'AST',
  `next_asset_number` INT DEFAULT 100,
  `warranty_alert_days` INT DEFAULT 60,
  `license_alert_days` INT DEFAULT 30,
  `auto_log_activity` TINYINT(1) DEFAULT 1,
  `enable_email_alerts` TINYINT(1) DEFAULT 1,
  `alert_email` VARCHAR(100) DEFAULT 'it-admin@nusantara-tech.co.id',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- DATA AWAL (SEED DATA DEFAULT)
-- ==========================================================

-- Data Pengaturan Default
INSERT INTO `company_settings` (`id`, `company_name`, `company_address`, `company_email`, `company_phone`, `currency`, `asset_tag_prefix`, `next_asset_number`, `warranty_alert_days`, `license_alert_days`, `auto_log_activity`, `enable_email_alerts`, `alert_email`)
VALUES (1, 'PT Nusantara Solusi Teknologi', 'Sudirman Central Business District (SCBD), Tower 2 Lt. 18, Jakarta Selatan', 'it-support@nusantara-tech.co.id', '+62 21 555-0199', 'IDR', 'AST', 101, 60, 30, 1, 1, 'it-admin@nusantara-tech.co.id')
ON DUPLICATE KEY UPDATE `company_name` = VALUES(`company_name`);

-- Data Kategori Aset
INSERT INTO `asset_categories` (`id`, `name`, `code`, `icon_name`, `description`, `default_lifespan_years`) VALUES
('cat-1', 'Laptop & Ultrabook', 'LAPTOP', 'Laptop', 'Perangkat komputer jinjing untuk karyawan', 4),
('cat-2', 'Desktop & Workstation', 'DESKTOP', 'Monitor', 'PC desktop untuk operasional kantor & developer', 5),
('cat-3', 'Server & Storage', 'SERVER', 'Server', 'Infrastruktur server datacenter, NAS, & rack unit', 6),
('cat-4', 'Jaringan & Network', 'NETWORK', 'Wifi', 'Router, switch manageable, access point WiFi, firewall', 5),
('cat-5', 'Smartphone & Tablet', 'MOBILE', 'Smartphone', 'Device mobile testing, operasional lapangan, & tablet', 3),
('cat-6', 'Printer & Scanner', 'PRINTER', 'Printer', 'Printer multifungsi & scanner dokumen', 5);

-- Data Lokasi
INSERT INTO `locations` (`id`, `name`, `type`, `address`, `building`, `floor`, `contact_person`, `phone`) VALUES
('loc-1', 'Kantor Pusat SCBD', 'Head Office', 'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan', 'Gedung Menara Mandiri', 'Lantai 18', 'Budi Santoso', '021-5550100'),
('loc-2', 'Data Center Tier-3 Cyber', 'Data Center', 'Jl. Kuningan Barat No. 8, Mampang Prapatan', 'Cyber Building 1', 'Lantai 2 - Ruang 204', 'Dedi Pratama', '021-5550199'),
('loc-3', 'Gudang Logistik Cikarang', 'Warehouse', 'Kawasan Industri GIIC Cikarang Pusat, Bekasi', 'Warehouse Delta 3', 'Lantai 1', 'Rahmat Hidayat', '021-8990122');

-- Data Akun Pengguna Awal
INSERT INTO `users` (`id`, `name`, `email`, `role`, `department`, `status`) VALUES
('usr-1', 'Super Admin IT', 'superadmin@perusahaan.com', 'super_admin', 'Information Technology', 'active'),
('usr-2', 'Ahmad Fauzi (IT Lead)', 'ahmad.fauzi@perusahaan.com', 'it_admin', 'Information Technology', 'active'),
('usr-3', 'Rian IT Support', 'rian.support@perusahaan.com', 'it_support', 'Information Technology', 'active');
