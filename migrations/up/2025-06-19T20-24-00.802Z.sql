CREATE TABLE IF NOT EXISTS stores (
  `id` INT NOT NULL AUTO_INCREMENT,
  `entity_id` CHAR(32) NOT NULL UNIQUE,
  `organization_id` CHAR(32) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `profile_photo_src` VARCHAR(360),
  `cover_photo_src` VARCHAR(360),
  `package_id` CHAR(32) NOT NULL,
  `about` VARCHAR(320),
  `language` VARCHAR(12) NOT NULL,
  `location_id` VARCHAR(32),
  `secret_key` VARCHAR(64) NOT NULL,
  `status` VARCHAR(12) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `archived_at` TIMESTAMP NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(entity_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (package_id) REFERENCES packages(entity_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  PRIMARY KEY (id)
);