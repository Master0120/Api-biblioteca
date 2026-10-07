import { Collection, ObjectId } from "mongodb";
import { getDb } from "../../config/database";
import { Loan } from "./loans.model";

export class LoansRepository {
    private collection(): Collection<Loan> {
        return getDb().collection<Loan>("prestamos");
    }

    async create(data: Omit<Loan, "_id">): Promise<Loan> {
        const result = await this.collection().insertOne(data as Loan);
        return { _id: result.insertedId, ...data };
    }

    async findAll(): Promise<Loan[]> {
        return this.collection().find().sort({ createdAt: -1 }).toArray();
    }

    async findById(id: ObjectId): Promise<Loan | null> {
        return this.collection().findOne({ _id: id });
    }

    async update(id: ObjectId, changes: Partial<Loan>, unsetReturnDate = false): Promise<Loan | null> {
        const update: { $set: Partial<Loan>; $unset?: { returnDate: "" } } = { $set: changes };
        if (unsetReturnDate) update.$unset = { returnDate: "" };
        const result = await this.collection().updateOne({ _id: id }, update);
        return result.matchedCount ? this.findById(id) : null;
    }

    async delete(id: ObjectId): Promise<boolean> {
        const result = await this.collection().deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}