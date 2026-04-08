-- graduation_invitation.sql
CREATE DATABASE IF NOT EXISTS graduation_invitation;
USE graduation_invitation;

-- 1. Bảng admins: Tạo trước để làm khóa ngoại
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- 2. Bảng invitations: Đã gộp các cột cần thiết
CREATE TABLE IF NOT EXISTS invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT, -- Thêm trực tiếp ở đây
    name VARCHAR(255) NOT NULL UNIQUE, 
    cover_image VARCHAR(255) NULL,
    card_image VARCHAR(255) NOT NULL,
    scare BOOLEAN DEFAULT FALSE,
    video_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Thiết lập khóa ngoại để bảo vệ dữ liệu
    CONSTRAINT fk_invitation_owner FOREIGN KEY (owner_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- 3. Chèn dữ liệu Admin (Lưu ý: nên hash password ở code ứng dụng)
INSERT INTO admins (username, password_hash) 
VALUES ('admin_demo_1', 'change-me-before-production'), 
       ('admin_demo_2', 'change-me-before-production')
ON DUPLICATE KEY UPDATE username=username;

-- 4. Cập nhật chủ sở hữu mặc định cho các thiệp chưa có chủ
UPDATE invitations
SET owner_id = (SELECT id FROM admins WHERE username = 'admin_demo_1' LIMIT 1)
WHERE owner_id IS NULL;

ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS public_slug VARCHAR(80) NULL AFTER owner_id;

ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS note TEXT NULL AFTER name;

ALTER TABLE invitations
DROP INDEX name;

ALTER TABLE invitations
ADD UNIQUE INDEX owner_name_unique (owner_id, name);

CREATE TABLE IF NOT EXISTS wishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invitation_id INT NOT NULL,
    sender_name VARCHAR(255) NULL,
    message TEXT NULL,
    image_url VARCHAR(255) NULL,
    video_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishes_invitation
      FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);
