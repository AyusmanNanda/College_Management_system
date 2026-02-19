-- =====================================================
-- College Management System (Strict Migration Version)
-- Source of Truth: Testing Java Project
-- Database: collegedata
-- =====================================================

DROP DATABASE IF EXISTS collegedata;
CREATE DATABASE collegedata;
USE collegedata;

-- =====================================================
-- ADMIN TABLE (Single Admin System)
-- =====================================================

CREATE TABLE admin (
                       collagename VARCHAR(50),
                       address VARCHAR(100),
                       emailid VARCHAR(50),
                       contactnumber VARCHAR(40),
                       website VARCHAR(30),
                       lastlogin VARCHAR(40),
                       password VARCHAR(255), -- bcrypt hashed
                       facebook VARCHAR(100),
                       instagram VARCHAR(100),
                       twitter VARCHAR(100),
                       linkedin VARCHAR(100),
                       logo VARCHAR(255), -- store file path
                       activestatus TINYINT DEFAULT 0
);

-- Default Admin (Password will be hashed later)
INSERT INTO admin (
    collagename,
    address,
    emailid,
    contactnumber,
    website,
    password,
    activestatus
)
VALUES (
           'Government College Of Engineering',
           'Default Address',
           'admin@college.com',
           '1234567890',
           'https://college.com',
           'admin123',
           0
       );

-- =====================================================
-- COURSES
-- =====================================================

CREATE TABLE cources (
                         sr_no INT AUTO_INCREMENT PRIMARY KEY,
                         Courcecode VARCHAR(20),
                         CourceName VARCHAR(30),
                         semoryear VARCHAR(5),
                         totalsemoryear INT
);

-- =====================================================
-- STUDENTS
-- =====================================================

CREATE TABLE students (
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
                          sr_no INT AUTO_INCREMENT PRIMARY KEY,
                          lastlogin VARCHAR(100),
                          userid VARCHAR(50),
                          password VARCHAR(255),
                          activestatus TINYINT DEFAULT 0,
                          admissiondate VARCHAR(50)
);

-- =====================================================
-- FACULTIES
-- =====================================================

CREATE TABLE faculties (
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
                           sr_no INT AUTO_INCREMENT PRIMARY KEY,
                           lastlogin VARCHAR(100),
                           password VARCHAR(255),
                           activestatus TINYINT DEFAULT 0,
                           joineddate VARCHAR(50)
);

-- =====================================================
-- SUBJECTS
-- =====================================================

CREATE TABLE subject (
                         subjectcode VARCHAR(20) UNIQUE,
                         subjectname VARCHAR(50),
                         courcecode VARCHAR(20),
                         semoryear INT,
                         subjecttype VARCHAR(30),
                         theorymarks INT,
                         practicalmarks INT
);

-- =====================================================
-- ATTENDANCE
-- =====================================================

CREATE TABLE attandance (
                            subjectcode VARCHAR(30),
                            date VARCHAR(30),
                            rollnumber BIGINT,
                            present TINYINT DEFAULT 0,
                            courcecode VARCHAR(20),
                            semoryear INT
);

-- =====================================================
-- MARKS
-- =====================================================

CREATE TABLE marks (
                       courcecode VARCHAR(20),
                       semoryear INT,
                       subjectcode VARCHAR(20),
                       subjectname VARCHAR(40),
                       rollnumber BIGINT,
                       theorymarks INT,
                       practicalmarks INT
);

-- =====================================================
-- RESULT DECLARATION
-- =====================================================

CREATE TABLE result (
                        courcecode VARCHAR(30),
                        semoryear INT,
                        isdeclared TINYINT
);

-- =====================================================
-- ROLL GENERATOR
-- =====================================================

CREATE TABLE rollgenerator (
                               courcecode VARCHAR(20),
                               semoryear INT,
                               rollnumber BIGINT
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notification (
                              sr_no INT AUTO_INCREMENT PRIMARY KEY,
                              userprofile VARCHAR(30),
                              courcecode VARCHAR(30),
                              semoryear INT,
                              userid VARCHAR(30),
                              title VARCHAR(100),
                              message VARCHAR(1000),
                              time VARCHAR(100),
                              readby TEXT
);

-- =====================================================
-- CHAT SYSTEM
-- =====================================================

CREATE TABLE chat (
                      sr_no INT AUTO_INCREMENT PRIMARY KEY,
                      fromuserid VARCHAR(70),
                      fromusername VARCHAR(50),
                      touserid VARCHAR(70),
                      message TEXT,
                      messagetime VARCHAR(20),
                      messagedate VARCHAR(40),
                      readby TEXT
);
