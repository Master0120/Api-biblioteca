import { ObjectId } from "mongodb";

export interface Libro {
    _id?: ObjectId;
    title: string;
    isbn: string;
    authorId: ObjectId;
    year?: number;
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface LibroDTO {
    title?: string;
    isbn?: string;
    authorId?: string;
    year?: number;
}