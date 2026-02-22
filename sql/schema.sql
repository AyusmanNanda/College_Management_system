BEGIN TRANSACTION;

--------------------------------------------------
-- ADMIN
--------------------------------------------------

CREATE TABLE admin (
                       collagename VARCHAR(50),
                       address VARCHAR(100),
                       emailid VARCHAR(50),
                       contactnumber VARCHAR(40),
                       website VARCHAR(100),
                       lastlogin VARCHAR(40),
                       password VARCHAR(255),
                       facebook VARCHAR(100),
                       instagram VARCHAR(100),
                       twitter VARCHAR(100),
                       linkedin VARCHAR(100),
                       logo VARCHAR(255),
                       activestatus INTEGER DEFAULT 0
);

INSERT INTO admin VALUES (
                             'Government College of Engineering, Keonjhar',
                             'Jamunalia, Keonjhar, Odisha',
                             'admin@gcekjr.ac.in',
                             '00000000000',
                             'http://geckjr.ac.in',
                             '2026-02-22T10:13:36.075Z',
                             '$2b$10$DLdljUn/zIMIzYer4rU8m.MaMweTY2ggRpPwonWDNvj7KV7S9cl5m',
                             'https://facebook.com/gcekjr',
                             'https://instagram.com/gcekjr',
                             'https://x.com/gcekjr',
                             'https://linkedin.com/gcekjr',
                             '/uploads/1771738447938.jpg',
                             1
                         );

--------------------------------------------------
-- COURSES
--------------------------------------------------

CREATE TABLE courses (
                         id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                         course_code VARCHAR(20) UNIQUE NOT NULL,
                         course_name VARCHAR(100) UNIQUE NOT NULL,
                         total_semesters INTEGER NOT NULL,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         sem_or_year VARCHAR(10) DEFAULT 'sem'
);

INSERT INTO courses (course_code, course_name, total_semesters, sem_or_year)
VALUES
    ('BTECHCSE','CSE',8,'sem'),
    ('BTECHCE','CE',8,'sem'),
    ('BTECHEE','EE',8,'sem'),
    ('BTECHMME','MME',8,'sem');

--------------------------------------------------
-- FACULTIES
--------------------------------------------------

CREATE TABLE faculties (
                           sr_no INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                           facultyid INTEGER,
                           facultyname VARCHAR(50),
                           state VARCHAR(50),
                           city VARCHAR(50),
                           emailid VARCHAR(100) UNIQUE,
                           contactnumber VARCHAR(20),
                           qualification VARCHAR(50),
                           experience VARCHAR(50),
                           birthdate VARCHAR(30),
                           gender VARCHAR(10),
                           profilepic VARCHAR(255),
                           courcecode VARCHAR(20) DEFAULT 'NOT ASSIGNED',
                           semoryear INTEGER DEFAULT 0,
                           subject VARCHAR(50) DEFAULT 'NOT ASSIGNED',
                           position VARCHAR(50) DEFAULT 'NOT ASSIGNED',
                           lastlogin VARCHAR(100),
                           password VARCHAR(255),
                           activestatus INTEGER DEFAULT 0,
                           joineddate VARCHAR(50)
);

INSERT INTO faculties (facultyid, facultyname, state, city, emailid,
                       contactnumber, qualification, experience, birthdate, gender, profilepic,
                       password)
VALUES
    (23011040,'Muna Samal','Odisha','Keonjhar','muna@gcekjr.ac.in',
     '00000000000','M.Tech','10 Yrs','2005-02-12','Male',
     '1771757222471-IMG_20250514_225859_485.jpg',
     '$2b$10$57k9twGrTS3gMX.g6QcUYOJylQTXE6.Val5V7fJ.LNcgYAf3gSkka'),

    (23011041,'Ayusman','Odisha','Keonjhar','faculty1@gcekjr.ac.in',
     '00000000000','M.Tech','10 Yrs','2004-10-05','Male',
     '1771757746884-IMG_20250514_225922_626.jpg',
     '$2b$10$JBzAW2/VmgydNE233e4RquJfr3DTEDygQK6t7Q5pfR8K8LWLlMdr6');

--------------------------------------------------
-- STUDENTS
--------------------------------------------------

CREATE TABLE students (
                          sr_no INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          Courcecode VARCHAR(20),
                          semoryear INTEGER,
                          rollnumber BIGINT,
                          optionalsubject VARCHAR(30),
                          firstname VARCHAR(30),
                          lastname VARCHAR(30),
                          emailid VARCHAR(100),
                          contactnumber VARCHAR(20),
                          dateofbirth VARCHAR(20),
                          gender VARCHAR(10),
                          state VARCHAR(50),
                          city VARCHAR(50),
                          fathername VARCHAR(50),
                          fatheroccupation VARCHAR(50),
                          mothername VARCHAR(50),
                          motheroccupation VARCHAR(50),
                          profilepic VARCHAR(255),
                          lastlogin VARCHAR(100),
                          userid VARCHAR(50),
                          password VARCHAR(255),
                          activestatus INTEGER DEFAULT 0,
                          admissiondate VARCHAR(50)
);

INSERT INTO students (Courcecode, semoryear, rollnumber, optionalsubject,
                      firstname, lastname, emailid, contactnumber, dateofbirth, gender,
                      state, city, fathername, fatheroccupation, mothername,
                      motheroccupation, profilepic, lastlogin, userid, password,
                      activestatus, admissiondate)
VALUES
    ('BCA2024',1,2401001,'Mathematics','Aman','Sharma',
     'student@gcekjr.ac.in','9876543210','2005-06-15','Male',
     'Odisha','Bhubaneswar','Rajesh Sharma','Businessman',
     'Sunita Sharma','Teacher','profile.jpg',
     '2026-02-22T10:11:17.424Z','studet',
     '$2b$10$QLkOcQHQ/oQUwRfRZ6kzkuWdQTeZor9chIrVhIcjvssaUce4546O6',
     1,'2026-02-01');

--------------------------------------------------
-- SUBJECT
--------------------------------------------------

CREATE TABLE subject (
                         subjectcode VARCHAR(20) PRIMARY KEY,
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

--------------------------------------------------

COMMIT;