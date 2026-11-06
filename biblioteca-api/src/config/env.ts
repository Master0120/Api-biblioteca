import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI?.trim();

if (!mongoUri) {
    throw new Error("Missing MONGO_URI. Copy .env.example to .env and configure your MongoDB connection string.");
}

export const env = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri,
    mongoDBName: process.env.MONGO_DB_NAME || "Library",
};
