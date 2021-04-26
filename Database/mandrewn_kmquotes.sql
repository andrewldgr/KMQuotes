-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 26, 2021 at 02:27 AM
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
-- Database: `mandrewn_kmquotes`
--

-- --------------------------------------------------------

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
CREATE TABLE `address` (
  `id` int NOT NULL,
  `street_number` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `province` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `postal` varchar(255) NOT NULL,
  `customer_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `address`
--

INSERT INTO `address` (`id`, `street_number`, `city`, `province`, `country`, `postal`, `customer_id`) VALUES
(1, '1754 Salty Rd', 'Abbotsford', 'BC', 'Canada', 'V2S 7C5', 1),
(2, '111 Bayshore Dr.', 'Vancouver', 'BC', 'Canada', 'V1R 7C5', 2),
(5, '123 Abstract Way', 'Toronto', 'Ontario', 'Canada', 'G3E 4J8', 6),
(6, '123 Progress Way', 'Chilliwack', 'BC', 'Canada', 'V5H 2F4', 7),
(7, '123 bart way', 'Springfield', 'TX', 'USA', '83345', 8),
(9, '123456 123st', 'Youkon', 'NWT', 'Canada', 'H3R 4R7', 10);

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
CREATE TABLE `customer` (
  `id` int NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`id`, `first_name`, `last_name`, `phone`, `email`) VALUES
(1, 'Andrew', 'Ledger', '(604) 555-1234', 'andrew.ledger@student.ufv.ca'),
(2, 'Katie', 'Ledger', '(604) 555-1234', 'katie.ledger@student.ufv.ca'),
(6, 'Joyce', 'Fredrickson', '555-123-4456', 'joyce.fred@gmail.com'),
(7, 'Another', 'Customer', '123-444-4444', 'moreemails@gmail.com'),
(8, 'Homer', 'Simpson', '123-456-9999', 'homer@nuclear.com'),
(10, 'Andrew', 'The Man', '444-123-5555', 'theman@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `line_item`
--

DROP TABLE IF EXISTS `line_item`;
CREATE TABLE `line_item` (
  `id` int NOT NULL,
  `quote_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `description` text NOT NULL,
  `quantity` float NOT NULL,
  `price` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `line_item`
--

INSERT INTO `line_item` (`id`, `quote_id`, `title`, `description`, `quantity`, `price`) VALUES
(1, 1, 'Kitchen Refinishing | Poly', 'Kitchen cabinet doors (100), drawer faces (10), and shelves (2) will be un-installed, cleaned, sanded and refinished using a tinted lacquer, applied by a spray application in a stock colour at our facility. Total coating system will have a 4mil dry build. Kitchen cabinet frame will be cleaned, sanded, and refinished using a tinted lacquer, applied by a spray application in a stock colour in place. Total coating system will have a 4m dry build. Doors and drawers will be re-installed.', 1, 1000),
(2, 1, 'Handles', 'Part# 9635-128-BNI', 25, 7),
(4, 2, 'Kitchen Refinishing', 'Your entire kitchen will be paintedd', 1, 2344.52),
(5, 3, 'Furniture', 'Furniture must be transported to shop, where we will refinish and spray it with paint', 1, 425.35),
(16, 1, '', '', 1, 100),
(17, 8, 'Kitchen Cabinet Refinishing', 'This is a line item for kitchen cabinet refinishing', 4, 3000),
(18, 9, 'Furniture', '3 Chairs will be cleaned, sanded, and sprayed with a paint', 3, 75),
(19, 10, 'Kitchen Cabinet Refinishing', 'Cabinets will be removed and then put back on', 3, 123),
(21, 12, 'Door Refinishing', 'Door will be transported by customer to the shop and refinished using a painting process', 3, 400),
(33, 2, '', '', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `quote`
--

DROP TABLE IF EXISTS `quote`;
CREATE TABLE `quote` (
  `id` int NOT NULL,
  `address_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `quote`
--

INSERT INTO `quote` (`id`, `address_id`) VALUES
(1, 1),
(2, 2),
(8, 5),
(9, 6),
(10, 7),
(12, 9);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `line_item`
--
ALTER TABLE `line_item`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `quote`
--
ALTER TABLE `quote`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
