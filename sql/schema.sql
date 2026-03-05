-- MySQL Dump
-- version 8.0
-- https://www.mysql.com/
--
-- Host: localhost
-- Generation Time: Mar 05, 2026 at 03:06 PM
-- Server version: 8.0
-- PHP Version: 8.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;

--
-- Database: `collegedata`
--

CREATE DATABASE IF NOT EXISTS `collegedata`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE `collegedata`;

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `collagename` VARCHAR(50) DEFAULT NULL,
  `address` VARCHAR(100) DEFAULT NULL,
  `emailid` VARCHAR(50) DEFAULT NULL,
  `contactnumber` VARCHAR(40) DEFAULT NULL,
  `website` VARCHAR(30) DEFAULT NULL,
  `lastlogin` VARCHAR(40) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `facebook` VARCHAR(100) DEFAULT NULL,
  `instagram` VARCHAR(100) DEFAULT NULL,
  `twitter` VARCHAR(100) DEFAULT NULL,
  `linkedin` VARCHAR(100) DEFAULT NULL,
  `logo` VARCHAR(255) DEFAULT NULL,
  `activestatus` TINYINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`collagename`, `address`, `emailid`, `contactnumber`, `website`, `lastlogin`, `password`, `facebook`, `instagram`, `twitter`, `linkedin`, `logo`, `activestatus`) VALUES
