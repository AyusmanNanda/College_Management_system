-- phpMyAdmin SQL Dump
-- version 5.2.2deb1+deb13u1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 03, 2026 at 11:26 PM
-- Server version: MySQL Compatible
-- PHP Version: 8.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `collegedata`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

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
                         `activestatus` tinyint DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`collagename`, `address`, `emailid`, `contactnumber`, `website`, `lastlogin`, `password`, `facebook`, `instagram`, `twitter`, `linkedin`, `logo`, `activestatus`) VALUES
    ('Government College of Engineering, Keonjhar', 'Jamunalia, Keonjhar, Odisha ', 'admin@gcekjr.ac.in', '0000000000', 'http://geckjr.ac.in', '2026-03-03T04:19:06.444Z', '$2b$10$FoHLLo5wyNZzU6tYuy6ao.WL/EVGkF9nQkLJcuK5gvdvAEdWWygAC', 'https://facebook.com/gcekjr', 'https://instagram.com/gcekjr', 'https://x.com/gcekjr', 'https://linkedin.com/gcekjr ', '/uploads/admin/admin.jpg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
                              `id` int NOT NULL,
                              `student_id` int NOT NULL,
                              `subjectcode` varchar(30) NOT NULL,
                              `attendance_date` date NOT NULL,
                              `present` tinyint NOT NULL DEFAULT 0,
                              `courcecode` varchar(20) NOT NULL,
                              `semoryear` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `student_id`, `subjectcode`, `attendance_date`, `present`, `courcecode`, `semoryear`) VALUES
                                                                                                                          (90, 23, 'CSE002', '2026-03-04', 1, 'CSE', 1),
                                                                                                                          (95, 23, 'CSE002', '2026-03-03', 0, 'CSE', 1),
                                                                                                                          (120, 23, 'CSE002', '2026-03-05', 0, 'CSE', 1),
                                                                                                                          (121, 23, 'CSE004', '2026-03-04', 1, 'CSE', 1),
                                                                                                                          (122, 28, 'CSE004', '2026-03-04', 0, 'CSE', 1);

-- --------------------------------------------------------

--
-- Table structure for table `chat`
--

