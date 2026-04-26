-- MySQL dump 10.13  Distrib 8.4.8, for Linux (x86_64)
--
-- Host: crossover.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
                         `collagename` varchar(50) DEFAULT NULL,
                         `address` varchar(100) DEFAULT NULL,
                         `emailid` varchar(255) NOT NULL,
                         `contactnumber` varchar(40) DEFAULT NULL,
                         `website` varchar(30) DEFAULT NULL,
                         `lastlogin` varchar(40) DEFAULT NULL,
                         `password` varchar(255) DEFAULT NULL,
                         `facebook` varchar(100) DEFAULT NULL,
                         `instagram` varchar(100) DEFAULT NULL,
                         `twitter` varchar(100) DEFAULT NULL,
                         `linkedin` varchar(100) DEFAULT NULL,
                         `logo` varchar(255) DEFAULT NULL,
                         `activestatus` tinyint DEFAULT '0',
                         PRIMARY KEY (`emailid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES ('Government College of Engineering, Keonjhar','Jamunalia, Keonjhar, Odisha ','admin@gcekjr.ac.in','0000000000','http://geckjr.ac.in','2026-03-21T17:28:00.311Z','$2b$10$dWTjLOwtAaGrlZ4CAbTud.FGDvmDj.WOI3sDsRUQlpiNFnNrkesK.','https://facebook.com/gcekjr','https://instagram.com/gcekjr','https://x.com/gcekjr','https://linkedin.com/gcekjr ','/uploads/admin/admin.jpg',1);
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attandance`
--

DROP TABLE IF EXISTS `attandance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attandance` (
                              `subjectcode` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                              `date` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                              `rollnumber` bigint DEFAULT NULL,
                              `present` tinyint DEFAULT '0',
                              `courcecode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                              `semoryear` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attandance`
--

LOCK TABLES `attandance` WRITE;
/*!40000 ALTER TABLE `attandance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attandance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
                              `id` int NOT NULL AUTO_INCREMENT,
                              `student_id` int NOT NULL,
                              `subjectcode` varchar(30) NOT NULL,
                              `attendance_date` date NOT NULL,
                              `present` tinyint(1) NOT NULL DEFAULT '0',
                              `courcecode` varchar(20) NOT NULL,
                              `semoryear` int NOT NULL,
                              PRIMARY KEY (`id`),
                              UNIQUE KEY `unique_attendance` (`student_id`,`subjectcode`,`attendance_date`,`courcecode`,`semoryear`),
                              KEY `idx_lookup` (`subjectcode`,`courcecode`,`semoryear`,`attendance_date`),
                              CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`sr_no`) ON DELETE CASCADE,
                              CONSTRAINT `fk_attendance_subject` FOREIGN KEY (`subjectcode`) REFERENCES `subject` (`subjectcode`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (133,23,'CSE001','2026-03-09',1,'CSE',1),(134,28,'CSE001','2026-03-09',0,'CSE',1),(135,23,'CSE001','2026-03-03',1,'CSE',1),(136,28,'CSE001','2026-03-03',0,'CSE',1),(141,23,'CSE001','2026-03-10',1,'CSE',1),(142,28,'CSE001','2026-03-10',0,'CSE',1),(143,23,'CSE001','2026-03-11',1,'CSE',1),(145,34,'CSE001','2026-03-03',1,'CSE',1),(147,23,'CSE001','2026-03-20',1,'CSE',1),(148,34,'CSE001','2026-03-20',1,'CSE',1),(149,23,'CSE001','2026-03-02',1,'CSE',1),(150,34,'CSE001','2026-03-02',1,'CSE',1),(151,23,'CSE005','2026-03-21',0,'CSE',1),(152,34,'CSE005','2026-03-21',1,'CSE',1);
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `basic`
--

DROP TABLE IF EXISTS `basic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `basic` (
                         `id` bigint unsigned NOT NULL AUTO_INCREMENT,
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `basic`
--

LOCK TABLES `basic` WRITE;
/*!40000 ALTER TABLE `basic` DISABLE KEYS */;
/*!40000 ALTER TABLE `basic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat`
--

DROP TABLE IF EXISTS `chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat` (
                        `sr_no` int NOT NULL AUTO_INCREMENT,
                        `fromuserid` varchar(70) DEFAULT NULL,
                        `fromusername` varchar(50) DEFAULT NULL,
                        `touserid` varchar(70) DEFAULT NULL,
                        `message` text,
                        `messagetime` varchar(20) DEFAULT NULL,
                        `messagedate` varchar(40) DEFAULT NULL,
                        `readby` text,
                        PRIMARY KEY (`sr_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat`
--

LOCK TABLES `chat` WRITE;
/*!40000 ALTER TABLE `chat` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
                           `id` int NOT NULL AUTO_INCREMENT,
                           `course_code` varchar(20) NOT NULL,
                           `course_name` varchar(100) NOT NULL,
                           `total_semesters` int NOT NULL,
                           `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                           `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                           `sem_or_year` enum('sem','year') NOT NULL DEFAULT 'sem',
                           PRIMARY KEY (`id`),
                           UNIQUE KEY `course_code` (`course_code`),
                           UNIQUE KEY `course_name` (`course_name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (9,'CSE','Computer Science & Engineering',8,'2026-02-25 12:32:58','2026-02-25 12:32:58','sem'),(10,'IT','Information Technology',8,'2026-02-25 12:33:26','2026-02-25 12:33:26','sem'),(15,'BCA','Bachelor In Computer Application',3,'2026-03-01 09:55:38','2026-03-01 09:55:38','year');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculties`
--

DROP TABLE IF EXISTS `faculties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculties` (
                             `facultyid` int NOT NULL,
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
                             `semoryear` int DEFAULT '0',
                             `subject` varchar(40) DEFAULT 'NOT ASSIGNED',
                             `position` varchar(40) DEFAULT 'NOT ASSIGNED',
                             `sr_no` int NOT NULL AUTO_INCREMENT,
                             `lastlogin` varchar(100) DEFAULT NULL,
                             `password` varchar(255) DEFAULT NULL,
                             `activestatus` tinyint DEFAULT '0',
                             `joineddate` varchar(50) DEFAULT NULL,
                             PRIMARY KEY (`sr_no`),
                             UNIQUE KEY `facultyid` (`facultyid`),
                             UNIQUE KEY `emailid` (`emailid`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculties`
--

LOCK TABLES `faculties` WRITE;
/*!40000 ALTER TABLE `faculties` DISABLE KEYS */;
INSERT INTO `faculties` VALUES (23011050,'John','Odisha','Bhubaneswar','example@gmail.com','9876543210','MCA','5 Years','2000-02-01','Female','23011050.jpg','CSE',6,'603','Assistant Professor',121,'2026-03-19T15:28:39.902Z','$2b$10$NMoy0KUxl4tsVGHZ5Xjs4.CLrZ6Qdvkii6eENxi2Zjwh1SN8jSzEy',1,'2026-03-10');
/*!40000 ALTER TABLE `faculties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marks`
--

DROP TABLE IF EXISTS `marks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marks` (
                         `courcecode` varchar(20) DEFAULT NULL,
                         `semoryear` int DEFAULT NULL,
                         `subjectcode` varchar(20) DEFAULT NULL,
                         `subjectname` varchar(100) DEFAULT NULL,
                         `rollnumber` bigint DEFAULT NULL,
                         `theorymarks` int DEFAULT NULL,
                         `practicalmarks` int DEFAULT NULL,
                         UNIQUE KEY `unique_marks` (`courcecode`,`semoryear`,`subjectcode`,`rollnumber`),
                         KEY `fk_marks_student` (`rollnumber`),
                         KEY `fk_marks_subject` (`subjectcode`),
                         CONSTRAINT `fk_marks_student` FOREIGN KEY (`rollnumber`) REFERENCES `students` (`rollnumber`) ON DELETE CASCADE,
                         CONSTRAINT `fk_marks_subject` FOREIGN KEY (`subjectcode`) REFERENCES `subject` (`subjectcode`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marks`
--

LOCK TABLES `marks` WRITE;
/*!40000 ALTER TABLE `marks` DISABLE KEYS */;
INSERT INTO `marks` VALUES ('CSE',1,'CSE001','Operating Systems',23011006,0,0),('CSE',1,'CSE001','Operating Systems',23011007,94,42),('CSE',1,'CSE002','Discrete Mathematics',23011006,90,0),('CSE',1,'CSE003','Artificial Intelligence & Machine Learning',23011006,90,50),('CSE',1,'CSE003','Artificial Intelligence & Machine Learning',23011007,85,40),('CSE',1,'CSE004','Software Engineering',23011006,76,47),('CSE',1,'CSE004','Software Engineering',23011007,72,43),('CSE',1,'CSE005','Compiler Design',23011006,93,44),('CSE',1,'CSE005','Compiler Design',23011007,92,47),('CSE',1,'CSE006','Computer Graphics',23011006,95,0),('CSE',1,'CSE006','Computer Graphics',23011007,76,0),('CSE',1,'CSE002','Discrete Mathematics',23011007,23,0),('CSE',1,'CSE001','Operating Systems',23011009,0,0);
/*!40000 ALTER TABLE `marks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
                                `sr_no` int NOT NULL AUTO_INCREMENT,
                                `userprofile` varchar(30) DEFAULT NULL,
                                `courcecode` varchar(30) DEFAULT NULL,
                                `semoryear` int DEFAULT NULL,
                                `userid` varchar(30) DEFAULT NULL,
                                `title` varchar(100) DEFAULT NULL,
                                `message` varchar(1000) DEFAULT NULL,
                                `time` varchar(100) DEFAULT NULL,
                                `readby` text,
                                PRIMARY KEY (`sr_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `result`
--

DROP TABLE IF EXISTS `result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `result` (
                          `courcecode` varchar(30) NOT NULL,
                          `semoryear` int NOT NULL,
                          `isdeclared` tinyint DEFAULT NULL,
                          PRIMARY KEY (`courcecode`,`semoryear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `result`
--

LOCK TABLES `result` WRITE;
/*!40000 ALTER TABLE `result` DISABLE KEYS */;
/*!40000 ALTER TABLE `result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rollgenerator`
--

DROP TABLE IF EXISTS `rollgenerator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rollgenerator` (
                                 `courcecode` varchar(20) NOT NULL,
                                 `semoryear` int NOT NULL,
                                 `rollnumber` bigint DEFAULT NULL,
                                 PRIMARY KEY (`courcecode`,`semoryear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rollgenerator`
--

LOCK TABLES `rollgenerator` WRITE;
/*!40000 ALTER TABLE `rollgenerator` DISABLE KEYS */;
/*!40000 ALTER TABLE `rollgenerator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
                            `Courcecode` varchar(20) DEFAULT NULL,
                            `semoryear` int DEFAULT NULL,
                            `rollnumber` bigint DEFAULT NULL,
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
                            `sr_no` int NOT NULL AUTO_INCREMENT,
                            `lastlogin` varchar(100) DEFAULT NULL,
                            `password` varchar(255) DEFAULT NULL,
                            `activestatus` tinyint DEFAULT '0',
                            `admissiondate` varchar(50) DEFAULT NULL,
                            PRIMARY KEY (`sr_no`),
                            UNIQUE KEY `emailid` (`emailid`),
                            UNIQUE KEY `idx_rollnumber` (`rollnumber`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('CSE',1,23011006,NULL,'Amir','khan','amir@gcekjr.ac.in','9876543210','2003-01-06','Male','Odisha','Bhubaneswar',NULL,NULL,NULL,NULL,'23011006.jpg',23,'2026-03-18T07:18:16.538Z','$2b$10$f69fZK2wuNANAtAt.BHJKeJAKxC.OWXZuZ7lSmFqdgBjWzL.c3jxa',1,'2026-03-01'),('BCA',1,23011007,'Mathematics','Aman','Sharma','student22@gcekjr.ac.in','9867896540','2000-11-25','Male','Odisha','Keonjhar','Rajesh Sharma','Businessman','Sunita Sharma','Teacher','23011007.jpg',28,'2026-03-19T06:25:08.338Z','$2b$10$9yiGT7TqohIQ9fgbmf0IsOayhaO7WY4dlKcI0lfLR/Ea.Aq.pbvcm',1,'2026-03-03'),('BCA',1,23011001,NULL,'Rahul','Kumar','rahul@example.com','9876543210','2003-01-01','Male','Odisha','Bhubaneswar',NULL,NULL,NULL,NULL,'23011001.jpg',29,NULL,'$2b$10$B/MecBkLO5jkopucDkKxVe7zfTJyJiDLpwsAqeh30eQcDWjhbthfq',NULL,'2026-03-17'),('CSE',1,23011009,NULL,'Student1','','example.com','0000000000','2000-10-11','Female','Odisha','Keonjhar','Rajesh Sharma','Businessman','Sunita Sharma','Teacher','23011009.jpg',34,NULL,'$2b$10$I2aHx8.gaTOuS1Ql8scwL.F/ukhgat/jLJDG4gz9L3RL7GNhWZ3mi',NULL,'2026-03-18');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subject`
--

DROP TABLE IF EXISTS `subject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subject` (
                           `subjectcode` varchar(20) DEFAULT NULL,
                           `subjectname` varchar(50) DEFAULT NULL,
                           `courcecode` varchar(20) DEFAULT NULL,
                           `semoryear` int DEFAULT NULL,
                           `subjecttype` varchar(30) DEFAULT NULL,
                           `theorymarks` int DEFAULT NULL,
                           `practicalmarks` int DEFAULT NULL,
                           UNIQUE KEY `subjectcode` (`subjectcode`),
                           UNIQUE KEY `subject_unique` (`subjectcode`,`courcecode`,`semoryear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subject`
--

LOCK TABLES `subject` WRITE;
/*!40000 ALTER TABLE `subject` DISABLE KEYS */;
INSERT INTO `subject` VALUES ('CSE001','Operating Systems','CSE',1,'core',100,50),('CSE002','Discrete Mathematics','CSE',1,'core',100,0),('CSE003','Artificial Intelligence & Machine Learning','CSE',1,'core',100,50),('CSE004','Software Engineering','CSE',1,'core',100,50),('CSE005','Compiler Design','CSE',1,'core',100,50),('CSE006','Computer Graphics','CSE',1,'core',100,0),('BCA1004','Physics','BCA',1,'core',100,50),('601','compiler design','CSE',6,'core',5,10),('602','ml','CSE',6,'core',5,12),('603','computer networking','CSE',6,'core',5,10),('501','toc','CSE',5,'core',5,12),('502','dbms','CSE',5,'core',5,10),('503','data analytics','CSE',5,'core',5,5);
/*!40000 ALTER TABLE `subject` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-21 18:10:59
