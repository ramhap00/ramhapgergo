-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Gép: localhost:8889
-- Létrehozás ideje: 2022. Ápr 26. 07:38
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

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `eu_adatok`
--

CREATE TABLE `eu_adatok` (
  `id` int(11) NOT NULL,
  `datum` date DEFAULT NULL,
  `szazalekpont` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `eu_zonadatok`
--

CREATE TABLE `eu_zonadatok` (
  `zonakID` int(11) NOT NULL,
  `adatokID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `eu_zonak`
--

CREATE TABLE `eu_zonak` (
  `id` int(11) NOT NULL,
  `zonanev` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `vilagkereskedelem_zonak`
--

CREATE TABLE `vilagkereskedelem_zonak` (
  `id` int(11) NOT NULL,
  `zonanev` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `eu_zonak`
--
ALTER TABLE `eu_zonak`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `magyar_havi_adatok`
--
ALTER TABLE `magyar_havi_adatok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `vilagkereskedelem_adatok`
--
ALTER TABLE `vilagkereskedelem_adatok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `vilagkereskedelem_zonak`
--
ALTER TABLE `vilagkereskedelem_zonak`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