CREATE TABLE `chat` (
                        `sr_no` int NOT NULL,
                        `fromuserid` varchar(70) DEFAULT NULL,
                        `fromusername` varchar(50) DEFAULT NULL,
                        `touserid` varchar(70) DEFAULT NULL,
                        `message` text DEFAULT NULL,
                        `messagetime` varchar(20) DEFAULT NULL,
                        `messagedate` varchar(40) DEFAULT NULL,
                        `readby` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
                           `id` int NOT NULL,
                           `course_code` varchar(20) NOT NULL,
                           `course_name` varchar(100) NOT NULL,
                           `total_semesters` int NOT NULL,
                           `created_at` timestamp NULL DEFAULT current_timestamp(),
                           `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                           `sem_or_year` enum('sem','year') NOT NULL DEFAULT 'sem'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `course_code`, `course_name`, `total_semesters`, `created_at`, `updated_at`, `sem_or_year`) VALUES
                                                                                                                             (9, 'CSE', 'Computer Science & Engineering', 8, '2026-02-25 12:32:58', '2026-02-25 12:32:58', 'sem'),
                                                                                                                             (10, 'IT', 'Information Technology', 8, '2026-02-25 12:33:26', '2026-02-25 12:33:26', 'sem'),
                                                                                                                             (15, 'BCA', 'Bachelor In Computer Application', 3, '2026-03-01 09:55:38', '2026-03-01 09:55:38', 'year');

-- --------------------------------------------------------

--
-- Table structure for table `faculties`
--

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
                             `semoryear` int DEFAULT 0,
                             `subject` varchar(40) DEFAULT 'NOT ASSIGNED',
                             `position` varchar(40) DEFAULT 'NOT ASSIGNED',
                             `sr_no` int NOT NULL,
                             `lastlogin` varchar(100) DEFAULT NULL,
                             `password` varchar(255) DEFAULT NULL,
                             `activestatus` tinyint DEFAULT 0,
                             `joineddate` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculties`
--

INSERT INTO `faculties` (`facultyid`, `facultyname`, `state`, `city`, `emailid`, `contactnumber`, `qualification`, `experience`, `birthdate`, `gender`, `profilepic`, `courcecode`, `semoryear`, `subject`, `position`, `sr_no`, `lastlogin`, `password`, `activestatus`, `joineddate`) VALUES
    (23011050, 'John Doe', 'Odisha', 'Bhubaneswar', 'john@example.com', '9876543210', 'MCA', '5 Years', '2000-02-01', 'Male', '23011050.jpeg', 'CSE', 1, 'CSE002', 'Assistant Professor', 116, NULL, '$2b$10$yehGEm57GT7mwidNIFFLdOrHXLuAtu09yjtDc2uMcrBzQqBdaLqhG', 0, '2026-03-01');

-- --------------------------------------------------------

--
-- Table structure for table `marks`
--

CREATE TABLE `marks` (
                         `courcecode` varchar(20) DEFAULT NULL,
                         `semoryear` int DEFAULT NULL,
                         `subjectcode` varchar(20) DEFAULT NULL,
                         `subjectname` varchar(40) DEFAULT NULL,
                         `rollnumber` bigint DEFAULT NULL,
                         `theorymarks` int DEFAULT NULL,
                         `practicalmarks` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
                                `sr_no` int NOT NULL,
                                `userprofile` varchar(30) DEFAULT NULL,
                                `courcecode` varchar(30) DEFAULT NULL,
                                `semoryear` int DEFAULT NULL,
                                `userid` varchar(30) DEFAULT NULL,
                                `title` varchar(100) DEFAULT NULL,
                                `message` varchar(1000) DEFAULT NULL,
                                `time` varchar(100) DEFAULT NULL,
                                `readby` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `result`
--

CREATE TABLE `result` (
                          `courcecode` varchar(30) NOT NULL,
                          `semoryear` int NOT NULL,
                          `isdeclared` tinyint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rollgenerator`
--

CREATE TABLE `rollgenerator` (
                                 `courcecode` varchar(20) NOT NULL,
                                 `semoryear` int NOT NULL,
                                 `rollnumber` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

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
                            `sr_no` int NOT NULL,
                            `lastlogin` varchar(100) DEFAULT NULL,
                            `password` varchar(255) DEFAULT NULL,
                            `activestatus` tinyint DEFAULT 0,
                            `admissiondate` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`Courcecode`, `semoryear`, `rollnumber`, `optionalsubject`, `firstname`, `lastname`, `emailid`, `contactnumber`, `dateofbirth`, `gender`, `state`, `city`, `fathername`, `fatheroccupation`, `mothername`, `motheroccupation`, `profilepic`, `sr_no`, `lastlogin`, `password`, `activestatus`, `admissiondate`) VALUES
                                                                                                                                                                                                                                                                                                                                            ('CSE', 1, 23011006, NULL, 'Amir', 'khan', 'rahul11111@example.com', '9876543210', '2003-01-06', 'Male', 'Odisha', 'Bhubaneswar', NULL, NULL, NULL, NULL, '23011006.jpg', 23, NULL, '$2b$10$W/LY1RVk6B4xvl8TDtMXZO4yRVsKhThteiQF6trPsxx2ARc3.KX9S', NULL, '2026-03-01'),
                                                                                                                                                                                                                                                                                                                                            ('CSE', 1, 23011007, 'Mathematics', 'Aman', 'Sharma', 'student22@gcekjr.ac.in', '9867896540', '2000-11-25', 'Male', 'Odisha', 'Keonjhar', 'Rajesh Sharma', 'Businessman', 'Sunita Sharma', 'Teacher', NULL, 28, NULL, '$2b$10$MHmx/9gjquwpzdLcPyI3ZOClvuHYdPyMhfCgjw48IsrpP8grmkFtO', 1, '2026-03-03');

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
                           `subjectcode` varchar(20) DEFAULT NULL,
                           `subjectname` varchar(50) DEFAULT NULL,
                           `courcecode` varchar(20) DEFAULT NULL,
                           `semoryear` int DEFAULT NULL,
                           `subjecttype` varchar(30) DEFAULT NULL,
                           `theorymarks` int DEFAULT NULL,
                           `practicalmarks` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`subjectcode`, `subjectname`, `courcecode`, `semoryear`, `subjecttype`, `theorymarks`, `practicalmarks`) VALUES
                                                                                                                                    ('CSPC3002', 'OS', 'BTECHCSE', 1, 'core', 100, 50),
                                                                                                                                    ('CSPC3003', 'AIML', 'BTECHCSE', 1, 'core', 100, 50),
                                                                                                                                    ('CSPC3005', 'IOT', 'BTECHCSE', 2, 'core', 100, 50),
                                                                                                                                    ('CPCS2001', 'Basic Mechanical Engineering', 'BCACSE', 1, 'core', 100, 50),
                                                                                                                                    ('CSE002', 'Artificial Intelligence & Machine Learning', 'CSE', 1, 'core', 100, 50),
                                                                                                                                    ('CSE003', 'Internet Of Things', 'CSE', 1, 'core', 100, 50),
                                                                                                                                    ('CSE004', 'Software Engineering', 'CSE', 1, 'core', 100, 50),
                                                                                                                                    ('CSE005', 'IOT', 'CSE', 1, 'core', 100, 50);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
    ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attendance` (`student_id`,`subjectcode`,`attendance_date`,`courcecode`,`semoryear`),
  ADD KEY `idx_lookup` (`subjectcode`,`courcecode`,`semoryear`,`attendance_date`);

--
-- Indexes for table `chat`
--
ALTER TABLE `chat`
    ADD PRIMARY KEY (`sr_no`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
    ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_code` (`course_code`),
  ADD UNIQUE KEY `course_name` (`course_name`);

--
-- Indexes for table `faculties`
--
ALTER TABLE `faculties`
    ADD PRIMARY KEY (`sr_no`),
  ADD UNIQUE KEY `facultyid` (`facultyid`),
  ADD UNIQUE KEY `sr_no` (`sr_no`),
  ADD UNIQUE KEY `emailid` (`emailid`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
    ADD PRIMARY KEY (`sr_no`);

--
-- Indexes for table `result`
--
ALTER TABLE `result`
    ADD PRIMARY KEY (`courcecode`,`semoryear`);

--
-- Indexes for table `rollgenerator`
--
ALTER TABLE `rollgenerator`
    ADD PRIMARY KEY (`courcecode`,`semoryear`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
    ADD PRIMARY KEY (`sr_no`),
  ADD UNIQUE KEY `emailid` (`emailid`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
    ADD UNIQUE KEY `subjectcode` (`subjectcode`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
    MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT for table `chat`
--
ALTER TABLE `chat`
    MODIFY `sr_no` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
    MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `faculties`
--
ALTER TABLE `faculties`
    MODIFY `sr_no` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
    MODIFY `sr_no` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
    MODIFY `sr_no` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
    ADD CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`sr_no`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;