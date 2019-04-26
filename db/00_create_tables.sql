-- Query to create the tables for the database

CREATE TABLE regions (
    id INT AUTO_INCREMENT,
    region_name VARCHAR(255) NOT NULL UNIQUE,
    PRIMARY KEY (id)
) ENGINE=INNODB;

CREATE TABLE departments(
    id INT AUTO_INCREMENT,
    department_name VARCHAR(255) NOT NULL UNIQUE,
    PRIMARY KEY (id)
) ENGINE=INNODB;

CREATE TABLE users(
    id INT AUTO_INCREMENT,
    email VARCHAR(256) NOT NULL UNIQUE, -- 256 is max length an email address can be per RFC spec
    password VARCHAR(128) NOT NULL,
    salt VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_on DATETIME NOT NULL,
    is_admin TINYINT(1) NOT NULL,
    signature MEDIUMBLOB,
    region_id INT,
    department_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY fk_region(region_id) REFERENCES regions(id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY fk_department(department_id) REFERENCES departments(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=INNODB;

CREATE TABLE sessions(
    id VARCHAR(16),
    user_id INT NOT NULL UNIQUE,
    expires DATETIME NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY fk_user_session(user_id) REFERENCES users(id) ON UPDATE RESTRICT ON DELETE CASCADE
) ENGINE=INNODB;

CREATE TABLE certificates(
    id INT AUTO_INCREMENT,
    certificate_type VARCHAR(255) NOT NULL UNIQUE,
    background_image MEDIUMBLOB NOT NULL,
    PRIMARY KEY (id)
) ENGINE=INNODB;

CREATE TABLE awards(
    id INT AUTO_INCREMENT,
    certificate_id INT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(256) NOT NULL,
    recipient_department_id INT NOT NULL,
    recipient_region_id INT NOT NULL,
    presenter_id INT NOT NULL,
    sent_on DATETIME NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY fk_certificate(certificate_id) REFERENCES certificates(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY fk_user_award(presenter_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY fk_recipient_department(recipient_department_id) REFERENCES departments(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY fk_recipient_region(recipient_region_id) REFERENCES regions(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=INNODB;
