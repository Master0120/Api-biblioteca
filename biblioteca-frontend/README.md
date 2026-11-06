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

## Validación

```powershell
npm run build:frontend
npm run test:frontend
```
