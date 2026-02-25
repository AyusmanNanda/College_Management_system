-- MySQL-compatible SQL Dump
-- Database: `collegedata`

DROP DATABASE IF EXISTS collegedata;
CREATE DATABASE collegedata;
USE collegedata;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Table structure for table `admin`
-- --------------------------------------------------------
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

-- Data for table `admin`
INSERT INTO `admin` (`collagename`, `address`, `emailid`, `contactnumber`, `website`, `lastlogin`, `password`, `facebook`, `instagram`, `twitter`, `linkedin`, `logo`, `activestatus`) VALUES
    ('Government College of Engineering, Keonjhar', 'Jamunalia, Keonjhar, Odisha ', 'admin@gcekjr.ac.in', '0000000000', 'http://geckjr.ac.in', '2026-02-22T10:13:36.075Z', '$2b$10$DLdljUn/zIMIzYer4rU8m.MaMweTY2ggRpPwonWDNvj7KV7S9cl5m', 'https://facebook.com/gcekjr', 'https://instagram.com/gcekjr', 'https://x.com/gcekjr', 'https://linkedin.com/gcekjr ', '/uploads/admin/default.png', 0);

-- --------------------------------------------------------
-- Table structure for table `attandance`
-- --------------------------------------------------------
CREATE TABLE `attandance` (
                              `subjectcode` varchar(30) DEFAULT NULL,
                              `date` varchar(30) DEFAULT NULL,
                              `rollnumber` bigint(20) DEFAULT NULL,
                              `present` tinyint(4) DEFAULT 0,
                              `courcecode` varchar(20) DEFAULT NULL,
                              `semoryear` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `chat`
-- --------------------------------------------------------
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

-- --------------------------------------------------------
-- Table structure for table `courses`
-- --------------------------------------------------------
CREATE TABLE `courses` (
                           `id` int(11) NOT NULL AUTO_INCREMENT,
                           `course_code` varchar(20) NOT NULL,
                           `course_name` varchar(100) NOT NULL,
                           `total_semesters` int(11) NOT NULL,
                           `created_at` timestamp NULL DEFAULT current_timestamp(),
                           `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                           `sem_or_year` enum('sem','year') NOT NULL DEFAULT 'sem',
                           PRIMARY KEY (`id`),
                           UNIQUE KEY `course_code` (`course_code`),
                           UNIQUE KEY `course_name` (`course_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `courses`
INSERT INTO `courses` (`id`, `course_code`, `course_name`, `total_semesters`, `created_at`, `updated_at`, `sem_or_year`) VALUES
                                                                                                                             (3, 'BTECHCSE', 'CSE', 8, '2026-02-22 08:32:25', '2026-02-22 08:32:25', 'sem'),
                                                                                                                             (4, 'BTECHCE', 'CE', 8, '2026-02-22 08:32:44', '2026-02-22 08:32:44', 'sem'),
                                                                                                                             (5, 'BTECHEE', 'EE', 8, '2026-02-22 08:36:38', '2026-02-22 08:36:38', 'sem'),
                                                                                                                             (6, 'BTECHMME', 'MME', 8, '2026-02-22 08:37:18', '2026-02-22 08:37:18', 'sem');

-- --------------------------------------------------------
-- Table structure for table `faculties`
-- --------------------------------------------------------
CREATE TABLE `faculties` (
                             `facultyid` int(11) DEFAULT NULL,
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
                             UNIQUE KEY `emailid` (`emailid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `faculties`
INSERT INTO `faculties` (`facultyid`, `facultyname`, `state`, `city`, `emailid`, `contactnumber`, `qualification`, `experience`, `birthdate`, `gender`, `profilepic`, `courcecode`, `semoryear`, `subject`, `position`, `sr_no`, `lastlogin`, `password`, `activestatus`, `joineddate`) VALUES
                                                                                                                                                                                                                                                                                            (23011040, 'Faculty', 'Odisha', 'Keonjhar', 'faculty@gcekjr.ac.in', '1111111111', 'M.Tech', '10 Yrs', '2000-02-01', 'Male', '1771757222471-IMG_20250514_225859_485.jpg', 'NOT ASSIGNED', 0, 'NOT ASSIGNED', 'NOT ASSIGNED', 2, NULL, '$2b$10$57k9twGrTS3gMX.g6QcUYOJylQTXE6.Val5V7fJ.LNcgYAf3gSkka', 0, NULL),
                                                                                                                                                                                                                                                                                            (23011041, 'Faculty1', 'Odisha', 'Keonjhar', 'faculty1@gcekjr.ac.in', '2222222222', 'M.Tech', '10 Yrs', '2000-01-01', 'Male', '1771757746884-IMG_20250514_225922_626.jpg', 'NOT ASSIGNED', 0, 'NOT ASSIGNED', 'NOT ASSIGNED', 3, NULL, '$2b$10$JBzAW2/VmgydNE233e4RquJfr3DTEDygQK6t7Q5pfR8K8LWLlMdr6', 0, NULL);

-- --------------------------------------------------------
-- Table structure for table `marks`
-- --------------------------------------------------------
CREATE TABLE `marks` (
                         `courcecode` varchar(20) DEFAULT NULL,
                         `semoryear` int(11) DEFAULT NULL,
                         `subjectcode` varchar(20) DEFAULT NULL,
                         `subjectname` varchar(40) DEFAULT NULL,
                         `rollnumber` bigint(20) DEFAULT NULL,
                         `theorymarks` int(11) DEFAULT NULL,
                         `practicalmarks` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `notification`
-- --------------------------------------------------------
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

-- --------------------------------------------------------
-- Table structure for table `result`
-- --------------------------------------------------------
CREATE TABLE `result` (
                          `courcecode` varchar(30) NOT NULL,
                          `semoryear` int(11) NOT NULL,
                          `isdeclared` tinyint(4) DEFAULT NULL,
                          PRIMARY KEY (`courcecode`,`semoryear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `rollgenerator`
-- --------------------------------------------------------
CREATE TABLE `rollgenerator` (
                                 `courcecode` varchar(20) NOT NULL,
                                 `semoryear` int(11) NOT NULL,
                                 `rollnumber` bigint(20) DEFAULT NULL,
                                 PRIMARY KEY (`courcecode`,`semoryear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `students`
-- --------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for table `students`
INSERT INTO `students` (`Courcecode`, `semoryear`, `rollnumber`, `optionalsubject`, `firstname`, `lastname`, `emailid`, `contactnumber`, `dateofbirth`, `gender`, `state`, `city`, `fathername`, `fatheroccupation`, `mothername`, `motheroccupation`, `profilepic`, `sr_no`, `lastlogin`, `userid`, `password`, `activestatus`, `admissiondate`) VALUES
    ('BCA2024', 1, 2401001, 'Mathematics', 'Aman', 'Sharma', 'student@gcekjr.ac.in', '9876543210', '2005-06-15', 'Male', 'Odisha', 'Bhubaneswar', 'Rajesh Sharma', 'Businessman', 'Sunita Sharma', 'Teacher', 'rofile.jpg', 2, '2026-02-22T10:11:17.424Z', 'studet', '$2b$10$QLkOcQHQ/oQUwRfRZ6kzkuWdQTeZor9chIrVhIcjvssaUce4546O6', 1, '2026-02-01');

-- --------------------------------------------------------
-- Table structure for table `subject`
-- --------------------------------------------------------
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

-- Data for table `subject`
INSERT INTO `subject` (`subjectcode`, `subjectname`, `courcecode`, `semoryear`, `subjecttype`, `theorymarks`, `practicalmarks`) VALUES
                                                                                                                                    ('CSPC3002', 'OS', 'BTECHCSE', 1, 'core', 100, 50),
                                                                                                                                    ('CSPC3003', 'AIML', 'BTECHCSE', 1, 'core', 100, 50),
                                                                                                                                    ('CSPC3005', 'IOT', 'BTECHCSE', 2, 'core', 100, 50);

-- --------------------------------------------------------
-- Commit transaction
-- --------------------------------------------------------
COMMIT;