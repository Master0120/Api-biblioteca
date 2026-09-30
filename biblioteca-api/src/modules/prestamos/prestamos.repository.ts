import { Collection, ObjectId } from "mongodb";
import { getDb } from "../../config/database";
import { Prestamo } from "./prestamos.model";

export class PrestamosRepository {
    private collection(): Collection<Prestamo> {
        return getDb().collection<Prestamo>("prestamos");
    }

    async create(data: Omit<Prestamo, "_id">): Promise<Prestamo> {
        const result = await this.collection().insertOne(data as Prestamo);
        return { _id: result.insertedId, ...data };
    }

    async findAll(): Promise<Prestamo[]> {
        return this.collection().find().sort({ createdAt: -1 }).toArray();
    }

    async findById(id: ObjectId): Promise<Prestamo | null> {
        return this.collection().findOne({ _id: id });
    }

    async update(id: ObjectId, changes: Partial<Prestamo>, unsetReturnDate = false): Promise<Prestamo | null> {
        const update: { $set: Partial<Prestamo>; $unset?: { returnDate: "" } } = { $set: changes };
        if (unsetReturnDate) update.$unset = { returnDate: "" };
        const result = await this.collection().updateOne({ _id: id }, update);
        return result.matchedCount ? this.findById(id) : null;
    }

    async delete(id: ObjectId): Promise<boolean> {
        const result = await this.collection().deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}