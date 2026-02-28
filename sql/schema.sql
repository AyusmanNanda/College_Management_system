-- MariaDB/MySQL Compatible Database Dump
-- Database: collegedata
-- Compatible with both MariaDB and MySQL
-- Generated from original MariaDB dump

-- Disable checks for faster import
SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT;
SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS;
SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION;
SET NAMES utf8mb4;
SET @OLD_TIME_ZONE=@@TIME_ZONE;
SET TIME_ZONE='+00:00';
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
                         `collagename` varchar(50) DEFAULT NULL,
                         `address` varchar(100) DEFAULT NULL,
                         `emailid` varchar(50) DEFAULT NULL,
                         `contactnumber` varchar(40) DEFAULT NULL,
                         `website` varchar(30) DEFAULT NULL,
                         `lastlogin` varchar(40) DEFAULT NULL,
                         `password` varchar(255) DEFAULT NULL,
                         `facebook` varchar(100) DEFAULT NULL,
                         `instagram` varchar(100) DEFAULT NULL,
                         `twitter` varchar(100) DEFAULT NULL,
                         `linkedin` varchar(100) DEFAULT NULL,
                         `logo` varchar(255) DEFAULT NULL,
                         `activestatus` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
INSERT INTO `admin` VALUES
    ('Government College of Engineering, Keonjhar','Jamunalia, Keonjhar, Odisha ','admin@gcekjr.ac.in','0000000000','http://geckjr.ac.in','2026-02-26T14:13:12.271Z','$2b$10$FoHLLo5wyNZzU6tYuy6ao.WL/EVGkF9nQkLJcuK5gvdvAEdWWygAC','https://facebook.com/gcekjr','https://instagram.com/gcekjr','https://x.com/gcekjr','https://linkedin.com/gcekjr ','/uploads/admin/admin.jpg',1);
UNLOCK TABLES;

--
-- Table structure for table `attandance`
--

