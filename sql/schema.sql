-- =========================================
-- Database Schema: collegedata
-- Generated: 2026-02-22
-- =========================================

BEGIN TRANSACTION;

-- Standard settings
SET TIME ZONE 'UTC';
SET NAMES 'UTF8';


-- ========================
-- TABLE: admin
-- ========================

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
                       activestatus SMALLINT DEFAULT 0
);

INSERT INTO admin VALUES (
                             'Government College of Engineering, Keonjhar',
                             'Jamunalia, Keonjhar, Odisha ',
                             'admin@gcekjr.ac.in',
                             '8249823670',
                             'http://geckjr.ac.in',
                             '2026-02-22T10:13:36.075Z',
                             '$2b$10$DLdljUn/zIMIzYer4rU8m.MaMweTY2ggRpPwonWDNvj7KV7S9cl5m',
                             'https://facebook.com/gcekjr',
                             'https://instagram.com/gcekjr',
                             'https://x.com/gcekjr',
                             'https://linkedin.com/gcekjr ',
                             '/uploads/1771738447938.jpg',
                             0
                         );


-- ========================
-- TABLE: attandance
-- ========================

CREATE TABLE attandance (
                            subjectcode VARCHAR(30),
                            date VARCHAR(30),
                            rollnumber BIGINT,
                            present SMALLINT DEFAULT 0,
                            courcecode VARCHAR(20),
                            semoryear INTEGER
);


-- ========================
-- TABLE: chat
-- ========================

CREATE TABLE chat (
                      sr_no INTEGER PRIMARY KEY,
                      fromuserid VARCHAR(70),
                      fromusername VARCHAR(50),
                      touserid VARCHAR(70),
                      message TEXT,
                      messagetime VARCHAR(20),
                      messagedate VARCHAR(40),
                      readby TEXT
);


-- ========================
-- TABLE: courses
-- ========================

CREATE TABLE courses (
                         id INTEGER PRIMARY KEY,
                         course_code VARCHAR(20) NOT NULL UNIQUE,
                         course_name VARCHAR(100) NOT NULL UNIQUE,
                         total_semesters INTEGER NOT NULL,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         sem_or_year VARCHAR(10) DEFAULT 'sem'
);

INSERT INTO courses VALUES
                        (3,'BTECHCSE','CSE',8,'2026-02-22 08:32:25','2026-02-22 08:32:25','sem'),
                        (4,'BTECHCE','CE',8,'2026-02-22 08:32:44','2026-02-22 08:32:44','sem'),
                        (5,'BTECHEE','EE',8,'2026-02-22 08:36:38','2026-02-22 08:36:38','sem'),
                        (6,'BTECHMME','MME',8,'2026-02-22 08:37:18','2026-02-22 08:37:18','sem');


-- ========================
-- TABLE: faculties
-- ========================

CREATE TABLE faculties (
                           facultyid INTEGER,
                           facultyname VARCHAR(30),
                           state VARCHAR(30),
                           city VARCHAR(30),
                           emailid VARCHAR(50) UNIQUE,
                           contactnumber VARCHAR(20),
                           qualification VARCHAR(30),
                           experience VARCHAR(30),
                           birthdate VARCHAR(30),
                           gender VARCHAR(10),
                           profilepic VARCHAR(255),
                           courcecode VARCHAR(20) DEFAULT 'NOT ASSIGNED',
                           semoryear INTEGER DEFAULT 0,
                           subject VARCHAR(40) DEFAULT 'NOT ASSIGNED',
                           position VARCHAR(40) DEFAULT 'NOT ASSIGNED',
                           sr_no INTEGER PRIMARY KEY,
                           lastlogin VARCHAR(100),
                           password VARCHAR(255),
                           activestatus SMALLINT DEFAULT 0,
                           joineddate VARCHAR(50)
);

INSERT INTO faculties VALUES
                          (23011040,'Faculty1','Odisha','Keonjhar','faculty1@gcekjr.ac.in','9876543210','M.Tech','10 Yrs','2000-06-22','Male','default.png','NOT ASSIGNED',0,'NOT ASSIGNED','NOT ASSIGNED',2,NULL,'$2b$10$57k9twGrTS3gMX.g6QcUYOJylQTXE6.Val5V7fJ.LNcgYAf3gSkka',0,NULL),
                          (23011041,'Faculty2','Odisha','Keonjhar','faculty2@gcekjr.ac.in','9876543210','M.Tech','10 Yrs','2002-10-01','Male','default.png','NOT ASSIGNED',0,'NOT ASSIGNED','NOT ASSIGNED',3,NULL,'$2b$10$JBzAW2/VmgydNE233e4RquJfr3DTEDygQK6t7Q5pfR8K8LWLlMdr6',0,NULL);


-- ========================
-- TABLE: students
-- ========================

CREATE TABLE students (
                          Courcecode VARCHAR(20),
                          semoryear INTEGER,
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
                          sr_no INTEGER PRIMARY KEY,
                          lastlogin VARCHAR(100),
                          userid VARCHAR(50),
                          password VARCHAR(255),
                          activestatus SMALLINT DEFAULT 0,
                          admissiondate VARCHAR(50)
);

INSERT INTO students VALUES
    ('BCA2024',1,2401001,'Mathematics','Aman','Sharma','student@gcekjr.ac.in','9876543210','2005-06-15','Male','Odisha','Bhubaneswar','Rajesh Sharma','Businessman','Sunita Sharma','Teacher','rofile.jpg',2,'2026-02-22T10:11:17.424Z','studet','$2b$10$QLkOcQHQ/oQUwRfRZ6kzkuWdQTeZor9chIrVhIcjvssaUce4546O6',1,'2026-02-01');


-- ========================
-- TABLE: subject
-- ========================

CREATE TABLE subject (
                         subjectcode VARCHAR(20) UNIQUE,
                         subjectname VARCHAR(50),
                         courcecode VARCHAR(20),
                         semoryear INTEGER,
                         subjecttype VARCHAR(30),
                         theorymarks INTEGER,
                         practicalmarks INTEGER
);

INSERT INTO subject VALUES
                        ('CSPC3002','OS','BTECHCSE',1,'core',100,50),
                        ('CSPC3003','AIML','BTECHCSE',1,'core',100,50),
                        ('CSPC3005','IOT','BTECHCSE',2,'core',100,50);


COMMIT;