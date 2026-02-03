SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE collegedata;
USE collegedata;

CREATE TABLE `admin` (
  `collagename` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `emailid` varchar(255) DEFAULT NULL,
  `contactnumber` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `lastlogin` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `twitter` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `logo` longblob DEFAULT NULL,
  `activestatus` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admin` (`collagename`, `address`, `emailid`, `contactnumber`, `website`, `lastlogin`, `password`, `facebook`, `instagram`, `twitter`, `linkedin`, `logo`, `activestatus`) VALUES
('Government College Of Engineering, Keonjhar', 
'Old Town, Jamunalia, Odisha, Pin-758002', 
'principal@gcekjr.ac.in', 
'+91 9437053380', 
'http://gcekjrr.ac.in/', 
'03-Feb-2026 12:13:36 PM', 
'admin', 
'https://www.facebook.com/gcekjrofficial/', 
'https://www.instagram.com/gcekjrofficial/', 
'https://twitter.com/gcekjrofficial/', 
'https://in.linkedin.com/school/government-college-of-engineering-keonjhar/', 
NULL, 
0);

CREATE TABLE `students` (
  `Courcecode` varchar(255) DEFAULT NULL,
  `semoryear` int(255) DEFAULT NULL,
  `rollnumber` bigint(255) DEFAULT NULL,
  `optionalsubject` varchar(255) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `emailid` varchar(255) DEFAULT NULL,
  `contactnumber` varchar(255) DEFAULT NULL,
  `dateofbirth` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `fathername` varchar(255) DEFAULT NULL,
  `fatheroccupation` varchar(255) DEFAULT NULL,
  `mothername` varchar(255) DEFAULT NULL,
  `motheroccupation` varchar(255) DEFAULT NULL,
  `profilepic` longblob DEFAULT NULL,
  `sr_no` int(255) NOT NULL,
  `lastlogin` varchar(255) DEFAULT NULL,
  `userid` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `activestatus` tinyint(4) DEFAULT 0,
  `admissiondate` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO students (userid, password)
VALUES ('student', '1234');

ALTER TABLE `students`
  ADD PRIMARY KEY (`sr_no`);

ALTER TABLE `students`
  MODIFY `sr_no` int(11) NOT NULL AUTO_INCREMENT;

COMMIT;

CREATE TABLE `faculties` (
  `facultyid` varchar(11) DEFAULT NULL,
  `facultyname` varchar(30) DEFAULT NULL,
  `state` varchar(30) DEFAULT NULL,
  `city` varchar(30) DEFAULT NULL,
  `emailid` varchar(50) DEFAULT NULL,
  `contactnumber` varchar(20) DEFAULT NULL,
  `qualification` varchar(30) DEFAULT NULL,
  `experience` varchar(30) DEFAULT NULL,
  `birthdate` varchar(30) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `profilepic` longblob DEFAULT NULL,
  `courcecode` varchar(20) DEFAULT 'NOT ASSIGNED',
  `semoryear` int(11) DEFAULT 0,
  `subject` varchar(40) DEFAULT 'NOT ASSIGNED',
  `position` varchar(40) DEFAULT 'NOT ASSIGNED',
  `sr_no` int(11) NOT NULL,
  `lastlogin` varchar(100) DEFAULT NULL,
  `password` varchar(30) DEFAULT NULL,
  `activestatus` tinyint(4) DEFAULT 0,
  `joineddate` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO faculties (facultyid, password)
VALUES ('faculty', '2006');

ALTER TABLE `faculties`
  ADD PRIMARY KEY (`sr_no`);

ALTER TABLE `faculties`
  MODIFY `sr_no` int(11) NOT NULL AUTO_INCREMENT;
