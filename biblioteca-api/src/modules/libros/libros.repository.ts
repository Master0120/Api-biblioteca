import { Collection, ObjectId } from "mongodb";
import { getDb } from "../../config/database";
import { Libro } from "./libros.model";

export class LibrosRepository {
    private collection(): Collection<Libro> {
        return getDb().collection<Libro>("libros");
    }

    async create(data: Omit<Libro, "_id">): Promise<Libro> {
        const result = await this.collection().insertOne(data as Libro);
        return { _id: result.insertedId, ...data };
    }

    async findAll(): Promise<Libro[]> {
        return this.collection().find().sort({ createdAt: -1 }).toArray();
    }

    async findById(id: ObjectId): Promise<Libro | null> {
        return this.collection().findOne({ _id: id });
    }

    async findByIsbn(isbn: string): Promise<Libro | null> {
        return this.collection().findOne({ isbn });
    }

    async update(id: ObjectId, changes: Partial<Libro>): Promise<Libro | null> {
        const result = await this.collection().updateOne({ _id: id }, { $set: changes });
        return result.matchedCount ? this.findById(id) : null;
    }

    async delete(id: ObjectId): Promise<boolean> {
        const result = await this.collection().deleteOne({ _id: id });
        return result.deletedCount === 1;
    }

    async hasBooksByAuthor(authorId: ObjectId): Promise<boolean> {
        return (await this.collection().findOne({ authorId }, { projection: { _id: 1 } })) !== null;
    }

    async hasLoans(bookId: ObjectId): Promise<boolean> {
        return (await getDb().collection("prestamos").findOne({ bookId }, { projection: { _id: 1 } })) !== null;
    }

    async setAvailability(bookId: ObjectId, available: boolean): Promise<boolean> {
        const result = await this.collection().updateOne(
            { _id: bookId, available: !available },
            { $set: { available, updatedAt: new Date() } }
        );
        return result.modifiedCount === 1;
    }
}