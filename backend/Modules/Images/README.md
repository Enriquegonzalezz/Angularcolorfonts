# Sistema de Gestión de Imágenes con Recorte

Este módulo proporciona funcionalidades completas para subir, recortar y gestionar imágenes en tu aplicación Angular con backend Node.js.

## Características

- ✅ **Subida de imágenes** con validación de tipos y tamaños
- ✅ **Recorte de imágenes** usando Cropper.js
- ✅ **Almacenamiento en servidor** con nombres únicos
- ✅ **Base de datos** con metadatos completos
- ✅ **API REST** para gestión de imágenes
- ✅ **Interfaz moderna** y responsiva
- ✅ **Gestión de usuarios** con imágenes asociadas

## Instalación

### 1. Dependencias del Backend

```bash
cd backend
npm install multer uuid image-size
```

### 2. Dependencias del Frontend

```bash
npm install cropperjs
npm install --save-dev @types/cropperjs
```

### 3. Actualizar Base de Datos

Ejecuta el script SQL para actualizar la tabla de imágenes:

```bash
mysql -u tu_usuario -p tu_base_datos < backend/db/update_images_table.sql
```

## Estructura de Archivos

```
backend/Modules/Images/
├── controller.js          # Controlador principal
├── imagesModel.js         # Modelo de base de datos
├── routes.js             # Rutas de la API
└── README.md             # Este archivo

src/app/modules/image/
├── image-upload/
│   ├── image-upload.ts   # Componente Angular
│   ├── image-upload.html # Template HTML
│   └── image-upload.css  # Estilos CSS
└── ...
```

## API Endpoints

### Subir Imagen
```
POST /images/upload
Content-Type: multipart/form-data

Body:
- image: File (imagen)
- userId: number (ID del usuario)
- isCropped: string (true/false)
- cropData: string (JSON con datos de recorte)
```

### Obtener Imágenes del Usuario
```
GET /images/user/:userId
```

### Obtener Imagen por ID
```
GET /images/:imageId
```

### Actualizar Imagen
```
PUT /images/:imageId
Body: { campo: valor }
```

### Eliminar Imagen
```
DELETE /images/:imageId
```

### Seleccionar Imagen
```
POST /images/:imageId/select
Body: { userId: number }
```

### Obtener Imagen Seleccionada
```
GET /images/user/:userId/selected
```

## Uso del Componente Angular

### 1. Importar en tu módulo

```typescript
import { ImageUpload } from './modules/image/image-upload/image-upload';

@NgModule({
  declarations: [ImageUpload],
  // ...
})
```

### 2. Usar en tu template

```html
<app-image-upload></app-image-upload>
```

### 3. Personalizar el userId

```typescript
// En tu componente
export class MyComponent {
  userId = 123; // Obtener del servicio de autenticación
}
```

## Flujo de Trabajo

1. **Selección**: El usuario selecciona una imagen
2. **Previsualización**: Se muestra la imagen con metadatos
3. **Recorte** (opcional): El usuario puede recortar la imagen
4. **Subida**: La imagen se envía al servidor con metadatos
5. **Almacenamiento**: Se guarda en disco y base de datos
6. **Confirmación**: Se muestra confirmación de éxito

## Metadatos Almacenados

- **Básicos**: nombre, tamaño, dimensiones, tipo MIME
- **Recorte**: coordenadas, dimensiones, rotación, escala
- **Usuario**: ID del propietario, estado de selección
- **Temporal**: fecha de creación

## Configuración

### Tamaño máximo de archivo
```javascript
// En routes.js
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});
```

### Tipos de archivo permitidos
```javascript
fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
}
```

### Directorio de almacenamiento
```javascript
// En controller.js
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/images');
```

## Personalización

### Estilos CSS
Los estilos están en `image-upload.css` y usan variables CSS para fácil personalización.

### Configuración del Cropper
Las opciones del recortador están en el método `startCropping()` del componente.

### Validaciones
Puedes agregar validaciones adicionales en el controlador del backend.

## Troubleshooting

### Error: "Cropper not initialized"
- Verifica que Cropper.js esté instalado
- Asegúrate de que la imagen esté cargada antes de inicializar

### Error: "Upload failed"
- Verifica la conexión a la base de datos
- Comprueba los permisos del directorio de uploads
- Revisa los logs del servidor

### Imagen no se muestra
- Verifica que la ruta del archivo sea correcta
- Comprueba que el archivo exista en el servidor

## Seguridad

- ✅ Validación de tipos de archivo
- ✅ Límites de tamaño
- ✅ Nombres únicos para evitar conflictos
- ✅ Asociación con usuarios autenticados
- ✅ Sanitización de metadatos

## Rendimiento

- ✅ Compresión de imágenes recortadas (90% calidad)
- ✅ Índices en base de datos
- ✅ Almacenamiento en memoria temporal
- ✅ Lazy loading de imágenes

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
