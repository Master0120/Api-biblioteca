import { MongoClient, Db } from "mongodb";
import { env } from "./env";

let client: MongoClient;
let db: Db;

export const connectDB = async (): Promise<void> => {
    client = new MongoClient(env.mongoUri);
    await client.connect();
    db = client.db(env.mongoDBName);
    await db.collection("libros").createIndex({ isbn: 1 }, { unique: true });
    console.log(`Conectado a MongoDB (db: ${env.mongoDBName})`);
};

export const getDb = (): Db => {
    if (!db) {
        throw new Error("La base de datos no ha sido inicializada");
    }
    return db;
};
