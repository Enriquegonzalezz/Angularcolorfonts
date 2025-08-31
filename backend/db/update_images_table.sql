-- Script para actualizar la tabla de imágenes existente
-- Ejecutar este script en tu base de datos MySQL

-- Agregar nuevos campos a la tabla existente
ALTER TABLE imagenes 
ADD COLUMN nombre_original VARCHAR(255) NOT NULL DEFAULT '' AFTER imagen_url,
ADD COLUMN nombre_archivo VARCHAR(255) NOT NULL DEFAULT '' AFTER nombre_original,
ADD COLUMN ancho INT NOT NULL DEFAULT 0 AFTER tamano,
ADD COLUMN alto INT NOT NULL DEFAULT 0 AFTER ancho,
ADD COLUMN tipo_mime VARCHAR(100) NOT NULL DEFAULT 'image/jpeg' AFTER alto,
ADD COLUMN es_recortada TINYINT(1) NOT NULL DEFAULT 0 AFTER tipo_mime,
ADD COLUMN datos_recorte TEXT NULL AFTER es_recortada,
ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER seleccionada;

-- Actualizar el campo tamano para que sea INT en lugar de VARCHAR
-- Primero crear una columna temporal
ALTER TABLE imagenes ADD COLUMN tamano_temp INT AFTER tamano;

-- Actualizar los datos existentes (asumiendo que tamano contiene números)
UPDATE imagenes SET tamano_temp = CAST(tamano AS UNSIGNED) WHERE tamano REGEXP '^[0-9]+$';

-- Eliminar la columna antigua y renombrar la nueva
ALTER TABLE imagenes DROP COLUMN tamano;
ALTER TABLE imagenes CHANGE tamano_temp tamano INT NOT NULL DEFAULT 0;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_imagenes_usuario ON imagenes(id_usuario);
CREATE INDEX idx_imagenes_fecha ON imagenes(fecha_creacion);
CREATE INDEX idx_imagenes_seleccionada ON imagenes(seleccionada);

-- Comentarios sobre la estructura de la tabla
/*
La tabla imagenes ahora tiene la siguiente estructura:

- id: ID único de la imagen (auto-increment)
- id_usuario: ID del usuario propietario
- imagen_url: URL de la imagen en el servidor
- nombre_original: Nombre original del archivo subido
- nombre_archivo: Nombre del archivo en el servidor
- tamano: Tamaño del archivo en bytes
- ancho: Ancho de la imagen en píxeles
- alto: Alto de la imagen en píxeles
- tipo_mime: Tipo MIME de la imagen
- es_recortada: Indica si la imagen fue recortada (0/1)
- datos_recorte: JSON con los datos del recorte
- seleccionada: Indica si es la imagen seleccionada del usuario (0/1)
- fecha_creacion: Fecha y hora de creación del registro

Los datos de recorte se almacenan en formato JSON con la siguiente estructura:
{
  "x": 100,
  "y": 150,
  "width": 300,
  "height": 200,
  "rotate": 0,
  "scaleX": 1,
  "scaleY": 1
}
*/
