-- Create database
CREATE DATABASE IF NOT EXISTS collegedata;
USE collegedata;

-- =========================
-- admin
-- =========================
CREATE TABLE admin (
                       collagename VARCHAR(50),
                       address VARCHAR(100),
                       emailid VARCHAR(50),
                       contactnumber VARCHAR(40),
                       website VARCHAR(30),
                       lastlogin VARCHAR(40),
                       password VARCHAR(255),
                       facebook VARCHAR(100),
                       instagram VARCHAR(100),
                       twitter VARCHAR(100),
                       linkedin VARCHAR(100),
                       logo VARCHAR(255),
                       activestatus TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- attendance
-- =========================
CREATE TABLE attendance (
                            subjectcode VARCHAR(30),
                            date VARCHAR(30),
                            rollnumber BIGINT,
                            present TINYINT DEFAULT 0,
                            courcecode VARCHAR(20),
                            semoryear INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- chat
-- =========================
CREATE TABLE chat (
                      sr_no INT NOT NULL AUTO_INCREMENT,
                      fromuserid VARCHAR(70),
                      fromusername VARCHAR(50),
                      touserid VARCHAR(70),
                      message TEXT,
                      messagetime VARCHAR(20),
                      messagedate VARCHAR(40),
                      readby TEXT,
                      PRIMARY KEY (sr_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- courses
-- =========================
CREATE TABLE courses (
                         id INT NOT NULL AUTO_INCREMENT,
                         course_code VARCHAR(20) NOT NULL,
                         course_name VARCHAR(100) NOT NULL,
                         total_semesters INT NOT NULL,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- faculties
-- =========================
CREATE TABLE faculties (
                           sr_no INT NOT NULL AUTO_INCREMENT,
                           facultyid INT,
                           facultyname VARCHAR(30),
                           state VARCHAR(30),
                           city VARCHAR(30),
                           emailid VARCHAR(50),
                           contactnumber VARCHAR(20),
                           qualification VARCHAR(30),
                           experience VARCHAR(30),
                           birthdate VARCHAR(30),
                           gender VARCHAR(10),
                           profilepic VARCHAR(255),
                           courcecode VARCHAR(20) DEFAULT 'NOT ASSIGNED',
                           semoryear INT DEFAULT 0,
                           subject VARCHAR(40) DEFAULT 'NOT ASSIGNED',
                           position VARCHAR(40) DEFAULT 'NOT ASSIGNED',
                           lastlogin VARCHAR(100),
                           password VARCHAR(255),
                           activestatus TINYINT DEFAULT 0,
                           joineddate VARCHAR(50),
                           PRIMARY KEY (sr_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- marks
-- =========================
CREATE TABLE marks (
                       courcecode VARCHAR(20),
                       semoryear INT,
                       subjectcode VARCHAR(20),
                       subjectname VARCHAR(40),
                       rollnumber BIGINT,
                       theorymarks INT,
                       practicalmarks INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- notification
-- =========================
CREATE TABLE notification (
                              sr_no INT NOT NULL AUTO_INCREMENT,
                              userprofile VARCHAR(30),
                              courcecode VARCHAR(30),
                              semoryear INT,
                              userid VARCHAR(30),
                              title VARCHAR(100),
                              message VARCHAR(1000),
                              time VARCHAR(100),
                              readby TEXT,
                              PRIMARY KEY (sr_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- result
-- =========================
CREATE TABLE result (
                        courcecode VARCHAR(30),
                        semoryear INT,
                        isdeclared TINYINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- rollgenerator
-- =========================
CREATE TABLE rollgenerator (
                               courcecode VARCHAR(20),
                               semoryear INT,
                               rollnumber BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- students
-- =========================
CREATE TABLE students (
                          sr_no INT NOT NULL AUTO_INCREMENT,
                          Courcecode VARCHAR(20),
                          semoryear INT,
                          rollnumber BIGINT,
                          optionalsubject VARCHAR(30),
                          firstname VARCHAR(20),
                          lastname VARCHAR(20),
                          emailid VARCHAR(50),
                          contactnumber VARCHAR(20),
                          dateofbirth VARCHAR(15),
                          gender VARCHAR(10),
                          state VARCHAR(30),
                          city VARCHAR(30),
                          fathername VARCHAR(20),
                          fatheroccupation VARCHAR(30),
                          mothername VARCHAR(30),
                          motheroccupation VARCHAR(30),
                          profilepic VARCHAR(255),
                          lastlogin VARCHAR(100),
                          userid VARCHAR(50),
                          password VARCHAR(255),
                          activestatus TINYINT DEFAULT 0,
                          admissiondate VARCHAR(50),
                          PRIMARY KEY (sr_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- subject
-- =========================
CREATE TABLE subject (
                         subjectcode VARCHAR(20) UNIQUE,
                         subjectname VARCHAR(50),
                         courcecode VARCHAR(20),
                         semoryear INT,
                         subjecttype VARCHAR(30),
                         theorymarks INT,
                         practicalmarks INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- Insert admin record
-- =========================
INSERT INTO admin
(collagename, address, emailid, contactnumber, website, lastlogin, password, facebook, instagram, twitter, linkedin, logo, activestatus)
VALUES
    ('Government College of Engineering, Keonjhar',
     'Jamunalia, Keonjhar, Odisha',
     'admin@college.com',
     '00000000000',
     'http://geckjr.ac.in',
     '2026-02-21T19:07:11.557Z',
     '$2b$10$xFSYc3K9puHYFTLvz15aA.kP4hpVhQg4vrvTVU6KeGsxQWQCJXkIG',
     'https://facebook.com/gcekjr',
     'https://instagram.com/gcekjr',
     'https://x.com/gcekjr',
     'https://linkedin.com/gcekjr',
     '/uploads/1771696634307.jpg',
     0);