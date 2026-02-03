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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

INSERT INTO `admin` (`collagename`, `address`, `emailid`, `contactnumber`, `website`, `lastlogin`, `password`, `facebook`, `instagram`, `twitter`, `linkedin`, `logo`, `activestatus`) VALUES
('Government College Of Engineering, Keonjhar', 
'Old Town, Jamunalia, Odisha, Pin-758002', 
'principal@gcekjr.ac.in', 
'+91 9437053380', 
'http://gcekjr.ac.in/', 
'03-Feb-2026 12:13:36 PM', 
'admin', 
'https://www.facebook.com/gcekjrofficial/', 
'https://www.instagram.com/gcekjrofficial/', 
'https://twitter.com/gcekjrofficial/', 
'https://in.linkedin.com/school/government-college-of-engineering-keonjhar/', 
NULL, 
0);
COMMIT;

