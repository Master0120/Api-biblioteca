import { Collection, ObjectId } from "mongodb";
import { getDb } from "../../config/database";
import { Autor } from "./autores.model";

export class AutoresRepository {
    private collection(): Collection<Autor> {
        return getDb().collection<Autor>("autores");
    }

    async create(data: Omit<Autor, "_id">): Promise<Autor> {
        const result = await this.collection().insertOne(data as Autor);
        return { _id: result.insertedId, ...data };
    }

    async findAll(): Promise<Autor[]> {
        return this.collection().find().sort({ createdAt: -1 }).toArray();
    }

    async findById(id: ObjectId): Promise<Autor | null> {
        return this.collection().findOne({ _id: id });
    }

    async update(id: ObjectId, changes: Partial<Autor>): Promise<Autor | null> {
        const result = await this.collection().updateOne({ _id: id }, { $set: changes });
        return result.matchedCount ? this.findById(id) : null;
    }

    async delete(id: ObjectId): Promise<boolean> {
        const result = await this.collection().deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}