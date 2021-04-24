-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 24, 2021 at 05:40 AM
-- Server version: 8.0.22
-- PHP Version: 7.3.24-(to be removed in future macOS)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kmquotes`
--

-- --------------------------------------------------------

--
-- Table structure for table `address`
--

CREATE TABLE `address` (
  `id` int NOT NULL,
  `street_number` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `province` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `postal` varchar(255) NOT NULL,
  `customer_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `address`
--

INSERT INTO `address` (`id`, `street_number`, `city`, `province`, `country`, `postal`, `customer_id`) VALUES
(1, '1700 Salty Rd', 'Vancouver', 'BC', 'Canada', 'V2S 7R2', 1),
(2, '111 Bayshore Dr.', 'Vancouver', 'BC', 'Canada', 'V1R 7C5', 2),
(3, '123 Vedder Rd.', 'Chilliwack', 'BC', 'Canada', 'V2S 7R2', 3);

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `id` int NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`id`, `first_name`, `last_name`, `phone`, `email`) VALUES
(1, 'Andrew', 'Ledger', '(555) 779-5004', 'andrewldgr@gmail.com'),
(2, 'Katie', 'Ledger', '(604) 555-1234', 'katie.ledger@student.ufv.ca'),
(3, 'John', 'Smith', '(778) 555-4435', 'john.smith@student.ufv.ca');

-- --------------------------------------------------------

--
-- Table structure for table `line_item`
--

CREATE TABLE `line_item` (
  `id` int NOT NULL,
  `quote_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text NOT NULL,
  `quantity` float NOT NULL,
  `price` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `line_item`
--

INSERT INTO `line_item` (`id`, `quote_id`, `title`, `description`, `quantity`, `price`) VALUES
(1, 1, 'Kitchen Refinishing', 'Kitchen cabinet doors (10), drawer faces (10), and shelves (2) will be un-installed, cleaned, sanded and refinished using a tinted lacquer, applied by a spray application in a stock colour at our facility. Total coating system will have a 4mil dry build. Kitchen cabinet frame will be cleaned, sanded, and refinished using a tinted lacquer, applied by a spray application in a stock colour in place. Total coating system will have a 4m dry build. Doors and drawers will be re-installed.', 1, 3724.56),
(2, 1, 'Handles', 'Part# 9635-128-BNI', 25, 7),
(3, 1, 'Hardware Installation', '$2 per handle to install', 25, 2),
(4, 2, 'Kitchen Refinishing', 'Your entire kitchen will be painted', 1, 2344.52),
(5, 3, 'Furniture', 'Furniture must be transported to shop, where we will refinish and spray it with paint', 1, 425.35),
(6, 4, 'Bathroom Refinishing', 'Bathroom will be refinishing using a tinted polyurethane', 1, 390.83);

-- --------------------------------------------------------

--
-- Table structure for table `quote`
--

CREATE TABLE `quote` (
  `id` int NOT NULL,
  `customer_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `quote`
--

INSERT INTO `quote` (`id`, `customer_id`) VALUES
(1, 1),
(2, 2),
(3, 1),
(4, 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `address`
--
ALTER TABLE `address`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `line_item`
--
ALTER TABLE `line_item`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quote`
--
ALTER TABLE `quote`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `address`
--
ALTER TABLE `address`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `line_item`
--
ALTER TABLE `line_item`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `quote`
--
ALTER TABLE `quote`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
