-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : Dim 24 oct. 2021 à 23:32
-- Version du serveur :  5.7.31
-- Version de PHP : 7.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `esprit`
--

-- --------------------------------------------------------

--
-- Structure de la table `champion`
--

DROP TABLE IF EXISTS `champion`;
CREATE TABLE IF NOT EXISTS `champion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `champPic` int(11) NOT NULL,
  `champName` varchar(255) NOT NULL,
  `champRole` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `champion`
--

INSERT INTO `champion` (`id`, `champPic`, `champName`, `champRole`) VALUES
(1, 2131165297, 'Lee Sin', 'COMBATTANT: Jungler'),
(2, 2131165301, 'Miss Fortune', 'TIREUR: ADC'),
(3, 2131165308, 'Thresh', 'SUPPORT'),
(4, 2131165306, 'Nasus', 'COMBATTANT: Top'),
(5, 2131165287, 'Ahri', 'MAGE: MID'),
(6, 2131165289, 'Ashe', 'TIREUR: ADC'),
(7, 2131165290, 'Blitzcrank', 'TANK: Support'),
(8, 2131165293, 'Ekko', 'ASSASSIN: MID/Jungle'),
(9, 2131165307, 'Quinn', 'TIREUR: TOP'),
(10, 2131165309, 'Velkoz', 'MAGE: MID/Support');

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `age` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `login`, `password`, `age`) VALUES
(1, 'ben ali', 'ali', 25),
(2, 'ben salah', 'salah', 26),
(3, 'test', 'test', 25);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
