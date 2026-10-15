import { Collection, ObjectId } from "mongodb";
import { getDb } from "../../config/database";
import { Genres } from "./categories.model";

export class CategoriesRepository {
    private collection(): Collection<Genres> {
        return getDb().collection<Genres>("categorias");
    }

    async create(data: Omit<Genres, "_id">): Promise<Genres> {
        const result = await this.collection().insertOne(data as Genres);
        return { _id: result.insertedId, ...data };
    }

    async findAll(): Promise<Genres[]> {
        return this.collection().find().sort({ createdAt: -1 }).toArray();
    }

    async findById(id: ObjectId): Promise<Genres | null> {
        return this.collection().findOne({ _id: id });
    }

    async update(id: ObjectId, changes: Partial<Genres>): Promise<Genres | null> {
        const result = await this.collection().updateOne({ _id: id }, { $set: changes });
        return result.matchedCount ? this.findById(id) : null;
    }

    async delete(id: ObjectId): Promise<boolean> {
        const result = await this.collection().deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}