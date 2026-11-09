# Biblioteca frontend

Frontend administrativo en Angular para consumir la API de biblioteca. Está organizado por funcionalidades (`books`, `authors` y `loans`), con modelos y servicios separados, y componentes compartidos para la navegación y el pie de página.

## Requisitos

- Node.js 20.19 o posterior.
- API disponible en `http://localhost:3000/api/v1` para desarrollo local, o acceso a la API publicada.

## Instalación y ejecución

Desde la raíz del repositorio:

```powershell
npm install --prefix biblioteca-frontend
npm run dev:frontend
```

La aplicación se abre en `http://localhost:4200`. Para trabajar con la API local, inicia el backend en otra terminal con `npm run dev`. La URL local está configurada en `src/environments/environment.development.ts`; la configuración de producción está en `src/environments/environment.ts`.

## Funcionalidades

- Libros: listado, consulta por ID, creación, edición y eliminación. Para crear un libro se selecciona un autor existente.
- Autores: listado, consulta por ID, creación, edición y eliminación.
- Préstamos: listado, consulta por ID, creación, edición de usuario/fecha, devolución y eliminación.
- La API administra la disponibilidad del libro al crear/devolver/eliminar préstamos.

## Organización del frontend

La aplicación mantiene separados los modelos, servicios y páginas por funcionalidad, y reserva `shared/ui` para componentes reutilizables:

```text
src/app/
├── app.ts
├── app.config.ts
├── app.routes.ts
├── features/
│   ├── authors/
│   │   ├── authors-page/
│   │   ├── models/author.model.ts
│   │   └── services/author.service.ts
│   ├── books/
│   │   ├── books-page/
│   │   ├── models/book.model.ts
│   │   └── services/book.service.ts
│   └── loans/
│       ├── loans-page/
│       ├── models/loan.model.ts
│       └── services/loan.service.ts
└── shared/
    ├── ui/
    │   ├── header/
    │   └── footer/
    └── utils/
```

En libros, `book.model.ts` define `Book` y `BookDTO`; `book.service.ts` centraliza las solicitudes HTTP y `books-page` presenta la vista y sus formularios. Autores y préstamos siguen el mismo patrón. `app.config.ts` configura el router y `HttpClient`, y `app.routes.ts` conecta las tres páginas.

El encabezado y el pie se muestran desde `app.ts`, alrededor del `RouterOutlet`, para que estén disponibles en todas las rutas. Por eso `BooksPage` no importa el encabezado directamente. Esta organización conserva la separación del ejemplo y también las páginas de autores y préstamos que ya forman parte de la aplicación.

## Validación

```powershell
npm run build:frontend
npm run test:frontend
```
