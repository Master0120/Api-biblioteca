#!/usr/bin/env bash
#
# scaffold.sh
# Generates a REST API scaffold (Express 5 + TypeScript + MongoDB)
# con arquitectura por capas y un módulo "demo" con un CRUD completo.
#
# Uso:
#   chmod +x scaffold.sh
#   ./scaffold.sh
#
set -euo pipefail

# ----------------------------------------------------------------------------
# 1. Ask for the API name
# ----------------------------------------------------------------------------
read -rp "¿Cómo se llama la API? (ej: library-api): " API_NAME

# Normaliza: minúsculas y espacios -> guiones
API_NAME="$(echo "${API_NAME}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"

if [ -z "${API_NAME}" ]; then
  echo "El nombre de la API no puede estar vacío." >&2
  exit 1
fi

if [ -e "${API_NAME}" ]; then
  echo "A file or directory named '${API_NAME}' already exists. Aborting." >&2
  exit 1
fi

echo ""
echo "Creating project '${API_NAME}'..."

# ----------------------------------------------------------------------------
# 2. Crear el árbol de carpetas
# ----------------------------------------------------------------------------
mkdir -p "${API_NAME}"/src/api/v1
mkdir -p "${API_NAME}"/src/config
mkdir -p "${API_NAME}"/src/modules/demo
mkdir -p "${API_NAME}"/src/shared/errors
mkdir -p "${API_NAME}"/src/shared/middlewares

cd "${API_NAME}"

# ----------------------------------------------------------------------------
# 3. Archivos de configuración del proyecto
# ----------------------------------------------------------------------------

cat > package.json <<EOF
{
  "name": "${API_NAME}",
  "version": "1.0.0",
  "description": "",
  "license": "ISC",
  "author": "",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
    "start": "node build/server.js",
    "dev": "nodemon --exec ts-node src/server.ts"
  },
  "devDependencies": {
    "@types/compression": "^1.8.1",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/morgan": "^1.9.10",
    "nodemon": "^3.1.14",
    "ts-node": "^10.9.2",
    "typescript": "5.9.2"
  },
  "dependencies": {
    "compression": "^1.8.1",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "helmet": "^8.3.0",
    "mongodb": "^7.6.0",
    "morgan": "^1.11.0"
  }
}
EOF

cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "commonjs",
    "moduleResolution": "node",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "outDir": "./build",
    "sourceMap": true,
    "removeComments": true,
    "noEmitOnError": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build"]
}
EOF

cat > .gitignore <<'EOF'
node_modules/
build/
dist/

# Variables de entorno (contienen credenciales)
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*

# Sistema operativo / editor
.DS_Store
.idea/
.vscode/
*.tsbuildinfo
EOF

cat > .env.example <<'EOF'
# HTTP server port
PORT=3000

# Entorno de ejecución: development | production | test
NODE_ENV=development

# Cadena de conexión de MongoDB (no subir credenciales reales al repo)
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/?appName=Cluster0

# Database name
MONGO_DB_NAME=${API_NAME}
EOF

# .env local de arranque (ignorado por git)
cat > .env <<EOF
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=${API_NAME}
EOF

# ----------------------------------------------------------------------------
# 4. Configuración (env + database)
# ----------------------------------------------------------------------------

cat > src/config/env.ts <<'EOF'
import dotenv from "dotenv";

dotenv.config();

