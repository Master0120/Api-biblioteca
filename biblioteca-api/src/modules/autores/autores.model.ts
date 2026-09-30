import { ObjectId } from "mongodb";

export interface Autor {
    _id?: ObjectId;
    name: string;
    nationality: string;
    birthYear?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface AutorDTO {
    name?: string;
    nationality?: string;
    birthYear?: number;
}