-- =====================================================
-- College Management System - Web Version
-- Clean Production-Ready Schema
-- Database: collegedata
-- =====================================================

DROP DATABASE IF EXISTS collegedata;
CREATE DATABASE collegedata;
USE collegedata;

-- =====================================================
-- USERS (Central Authentication Table)
-- =====================================================

CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL, -- bcrypt hashed
                       role ENUM('admin', 'faculty', 'student') NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- COURSES
-- =====================================================

CREATE TABLE courses (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         course_code VARCHAR(20) UNIQUE NOT NULL,
                         course_name VARCHAR(100) NOT NULL,
                         total_semesters INT NOT NULL,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STUDENTS
-- =====================================================

CREATE TABLE students (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          user_id INT NOT NULL,
                          roll_number BIGINT UNIQUE NOT NULL,
                          course_id INT,
                          semester INT,
                          first_name VARCHAR(50),
                          last_name VARCHAR(50),
                          gender VARCHAR(10),
                          contact_number VARCHAR(20),
                          admission_date DATE,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- =====================================================
-- FACULTIES
-- =====================================================

CREATE TABLE faculties (
                           id INT AUTO_INCREMENT PRIMARY KEY,
                           user_id INT NOT NULL,
                           faculty_name VARCHAR(100),
                           qualification VARCHAR(100),
                           experience VARCHAR(50),
                           joined_date DATE,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- SUBJECTS
-- =====================================================

CREATE TABLE subjects (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          subject_code VARCHAR(20) UNIQUE NOT NULL,
                          subject_name VARCHAR(100) NOT NULL,
                          course_id INT,
                          semester INT,
                          theory_marks INT,
                          practical_marks INT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- =====================================================
-- ATTENDANCE
-- =====================================================

CREATE TABLE attendance (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            student_id INT NOT NULL,
                            subject_id INT NOT NULL,
                            attendance_date DATE NOT NULL,
                            status ENUM('present', 'absent') NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,

                            UNIQUE(student_id, subject_id, attendance_date)
);

-- =====================================================
-- MARKS
-- =====================================================

CREATE TABLE marks (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       student_id INT NOT NULL,
                       subject_id INT NOT NULL,
                       theory_marks INT,
                       practical_marks INT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                       FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                       FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,

                       UNIQUE(student_id, subject_id)
);

-- =====================================================
-- COLLEGE INFO (Optional)
-- =====================================================

CREATE TABLE college_info (
                              id INT AUTO_INCREMENT PRIMARY KEY,
                              college_name VARCHAR(100),
                              address VARCHAR(255),
                              email VARCHAR(100),
                              contact_number VARCHAR(30),
                              website VARCHAR(100),
                              logo VARCHAR(255),
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DEFAULT ADMIN USER
-- Password: admin123 (temporary plain text)
-- =====================================================

INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@college.com', 'admin123', 'admin');
