CREATE DATABASE IF NOT EXISTS edutrack CHARACTER SET utf8mb4;

USE edutrack;

CREATE TABLE IF NOT EXISTS students (
  studentId INT AUTO_INCREMENT PRIMARY KEY,
  firstName varchar(50) NOT NULL,
  lastName varchar(50) NOT NULL,
  email varchar(100) NOT NULL UNIQUE,
  yearLevel tinyint NOT NULL,
  CHECK(yearLevel BETWEEN 1 AND 4)
);

CREATE TABLE IF NOT EXISTS teachers (
  teacherId INT AUTO_INCREMENT PRIMARY KEY,
  firstName varchar(50) NOT NULL,
  lastName varchar(50) NOT NULL,
  email varchar(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS courses (
  courseId INT AUTO_INCREMENT PRIMARY KEY,
  courseName varchar(100) NOT NULL,
  description varchar(255) NULL,
  teacherId int NOT NULL,
  FOREIGN KEY (teacherId) REFERENCES teachers(teacherId) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS enrollments (
  enrollmentId INT AUTO_INCREMENT PRIMARY KEY,
  studentId int NOT NULL,
  FOREIGN KEY (studentId) REFERENCES students(studentId) ON DELETE RESTRICT,
  courseId int NOT NULL,
  FOREIGN KEY (courseId) REFERENCES courses(courseId) ON DELETE RESTRICT,
  dateEnrolled date NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'Active',
  UNIQUE(studentId, courseId),
  CHECK(status IN ('Active','Dropped'))
);

CREATE TABLE IF NOT EXISTS attendances (
  attendanceId INT AUTO_INCREMENT PRIMARY KEY,
  enrollmentId int NOT NULL,
  FOREIGN KEY (enrollmentId) REFERENCES enrollments(enrollmentId) ON DELETE RESTRICT,
  attendanceDate date NOT NULL,
  status varchar(15) NOT NULL,
  UNIQUE(enrollmentId, attendanceDate),
  CHECK(status IN ('Present','Absent','Late'))
);

CREATE TABLE IF NOT EXISTS grades (
  gradeId INT AUTO_INCREMENT PRIMARY KEY,
  enrollmentId int NOT NULL,
  FOREIGN KEY (enrollmentId) REFERENCES enrollments(enrollmentId) ON DELETE RESTRICT,
  teacherId int NOT NULL,
  FOREIGN KEY (teacherId) REFERENCES teachers(teacherId) ON DELETE RESTRICT,
  gradeValue decimal(5,2) NOT NULL,
  dateRecorded date NOT NULL,
  CHECK(gradeValue BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS accounts (id INT AUTO_INCREMENT PRIMARY KEY,email VARCHAR(100) UNIQUE NOT NULL,passwordHash VARCHAR(255) NOT NULL,role ENUM('admin','teacher','student') NOT NULL,studentId INT UNIQUE NULL,teacherId INT UNIQUE NULL, FOREIGN KEY(studentId) REFERENCES students(studentId), FOREIGN KEY(teacherId) REFERENCES teachers(teacherId), CHECK ((role='admin' AND studentId IS NULL AND teacherId IS NULL) OR (role='student' AND studentId IS NOT NULL AND teacherId IS NULL) OR (role='teacher' AND studentId IS NULL AND teacherId IS NOT NULL)));