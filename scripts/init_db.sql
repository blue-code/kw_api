-- kw_api_db 데이터베이스가 존재하지 않으면 생성합니다.
CREATE DATABASE IF NOT EXISTS kw_api_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- kw_api_db 데이터베이스를 사용합니다.
USE kw_api_db;

-- items 테이블이 존재하면 삭제합니다 (개발 편의성을 위해).
-- 프로덕션 환경에서는 이 부분을 사용하지 않거나 주의해야 합니다.
DROP TABLE IF EXISTS items;

-- items 테이블을 생성합니다.
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INT, -- 아이템을 생성한 사용자 ID (선택 사항, authController의 user.id와 연결 가능)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (user_id) -- user_id에 대한 인덱스 추가 (선택 사항)
);

-- 예시 데이터 추가 (선택 사항)
-- INSERT INTO items (name, description, user_id) VALUES
-- ('첫 번째 아이템', '이것은 첫 번째 테스트 아이템입니다.', 1),
-- ('두 번째 아이템', '이것은 두 번째 테스트 아이템입니다.', 1),
-- ('다른 사용자의 아이템', '이것은 다른 사용자가 생성한 아이템입니다.', 2);

-- 사용자 테이블 (참고용, authController.js의 임시 사용자 데이터와 유사하게 구성 가능)
-- DROP TABLE IF EXISTS users;
-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(255) NOT NULL UNIQUE,
--     password_hash VARCHAR(255) NOT NULL, -- 실제로는 해시된 비밀번호 저장
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- INSERT INTO users (username, password_hash) VALUES ('user1', 'hashed_password1');
-- INSERT INTO users (username, password_hash) VALUES ('user2', 'hashed_password2');

-- 만약 items 테이블에 user_id 외래 키 제약 조건을 추가하고 싶다면:
-- ALTER TABLE items
-- ADD CONSTRAINT fk_user_id
-- FOREIGN KEY (user_id) REFERENCES users(id)
-- ON DELETE SET NULL; -- 사용자가 삭제될 경우 아이템의 user_id를 NULL로 설정하거나, ON DELETE CASCADE로 아이템도 함께 삭제

SELECT '데이터베이스 및 테이블 초기화 완료.' AS message;
