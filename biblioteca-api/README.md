# Biblioteca API

API REST para administrar autores, libros y préstamos con Node.js, Express, TypeScript y MongoDB. Cada módulo sigue las capas rutas → controlador → servicio → repositorio.

## Requisitos

- Node.js 18 o superior y npm.
- Una instancia de MongoDB local o Atlas.

## Instalación y ejecución

```bash
npm install --prefix biblioteca-api
```

Copia `biblioteca-api/.env.example` como `biblioteca-api/.env` si necesitas cambiar la configuración. Por defecto se conecta a MongoDB local (`mongodb://127.0.0.1:27017`) y usa una única base llamada `Biblioteca`. La API guarda los datos en las colecciones `autores`, `libros` y `prestamos`.

```bash
npm run dev
```

Los comandos anteriores se ejecutan desde la carpeta raíz del repositorio. Para compilar y ejecutar:

```bash
npm run build
npm start
```

El servidor usa el puerto `3000` por defecto y expone `GET /health`.

## Endpoints

Base URL: `http://localhost:3000/api/v1`

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/autor` | Crear autor |
| GET | `/autor` | Listar autores |
| GET | `/autor/:id` | Consultar autor |
| PUT | `/autor/:id` | Actualizar autor |
| DELETE | `/autor/:id` | Eliminar autor si no tiene libros asociados |
| POST | `/libro` | Crear libro asociado a un autor |
| GET | `/libro` | Listar libros |
| GET | `/libro/:id` | Consultar libro |
| PUT | `/libro/:id` | Actualizar libro |
| DELETE | `/libro/:id` | Eliminar libro si no tiene préstamos asociados |
| POST | `/prestamo` | Registrar préstamo de un libro disponible |
| GET | `/prestamo` | Listar préstamos |
| GET | `/prestamo/:id` | Consultar préstamo |
| PUT | `/prestamo/:id` | Actualizar o devolver préstamo |
| DELETE | `/prestamo/:id` | Eliminar préstamo |

Todos los IDs deben ser ObjectId válidos de MongoDB. `year` debe ser entero; `birthYear` debe ser entero positivo. Al crear un libro se envían `title`, `isbn` y `authorId`; `available` comienza en `true`. Al crear un préstamo se envían `bookId`, `userName` y `loanDate` en formato ISO 8601; el libro pasa a no disponible. Para devolverlo, envía `{"returned": true}` al endpoint `PUT /loans/:id`; el servidor asigna `returnDate` automáticamente y vuelve a habilitar el libro.

Ejemplos de cuerpos:

```json
{"name":"Gabriel García Márquez","nationality":"Colombiana","birthYear":1927}
```

```json
{"title":"Cien años de soledad","isbn":"9780307474728","authorId":"<authorId>","year":1967}
```

```json
{"bookId":"<bookId>","userName":"Ana Pérez","loanDate":"2026-09-28T10:00:00.000Z"}
```

Las solicitudes listas para usar están en [`requests.http`](requests.http). Si MongoDB ya tiene bases antiguas con otros nombres, esta aplicación no las elimina: seguirá usando únicamente `Biblioteca`.