('Government College of Engineering, Keonjhar', 'Jamunalia, Keonjhar, Odisha ', 'admin@gcekjr.ac.in', '0000000000', 'http://geckjr.ac.in', '2026-03-05T07:40:27.338Z', '$2b$10$Mz4kkh2evcpMJsG9.XgUY.V9/q8mUOTnZSPhRVoqw4ySJO9YsM34y', 'https://facebook.com/gcekjr', 'https://instagram.com/gcekjr', 'https://x.com/gcekjr', 'https://linkedin.com/gcekjr ', '/uploads/admin/admin.jpg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `student_id` INT NOT NULL,
  `subjectcode` VARCHAR(30) NOT NULL,
  `attendance_date` DATE NOT NULL,
  `present` TINYINT(1) NOT NULL DEFAULT 0,
  `courcecode` VARCHAR(20) NOT NULL,
  `semoryear` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`student_id`, `subjectcode`, `attendance_date`, `courcecode`, `semoryear`),
  KEY `idx_lookup` (`subjectcode`, `courcecode`, `semoryear`, `attendance_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=133;

-- --------------------------------------------------------

--
-- Table structure for table `chat`
--

CREATE TABLE `chat` (
  `sr_no` INT NOT NULL AUTO_INCREMENT,
  `fromuserid` VARCHAR(70) DEFAULT NULL,
  `fromusername` VARCHAR(50) DEFAULT NULL,
  `touserid` VARCHAR(70) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `messagetime` VARCHAR(20) DEFAULT NULL,
  `messagedate` VARCHAR(40) DEFAULT NULL,
  `readby` TEXT DEFAULT NULL,
  PRIMARY KEY (`sr_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `course_code` VARCHAR(20) NOT NULL,
  `course_name` VARCHAR(100) NOT NULL,
  `total_semesters` INT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sem_or_year` ENUM('sem','year') NOT NULL DEFAULT 'sem',
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code` (`course_code`),
  UNIQUE KEY `course_name` (`course_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=16;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `course_code`, `course_name`, `total_semesters`, `created_at`, `updated_at`, `sem_or_year`) VALUES
(9,  'CSE', 'Computer Science & Engineering',  8, '2026-02-25 12:32:58', '2026-02-25 12:32:58', 'sem'),
(10, 'IT',  'Information Technology',           8, '2026-02-25 12:33:26', '2026-02-25 12:33:26', 'sem'),
(15, 'BCA', 'Bachelor In Computer Application', 3, '2026-03-01 09:55:38', '2026-03-01 09:55:38', 'year');

-- --------------------------------------------------------

--
-- Table structure for table `faculties`
--

CREATE TABLE `faculties` (
  `facultyid` INT NOT NULL,
  `facultyname` VARCHAR(30) DEFAULT NULL,
  `state` VARCHAR(30) DEFAULT NULL,
  `city` VARCHAR(30) DEFAULT NULL,
  `emailid` VARCHAR(50) DEFAULT NULL,
  `contactnumber` VARCHAR(20) DEFAULT NULL,
  `qualification` VARCHAR(30) DEFAULT NULL,
  `experience` VARCHAR(30) DEFAULT NULL,
  `birthdate` VARCHAR(30) DEFAULT NULL,
  `gender` VARCHAR(10) DEFAULT NULL,
  `profilepic` VARCHAR(255) DEFAULT NULL,
  `courcecode` VARCHAR(20) DEFAULT 'NOT ASSIGNED',
  `semoryear` INT DEFAULT 0,
  `subject` VARCHAR(40) DEFAULT 'NOT ASSIGNED',
  `position` VARCHAR(40) DEFAULT 'NOT ASSIGNED',
  `sr_no` INT NOT NULL AUTO_INCREMENT,
  `lastlogin` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `activestatus` TINYINT DEFAULT 0,
  `joineddate` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`sr_no`),
  UNIQUE KEY `facultyid` (`facultyid`),
  UNIQUE KEY `emailid` (`emailid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=121;

--
-- Dumping data for table `faculties`
--

INSERT INTO `faculties` (`facultyid`, `facultyname`, `state`, `city`, `emailid`, `contactnumber`, `qualification`, `experience`, `birthdate`, `gender`, `profilepic`, `courcecode`, `semoryear`, `subject`, `position`, `sr_no`, `lastlogin`, `password`, `activestatus`, `joineddate`) VALUES
(23011050, 'John Doe', 'Odisha', 'Bhubaneswar', 'john@example.com', '9876543210', 'MCA', '5 Years', '2000-02-01', 'Male', '23011050.jpg', 'CSE', 0, 'NOT ASSIGNED', 'Assistant Professor', 116, NULL, '$2b$10$yehGEm57GT7mwidNIFFLdOrHXLuAtu09yjtDc2uMcrBzQqBdaLqhG', 0, '2026-03-01');

-- --------------------------------------------------------

--
-- Table structure for table `marks`
--

CREATE TABLE `marks` (
  `courcecode` VARCHAR(20) DEFAULT NULL,
  `semoryear` INT DEFAULT NULL,
  `subjectcode` VARCHAR(20) DEFAULT NULL,
  `subjectname` VARCHAR(100) DEFAULT NULL,
  `rollnumber` BIGINT DEFAULT NULL,
  `theorymarks` INT DEFAULT NULL,
  `practicalmarks` INT DEFAULT NULL,
  UNIQUE KEY `unique_marks` (`courcecode`, `semoryear`, `subjectcode`, `rollnumber`),
  KEY `fk_marks_student` (`rollnumber`),
  KEY `fk_marks_subject` (`subjectcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `marks`
--

INSERT INTO `marks` (`courcecode`, `semoryear`, `subjectcode`, `subjectname`, `rollnumber`, `theorymarks`, `practicalmarks`) VALUES
('CSE', 1, 'CSE001', 'Operating Systems',                          23011006, 80, 45),
('CSE', 1, 'CSE001', 'Operating Systems',                          23011007, 65, 40),
('CSE', 1, 'CSE002', 'Discrete Mathematics',                       23011006, 75,  0),
('CSE', 1, 'CSE002', 'Discrete Mathematics',                       23011007, 80,  0),
('CSE', 1, 'CSE003', 'Artificial Intelligence & Machine Learning',  23011006, 90, 50),
('CSE', 1, 'CSE003', 'Artificial Intelligence & Machine Learning',  23011007, 85, 40),
('CSE', 1, 'CSE004', 'Software Engineering',                        23011006, 76, 47),
('CSE', 1, 'CSE004', 'Software Engineering',                        23011007, 72, 43),
('CSE', 1, 'CSE005', 'Compiler Design',                             23011006, 93, 44),
('CSE', 1, 'CSE005', 'Compiler Design',                             23011007, 92, 47),
('CSE', 1, 'CSE006', 'Computer Graphics',                           23011006, 95,  0),
('CSE', 1, 'CSE006', 'Computer Graphics',                           23011007, 76,  0);

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `sr_no` INT NOT NULL AUTO_INCREMENT,
  `userprofile` VARCHAR(30) DEFAULT NULL,
  `courcecode` VARCHAR(30) DEFAULT NULL,
  `semoryear` INT DEFAULT NULL,
  `userid` VARCHAR(30) DEFAULT NULL,
  `title` VARCHAR(100) DEFAULT NULL,
  `message` VARCHAR(1000) DEFAULT NULL,
  `time` VARCHAR(100) DEFAULT NULL,
  `readby` TEXT DEFAULT NULL,
  PRIMARY KEY (`sr_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `result`
--

CREATE TABLE `result` (
  `courcecode` VARCHAR(30) NOT NULL,
  `semoryear` INT NOT NULL,
  `isdeclared` TINYINT DEFAULT NULL,
  PRIMARY KEY (`courcecode`, `semoryear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rollgenerator`
--

CREATE TABLE `rollgenerator` (
  `courcecode` VARCHAR(20) NOT NULL,
  `semoryear` INT NOT NULL,
  `rollnumber` BIGINT DEFAULT NULL,
  PRIMARY KEY (`courcecode`, `semoryear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `Courcecode` VARCHAR(20) DEFAULT NULL,
  `semoryear` INT DEFAULT NULL,
  `rollnumber` BIGINT DEFAULT NULL,
  `optionalsubject` VARCHAR(30) DEFAULT NULL,
  `firstname` VARCHAR(20) DEFAULT NULL,
  `lastname` VARCHAR(20) DEFAULT NULL,
  `emailid` VARCHAR(50) DEFAULT NULL,
  `contactnumber` VARCHAR(20) DEFAULT NULL,
  `dateofbirth` VARCHAR(15) DEFAULT NULL,
  `gender` VARCHAR(10) DEFAULT NULL,
  `state` VARCHAR(30) DEFAULT NULL,
  `city` VARCHAR(30) DEFAULT NULL,
  `fathername` VARCHAR(20) DEFAULT NULL,
  `fatheroccupation` VARCHAR(30) DEFAULT NULL,
  `mothername` VARCHAR(30) DEFAULT NULL,
  `motheroccupation` VARCHAR(30) DEFAULT NULL,
  `profilepic` VARCHAR(255) DEFAULT NULL,
  `sr_no` INT NOT NULL AUTO_INCREMENT,
  `lastlogin` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `activestatus` TINYINT DEFAULT 0,
  `admissiondate` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`sr_no`),
  UNIQUE KEY `emailid` (`emailid`),
  UNIQUE KEY `idx_rollnumber` (`rollnumber`)  -- FIX: changed KEY to UNIQUE KEY for fk_marks_student
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=29;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`Courcecode`, `semoryear`, `rollnumber`, `optionalsubject`, `firstname`, `lastname`, `emailid`, `contactnumber`, `dateofbirth`, `gender`, `state`, `city`, `fathername`, `fatheroccupation`, `mothername`, `motheroccupation`, `profilepic`, `sr_no`, `lastlogin`, `password`, `activestatus`, `admissiondate`) VALUES
('CSE', 1, 23011006, NULL,          'Amir', 'khan',   'rahul11111@example.com', '9876543210', '2003-01-06', 'Male', 'Odisha', 'Bhubaneswar', NULL,            NULL,          NULL,            NULL,      '23011006.jpg', 23, NULL,                        '$2b$10$W/LY1RVk6B4xvl8TDtMXZO4yRVsKhThteiQF6trPsxx2ARc3.KX9S', NULL, '2026-03-01'),
('CSE', 1, 23011007, 'Mathematics', 'Aman', 'Sharma', 'student22@gcekjr.ac.in', '9867896540', '2000-11-25', 'Male', 'Odisha', 'Keonjhar',    'Rajesh Sharma', 'Businessman', 'Sunita Sharma', 'Teacher', NULL,           28, '2026-03-04T07:18:49.906Z', '$2b$10$iBPLpoBk2HZmleqr3EHuTOlBcZGPfvD/vY3ab1W0dfjBLHLmVyZDu', 1,    '2026-03-03');

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `subjectcode` VARCHAR(20) DEFAULT NULL,
  `subjectname` VARCHAR(50) DEFAULT NULL,
  `courcecode` VARCHAR(20) DEFAULT NULL,
  `semoryear` INT DEFAULT NULL,
  `subjecttype` VARCHAR(30) DEFAULT NULL,
  `theorymarks` INT DEFAULT NULL,
  `practicalmarks` INT DEFAULT NULL,
  UNIQUE KEY `subjectcode` (`subjectcode`),                              -- FIX: added standalone unique key for fk_attendance_subject and fk_marks_subject
  UNIQUE KEY `subject_unique` (`subjectcode`, `courcecode`, `semoryear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`subjectcode`, `subjectname`, `courcecode`, `semoryear`, `subjecttype`, `theorymarks`, `practicalmarks`) VALUES
('CSE001', 'Operating Systems',                          'CSE', 1, 'core', 100, 50),
('CSE002', 'Discrete Mathematics',                       'CSE', 1, 'core', 100,  0),
('CSE003', 'Artificial Intelligence & Machine Learning', 'CSE', 1, 'core', 100, 50),
('CSE004', 'Software Engineering',                       'CSE', 1, 'core', 100, 50),
('CSE005', 'Compiler Design',                            'CSE', 1, 'core', 100, 50),
('CSE006', 'Computer Graphics',                          'CSE', 1, 'core', 100,  0);

-- --------------------------------------------------------

--
-- Foreign key constraints
--

ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`sr_no`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attendance_subject` FOREIGN KEY (`subjectcode`) REFERENCES `subject` (`subjectcode`) ON DELETE CASCADE;

ALTER TABLE `marks`
  ADD CONSTRAINT `fk_marks_student` FOREIGN KEY (`rollnumber`) REFERENCES `students` (`rollnumber`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_marks_subject` FOREIGN KEY (`subjectcode`) REFERENCES `subject` (`subjectcode`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
