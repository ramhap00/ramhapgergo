SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

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
  `profilkep` VARCHAR(255) DEFAULT 'default-profile.png',
  `lastActive` DATETIME DEFAULT NULL, -- Itt a hozzáadott lastActive mező
  PRIMARY KEY (`userID`),
  UNIQUE INDEX `felhasznalonev_UNIQUE` (`felhasznalonev` ASC),
  INDEX `asd` (`kuldoID` ASC),
  INDEX `ig` (`fogadoID` ASC)
) ENGINE = InnoDB AUTO_INCREMENT = 30 DEFAULT CHARSET = utf8mb4;

-- -----------------------------------------------------
-- Table `sos_munka`.`posztok`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sos_munka`.`posztok` (
  `posztID` INT(11) NOT NULL AUTO_INCREMENT,
  `userID` INT(11) NULL DEFAULT NULL,
  `vezeteknev` VARCHAR(255) NULL DEFAULT NULL,
  `keresztnev` VARCHAR(255) NULL DEFAULT NULL,
  `telepules` VARCHAR(255) NULL DEFAULT NULL,
  `telefonszam` VARCHAR(255) NULL DEFAULT NULL,
  `kategoria` VARCHAR(255) NULL DEFAULT NULL,
  `datum` DATE NULL DEFAULT NULL,
  `leiras` VARCHAR(255) NULL DEFAULT NULL,
  `fotok` JSON NULL DEFAULT '[]', -- Eleve JSON típus, alapértelmezett üres tömb
  `fejlec` VARCHAR(255) NULL DEFAULT NULL,
  `averageRating` DECIMAL(3,1) DEFAULT 0.0,
  `ratingCount` INT(11) DEFAULT 0,
  PRIMARY KEY (`posztID`),
  INDEX `userID` (`userID` ASC),
  INDEX `kategoria` (`vezeteknev` ASC),
  CONSTRAINT `posztok_ibfk_1`
    FOREIGN KEY (`userID`)
    REFERENCES `sos_munka`.`felhasznaloi_adatok` (`userID`)
    ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 18 DEFAULT CHARSET = utf8mb4;

-- -----------------------------------------------------
-- Table `sos_munka`.`kedvencek`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sos_munka`.`kedvencek` (
  `kedvencID` INT(11) NOT NULL,
  `userID` INT(11) NOT NULL,
  `posztID` INT(11) NOT NULL,
  `datum` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`kedvencID`),
  INDEX `userid_idx` (`userID` ASC),
  INDEX `posztid_idx` (`posztID` ASC),
  CONSTRAINT `posztid`
    FOREIGN KEY (`posztID`)
    REFERENCES `sos_munka`.`posztok` (`posztID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `userid`
    FOREIGN KEY (`userID`)
    REFERENCES `sos_munka`.`felhasznaloi_adatok` (`userID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `sos_munka`.`uzenetek`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sos_munka`.`uzenetek` (
  `uzenetID` INT AUTO_INCREMENT PRIMARY KEY,
  `feladoID` INT NOT NULL,
  `cimzettID` INT NOT NULL,
  `posztID` INT,
  `nap` VARCHAR(10),
  `ora` VARCHAR(5),
  `tartalom` TEXT NOT NULL,
  `allapot` ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  `kuldesIdopont` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `fk_felado_idx` (`feladoID` ASC),
  INDEX `fk_cimzett_idx` (`cimzettID` ASC),
  INDEX `fk_poszt_idx` (`posztID` ASC),
  CONSTRAINT `fk_uzenetek_felado`
    FOREIGN KEY (`feladoID`)
    REFERENCES `sos_munka`.`felhasznaloi_adatok` (`userID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_uzenetek_cimzett`
    FOREIGN KEY (`cimzettID`)
    REFERENCES `sos_munka`.`felhasznaloi_adatok` (`userID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_uzenetek_poszt`
    FOREIGN KEY (`posztID`)
    REFERENCES `sos_munka`.`posztok` (`posztID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `sos_munka`.`ertekelesek`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sos_munka`.`ertekelesek` (
  `ertekelesID` INT(11) NOT NULL AUTO_INCREMENT,
  `post_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `rating` INT(11) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ertekelesID`),
  UNIQUE KEY `user_post_unique` (`post_id`, `user_id`),
  INDEX `fk_post_idx` (`post_id` ASC),
  INDEX `fk_user_idx` (`user_id` ASC),
  CONSTRAINT `fk_ertekelesek_post`
    FOREIGN KEY (`post_id`)
    REFERENCES `sos_munka`.`posztok` (`posztID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ertekelesek_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `sos_munka`.`felhasznaloi_adatok` (`userID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT = 7 DEFAULT CHARSET = utf8mb4;

-- -----------------------------------------------------
-- Table `sos_munka`.`naptar`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sos_munka`.`naptar` (
  `naptarID` INT(11) NOT NULL AUTO_INCREMENT,
  `posztID` INT(11) NOT NULL,
  `userID` INT(11) NOT NULL,
  `nap` VARCHAR(20) NOT NULL,
  `ora` VARCHAR(5) NOT NULL,
  `foglalasDatum` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`naptarID`),
  UNIQUE KEY `post_time_unique` (`posztID`, `nap`, `ora`),
  INDEX `fk_poszt_idx` (`posztID` ASC),
  INDEX `fk_user_idx` (`userID` ASC),
  CONSTRAINT `fk_naptar_poszt`
    FOREIGN KEY (`posztID`)
    REFERENCES `sos_munka`.`posztok` (`posztID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_naptar_user`
    FOREIGN KEY (`userID`)
    REFERENCES `sos_munka`.`felhasznaloi_adatok` (`userID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT = 14 DEFAULT CHARSET = utf8mb4;

-- -----------------------------------------------------
-- Table `sos_munka`.`beszelgetesek`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sos_munka`.`beszelgetesek` (
  `beszelgetesID` INT AUTO_INCREMENT PRIMARY KEY,
  `feladoID` INT NOT NULL,
  `cimzettID` INT NOT NULL,
  `tartalom` TEXT NOT NULL,
  `kuldesIdopont` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `olvasott` TINYINT(1) DEFAULT 0,
  INDEX `fk_felado_idx` (`feladoID` ASC),
  INDEX `fk_cimzett_idx` (`cimzettID` ASC),
  CONSTRAINT `fk_beszelgetesek_felado`
    FOREIGN KEY (`feladoID`)
    REFERENCES `sos_munka`.`felhasznaloi_adatok` (`userID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_beszelgetesek_cimzett`
    FOREIGN KEY (`cimzettID`)
    REFERENCES `sos_munka`.`felhasznaloi_adatok` (`userID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- -----------------------------------------------------
-- Table `sos_munka`.`velemenyek`
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `sos_munka`.`velemenyek` (
 `velemenyID` INT(11) NOT NULL AUTO_INCREMENT,
 `posztID` INT(11) NOT NULL,
 `userID` INT(11) NOT NULL,
 `szoveg` TEXT NOT NULL,
 `datum` DATETIME DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (`velemenyID`),
 INDEX `fk_velemenyek_poszt_idx` (`posztID` ASC),
 INDEX `fk_velemenyek_user_idx` (`userID` ASC),
 CONSTRAINT `fk_velemenyek_poszt`
   FOREIGN KEY (`posztID`)
   REFERENCES `sos_munka`.`posztok` (`posztID`)
   ON DELETE CASCADE
   ON UPDATE NO ACTION,
 CONSTRAINT `fk_velemenyek_user`
   FOREIGN KEY (`userID`)
   REFERENCES `sos_munka`.`felhasznaloi_adatok` (`userID`)
   ON DELETE CASCADE
   ON UPDATE NO ACTION
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;