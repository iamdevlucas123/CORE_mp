CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE space_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  space_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner', 'member') DEFAULT 'owner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_space_members_space
    FOREIGN KEY (space_id) REFERENCES spaces(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_space_members_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  UNIQUE KEY uniq_space_member (space_id, user_id)
);

CREATE INDEX idx_space_members_user ON space_members(user_id);
