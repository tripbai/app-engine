CREATE TABLE IF NOT EXISTS default_features (
  `id` INT NOT NULL AUTO_INCREMENT,
  `entity_id` CHAR(32) NOT NULL UNIQUE,
  `key` VARCHAR(32) NOT NULL,
  `value` VARCHAR(64) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `package_id` CHAR(32) NOT NULL,
  `description` VARCHAR(256),
  `featurable_entity_id` CHAR(32),
  `org_mutable` BOOLEAN NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `archived_at` TIMESTAMP NULL,
  FOREIGN KEY (package_id) REFERENCES packages(entity_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS feature_overrides (
  `id` INT NOT NULL AUTO_INCREMENT,
  `entity_id` CHAR(32) NOT NULL UNIQUE,
  `key` VARCHAR(32) NOT NULL,
  `value` VARCHAR(64) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `package_id` CHAR(32) NOT NULL,
  `description` VARCHAR(256),
  `featurable_entity_id` CHAR(32),
  `org_mutable` BOOLEAN NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `archived_at` TIMESTAMP NULL,
  FOREIGN KEY (package_id) REFERENCES packages(entity_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  PRIMARY KEY (id)
);