-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: prof_platform
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activites`
--

DROP TABLE IF EXISTS `activites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `classe_id` int NOT NULL,
  `cours_id` int DEFAULT NULL,
  `titre` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `contexte` text COLLATE utf8mb4_unicode_ci,
  `consignes` text COLLATE utf8mb4_unicode_ci,
  `production_attendue` text COLLATE utf8mb4_unicode_ci,
  `criteres_reussite` text COLLATE utf8mb4_unicode_ci,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `statut` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `rendu_aux_eleves` tinyint(1) NOT NULL DEFAULT '0',
  `rendu_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `classe_id` (`classe_id`),
  KEY `cours_id` (`cours_id`),
  CONSTRAINT `activites_ibfk_1` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `activites_ibfk_2` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activites`
--

LOCK TABLES `activites` WRITE;
/*!40000 ALTER TABLE `activites` DISABLE KEYS */;
INSERT INTO `activites` VALUES (1,6,NULL,'Découverte et technologie des composants électronique','',NULL,'','',NULL,NULL,NULL,'a_faire','2026-09-11 11:12:00','2026-09-11 11:12:00',0,NULL),(2,4,NULL,'Découverte et technologie des composants électronique','',NULL,'','',NULL,NULL,NULL,'a_faire','2026-09-11 12:06:08','2026-09-11 12:06:08',0,NULL),(3,4,NULL,'Saisie d\'un schéma électronique avec le logiciel PROTEUS ','',NULL,'','',NULL,NULL,NULL,'a_faire','2026-09-11 12:07:48','2026-09-11 12:07:48',0,NULL),(4,4,NULL,'Prise en Main de Circuit JS1 (Simulation électronique)','',NULL,'','',NULL,NULL,NULL,'a_faire','2026-09-11 12:09:01','2026-09-11 12:09:01',0,NULL),(5,4,NULL,'Routage Manuel d\'un Circuit imprimé (PCB)','',NULL,'','',NULL,NULL,NULL,'a_faire','2026-09-11 12:10:14','2026-09-11 12:10:14',0,NULL),(6,4,NULL,'Analyser Une Carte électronique (Les Blocs Fonctionnels)','',NULL,'','',NULL,NULL,NULL,'a_faire','2026-09-11 12:12:41','2026-09-11 12:12:41',0,NULL),(7,5,NULL,'Analyser un Cahier de charges','',NULL,'','',NULL,NULL,NULL,'a_faire','2026-09-11 12:38:59','2026-09-11 12:38:59',0,NULL),(8,5,NULL,'Concevoir un système électronique','',NULL,'','',NULL,NULL,NULL,'a_faire','2026-09-11 12:39:40','2026-09-11 12:39:40',0,NULL),(9,5,NULL,'Conception Carte Domotique','',NULL,'','',NULL,NULL,NULL,'a_faire','2026-09-11 12:40:22','2026-09-11 12:40:22',0,NULL),(10,6,NULL,'Prise en Main de Circuit JS1','',NULL,'','',NULL,NULL,NULL,'a_faire','2026-09-11 14:16:33','2026-09-11 14:16:33',0,NULL),(11,5,NULL,'Simulation Régulation (Diode Zener) Avec CircuitJS1','',NULL,'','',NULL,NULL,NULL,'a_faire','2026-09-14 07:43:20','2026-09-14 07:43:20',0,NULL),(12,5,NULL,'Conception Alimentation AC vers DC','',NULL,'','',NULL,NULL,NULL,'a_faire','2026-09-14 07:44:36','2026-09-14 07:44:36',0,NULL);
/*!40000 ALTER TABLE `activites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activites_competences`
--

DROP TABLE IF EXISTS `activites_competences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activites_competences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activite_id` int NOT NULL,
  `competence_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `activite_id` (`activite_id`),
  KEY `competence_id` (`competence_id`),
  CONSTRAINT `activites_competences_ibfk_1` FOREIGN KEY (`activite_id`) REFERENCES `activites` (`id`),
  CONSTRAINT `activites_competences_ibfk_2` FOREIGN KEY (`competence_id`) REFERENCES `competences` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activites_competences`
--

LOCK TABLES `activites_competences` WRITE;
/*!40000 ALTER TABLE `activites_competences` DISABLE KEYS */;
INSERT INTO `activites_competences` VALUES (1,1,3),(2,1,4),(3,1,6),(4,1,9),(5,1,11),(6,2,3),(7,2,4),(8,2,6),(9,2,9),(10,2,11),(11,3,4),(12,3,7),(13,4,4),(14,4,6),(15,4,7),(16,5,4),(17,5,7),(18,6,3),(19,6,4),(20,6,6),(21,6,9),(22,6,11),(23,7,1),(24,7,3),(25,7,4),(26,8,1),(27,8,3),(28,8,4),(29,9,4),(30,9,7),(31,9,8),(32,10,4),(33,10,6),(34,10,7),(35,11,4),(36,11,7),(37,12,4),(38,12,6),(39,12,7);
/*!40000 ALTER TABLE `activites_competences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activites_suivis`
--

DROP TABLE IF EXISTS `activites_suivis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activites_suivis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activite_id` int NOT NULL,
  `eleve_id` int NOT NULL,
  `statut` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_activite_suivi_eleve` (`activite_id`,`eleve_id`),
  KEY `eleve_id` (`eleve_id`),
  CONSTRAINT `activites_suivis_ibfk_1` FOREIGN KEY (`activite_id`) REFERENCES `activites` (`id`),
  CONSTRAINT `activites_suivis_ibfk_2` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activites_suivis`
--

LOCK TABLES `activites_suivis` WRITE;
/*!40000 ALTER TABLE `activites_suivis` DISABLE KEYS */;
INSERT INTO `activites_suivis` VALUES (1,1,1,'commencee'),(2,1,2,'commencee'),(3,1,3,'commencee'),(4,1,4,'commencee'),(5,1,10,'commencee'),(6,1,6,'commencee'),(7,1,9,'commencee'),(8,1,5,'commencee'),(9,1,15,'commencee'),(10,1,12,'commencee'),(11,1,11,'commencee'),(12,1,14,'commencee'),(13,1,13,'commencee'),(14,1,7,'commencee'),(15,1,19,'terminee'),(16,1,25,'commencee'),(17,1,24,'commencee'),(18,1,21,'commencee'),(19,1,16,'commencee'),(20,1,27,'terminee'),(21,1,26,'terminee'),(22,1,22,'terminee'),(23,1,20,'terminee'),(24,1,28,'terminee'),(25,1,29,'commencee'),(26,1,23,'commencee'),(27,6,40,'terminee'),(28,6,38,'terminee'),(29,6,31,'terminee'),(30,6,32,'terminee'),(31,6,36,'terminee'),(32,6,34,'terminee'),(33,6,35,'terminee'),(34,6,30,'terminee'),(35,6,44,'terminee'),(36,6,37,'terminee'),(37,6,33,'terminee'),(38,6,39,'terminee'),(39,6,43,'terminee'),(40,6,42,'terminee'),(41,5,35,'commencee'),(42,5,33,'commencee'),(43,4,34,'commencee'),(44,4,36,'commencee'),(45,4,43,'commencee'),(46,4,38,'commencee'),(47,3,35,'terminee'),(48,3,32,'terminee'),(49,3,43,'terminee'),(50,3,39,'terminee'),(51,3,30,'terminee'),(52,3,33,'terminee'),(53,3,34,'terminee'),(54,3,36,'terminee'),(55,3,44,'commencee'),(56,3,31,'commencee'),(57,3,37,'commencee'),(58,3,40,'commencee'),(59,3,42,'commencee'),(60,2,38,'terminee'),(61,2,36,'terminee'),(62,2,43,'terminee'),(63,2,39,'commencee'),(64,9,48,'terminee'),(65,9,54,'commencee'),(66,9,52,'commencee'),(67,9,46,'commencee'),(68,9,55,'commencee'),(69,8,47,'terminee'),(70,7,47,'terminee'),(71,8,45,'commencee'),(72,7,45,'commencee'),(73,8,51,'terminee'),(74,7,51,'terminee'),(75,7,56,'terminee'),(76,8,56,'terminee'),(77,8,50,'terminee'),(78,7,50,'terminee'),(79,8,49,'terminee'),(80,7,49,'terminee'),(81,8,53,'terminee'),(82,7,53,'terminee'),(83,8,57,'terminee'),(84,7,57,'terminee'),(85,10,26,'commencee'),(86,10,22,'commencee'),(87,10,19,'commencee'),(88,10,20,'commencee'),(89,1,18,'commencee'),(90,10,16,'commencee'),(91,10,27,'commencee'),(92,10,28,'commencee'),(93,7,59,'commencee'),(94,9,57,'commencee'),(95,7,58,'commencee'),(96,7,48,'commencee'),(97,9,47,'commencee'),(98,11,49,'commencee'),(99,11,53,'commencee');
/*!40000 ALTER TABLE `activites_suivis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'01','Electronique'),(2,'02','Informatique'),(3,'03','Réseaux'),(4,'04','Cybersécurité'),(5,'05','Projets'),(6,'06','CIEL DIVERS');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `annee_scolaire` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `owner_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_classes_owner_nom` (`owner_id`,`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'2 TNE','2026-2027','2026-09-01 11:11:58',1),(2,'1 CIEL','2026-2027','2026-09-01 11:11:58',1),(3,'T CIEL','2026-2027','2026-09-01 11:11:58',1),(4,'1 CIEL','2026-2027','2026-09-11 10:59:48',2),(5,'T CIEL','2026-2027','2026-09-11 10:59:55',2),(6,'2 TNE','2026-2027','2026-09-11 11:00:02',2),(7,'M2 EEA','2026-2027','2026-09-11 11:01:50',2),(9,'06 - CIEL DIVERS','2026-2027','2026-09-14 07:20:16',1);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `competences`
--

DROP TABLE IF EXISTS `competences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `domaine_id` int NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ordre` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `domaine_id` (`domaine_id`),
  CONSTRAINT `competences_ibfk_1` FOREIGN KEY (`domaine_id`) REFERENCES `domaines_competences` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `competences`
--

LOCK TABLES `competences` WRITE;
/*!40000 ALTER TABLE `competences` DISABLE KEYS */;
INSERT INTO `competences` VALUES (1,1,'C01','COMMUNIQUER EN SITUATION PROFESSIONNELLE (FRANÇAIS/ANGLAIS)','Communiquer en situation professionnelle en français et en anglais',1),(2,1,'C02','ORGANISER','Compétence relevant d\'un niveau 5 - Organiser',2),(3,1,'C03','PARTICIPER A UN PROJET','Participer à un projet',3),(4,1,'C04','ANALYSER UNE STRUCTURE MATÉRIELLE ET LOGICIELLE','Analyser une structure matérielle et logicielle',4),(5,1,'C05','CONCEVOIR','Compétence relevant d\'un niveau 5 - Concevoir',5),(6,1,'C06','VALIDER LA CONFORMITÉ D\'UNE INSTALLATION','Valider la conformité d\'une installation',6),(7,1,'C07','RÉALISER DES MAQUETTES ET PROTOTYPES','Réaliser des maquettes et prototypes',7),(8,1,'C08','CODER','Coder',8),(9,1,'C09','INSTALLER LES ÉLÉMENTS D\'UN SYSTÈME ÉLECTRONIQUE OU INFORMATIQUE','Installer les éléments d\'un système électronique ou informatique',9),(10,1,'C10','EXPLOITER UN RÉSEAU INFORMATIQUE','Exploiter un réseau informatique',10),(11,1,'C11','MAINTENIR UN SYSTÈME ÉLECTRONIQUE OU RÉSEAU INFORMATIQUE','Maintenir un système électronique ou réseau informatique',11);
/*!40000 ALTER TABLE `competences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cours`
--

DROP TABLE IF EXISTS `cours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cours` (
  `id` int NOT NULL AUTO_INCREMENT,
  `classe_id` int NOT NULL,
  `categorie_id` int NOT NULL,
  `titre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `objectifs` text COLLATE utf8mb4_unicode_ci,
  `contenu` text COLLATE utf8mb4_unicode_ci,
  `exercices` text COLLATE utf8mb4_unicode_ci,
  `tp` text COLLATE utf8mb4_unicode_ci,
  `statut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ordre` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `classe_id` (`classe_id`),
  KEY `categorie_id` (`categorie_id`),
  CONSTRAINT `cours_ibfk_1` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `cours_ibfk_2` FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cours`
--

LOCK TABLES `cours` WRITE;
/*!40000 ALTER TABLE `cours` DISABLE KEYS */;
INSERT INTO `cours` VALUES (1,6,1,'Découverte et Technologie des Composants électronique','Être capable de reconnaitre les 6 composants électroniques les plus courant, d\'expliquer simplement leurs rôles et de commencer à comprendre pourquoi ils sont utilisés ensemble sur une carte. ',NULL,NULL,NULL,'en_cours',0,'2026-09-11 11:10:19','2026-09-11 11:12:55'),(2,4,1,'Analyser une Carte électronique (Les Blocs Fonctionnels)','',NULL,NULL,NULL,'en_cours',0,'2026-09-11 12:14:59','2026-09-14 07:46:03'),(3,4,1,'Saisie d\'un Schémas électronique avec le logiciel PROTEUS','',NULL,NULL,NULL,'en_cours',0,'2026-09-11 12:15:55','2026-09-14 07:46:17'),(4,4,1,'Prise en Main de CircuitJS1 (Simulation électronique)','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 12:17:00','2026-09-11 12:17:00'),(5,4,1,'Routage Manuel d\'un Circuit Imprimé','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 12:17:26','2026-09-11 12:17:26'),(6,4,1,'La Diode','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 12:18:08','2026-09-11 12:18:08'),(7,4,1,'Le Transistor Bipolaire en Commutation','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 12:18:59','2026-09-11 12:18:59'),(8,5,1,'Analyser un cahier de Charges','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 12:47:39','2026-09-11 12:47:39'),(9,5,1,'Concevoir un Système électronique','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 12:48:10','2026-09-11 12:48:10'),(10,5,1,'Conception carte Domotique','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 12:48:37','2026-09-11 12:48:37'),(11,5,5,'Réalisation de Projet','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 12:55:41','2026-09-11 12:55:41'),(12,5,6,'Soutien au Parcours','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 12:55:56','2026-09-11 13:42:22'),(13,4,5,'Réalisation de Projet','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 12:56:25','2026-09-11 12:56:25'),(15,6,6,'Co intervention Maths','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 13:20:08','2026-09-11 13:41:26'),(16,6,6,'Co intervention Francais','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 13:20:25','2026-09-11 13:42:06'),(17,6,6,'Accueil Nouveau','',NULL,NULL,NULL,'a_faire',0,'2026-09-11 13:21:52','2026-09-11 13:41:46');
/*!40000 ALTER TABLE `cours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `domaines_competences`
--

DROP TABLE IF EXISTS `domaines_competences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `domaines_competences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ordre` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `domaines_competences`
--

LOCK TABLES `domaines_competences` WRITE;
/*!40000 ALTER TABLE `domaines_competences` DISABLE KEYS */;
INSERT INTO `domaines_competences` VALUES (1,'CIEL','Compétences CIEL','Référentiel des compétences du BTS Cybersécurité, Informatique et réseaux, Électronique',0);
/*!40000 ALTER TABLE `domaines_competences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eleves`
--

DROP TABLE IF EXISTS `eleves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eleves` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `classe_id` int NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `actif` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `classe_id` (`classe_id`),
  CONSTRAINT `eleves_ibfk_1` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eleves`
--

LOCK TABLES `eleves` WRITE;
/*!40000 ALTER TABLE `eleves` DISABLE KEYS */;
INSERT INTO `eleves` VALUES (1,'AOUJAJ','Rayan',6,NULL,NULL,1,'2026-09-11 11:00:45'),(2,'BEAURY','Johan',6,NULL,NULL,1,'2026-09-11 11:00:45'),(3,'BRAILLY','Lorenzo',6,NULL,NULL,1,'2026-09-11 11:00:45'),(4,'CARRE','Sacha',6,NULL,NULL,1,'2026-09-11 11:00:45'),(5,'DA SILVA','Harrison',6,NULL,NULL,1,'2026-09-11 11:00:45'),(6,'DIALLO','Alassane',6,NULL,NULL,1,'2026-09-11 11:00:45'),(7,'DIJEONT','Kenny',6,NULL,NULL,1,'2026-09-11 11:00:45'),(8,'FRITE','Zaïd',6,NULL,NULL,1,'2026-09-11 11:00:45'),(9,'HADDANA','Sofian',6,NULL,NULL,1,'2026-09-11 11:00:45'),(10,'HARLAY','Gabin',6,NULL,NULL,1,'2026-09-11 11:00:45'),(11,'KONATE','Chaka-Angelo',6,NULL,NULL,1,'2026-09-11 11:00:45'),(12,'LUBOUE','Eliot',6,NULL,NULL,1,'2026-09-11 11:00:45'),(13,'MAGDELEINE-HIPPOLYTE','Luka',6,NULL,NULL,1,'2026-09-11 11:00:45'),(14,'MAHALINGAM','Mathusan',6,NULL,NULL,1,'2026-09-11 11:00:45'),(15,'MAINDORGE','Raphaël',6,NULL,NULL,1,'2026-09-11 11:00:45'),(16,'MILLERIOUX','Hugo',6,NULL,NULL,1,'2026-09-11 11:00:45'),(17,'MILLIEZ','Gino',6,NULL,NULL,1,'2026-09-11 11:00:45'),(18,'NEZONDET','Lénny',6,NULL,NULL,1,'2026-09-11 11:00:45'),(19,'PETIT','Nolhan',6,NULL,NULL,1,'2026-09-11 11:00:45'),(20,'ROBBA','Timothé',6,NULL,NULL,1,'2026-09-11 11:00:45'),(21,'RODRIGUES','Alessio',6,NULL,NULL,1,'2026-09-11 11:00:45'),(22,'SAINTE-ROSE','Samuel',6,NULL,NULL,1,'2026-09-11 11:00:45'),(23,'SARI','Oruc',6,NULL,NULL,1,'2026-09-11 11:00:45'),(24,'SGHIR','Ilyesse',6,NULL,NULL,1,'2026-09-11 11:00:45'),(25,'SUMER','Erdem',6,NULL,NULL,1,'2026-09-11 11:00:45'),(26,'VEFFOND-HAULET','Robin',6,NULL,NULL,1,'2026-09-11 11:00:45'),(27,'VIOUX OUSRIR','Lucas',6,NULL,NULL,1,'2026-09-11 11:00:45'),(28,'WEISS','Tyler',6,NULL,NULL,1,'2026-09-11 11:00:45'),(29,'WUNSCH','Eliott',6,NULL,NULL,1,'2026-09-11 11:00:45'),(30,'ABERGEL','Elone',4,NULL,NULL,1,'2026-09-11 11:04:49'),(31,'ALVES','Yanis',4,NULL,NULL,1,'2026-09-11 11:04:49'),(32,'BORDIN','Nolan',4,NULL,NULL,1,'2026-09-11 11:04:49'),(33,'BRISSOT','Téo',4,NULL,NULL,1,'2026-09-11 11:04:49'),(34,'CHEVREY','Leny',4,NULL,NULL,1,'2026-09-11 11:04:49'),(35,'DUHAILLIER','Evan',4,NULL,NULL,1,'2026-09-11 11:04:49'),(36,'FLOT','Nicolas',4,NULL,NULL,1,'2026-09-11 11:04:49'),(37,'FRULIO','Giovanni',4,NULL,NULL,1,'2026-09-11 11:04:49'),(38,'MANICORE KANGALA-NDOTO','Kaïss',4,NULL,NULL,1,'2026-09-11 11:04:49'),(39,'MARINELLI','Ethan',4,NULL,NULL,1,'2026-09-11 11:04:49'),(40,'MICHON','Aaron',4,NULL,NULL,1,'2026-09-11 11:04:49'),(42,'SCHLICK','Nicolas',4,NULL,NULL,1,'2026-09-11 11:04:49'),(43,'TRUNDE','Gabriel',4,NULL,NULL,1,'2026-09-11 11:04:49'),(44,'TURCA','Claude',4,NULL,NULL,1,'2026-09-11 11:04:49'),(45,'ANTONIO','Dayvon',5,NULL,NULL,1,'2026-09-11 11:05:00'),(46,'BENRHALMIA','Billel',5,NULL,NULL,1,'2026-09-11 11:05:00'),(47,'CHEVREY','Matys',5,NULL,NULL,1,'2026-09-11 11:05:00'),(48,'FERRARE--BREGE','Adryan',5,NULL,NULL,1,'2026-09-11 11:05:00'),(49,'LAGOAÇA','Noham',5,NULL,NULL,1,'2026-09-11 11:05:00'),(50,'MAOUCHI','Lyes',5,NULL,NULL,1,'2026-09-11 11:05:00'),(51,'MINOT','Mathis',5,NULL,NULL,1,'2026-09-11 11:05:00'),(52,'NIQUET','Mathieu',5,NULL,NULL,1,'2026-09-11 11:05:00'),(53,'PRETO LOPES DE CASTRO','Faris',5,NULL,NULL,1,'2026-09-11 11:05:00'),(54,'THURET','Maxime',5,NULL,NULL,1,'2026-09-11 11:05:00'),(55,'TURGUT','Arda',5,NULL,NULL,1,'2026-09-11 11:05:00'),(56,'UYMAZ','Ali-Poyraz',5,NULL,NULL,1,'2026-09-11 11:05:00'),(57,'VITTOZ','Filipe',5,NULL,NULL,1,'2026-09-11 11:05:00'),(58,'WEISS','Iyana',5,NULL,NULL,1,'2026-09-11 11:05:00'),(59,'ABBOUZI','Naïl',5,'',NULL,1,'2026-09-14 12:01:48');
/*!40000 ALTER TABLE `eleves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluations`
--

DROP TABLE IF EXISTS `evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eleve_id` int NOT NULL,
  `cours_id` int DEFAULT NULL,
  `titre` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` float DEFAULT NULL,
  `bareme` float DEFAULT NULL,
  `commentaire` text COLLATE utf8mb4_unicode_ci,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `eleve_id` (`eleve_id`),
  KEY `cours_id` (`cours_id`),
  CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`),
  CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluations`
--

LOCK TABLES `evaluations` WRITE;
/*!40000 ALTER TABLE `evaluations` DISABLE KEYS */;
/*!40000 ALTER TABLE `evaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluations_activites`
--

DROP TABLE IF EXISTS `evaluations_activites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluations_activites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eleve_id` int NOT NULL,
  `activite_id` int NOT NULL,
  `note` float NOT NULL,
  `bareme` float NOT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_evaluation_activite_eleve` (`eleve_id`,`activite_id`),
  KEY `activite_id` (`activite_id`),
  CONSTRAINT `evaluations_activites_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`),
  CONSTRAINT `evaluations_activites_ibfk_2` FOREIGN KEY (`activite_id`) REFERENCES `activites` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluations_activites`
--

LOCK TABLES `evaluations_activites` WRITE;
/*!40000 ALTER TABLE `evaluations_activites` DISABLE KEYS */;
/*!40000 ALTER TABLE `evaluations_activites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluations_competences`
--

DROP TABLE IF EXISTS `evaluations_competences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluations_competences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eleve_id` int NOT NULL,
  `competence_id` int NOT NULL,
  `activite_id` int DEFAULT NULL,
  `niveau` int NOT NULL,
  `commentaire` text COLLATE utf8mb4_unicode_ci,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `eleve_id` (`eleve_id`),
  KEY `competence_id` (`competence_id`),
  KEY `activite_id` (`activite_id`),
  CONSTRAINT `evaluations_competences_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`),
  CONSTRAINT `evaluations_competences_ibfk_2` FOREIGN KEY (`competence_id`) REFERENCES `competences` (`id`),
  CONSTRAINT `evaluations_competences_ibfk_3` FOREIGN KEY (`activite_id`) REFERENCES `activites` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluations_competences`
--

LOCK TABLES `evaluations_competences` WRITE;
/*!40000 ALTER TABLE `evaluations_competences` DISABLE KEYS */;
/*!40000 ALTER TABLE `evaluations_competences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groupes_eleves`
--

DROP TABLE IF EXISTS `groupes_eleves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groupes_eleves` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eleve_id` int NOT NULL,
  `groupe` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_groupes_eleves_eleve` (`eleve_id`),
  CONSTRAINT `groupes_eleves_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groupes_eleves`
--

LOCK TABLES `groupes_eleves` WRITE;
/*!40000 ALTER TABLE `groupes_eleves` DISABLE KEYS */;
INSERT INTO `groupes_eleves` VALUES (1,1,'Groupe 1'),(2,2,'Groupe 1'),(3,3,'Groupe 1'),(4,4,'Groupe 1'),(5,5,'Groupe 1'),(6,6,'Groupe 1'),(7,7,'Groupe 1'),(8,8,'Groupe 1'),(9,9,'Groupe 1'),(10,10,'Groupe 1'),(11,11,'Groupe 1'),(12,12,'Groupe 1'),(13,13,'Groupe 1'),(14,14,'Groupe 1'),(15,15,'Groupe 1'),(16,16,'Groupe 2'),(17,17,'Groupe 2'),(18,18,'Groupe 2'),(19,19,'Groupe 2'),(20,20,'Groupe 2'),(21,21,'Groupe 2'),(22,22,'Groupe 2'),(23,23,'Groupe 2'),(24,24,'Groupe 2'),(25,25,'Groupe 2'),(26,26,'Groupe 2'),(27,27,'Groupe 2'),(28,28,'Groupe 2'),(29,29,'Groupe 2');
/*!40000 ALTER TABLE `groupes_eleves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `observations_eleve`
--

DROP TABLE IF EXISTS `observations_eleve`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `observations_eleve` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eleve_id` int NOT NULL,
  `date` date DEFAULT NULL,
  `categorie` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `texte` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `eleve_id` (`eleve_id`),
  CONSTRAINT `observations_eleve_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `observations_eleve`
--

LOCK TABLES `observations_eleve` WRITE;
/*!40000 ALTER TABLE `observations_eleve` DISABLE KEYS */;
/*!40000 ALTER TABLE `observations_eleve` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `presences`
--

DROP TABLE IF EXISTS `presences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `presences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seance_id` int NOT NULL,
  `eleve_id` int NOT NULL,
  `statut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `justifie` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `seance_id` (`seance_id`),
  KEY `eleve_id` (`eleve_id`),
  CONSTRAINT `presences_ibfk_1` FOREIGN KEY (`seance_id`) REFERENCES `seances` (`id`),
  CONSTRAINT `presences_ibfk_2` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=421 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `presences`
--

LOCK TABLES `presences` WRITE;
/*!40000 ALTER TABLE `presences` DISABLE KEYS */;
INSERT INTO `presences` VALUES (1,1,1,'present',0),(2,1,2,'present',0),(3,1,3,'present',0),(4,1,4,'present',0),(5,1,5,'present',0),(6,1,6,'present',0),(7,1,7,'present',0),(8,1,8,'present',0),(9,1,9,'present',0),(10,1,10,'present',0),(11,1,11,'present',0),(12,1,12,'present',0),(13,1,13,'present',0),(14,1,14,'present',0),(15,1,15,'present',0),(16,2,1,'present',0),(17,2,2,'present',0),(18,2,3,'present',0),(19,2,4,'present',0),(20,2,5,'present',0),(21,2,6,'present',0),(22,2,7,'present',0),(23,2,8,'absent',0),(24,2,9,'present',0),(25,2,10,'present',0),(26,2,11,'present',0),(27,2,12,'present',0),(28,2,13,'present',0),(29,2,14,'present',0),(30,2,15,'present',0),(46,5,16,'present',0),(47,5,17,'present',0),(48,5,18,'present',0),(49,5,19,'present',0),(50,5,20,'present',0),(51,5,21,'present',0),(52,5,22,'present',0),(53,5,23,'present',0),(54,5,24,'present',0),(55,5,25,'present',0),(56,5,26,'present',0),(57,5,27,'present',0),(58,5,28,'present',0),(59,5,29,'present',0),(60,6,16,'retard',0),(61,6,17,'present',0),(62,6,18,'absent',0),(63,6,19,'present',0),(64,6,20,'present',0),(65,6,21,'present',0),(66,6,22,'present',0),(67,6,23,'present',0),(68,6,24,'present',0),(69,6,25,'present',0),(70,6,26,'present',0),(71,6,27,'present',0),(72,6,28,'present',0),(73,6,29,'present',0),(88,8,16,'present',0),(89,8,17,'present',0),(90,8,18,'present',0),(91,8,19,'present',0),(92,8,20,'present',0),(93,8,21,'present',0),(94,8,22,'present',0),(95,8,23,'present',0),(96,8,24,'present',0),(97,8,25,'present',0),(98,8,26,'present',0),(99,8,27,'present',0),(100,8,28,'present',0),(101,8,29,'present',0),(102,9,30,'present',0),(103,9,31,'present',0),(104,9,32,'present',0),(105,9,33,'present',0),(106,9,34,'present',0),(107,9,35,'present',0),(108,9,36,'present',0),(109,9,37,'present',0),(110,9,38,'present',0),(111,9,39,'present',0),(112,9,40,'present',0),(113,9,42,'present',0),(114,9,43,'present',0),(115,9,44,'present',0),(116,10,30,'present',0),(117,10,31,'present',0),(118,10,32,'present',0),(119,10,33,'present',0),(120,10,34,'present',0),(121,10,35,'present',0),(122,10,36,'present',0),(123,10,37,'present',0),(124,10,38,'present',0),(125,10,39,'present',0),(126,10,40,'present',0),(127,10,42,'present',0),(128,10,43,'present',0),(129,10,44,'present',0),(130,11,1,'present',0),(131,11,2,'present',0),(132,11,3,'present',0),(133,11,4,'present',0),(134,11,5,'present',0),(135,11,6,'present',0),(136,11,7,'present',0),(137,11,8,'present',0),(138,11,9,'present',0),(139,11,10,'present',0),(140,11,11,'present',0),(141,11,12,'present',0),(142,11,13,'present',0),(143,11,14,'present',0),(144,11,15,'present',0),(160,13,45,'present',0),(161,13,46,'present',0),(162,13,47,'present',0),(163,13,48,'present',0),(164,13,49,'present',0),(165,13,50,'present',0),(166,13,51,'present',0),(167,13,52,'present',0),(168,13,53,'present',0),(169,13,54,'present',0),(170,13,55,'present',0),(171,13,56,'present',0),(172,13,57,'present',0),(173,13,58,'present',0),(174,14,45,'present',0),(175,14,46,'present',0),(176,14,47,'present',0),(177,14,48,'present',0),(178,14,49,'present',0),(179,14,50,'present',0),(180,14,51,'present',0),(181,14,52,'present',0),(182,14,53,'present',0),(183,14,54,'present',0),(184,14,55,'present',0),(185,14,56,'present',0),(186,14,57,'present',0),(187,14,58,'present',0),(188,15,45,'present',0),(189,15,46,'present',0),(190,15,47,'present',0),(191,15,48,'present',0),(192,15,49,'present',0),(193,15,50,'present',0),(194,15,51,'present',0),(195,15,52,'present',0),(196,15,53,'present',0),(197,15,54,'present',0),(198,15,55,'present',0),(199,15,56,'present',0),(200,15,57,'present',0),(201,15,58,'present',0),(202,16,45,'present',0),(203,16,46,'present',0),(204,16,47,'present',0),(205,16,48,'present',0),(206,16,49,'present',0),(207,16,50,'present',0),(208,16,51,'present',0),(209,16,52,'present',0),(210,16,53,'present',0),(211,16,54,'present',0),(212,16,55,'present',0),(213,16,56,'present',0),(214,16,57,'present',0),(215,16,58,'present',0),(216,17,45,'present',0),(217,17,46,'present',0),(218,17,47,'present',0),(219,17,48,'present',0),(220,17,49,'present',0),(221,17,50,'present',0),(222,17,51,'present',0),(223,17,52,'present',0),(224,17,53,'present',0),(225,17,54,'present',0),(226,17,55,'present',0),(227,17,56,'present',0),(228,17,57,'present',0),(229,17,58,'present',0),(230,18,30,'present',0),(231,18,31,'present',0),(232,18,32,'present',0),(233,18,33,'present',0),(234,18,34,'present',0),(235,18,35,'present',0),(236,18,36,'present',0),(237,18,37,'present',0),(238,18,38,'present',0),(239,18,39,'present',0),(240,18,40,'present',0),(241,18,42,'present',0),(242,18,43,'present',0),(243,18,44,'present',0),(244,19,30,'present',0),(245,19,31,'present',0),(246,19,32,'present',0),(247,19,33,'present',0),(248,19,34,'present',0),(249,19,35,'present',0),(250,19,36,'present',0),(251,19,37,'present',0),(252,19,38,'present',0),(253,19,39,'present',0),(254,19,40,'present',0),(255,19,42,'present',0),(256,19,43,'present',0),(257,19,44,'present',0),(258,20,30,'present',0),(259,20,31,'present',0),(260,20,32,'present',0),(261,20,33,'present',0),(262,20,34,'present',0),(263,20,35,'present',0),(264,20,36,'present',0),(265,20,37,'present',0),(266,20,38,'present',0),(267,20,39,'present',0),(268,20,40,'present',0),(269,20,42,'present',0),(270,20,43,'present',0),(271,20,44,'present',0),(272,21,45,'present',0),(273,21,46,'present',0),(274,21,47,'present',0),(275,21,48,'present',0),(276,21,49,'present',0),(277,21,50,'present',0),(278,21,51,'present',0),(279,21,52,'present',0),(280,21,53,'present',0),(281,21,54,'present',0),(282,21,55,'present',0),(283,21,56,'present',0),(284,21,57,'present',0),(285,21,58,'absent',0),(286,22,30,'present',0),(287,22,31,'present',0),(288,22,32,'present',0),(289,22,33,'present',0),(290,22,34,'present',0),(291,22,35,'present',0),(292,22,36,'present',0),(293,22,37,'present',0),(294,22,38,'present',0),(295,22,39,'present',0),(296,22,40,'present',0),(297,22,42,'present',0),(298,22,43,'present',0),(299,22,44,'present',0),(300,23,30,'present',0),(301,23,31,'present',0),(302,23,32,'present',0),(303,23,33,'present',0),(304,23,34,'present',0),(305,23,35,'present',0),(306,23,36,'present',0),(307,23,37,'present',0),(308,23,38,'present',0),(309,23,39,'present',0),(310,23,40,'present',0),(311,23,42,'present',0),(312,23,43,'present',0),(313,23,44,'present',0),(329,24,16,'present',0),(330,24,17,'absent',0),(331,24,18,'present',0),(332,24,19,'present',0),(333,24,20,'present',0),(334,24,21,'present',0),(335,24,22,'present',0),(336,24,23,'present',0),(337,24,24,'absent',0),(338,24,25,'present',0),(339,24,26,'present',0),(340,24,27,'present',0),(341,24,28,'present',0),(342,24,29,'present',0),(343,25,30,'present',0),(344,25,31,'present',0),(345,25,32,'present',0),(346,25,33,'present',0),(347,25,34,'present',0),(348,25,35,'present',0),(349,25,36,'present',0),(350,25,37,'present',0),(351,25,38,'present',0),(352,25,39,'present',0),(353,25,40,'present',0),(354,25,42,'present',0),(355,25,43,'present',0),(356,25,44,'present',0),(372,26,16,'present',0),(373,26,17,'absent',0),(374,26,18,'present',0),(375,26,19,'present',0),(376,26,20,'present',0),(377,26,21,'present',0),(378,26,22,'present',0),(379,26,23,'present',0),(380,26,24,'present',0),(381,26,25,'present',0),(382,26,26,'present',0),(383,26,27,'present',0),(384,26,28,'present',0),(385,26,29,'present',0),(386,27,30,'present',0),(387,27,31,'present',0),(388,27,32,'present',0),(389,27,33,'present',0),(390,27,34,'present',0),(391,27,35,'absent',0),(392,27,36,'present',0),(393,27,37,'present',0),(394,27,38,'present',0),(395,27,39,'present',0),(396,27,40,'present',0),(397,27,42,'present',0),(398,27,43,'present',0),(399,27,44,'present',0),(400,28,45,'absent',0),(401,28,46,'present',0),(402,28,47,'present',0),(403,28,48,'present',0),(404,28,49,'present',0),(405,28,50,'present',0),(406,28,51,'present',0),(407,28,52,'present',0),(408,28,53,'present',0),(409,28,54,'absent',0),(410,28,55,'present',0),(411,28,56,'present',0),(412,28,57,'present',0),(413,28,58,'present',0),(414,28,59,'present',0),(415,16,59,'present',0),(416,15,59,'present',0),(417,21,59,'present',0),(418,17,59,'present',0),(419,14,59,'present',0),(420,13,59,'present',0);
/*!40000 ALTER TABLE `presences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ressources`
--

DROP TABLE IF EXISTS `ressources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ressources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cours_id` int NOT NULL,
  `nom_fichier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `chemin_fichier` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_fichier` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cours_id` (`cours_id`),
  CONSTRAINT `ressources_ibfk_1` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ressources`
--

LOCK TABLES `ressources` WRITE;
/*!40000 ALTER TABLE `ressources` DISABLE KEYS */;
/*!40000 ALTER TABLE `ressources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `savoir_faires`
--

DROP TABLE IF EXISTS `savoir_faires`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `savoir_faires` (
  `id` int NOT NULL AUTO_INCREMENT,
  `competence_id` int NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ordre` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `competence_id` (`competence_id`),
  CONSTRAINT `savoir_faires_ibfk_1` FOREIGN KEY (`competence_id`) REFERENCES `competences` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `savoir_faires`
--

LOCK TABLES `savoir_faires` WRITE;
/*!40000 ALTER TABLE `savoir_faires` DISABLE KEYS */;
/*!40000 ALTER TABLE `savoir_faires` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seances`
--

DROP TABLE IF EXISTS `seances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `classe_id` int NOT NULL,
  `cours_id` int DEFAULT NULL,
  `date` date NOT NULL,
  `heure_debut` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `heure_fin` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenu_realise` text COLLATE utf8mb4_unicode_ci,
  `travail_donne` text COLLATE utf8mb4_unicode_ci,
  `observations` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `groupe` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Toute la classe',
  `statut` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planifiee',
  PRIMARY KEY (`id`),
  KEY `classe_id` (`classe_id`),
  KEY `cours_id` (`cours_id`),
  CONSTRAINT `seances_ibfk_1` FOREIGN KEY (`classe_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `seances_ibfk_2` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seances`
--

LOCK TABLES `seances` WRITE;
/*!40000 ALTER TABLE `seances` DISABLE KEYS */;
INSERT INTO `seances` VALUES (1,6,NULL,'2026-09-01','14:00','17:00','TRANSITION NUMÉRIQUE ET ÉNERGÉTIQUE · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 11:06:14','Groupe 1','planifiee'),(2,6,1,'2026-09-04','16:00','18:00','TRANSITION NUMÉRIQUE ET ÉNERGÉTIQUE · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 11:13:22','Groupe 1','planifiee'),(4,3,NULL,'2026-09-11','08:00','10:00',NULL,NULL,NULL,'2026-09-11 11:27:06','Toute la classe','planifiee'),(5,6,1,'2026-09-08','14:00','17:00','TRANSITION NUMÉRIQUE ET ÉNERGÉTIQUE · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 11:30:39','Groupe 2','planifiee'),(6,6,1,'2026-09-11','16:00','18:00','Suite et fin de l\'activité',NULL,NULL,'2026-09-11 11:32:43','Groupe 2','planifiee'),(8,6,NULL,'2026-09-10','11:00','12:00','CO-MATHS/PRO · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 11:40:29','Groupe 2','annulee'),(9,4,13,'2026-09-03','08:00','09:30','RÉALISATION PROJET · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 12:56:50','Toute la classe','planifiee'),(10,4,13,'2026-09-10','08:00','09:30','RÉALISATION PROJET · 2-208 Salle SN LP',NULL,NULL,'2026-09-11 13:03:01','Toute la classe','planifiee'),(11,6,NULL,'2026-09-03','10:00','11:00','CO-FR/PRO · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 13:03:44','Groupe 1','annulee'),(13,5,12,'2026-09-03','11:00','12:00','SOUTIEN AU PARCOURS · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 13:07:51','Toute la classe','planifiee'),(14,5,12,'2026-09-04','15:00','16:00','SOUTIEN AU PARCOURS · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 13:08:10','Toute la classe','planifiee'),(15,5,12,'2026-09-11','15:00','16:00','SOUTIEN AU PARCOURS · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 13:08:30','Toute la classe','planifiee'),(16,5,11,'2026-09-11','14:00','15:00','Définition des différentes Tâches et évolution du projet',NULL,NULL,'2026-09-11 13:10:34','Toute la classe','planifiee'),(17,5,11,'2026-09-04','14:00','15:00','RÉALISATION PROJET · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 13:11:32','Toute la classe','planifiee'),(18,4,6,'2026-09-10','15:00','18:00',NULL,NULL,NULL,'2026-09-11 13:13:35','Toute la classe','planifiee'),(19,4,3,'2026-09-08','09:00','12:00',NULL,NULL,NULL,'2026-09-11 13:15:56','Toute la classe','planifiee'),(20,4,4,'2026-09-11','09:00','12:00','CIEL · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 13:16:03','Toute la classe','planifiee'),(21,5,8,'2026-09-07','14:00','18:00','CIEL · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 13:16:27','Toute la classe','planifiee'),(22,4,2,'2026-09-04','09:00','12:00','CIEL · 2-201 Salle SN LP',NULL,NULL,'2026-09-11 13:16:53','Toute la classe','planifiee'),(23,4,2,'2026-09-03','15:00','18:00',NULL,NULL,NULL,'2026-09-11 13:17:45','Toute la classe','planifiee'),(24,6,NULL,'2026-09-14','08:00','09:00','CO-MATHS/PRO · 2-201 Salle SN LP\n\n01 - Rappel Mathématique',NULL,NULL,'2026-09-14 07:35:16','Groupe 2','planifiee'),(25,4,NULL,'2026-09-14','11:00','12:00','CO-FR/PRO · 2-201 Salle SN LP',NULL,NULL,'2026-09-14 07:38:16','Toute la classe','annulee'),(26,6,NULL,'2026-09-14','10:00','11:00','CO-FR/PRO · 2-201 Salle SN LP\n\nLettre de Motivation',NULL,NULL,'2026-09-14 08:18:54','Groupe 2','planifiee'),(27,4,NULL,'2026-09-14','13:00','14:00','CO-MATHS/PRO · 2-201 Salle SN LP',NULL,NULL,'2026-09-14 11:54:05','Toute la classe','planifiee'),(28,5,9,'2026-09-14','14:00','18:00','CIEL · 2-201 Salle SN LP',NULL,NULL,'2026-09-14 11:55:50','Toute la classe','planifiee');
/*!40000 ALTER TABLE `seances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `travaux`
--

DROP TABLE IF EXISTS `travaux`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `travaux` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eleve_id` int NOT NULL,
  `cours_id` int DEFAULT NULL,
  `titre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_rendu` date DEFAULT NULL,
  `statut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `eleve_id` (`eleve_id`),
  KEY `cours_id` (`cours_id`),
  CONSTRAINT `travaux_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleves` (`id`),
  CONSTRAINT `travaux_ibfk_2` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `travaux`
--

LOCK TABLES `travaux` WRITE;
/*!40000 ALTER TABLE `travaux` DISABLE KEYS */;
/*!40000 ALTER TABLE `travaux` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'enseignant','scrypt:32768:8:1$eiCpqzf8EJx0CelK$71e4efd58a260747a99a24eb09e93664230723b12a16e9cfe75e9cc995d6edafa86ec81c73c4f321559a6dc71cc4e44ab542d25dd1fcef17ea4574188c38a310','enseignant','Enseignant','2026-09-01 11:11:58'),(2,'Adriel','scrypt:32768:8:1$5Jwd8hujf6hYiAoO$0bf3caa1265f21af4a85a1ebf70fc47530f80fc5bf7c50ee08adc233969bfb1e6ac14f81f92f8c55adba7dfba3165e976818c2fbf7eaf97ca209efe04e6f1cee','enseignant','TATCHUM SIMO Adriel','2026-09-01 11:13:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-14 17:19:23