DROP TABLE IF EXISTS `attandance`;
CREATE TABLE `attandance` (
                              `subjectcode` varchar(30) DEFAULT NULL,
                              `date` varchar(30) DEFAULT NULL,
                              `rollnumber` bigint(20) DEFAULT NULL,
                              `present` tinyint(4) DEFAULT 0,
                              `courcecode` varchar(20) DEFAULT NULL,
                              `semoryear` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attandance`
--

LOCK TABLES `attandance` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `chat`
--

DROP TABLE IF EXISTS `chat`;
CREATE TABLE `chat` (
                        `sr_no` int(11) NOT NULL AUTO_INCREMENT,
                        `fromuserid` varchar(70) DEFAULT NULL,
                        `fromusername` varchar(50) DEFAULT NULL,
                        `touserid` varchar(70) DEFAULT NULL,
                        `message` text DEFAULT NULL,
                        `messagetime` varchar(20) DEFAULT NULL,
                        `messagedate` varchar(40) DEFAULT NULL,
                        `readby` text DEFAULT NULL,
                        PRIMARY KEY (`sr_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat`
--

LOCK TABLES `chat` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
                           `id` int(11) NOT NULL AUTO_INCREMENT,
                           `course_code` varchar(20) NOT NULL,
                           `course_name` varchar(100) NOT NULL,
                           `total_semesters` int(11) NOT NULL,
                           `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                           `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                           `sem_or_year` enum('sem','year') NOT NULL DEFAULT 'sem',
                           PRIMARY KEY (`id`),
                           UNIQUE KEY `course_code` (`course_code`),
                           UNIQUE KEY `course_name` (`course_name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
INSERT INTO `courses` VALUES
                          (9,'CSE','Computer Science & Engineering',8,'2026-02-25 12:32:58','2026-02-25 12:32:58','sem'),
                          (10,'IT','Information Technology',8,'2026-02-25 12:33:26','2026-02-25 12:33:26','sem'),
                          (14,'CPPC2004','Mathematics',8,'2026-02-26 12:28:45','2026-02-26 12:28:45','sem');
UNLOCK TABLES;

--
-- Table structure for table `faculties`
--

DROP TABLE IF EXISTS `faculties`;
CREATE TABLE `faculties` (
                             `facultyid` int(11) NOT NULL,
                             `facultyname` varchar(30) DEFAULT NULL,
                             `state` varchar(30) DEFAULT NULL,
                             `city` varchar(30) DEFAULT NULL,
                             `emailid` varchar(50) DEFAULT NULL,
                             `contactnumber` varchar(20) DEFAULT NULL,
                             `qualification` varchar(30) DEFAULT NULL,
                             `experience` varchar(30) DEFAULT NULL,
                             `birthdate` varchar(30) DEFAULT NULL,
                             `gender` varchar(10) DEFAULT NULL,
                             `profilepic` varchar(255) DEFAULT NULL,
                             `courcecode` varchar(20) DEFAULT 'NOT ASSIGNED',
                             `semoryear` int(11) DEFAULT 0,
                             `subject` varchar(40) DEFAULT 'NOT ASSIGNED',
                             `position` varchar(40) DEFAULT 'NOT ASSIGNED',
                             `sr_no` int(11) NOT NULL AUTO_INCREMENT,
                             `lastlogin` varchar(100) DEFAULT NULL,
                             `password` varchar(255) DEFAULT NULL,
                             `activestatus` tinyint(4) DEFAULT 0,
                             `joineddate` varchar(50) DEFAULT NULL,
                             PRIMARY KEY (`sr_no`),
                             UNIQUE KEY `facultyid` (`facultyid`),
                             UNIQUE KEY `sr_no` (`sr_no`),
                             UNIQUE KEY `emailid` (`emailid`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculties`
--

LOCK TABLES `faculties` WRITE;
INSERT INTO `faculties` VALUES
                            (23011050,'John Doe','Odisha','Bhubaneswar','john@example.com','9876543210','MCA','5 Years','2000-02-01','Male','default.png','CSE',1,'CSE002','Assistant Professor',59,NULL,'$2b$10$AqWOEMWcRPBp1munUeCl3.TMqUUBGw7RM0Gq/SMuVacnWGflLwBwu',0,'2026-02-26T09:31:50.427Z'),
                            (23011051,'Ram Singh','Odisha','Bhubaneswar','john1@example.com','1546456565','MCA','6 Years','2000-02-02','Male','default.png','CSE',1,'CSE004','Assistant Professor',60,NULL,'$2b$10$tU5vPl7Gp0THaQOMZsPjcOt9VIjpJmiCYOnbUbDT9jhkherwaVbsq',0,'2026-02-26T09:31:50.495Z'),
                            (23011052,'Ram Pal','Odisha','Bhubaneswar','john2@example.com','2565656656','MCA','7 Years','2000-02-03','Male','default.png','NOT ASSIGNED',0,'NOT ASSIGNED','Assistant Professor',61,NULL,'$2b$10$QsCW5wZgXQsVu77ubl0Jeu3qSgHwMejK2rgmTOE4peSgnaNS8DTnK',0,'2026-02-26T09:31:50.549Z');
UNLOCK TABLES;

--
-- Table structure for table `marks`
--

DROP TABLE IF EXISTS `marks`;
CREATE TABLE `marks` (
                         `courcecode` varchar(20) DEFAULT NULL,
                         `semoryear` int(11) DEFAULT NULL,
                         `subjectcode` varchar(20) DEFAULT NULL,
                         `subjectname` varchar(40) DEFAULT NULL,
                         `rollnumber` bigint(20) DEFAULT NULL,
                         `theorymarks` int(11) DEFAULT NULL,
                         `practicalmarks` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `marks`
--

LOCK TABLES `marks` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
                                `sr_no` int(11) NOT NULL AUTO_INCREMENT,
                                `userprofile` varchar(30) DEFAULT NULL,
                                `courcecode` varchar(30) DEFAULT NULL,
                                `semoryear` int(11) DEFAULT NULL,
                                `userid` varchar(30) DEFAULT NULL,
                                `title` varchar(100) DEFAULT NULL,
                                `message` varchar(1000) DEFAULT NULL,
                                `time` varchar(100) DEFAULT NULL,
                                `readby` text DEFAULT NULL,
                                PRIMARY KEY (`sr_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `result`
--

DROP TABLE IF EXISTS `result`;
CREATE TABLE `result` (
                          `courcecode` varchar(30) NOT NULL,
                          `semoryear` int(11) NOT NULL,
                          `isdeclared` tinyint(4) DEFAULT NULL,
                          PRIMARY KEY (`courcecode`,`semoryear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `result`
--

LOCK TABLES `result` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `rollgenerator`
--

DROP TABLE IF EXISTS `rollgenerator`;
CREATE TABLE `rollgenerator` (
                                 `courcecode` varchar(20) NOT NULL,
                                 `semoryear` int(11) NOT NULL,
                                 `rollnumber` bigint(20) DEFAULT NULL,
                                 PRIMARY KEY (`courcecode`,`semoryear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rollgenerator`
--

LOCK TABLES `rollgenerator` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
                            `Courcecode` varchar(20) DEFAULT NULL,
                            `semoryear` int(11) DEFAULT NULL,
                            `rollnumber` bigint(20) DEFAULT NULL,
                            `optionalsubject` varchar(30) DEFAULT NULL,
                            `firstname` varchar(20) DEFAULT NULL,
                            `lastname` varchar(20) DEFAULT NULL,
                            `emailid` varchar(50) DEFAULT NULL,
                            `contactnumber` varchar(20) DEFAULT NULL,
                            `dateofbirth` varchar(15) DEFAULT NULL,
                            `gender` varchar(10) DEFAULT NULL,
                            `state` varchar(30) DEFAULT NULL,
                            `city` varchar(30) DEFAULT NULL,
                            `fathername` varchar(20) DEFAULT NULL,
                            `fatheroccupation` varchar(30) DEFAULT NULL,
                            `mothername` varchar(30) DEFAULT NULL,
                            `motheroccupation` varchar(30) DEFAULT NULL,
                            `profilepic` varchar(255) DEFAULT NULL,
                            `sr_no` int(11) NOT NULL AUTO_INCREMENT,
                            `lastlogin` varchar(100) DEFAULT NULL,
                            `userid` varchar(50) DEFAULT NULL,
                            `password` varchar(255) DEFAULT NULL,
                            `activestatus` tinyint(4) DEFAULT 0,
                            `admissiondate` varchar(50) DEFAULT NULL,
                            PRIMARY KEY (`sr_no`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
INSERT INTO `students` VALUES
    ('BCA2024',1,2401001,'Mathematics','Aman','Sharma','student@gcekjr.ac.in','9876543210','2005-06-15','Male','Odisha','Bhubaneswar','Rajesh Sharma','Businessman','Sunita Sharma','Teacher','rofile.jpg',2,'2026-02-22T10:11:17.424Z','studet','$2b$10$QLkOcQHQ/oQUwRfRZ6kzkuWdQTeZor9chIrVhIcjvssaUce4546O6',1,'2026-02-01');
UNLOCK TABLES;

--
-- Table structure for table `subject`
--

DROP TABLE IF EXISTS `subject`;
CREATE TABLE `subject` (
                           `subjectcode` varchar(20) DEFAULT NULL,
                           `subjectname` varchar(50) DEFAULT NULL,
                           `courcecode` varchar(20) DEFAULT NULL,
                           `semoryear` int(11) DEFAULT NULL,
                           `subjecttype` varchar(30) DEFAULT NULL,
                           `theorymarks` int(11) DEFAULT NULL,
                           `practicalmarks` int(11) DEFAULT NULL,
                           UNIQUE KEY `subjectcode` (`subjectcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subject`
--

LOCK TABLES `subject` WRITE;
INSERT INTO `subject` VALUES
                          ('CSPC3002','OS','BTECHCSE',1,'core',100,50),
                          ('CSPC3003','AIML','BTECHCSE',1,'core',100,50),
                          ('CSPC3005','IOT','BTECHCSE',2,'core',100,50),
                          ('CPCS2001','Basic Mechanical Engineering','BCACSE',1,'core',100,50),
                          ('CSE002','Artificial Intelligence & Machine Learning','CSE',1,'core',100,50),
                          ('CSE003','Internet Of Things','CSE',1,'core',100,50),
                          ('CSE004','Software Engineering','CSE',1,'core',100,50),
                          ('CSE005','IOT','CSE',1,'core',100,50);
UNLOCK TABLES;

-- Restore settings
SET TIME_ZONE=@OLD_TIME_ZONE;
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT;
SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS;
SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION;

-- Dump completed