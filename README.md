# Sistema de Biblioteca

Repositorio de la API REST y su aplicación frontend Angular.

## Ejecutar localmente

Instala dependencias de cada aplicación:

```powershell
npm install --prefix biblioteca-api
npm install --prefix biblioteca-frontend
```

Configura `biblioteca-api/.env` con una URI válida de MongoDB a partir de `biblioteca-api/.env.example`. No compartas ni subas el archivo `.env`.

Abre dos terminales desde la raíz:

```powershell
npm run dev
```

```powershell
npm run dev:frontend
```

La API local usa `http://localhost:3000/api/v1` y el frontend se abre en `http://localhost:4200`. Para compilar:

```powershell
npm run build
npm run build:frontend
```

Consulta [biblioteca-api/README.md](./biblioteca-api/README.md) para los endpoints del backend y [biblioteca-frontend/README.md](./biblioteca-frontend/README.md) para las pantallas, configuración y validaciones del frontend.