const required = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Required environment variable is missing: ${name}`);
    }
    return value;
};

export const env = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: required("MONGO_URI"),
    mongoDBName: process.env.MONGO_DB_NAME || "app",
};
EOF

cat > src/config/database.ts <<'EOF'
import { MongoClient, Db } from "mongodb";
import { env } from "./env";

let client: MongoClient;
let db: Db;

export const connectDB = async (): Promise<void> => {
    client = new MongoClient(env.mongoUri);
    await client.connect();
    db = client.db(env.mongoDBName);
    console.log(`Connected to MongoDB (database: ${env.mongoDBName})`);
};

export const getDb = (): Db => {
    if (!db) {
        throw new Error("The database has not been initialized");
    }
    return db;
};
EOF

# ----------------------------------------------------------------------------
# 5. Shared layer (errors and middleware)
# ----------------------------------------------------------------------------

cat > src/shared/errors/AppError.ts <<'EOF'
/**
 * Error operacional de la aplicación. Permite adjuntar un código HTTP
 * 
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Solicitud inválida") {
        super(message, 400);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}
EOF

cat > src/shared/middlewares/asyncHandler.ts <<'EOF'
import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async controller so rejected promises are forwarded to next()
 * se reenvíe automáticamente a next() y la capture el errorHandler.
 * Es genérico para preservar el tipado de req.params/body del handler.
 */
export const asyncHandler =
    <P = Record<string, string>, ResBody = unknown, ReqBody = unknown>(
        fn: (
            req: Request<P, ResBody, ReqBody>,
            res: Response<ResBody>,
            next: NextFunction
        ) => Promise<unknown>
    ): RequestHandler<P, ResBody, ReqBody> =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
EOF

cat > src/shared/middlewares/errorHandler.ts <<'EOF'
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { env } from "../../config/env";

/**
 * Middleware 404: se ejecuta cuando ninguna ruta coincidió.
 */
export const notFound = (req: Request, res: Response): void => {
    res.status(404).json({
        status: "error",
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

/**
 * Centralized error middleware. Register it after all routes.
 * después de las rutas.
 */
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message =
        err instanceof AppError || env.nodeEnv !== "production"
            ? err.message
            : "Internal server error";

    if (statusCode >= 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        status: "error",
        message,
        ...(env.nodeEnv !== "production" && statusCode >= 500 ? { stack: err.stack } : {}),
    });
};
EOF

# ----------------------------------------------------------------------------
# 6. Módulo demo (CRUD completo)
# ----------------------------------------------------------------------------

cat > src/modules/demo/demo.model.ts <<'EOF'
import { ObjectId } from "mongodb";

export interface Demo {
    _id?: ObjectId;
    name: string;
    description: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Datos que el cliente puede enviar sobre un demo.
 * Todos los campos son opcionales; el servicio valida qué es
 * obligatorio según la operación (crear vs. actualizar).
 */
export interface DemoDTO {
    name?: string;
    description?: string;
    active?: boolean;
}
EOF

cat > src/modules/demo/demo.repository.ts <<'EOF'
import { getDb } from "../../config/database";
import { Demo } from "./demo.model";
import { Collection, ObjectId } from "mongodb";

export class DemoRepository {

    private collection(): Collection<Demo> {
        return getDb().collection<Demo>("demo");
    }

    async create(data: Omit<Demo, "_id">): Promise<Demo> {
        const result = await this.collection().insertOne(data as Demo);
        return { _id: result.insertedId, ...data };
    }

    async findAll(): Promise<Demo[]> {
        return this.collection().find().sort({ createdAt: -1 }).toArray();
    }

    async findById(id: ObjectId): Promise<Demo | null> {
        return this.collection().findOne({ _id: id });
    }

    async update(id: ObjectId, changes: Partial<Demo>): Promise<Demo | null> {
        const result = await this.collection().findOneAndUpdate(
            { _id: id },
            { $set: changes },
            { returnDocument: "after" }
        );
        return result ?? null;
    }

    async delete(id: ObjectId): Promise<boolean> {
        const result = await this.collection().deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}
EOF

cat > src/modules/demo/demo.service.ts <<'EOF'
import { ObjectId } from "mongodb";
import { Demo, DemoDTO } from "./demo.model";
import { DemoRepository } from "./demo.repository";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";

export class DemoService {

    private readonly demoRepository = new DemoRepository();

    async create(data: DemoDTO): Promise<Demo> {
        const name = this.requireString(data?.name, "name");
        const description = this.requireString(data?.description, "description");

        const now = new Date();
        return this.demoRepository.create({
            name,
            description,
            active: typeof data.active === "boolean" ? data.active : true,
            createdAt: now,
            updatedAt: now,
        });
    }

    async findAll(): Promise<Demo[]> {
        return this.demoRepository.findAll();
    }

    async findById(id: string): Promise<Demo> {
        const demo = await this.demoRepository.findById(this.toObjectId(id));
        if (!demo) {
            throw new NotFoundError("Record not found");
        }
        return demo;
    }

    async update(id: string, data: DemoDTO): Promise<Demo> {
        const objectId = this.toObjectId(id);
        const changes: Partial<Demo> = {};

        if (data.name !== undefined) changes.name = this.requireString(data.name, "name");
        if (data.description !== undefined) changes.description = this.requireString(data.description, "description");
        if (data.active !== undefined) {
            if (typeof data.active !== "boolean") {
                throw new BadRequestError("Field 'active' must be a boolean");
            }
            changes.active = data.active;
        }

        if (Object.keys(changes).length === 0) {
            throw new BadRequestError("No fields were provided for update");
        }
        changes.updatedAt = new Date();

        const updated = await this.demoRepository.update(objectId, changes);
        if (!updated) {
            throw new NotFoundError("Record not found");
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        const deleted = await this.demoRepository.delete(this.toObjectId(id));
        if (!deleted) {
            throw new NotFoundError("Record not found");
        }
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || value.trim() === "") {
            throw new BadRequestError(`El campo '${field}' es obligatorio y debe ser un texto no vacío`);
        }
        return value.trim();
    }

    private toObjectId(id: string): ObjectId {
        if (!ObjectId.isValid(id)) {
            throw new BadRequestError(`Identificador inválido: ${id}`);
        }
        return new ObjectId(id);
    }
}
EOF

cat > src/modules/demo/demo.controller.ts <<'EOF'
import { Request, Response } from "express";
import { DemoService } from "./demo.service";

export class DemoController {

    private readonly demoService = new DemoService();

    create = async (req: Request, res: Response): Promise<void> => {
        const demo = await this.demoService.create(req.body);
        res.status(201).json(demo);
    };

    findAll = async (_req: Request, res: Response): Promise<void> => {
        const demos = await this.demoService.findAll();
        res.status(200).json(demos);
    };

    findById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const demo = await this.demoService.findById(req.params.id);
        res.status(200).json(demo);
    };

    update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const demo = await this.demoService.update(req.params.id, req.body);
        res.status(200).json(demo);
    };

    delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        await this.demoService.delete(req.params.id);
        res.status(204).send();
    };
}
EOF

cat > src/modules/demo/demo.routes.ts <<'EOF'
import { Router } from "express";
import { DemoController } from "./demo.controller";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";

const router = Router();
const demoController = new DemoController();

router.post("/", asyncHandler(demoController.create));
router.get("/", asyncHandler(demoController.findAll));
router.get("/:id", asyncHandler(demoController.findById));
router.put("/:id", asyncHandler(demoController.update));
router.delete("/:id", asyncHandler(demoController.delete));

export default router;
EOF

# ----------------------------------------------------------------------------
# 7. Enrutador v1
# ----------------------------------------------------------------------------

cat > src/api/v1/index.ts <<'EOF'
import { Router } from "express";
import demoRoutes from "../../modules/demo/demo.routes";

const router = Router();

router.use("/demo", demoRoutes);

export default router;
EOF

# ----------------------------------------------------------------------------
# 8. App y server
# ----------------------------------------------------------------------------

cat > src/app.ts <<'EOF'
import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import v1Routes from "./api/v1/index";
import { notFound, errorHandler } from "./shared/middlewares/errorHandler";

export const app = express();

app.use(express.json());
app.use(cors());
app.use(compression());
app.use(helmet());
app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/v1", v1Routes);

// Not-found and error handling (always registered last)
app.use(notFound);
app.use(errorHandler);
EOF

cat > src/server.ts <<'EOF'
import { app } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/database";

const bootstrap = async (): Promise<void> => {
    await connectDB();

    app.listen(env.port, () => {
        console.log(`Server listening on port ${env.port} [${env.nodeEnv}]`);
    });
};

bootstrap().catch((error) => {
    console.error("Error al iniciar la aplicación:", error);
    process.exit(1);
});
EOF

# ----------------------------------------------------------------------------
# 9. README
# ----------------------------------------------------------------------------

cat > README.md <<EOF
# ${API_NAME}

API REST construida con Node.js, Express 5, TypeScript y MongoDB.
Arquitectura por capas (rutas → controlador → servicio → repositorio).

## Instalación

\`\`\`bash
npm install
cp .env.example .env   # ajusta MONGO_URI
\`\`\`

## Ejecución

\`\`\`bash
npm run dev            # desarrollo con recarga
npm run build && npm start   # producción
\`\`\`

## Endpoints del módulo demo

Base URL: \`http://localhost:3000/api/v1/demo\`

| Método | Ruta   | Descripción                  |
| ------ | ------ | ---------------------------- |
| POST   | /     | Create a record               |
| GET    | /     | List all records              |
| GET    | /:id  | Retrieve a record by ID       |
| PUT    | /:id  | Update a record               |
| DELETE | /:id  | Delete a record               |

Health check: \`GET /health\`
EOF

# ----------------------------------------------------------------------------
# 10. Done
# ----------------------------------------------------------------------------

echo ""
echo "Project '${API_NAME}' created successfully."
echo ""
echo "Next steps:"
echo "  cd ${API_NAME}"
echo "  npm install"
echo "  cp .env.example .env   # ajusta MONGO_URI"
echo "  npm run dev"
echo ""
