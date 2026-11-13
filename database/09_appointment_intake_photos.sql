-- Additive migration: preserves all existing appointments and workshop data.
CREATE TABLE IF NOT EXISTS appointment_intake_photos (
  photo_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  appointment_id INT UNSIGNED NOT NULL,
  uploaded_by INT UNSIGNED NOT NULL,
  uploaded_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  original_name VARCHAR(120) NOT NULL,
  caption VARCHAR(250) NOT NULL DEFAULT '',
  mime_type VARCHAR(30) NOT NULL,
  byte_size INT UNSIGNED NOT NULL,
  sha256 CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  image_data MEDIUMBLOB NOT NULL,
  UNIQUE KEY uk_intake_photo_content (appointment_id, sha256),
  CONSTRAINT fk_intake_photo_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE RESTRICT,
  CONSTRAINT fk_intake_photo_staff FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Append-only vehicle condition photographs recorded before workshop work starts';
