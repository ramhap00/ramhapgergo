-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema sos_munka
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema sos_munka
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `sos_munka` DEFAULT CHARACTER SET utf8mb4 ;
USE `sos_munka` ;

-- -----------------------------------------------------
-- Table `sos_munka`.`felhasznaloi_adatok`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sos_munka`.`felhasznaloi_adatok` (
  `userID` INT(11) NOT NULL AUTO_INCREMENT,
  `kuldoID` INT(11) NOT NULL,
  `fogadoID` INT(11) NOT NULL,
  `vezeteknev` VARCHAR(255) NULL DEFAULT NULL,
  `keresztnev` VARCHAR(255) NULL DEFAULT NULL,
  `felhasznalonev` VARCHAR(255) NULL DEFAULT NULL,
  `jelszo` VARCHAR(255) NULL DEFAULT NULL,
  `emailcim` VARCHAR(255) NULL DEFAULT NULL,
  `telefonszam` VARCHAR(20) NULL DEFAULT NULL,
  `telepules` VARCHAR(255) NULL DEFAULT NULL,
  `letrehozasDatum` DATE NULL DEFAULT NULL,
  `modositasDatum` DATE NULL DEFAULT NULL,
  `admin` TINYINT(1) NULL DEFAULT NULL,
  `munkasreg` TINYINT(1) NULL DEFAULT NULL,
  PRIMARY KEY (`userID`),
  INDEX `asd` (`kuldoID` ASC) ,
  INDEX `ig` (`fogadoID` ASC) )
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `sos_munka`.`kategoriak`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sos_munka`.`kategoriak` (
  `kategoriID` INT(11) NOT NULL AUTO_INCREMENT,
  `megnevezes` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`kategoriID`),
  UNIQUE INDEX `megnevezes` (`megnevezes` ASC) )
ENGINE = InnoDB
AUTO_INCREMENT = 10
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `sos_munka`.`posztok`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sos_munka`.`posztok` (
  `posztID` INT(11) NOT NULL AUTO_INCREMENT,
  `userID` INT(11) NULL DEFAULT NULL,
  `kategoria` INT(11) NULL DEFAULT NULL,
  `cim` VARCHAR(255) NULL DEFAULT NULL,
  `leiras` TEXT NULL DEFAULT NULL,
  `munkasok_szama` VARCHAR(255) NULL DEFAULT NULL,
  `telefonszam` VARCHAR(20) NULL DEFAULT NULL,
  `telepules` VARCHAR(255) NULL DEFAULT NULL,
  `letrehozasDatum` DATE NULL DEFAULT NULL,
  `modositasDatum` DATE NULL DEFAULT NULL,
  `valid` TINYINT(1) NULL DEFAULT NULL,
  `validDatum` DATE NULL DEFAULT NULL,
  `fenykep` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`posztID`),
  INDEX `userID` (`userID` ASC) ,
  INDEX `kategoria` (`kategoria` ASC) ,
  CONSTRAINT `posztok_ibfk_1`
    FOREIGN KEY (`userID`)
    REFERENCES `sos_munka`.`felhasznaloi_adatok` (`userID`)
    ON DELETE CASCADE,
  CONSTRAINT `posztok_ibfk_2`
    FOREIGN KEY (`kategoria`)
    REFERENCES `sos_munka`.`kategoriak` (`kategoriID`)
    ON DELETE SET NULL)
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `sos_munka`.`kedvencek`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sos_munka`.`kedvencek` (
  `kedvencID` INT(11) NOT NULL,
  `userID` INT(11) NOT NULL,
  `posztID` INT(11) NOT NULL,
  `datum` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`kedvencID`),
  INDEX `userid_idx` (`userID` ASC) ,
  INDEX `posztid_idx` (`posztID` ASC) ,
  CONSTRAINT `posztid`
    FOREIGN KEY (`posztID`)
    REFERENCES `sos_munka`.`posztok` (`posztID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `userid`
    FOREIGN KEY (`userID`)
    REFERENCES `sos_munka`.`felhasznaloi_adatok` (`userID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `sos_munka`.`uzenetek`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sos_munka`.`uzenetek` (
  `uzenetID` INT(11) NOT NULL,
  `kuldoID` INT(11) NOT NULL,
  `fogadoID` INT(11) NOT NULL,
  `uzenetekcol` VARCHAR(45) NOT NULL,
  `uzenet` VARCHAR(45) NOT NULL,
  `kuldesi_datum` DATETIME NULL DEFAULT NULL,
  `olvasott` TINYINT(4) NULL DEFAULT NULL,
  PRIMARY KEY (`uzenetID`),
  INDEX `fkkuldo_idx` (`kuldoID` ASC) ,
  INDEX `asdas` (`fogadoID` ASC) ,
  CONSTRAINT `asder`
    FOREIGN KEY (`fogadoID`)
    REFERENCES `sos_munka`.`felhasznaloi_adatok` (`fogadoID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fkkuldo`
    FOREIGN KEY (`kuldoID`)
    REFERENCES `sos_munka`.`felhasznaloi_adatok` (`kuldoID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
