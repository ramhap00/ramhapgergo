-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Gép: localhost:8889
-- Létrehozás ideje: 2022. Ápr 26. 07:37
-- Kiszolgáló verziója: 5.7.34
-- PHP verzió: 7.4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `covid`
--
CREATE DATABASE IF NOT EXISTS `covid` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `covid`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `eu_adatok`
--

CREATE TABLE `eu_adatok` (
  `id` int(11) NOT NULL,
  `datum` date DEFAULT NULL,
  `szazalekpont` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- A tábla adatainak kiíratása `eu_adatok`
--

INSERT INTO `eu_adatok` (`id`, `datum`, `szazalekpont`) VALUES
(1, '2021-01-01', -1),
(2, '2021-01-01', 12.6),
(3, '2021-01-01', 1.5),
(4, '2021-01-01', 2),
(5, '2021-02-01', -0.9),
(6, '2021-02-01', 4.9),
(7, '2021-02-01', 3.2),
(8, '2021-02-01', 3.9),
(9, '2021-03-01', -6.6),
(10, '2021-03-01', 13.6),
(11, '2021-03-01', 4.5),
(12, '2021-03-01', 10.6),
(13, '2021-04-01', -28.7),
(14, '2021-04-01', -41.71),
(15, '2021-04-01', -21.5),
(16, '2021-04-01', -35);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `eu_zonadatok`
--

CREATE TABLE `eu_zonadatok` (
  `zonakID` int(11) NOT NULL,
  `adatokID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- A tábla adatainak kiíratása `eu_zonadatok`
--

INSERT INTO `eu_zonadatok` (`zonakID`, `adatokID`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(2, 5),
(2, 6),
(2, 7),
(2, 8),
(3, 9),
(3, 10),
(3, 11),
(3, 12),
(4, 13),
(4, 14),
(4, 15),
(4, 16);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `eu_zonak`
--

CREATE TABLE `eu_zonak` (
  `id` int(11) NOT NULL,
  `zonanev` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- A tábla adatainak kiíratása `eu_zonak`
--

INSERT INTO `eu_zonak` (`id`, `zonanev`) VALUES
(1, 'Nyugat-Európa'),
(2, 'Dél-Európa'),
(3, 'Észak-Európa'),
(4, 'Visegrádi országok');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `magyar_havi_adatok`
--

CREATE TABLE `magyar_havi_adatok` (
  `id` int(11) NOT NULL,
  `datum` date DEFAULT NULL,
  `import` float(11,2) DEFAULT NULL,
  `export` float DEFAULT NULL
) ENGINE=InnoDB AVG_ROW_LENGTH=399 DEFAULT CHARSET=utf8;

--
-- A tábla adatainak kiíratása `magyar_havi_adatok`
--

INSERT INTO `magyar_havi_adatok` (`id`, `datum`, `import`, `export`) VALUES
(1, '2017-01-01', 7182.20, 7672.09),
(2, '2017-02-01', 7357.33, 8136.3),
(3, '2017-03-01', 8672.22, 9490.86),
(4, '2017-04-01', 6950.34, 7765.47),
(5, '2017-05-01', 8235.47, 9091.72),
(6, '2017-06-01', 7911.15, 8770.38),
(7, '2017-07-01', 7289.40, 7571.56),
(8, '2017-08-01', 7475.92, 7908.12),
(9, '2017-09-01', 7899.38, 8866.84),
(10, '2017-10-01', 8350.21, 8875.07),
(11, '2017-11-01', 8380.32, 9062.06),
(12, '2017-12-01', 6898.50, 7469.56),
(13, '2018-01-01', 7848.20, 8455.32),
(14, '2018-02-01', 7684.73, 8527.03),
(15, '2018-03-01', 8523.32, 9219.94),
(16, '2018-04-01', 8072.45, 8555.1),
(17, '2018-05-01', 8525.07, 9016.24),
(18, '2018-06-01', 8572.17, 9560.08),
(19, '2018-07-01', 8113.28, 8370.26),
(20, '2018-08-01', 7996.62, 7934.59),
(21, '2018-09-01', 8462.86, 8643.98),
(22, '2018-10-01', 9236.85, 9450.94),
(23, '2018-11-01', 9039.04, 9479.52),
(24, '2018-12-01', 7260.07, 7641.63),
(25, '2019-01-01', 8593.41, 8977.58),
(26, '2019-02-01', 8299.41, 9074.34),
(27, '2019-03-01', 9064.22, 9708.44),
(28, '2019-04-01', 8713.26, 8942.38),
(29, '2019-05-01', 8859.18, 9505.85),
(30, '2019-06-01', 8319.51, 8815.17);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `vilagkereskedelem_adatok`
--

CREATE TABLE `vilagkereskedelem_adatok` (
  `id` int(11) NOT NULL,
  `zonaID` int(11) DEFAULT NULL,
  `szazalekpont` float(11,2) DEFAULT NULL,
  `datum` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- A tábla adatainak kiíratása `vilagkereskedelem_adatok`
--

INSERT INTO `vilagkereskedelem_adatok` (`id`, `zonaID`, `szazalekpont`, `datum`) VALUES
(1, 1, 104.30, '2019-01-01'),
(2, 2, 102.90, '2019-01-01'),
(3, 3, 100.50, '2019-01-01'),
(4, 4, 102.70, '2019-02-01'),
(5, 5, 102.20, '2019-02-01'),
(6, 6, 100.70, '2019-02-01'),
(7, 7, 103.90, '2019-03-01'),
(8, 8, 103.20, '2019-03-01'),
(9, 9, 100.50, '2019-03-01'),
(10, 10, 101.70, '2019-04-01'),
(11, 11, 102.70, '2019-04-02'),
(12, 12, 104.00, '2019-04-03'),
(13, 13, 104.10, '2019-05-01'),
(14, 14, 103.00, '2019-05-02'),
(15, 15, 95.90, '2019-05-03'),
(16, 16, 103.30, '2019-06-01'),
(17, 17, 102.60, '2019-06-02'),
(18, 18, 98.60, '2019-06-03'),
(19, 19, 103.80, '2019-07-01'),
(20, 20, 102.50, '2019-07-02'),
(21, 21, 99.10, '2019-07-03'),
(22, 22, 104.40, '2019-08-01'),
(23, 23, 102.00, '2019-08-02'),
(24, 24, 106.30, '2019-08-03'),
(25, 25, 102.40, '2019-09-01'),
(26, 26, 102.30, '2019-09-02'),
(27, 27, 103.00, '2019-09-03'),
(28, 28, 100.80, '2019-10-01'),
(29, 29, 101.80, '2019-10-02'),
(30, 30, 105.60, '2019-10-03'),
(31, 31, 99.90, '2019-11-01'),
(32, 32, 101.00, '2019-11-02'),
(33, 33, 107.08, '2019-11-03'),
(34, 34, 102.03, '2019-12-01'),
(35, 35, 99.10, '2019-12-02'),
(36, 36, 107.90, '2019-12-03'),
(37, 37, 100.00, '2020-01-01'),
(38, 38, 100.00, '2020-01-02'),
(39, 39, 100.00, '2020-01-03'),
(40, 40, 98.10, '2020-02-01'),
(41, 41, 100.50, '2020-02-02'),
(42, 42, 96.80, '2020-02-03'),
(43, 43, 98.40, '2020-03-01'),
(44, 44, 91.00, '2020-03-02'),
(45, 45, 102.90, '2020-03-03'),
(46, 46, 87.30, '2020-04-01'),
(47, 47, 75.50, '2020-04-02'),
(48, 48, 99.10, '2020-04-03'),
(54, 0, 0.00, '0000-00-00');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `vilagkereskedelem_zonak`
--

CREATE TABLE `vilagkereskedelem_zonak` (
  `id` int(11) NOT NULL,
  `zonanev` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- A tábla adatainak kiíratása `vilagkereskedelem_zonak`
--

INSERT INTO `vilagkereskedelem_zonak` (`id`, `zonanev`) VALUES
(1, 'Egyesült Államok'),
(2, 'Eurózóna'),
(3, 'Kína');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `eu_adatok`
--
ALTER TABLE `eu_adatok`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `eu_zonadatok`
--
ALTER TABLE `eu_zonadatok`
  ADD PRIMARY KEY (`zonakID`,`adatokID`),
  ADD KEY `zonakID` (`zonakID`) USING BTREE,
  ADD KEY `adatokID` (`adatokID`) USING BTREE;

--
-- A tábla indexei `eu_zonak`
--
ALTER TABLE `eu_zonak`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `magyar_havi_adatok`
--
ALTER TABLE `magyar_havi_adatok`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `vilagkereskedelem_adatok`
--
ALTER TABLE `vilagkereskedelem_adatok`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `vilagkereskedelem_zonak`
--
ALTER TABLE `vilagkereskedelem_zonak`
  ADD PRIMARY KEY (`id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `eu_adatok`
--
ALTER TABLE `eu_adatok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT a táblához `eu_zonak`
--
ALTER TABLE `eu_zonak`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT a táblához `magyar_havi_adatok`
--
ALTER TABLE `magyar_havi_adatok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT a táblához `vilagkereskedelem_adatok`
--
ALTER TABLE `vilagkereskedelem_adatok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT a táblához `vilagkereskedelem_zonak`
--
ALTER TABLE `vilagkereskedelem_zonak`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `eu_zonadatok`
--
ALTER TABLE `eu_zonadatok`
  ADD CONSTRAINT `eu_zonadatok_ibfk_1` FOREIGN KEY (`zonakID`) REFERENCES `eu_zonak` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `eu_zonadatok_ibfk_2` FOREIGN KEY (`adatokID`) REFERENCES `eu_adatok` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
