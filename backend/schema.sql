-- TP3 Programacion IV - Gestion de transporte
-- Leonel Ochoa
-- Definicion de la base de datos y tablas del sistema

CREATE DATABASE IF NOT EXISTS tp3_transporte;
USE tp3_transporte;

-- Usuarios del sistema (la contrasena se guarda hasheada)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

-- Vehiculos de la empresa
CREATE TABLE IF NOT EXISTS vehiculos (
  id INT NOT NULL AUTO_INCREMENT,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  patente VARCHAR(20) NOT NULL UNIQUE,
  anio INT NOT NULL,
  capacidad_carga DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id)
);

-- Conductores
CREATE TABLE IF NOT EXISTS conductores (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  documento VARCHAR(30) NOT NULL UNIQUE,
  numero_licencia VARCHAR(40) NOT NULL,
  licencia_alta DATE NOT NULL,
  licencia_vencimiento DATE NOT NULL,
  PRIMARY KEY (id)
);

-- Viajes: relacionan un vehiculo y un conductor
CREATE TABLE IF NOT EXISTS viajes (
  id INT NOT NULL AUTO_INCREMENT,
  vehiculo_id INT NOT NULL,
  conductor_id INT NOT NULL,
  fecha_salida DATETIME NOT NULL,
  fecha_llegada DATETIME NULL,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  kilometros DECIMAL(10, 2) NOT NULL,
  observaciones VARCHAR(255) NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
  FOREIGN KEY (conductor_id) REFERENCES conductores(id)
);
