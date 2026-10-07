import { ObjectId } from "mongodb";

export interface Book {
    _id?: ObjectId;
    title: string;
    isbn: string;
    authorId: ObjectId; // Reference to the author.
    year?: number;
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface BookDTO {
    title?: string;
    isbn?: string;
    authorId?: string;
    year?: number;
}