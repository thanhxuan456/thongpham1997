-- ============================================
-- ThemeVN Database Schema - MySQL Version
-- ============================================

-- ============================================
-- USERS AND AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_confirmed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_sign_in_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email)
);

-- User profiles
CREATE TABLE IF NOT EXISTS profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    affiliate_enabled BOOLEAN DEFAULT FALSE,
    affiliate_percentage DECIMAL(5,2) DEFAULT 10,
    affiliate_code VARCHAR(50) UNIQUE,
    affiliate_earnings DECIMAL(15,2) DEFAULT 0,
    referred_by CHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_affiliate_code (affiliate_code)
);

-- User roles - using ENUM for role type
CREATE TABLE IF NOT EXISTS user_roles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_role (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    device_info TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sessions (user_id)
);

-- OTP codes for verification
CREATE TABLE IF NOT EXISTS otp_codes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(20) DEFAULT 'login',
    used BOOLEAN DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_email (email)
);

-- ============================================
-- THEMES AND PRODUCTS
-- ============================================

CREATE TABLE IF NOT EXISTS themes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    price DECIMAL(15,2) DEFAULT 0,
    original_price DECIMAL(15,2),
    image_url TEXT,
    demo_url TEXT,
    downloads INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);

-- ============================================
-- ORDERS AND TRANSACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    user_email VARCHAR(255) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (status)
);

CREATE TABLE IF NOT EXISTS order_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id CHAR(36) NOT NULL,
    theme_id CHAR(36),
    theme_name VARCHAR(255) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    quantity INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL,
    INDEX idx_order_items (order_id)
);

-- User downloads
CREATE TABLE IF NOT EXISTS user_downloads (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    order_id CHAR(36),
    theme_id CHAR(36),
    theme_name VARCHAR(255) NOT NULL,
    download_url TEXT,
    download_count INT DEFAULT 0,
    max_downloads INT DEFAULT 5,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL,
    INDEX idx_downloads_user (user_id)
);

-- ============================================
-- AFFILIATE SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    affiliate_user_id CHAR(36) NOT NULL,
    referred_user_id CHAR(36) NOT NULL,
    order_id CHAR(36),
    commission_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    FOREIGN KEY (affiliate_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_affiliate (affiliate_user_id)
);

-- ============================================
-- COUPONS
-- ============================================

CREATE TABLE IF NOT EXISTS coupons (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) DEFAULT 'percentage',
    discount_value DECIMAL(10,2) DEFAULT 0,
    min_order_amount DECIMAL(15,2) DEFAULT 0,
    max_discount_amount DECIMAL(15,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    starts_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- SUPPORT SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    user_phone VARCHAR(50),
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'normal',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tickets_user (user_id)
);

CREATE TABLE IF NOT EXISTS ticket_messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ticket_id CHAR(36) NOT NULL,
    sender_id CHAR(36),
    sender_type VARCHAR(20) DEFAULT 'user',
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_messages_ticket (ticket_id)
);

-- Admin notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'support',
    ticket_id CHAR(36),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE SET NULL
);

-- Chat ratings
CREATE TABLE IF NOT EXISTS chat_ratings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ticket_id CHAR(36),
    user_id CHAR(36),
    user_email VARCHAR(255),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    is_suspicious BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- CONTENT AND SETTINGS
-- ============================================

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    variables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    parent_id CHAR(36),
    title VARCHAR(255) NOT NULL,
    url TEXT,
    icon VARCHAR(50),
    menu_location VARCHAR(50) DEFAULT 'header',
    target VARCHAR(20) DEFAULT '_self',
    css_class VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE SET NULL
);

-- Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    preferences JSON DEFAULT ('{"tips": true, "coupons": true, "new_themes": true}'),
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    is_secret BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Check if user has specific role
CREATE FUNCTION IF NOT EXISTS has_role(p_user_id CHAR(36), p_role VARCHAR(20))
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE role_exists BOOLEAN;
    SELECT EXISTS(
        SELECT 1 FROM user_roles 
        WHERE user_id = p_user_id AND role = p_role
    ) INTO role_exists;
    RETURN role_exists;
END //

-- Check if user is admin
CREATE FUNCTION IF NOT EXISTS is_admin(p_user_id CHAR(36))
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    RETURN has_role(p_user_id, 'admin');
END //

-- Cleanup expired OTPs
CREATE PROCEDURE IF NOT EXISTS cleanup_expired_otps()
BEGIN
    DELETE FROM otp_codes WHERE expires_at < NOW();
END //

DELIMITER ;

-- ============================================
-- DEFAULT DATA
-- ============================================

INSERT IGNORE INTO settings (id, setting_key, setting_value, description) VALUES
    (UUID(), 'STORE_NAME', 'ThemeVN', 'Tên cửa hàng'),
    (UUID(), 'STORE_URL', 'https://themevn.com', 'URL cửa hàng'),
    (UUID(), 'FROM_EMAIL', 'noreply@themevn.com', 'Email gửi đi'),
    (UUID(), 'CURRENCY', 'VND', 'Đơn vị tiền tệ'),
    (UUID(), 'CURRENCY_SYMBOL', '₫', 'Ký hiệu tiền tệ');

INSERT IGNORE INTO email_templates (id, name, slug, subject, html_content, variables) VALUES
    (UUID(), 'Chào mừng Subscriber', 'welcome-subscriber', 'Chào mừng bạn đến với {{store_name}}!', 
     '<h1>Chào mừng!</h1><p>Cảm ơn bạn đã đăng ký nhận tin từ {{store_name}}.</p>', 
     '["store_name", "email"]');
