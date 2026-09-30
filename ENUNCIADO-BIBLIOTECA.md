# Proyecto: API REST para la gestión de una Biblioteca

**Asignatura:** Programación III
**Modalidad:** Individual o en parejas
**Entrega:** Repositorio Git con el código fuente + README

## 1. Contexto

Una biblioteca necesita modernizar su sistema y reemplazar su registro en papel por
una **API REST**. Tu trabajo es construir el backend que permitirá gestionar los
**libros**, los **autores** y los **préstamos** a los usuarios.

Debes construir la API usando **Node.js + Express + TypeScript + MongoDB**, siguiendo
una **arquitectura por capas** (rutas → controlador → servicio → repositorio), tal como
se vio en clase.

> Puedes generar la estructura inicial del proyecto con el script `scaffold.sh` y
> luego adaptar el módulo `demo` para crear los tres módulos que se piden.

## 2. Objetivos de aprendizaje

Al finalizar el proyecto, el estudiante será capaz de:

- Diseñar e implementar una API REST con operaciones CRUD.
- Aplicar separación de responsabilidades por capas.
- Validar datos de entrada y manejar errores de forma centralizada.
- Modelar relaciones entre entidades en MongoDB.
- Documentar y probar los endpoints de una API.

## 3. Módulos requeridos

La API debe tener **tres módulos**, cada uno con su CRUD completo
(crear, listar, consultar por id, actualizar y eliminar).

### Módulo 1: Autores (`authors`)

Representa a los autores de los libros.

| Campo         | Tipo    | Reglas                                    |
| ------------- | ------- | ----------------------------------------- |
| `name`        | string  | Obligatorio, no vacío                     |
| `nationality` | string  | Obligatorio, no vacío                     |
| `birthYear`   | number  | Opcional, entero positivo                 |
| `createdAt`   | Date    | Se asigna automáticamente                 |
| `updatedAt`   | Date    | Se actualiza automáticamente              |

### Módulo 2: Libros (`books`)

Representa los libros del catálogo. Cada libro pertenece a un autor.

| Campo         | Tipo    | Reglas                                             |
| ------------- | ------- | -------------------------------------------------- |
| `title`       | string  | Obligatorio, no vacío                              |
| `isbn`        | string  | Obligatorio, único                                 |
| `authorId`    | ObjectId| Obligatorio, debe existir en el módulo de autores  |
| `year`        | number  | Opcional, entero                                   |
| `available`   | boolean | Por defecto `true`                                 |
| `createdAt`   | Date    | Se asigna automáticamente                          |
| `updatedAt`   | Date    | Se actualiza automáticamente                       |

### Módulo 3: Préstamos (`loans`)

Registra qué libro se prestó, a quién y en qué fechas.

| Campo         | Tipo    | Reglas                                                       |
| ------------- | ------- | ------------------------------------------------------------ |
| `bookId`      | ObjectId| Obligatorio, debe existir en el módulo de libros             |
| `userName`    | string  | Obligatorio, no vacío                                        |
| `loanDate`    | Date    | Obligatorio                                                  |
| `returnDate`  | Date    | Opcional (se llena cuando se devuelve el libro)              |
| `returned`    | boolean | Por defecto `false`                                          |
| `createdAt`   | Date    | Se asigna automáticamente                                    |
| `updatedAt`   | Date    | Se actualiza automáticamente                                 |

## 4. Endpoints mínimos

Cada módulo se expone bajo `/api/v1`. Como mínimo:

| Método | Ruta                     | Descripción                     |
| ------ | ------------------------ | ------------------------------- |
| POST   | `/api/v1/authors`        | Crear un autor                  |
| GET    | `/api/v1/authors`        | Listar autores                  |
| GET    | `/api/v1/authors/:id`    | Consultar un autor              |
| PUT    | `/api/v1/authors/:id`    | Actualizar un autor             |
| DELETE | `/api/v1/authors/:id`    | Eliminar un autor               |
| POST   | `/api/v1/books`          | Crear un libro                  |
| GET    | `/api/v1/books`          | Listar libros                   |
| GET    | `/api/v1/books/:id`      | Consultar un libro              |
| PUT    | `/api/v1/books/:id`      | Actualizar un libro             |
| DELETE | `/api/v1/books/:id`      | Eliminar un libro               |
| POST   | `/api/v1/loans`          | Registrar un préstamo           |
| GET    | `/api/v1/loans`          | Listar préstamos                |
| GET    | `/api/v1/loans/:id`      | Consultar un préstamo           |
| PUT    | `/api/v1/loans/:id`      | Actualizar / devolver un préstamo |
| DELETE | `/api/v1/loans/:id`      | Eliminar un préstamo            |

## 5. Requisitos técnicos obligatorios

1. **Arquitectura por capas** en cada módulo: `model`, `repository`, `service`,
   `controller` y `routes`.
2. **Validación de datos** en la capa de servicio (campos obligatorios, tipos, ids válidos).
3. **Manejo centralizado de errores** con códigos HTTP correctos
   (`201`, `200`, `204`, `400`, `404`, `500`).
4. **Variables de entorno** para la conexión a MongoDB (nada de credenciales en el código).
5. **Validación de relaciones**: no se puede crear un libro con un `authorId`
   inexistente, ni un préstamo con un `bookId` inexistente.
6. El proyecto debe **compilar sin errores** (`npm run build`) y **ejecutarse**
   (`npm run dev`).

## 6. Reglas de negocio adicionales

Implementa al menos **estas tres reglas** (una por módulo):

- **Autores:** no se puede eliminar un autor que tenga libros asociados.
- **Libros:** al registrar un préstamo, el libro debe estar `available: true`;
  al prestarlo pasa a `available: false`.
- **Préstamos:** al marcar un préstamo como `returned: true`, se debe asignar la
  `returnDate` y el libro vuelve a `available: true`.

## 7. Entregables

1. Repositorio Git (con historial de commits, no un solo commit final).
2. Archivo `README.md` con:
   - Descripción del proyecto.
   - Pasos para instalar y ejecutar.
   - Lista de endpoints con ejemplos (curl o Postman).
3. Una colección de Postman/Thunder o un archivo `.http` para probar los endpoints.
4. Archivo `.env.example` (sin credenciales reales).

## 8. Criterios de evaluación (100 puntos)

| Criterio                                                        | Puntos |
| --------------------------------------------------------------- | ------ |
| Estructura del proyecto y arquitectura por capas                | 15     |
| CRUD completo del módulo Autores                                | 15     |
| CRUD completo del módulo Libros                                 | 15     |
| CRUD completo del módulo Préstamos                              | 15     |
| Validaciones y manejo de errores                                | 15     |
| Reglas de negocio y relaciones entre módulos                    | 15     |
| Documentación (README + colección de pruebas)                   | 10     |

## 9. Puntos extra (opcional, +10)

- Filtros en el listado (ej: `GET /api/v1/books?available=true`).
- Paginación en los listados (`?page=1&limit=10`).
- Endpoint que liste los libros de un autor (`GET /api/v1/authors/:id/books`).
- Endpoint que liste los préstamos activos (`returned: false`).

---

**Recomendación:** empieza por el módulo de **Autores** (el más simple), luego
**Libros** (que depende de autores) y finalmente **Préstamos** (que depende de libros).
Así construyes las relaciones de forma incremental.
