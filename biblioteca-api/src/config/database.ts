import { MongoClient, Db } from "mongodb";
import { env } from "./env";

let client: MongoClient;
let db: Db;

export const connectDB = async (): Promise<void> => {
    client = new MongoClient(env.mongoUri);
    await client.connect();
    db = client.db(env.mongoDBName);
    await db.collection("libros").createIndex({ isbn: 1 }, { unique: true });
    console.log(`Connected to MongoDB (database: ${env.mongoDBName})`);
};

export const getDb = (): Db => {
    if (!db) {
        throw new Error("The database has not been initialized");
    }
    return db;
};
