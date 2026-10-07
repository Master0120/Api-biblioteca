import dotenv from "dotenv";

dotenv.config();

export const env = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: process.env.MONGO_URI || "mongodb+srv://andrecores0120_db_user:<db_password>@biblioteca.tw6lpnc.mongodb.net/?appName=Biblioteca",
    mongoDBName: process.env.MONGO_DB_NAME || "Library",
};
