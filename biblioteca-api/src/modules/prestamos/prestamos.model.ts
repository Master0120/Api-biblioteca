import { ObjectId } from "mongodb";

export interface Prestamo {
    _id?: ObjectId;
    bookId: ObjectId;
    userName: string;
    loanDate: Date;
    returnDate?: Date;
    returned: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PrestamoDTO {
    bookId?: string;
    userName?: string;
    loanDate?: string | Date;
    returnDate?: string | Date;
    returned?: boolean;
}