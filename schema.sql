-- ============================================
-- Payment Integration Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS payment_db;
USE payment_db;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        VARCHAR(255) NOT NULL UNIQUE,
    customer_name   VARCHAR(255) NOT NULL,
    amount          BIGINT       NOT NULL COMMENT 'Amount in paise (1 INR = 100 paise)',
    currency        VARCHAR(10)  NOT NULL DEFAULT 'INR',
    status          ENUM('CREATED', 'PAID', 'FAILED') NOT NULL DEFAULT 'CREATED',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id          VARCHAR(255) NOT NULL UNIQUE,
    razorpay_order_id   VARCHAR(255) NOT NULL,
    razorpay_signature  VARCHAR(512) NOT NULL,
    amount              BIGINT       NOT NULL COMMENT 'Amount in paise',
    status              ENUM('SUCCESS', 'FAILED') NOT NULL,
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_payment_id (payment_id),
    INDEX idx_razorpay_order_id (razorpay_order_id),

    CONSTRAINT fk_payment_order
        FOREIGN KEY (razorpay_order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
