import { ObjectId } from "mongodb";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";
import { BooksRepository } from "../books/books.repository";
import { Loan, LoanDTO } from "./loans.model";
import { LoansRepository } from "./loans.repository";

export class LoansService {
    private readonly loansRepository = new LoansRepository();
    private readonly booksRepository = new BooksRepository();

    async create(data: LoanDTO): Promise<Loan> {
        const bookId = this.toObjectId(data?.bookId, "bookId");
        const book = await this.booksRepository.findById(bookId);
        if (!book) throw new NotFoundError("The specified book does not exist");
        const userName = this.requireString(data?.userName, "userName");
        const loanDate = this.parseDate(data?.loanDate, "loanDate", true);
        if (!(await this.booksRepository.setAvailability(bookId, false))) {
            throw new BadRequestError("The book is not available for loan");
        }
        const now = new Date();
        try {
            return await this.loansRepository.create({
                bookId, userName, loanDate, returned: false, createdAt: now, updatedAt: now,
            });
        } catch (error) {
            await this.booksRepository.setAvailability(bookId, true);
            throw error;
        }
    }

    async findAll(): Promise<Loan[]> {
        return this.loansRepository.findAll();
    }

    async findById(id: string): Promise<Loan> {
        const loan = await this.loansRepository.findById(this.toObjectId(id, "id"));
        if (!loan) throw new NotFoundError("Loan not found");
        return loan;
    }

    async update(id: string, data: LoanDTO): Promise<Loan> {
        const loanId = this.toObjectId(id, "id");
        const current = await this.loansRepository.findById(loanId);
        if (!current) throw new NotFoundError("Loan not found");

        const changes: Partial<Loan> = {};
        if (data.userName !== undefined) changes.userName = this.requireString(data.userName, "userName");
        if (data.loanDate !== undefined) changes.loanDate = this.parseDate(data.loanDate, "loanDate", true);
        const nextReturned = data.returned ?? current.returned;
        if (data.returned !== undefined && typeof data.returned !== "boolean") {
            throw new BadRequestError("Field 'returned' must be a boolean");
        }
        if (data.bookId !== undefined) {
            const requestedBookId = this.toObjectId(data.bookId, "bookId");
            if (!requestedBookId.equals(current.bookId)) {
                throw new BadRequestError("The book associated with a loan cannot be changed");
            }
        }
        if (data.returnDate !== undefined && !nextReturned) {
            throw new BadRequestError("returnDate can only be set when returning a loan");
        }
        if (nextReturned && !current.returned) {
            const returnDate = data.returnDate === undefined
                ? new Date()
                : this.parseDate(data.returnDate, "returnDate", true);
            if (!(await this.booksRepository.setAvailability(current.bookId, true))) {
                throw new BadRequestError("Could not mark the book as available");
            }
            changes.returned = true;
            changes.returnDate = returnDate;
        } else if (!nextReturned && current.returned) {
            const book = await this.booksRepository.findById(current.bookId);
            if (!book) throw new NotFoundError("The associated book no longer exists");
            if (!(await this.booksRepository.setAvailability(current.bookId, false))) {
                throw new BadRequestError("The book is not available to reactivate this loan");
            }
            changes.returned = false;
        } else if (nextReturned && data.returnDate !== undefined) {
            changes.returnDate = this.parseDate(data.returnDate, "returnDate", true);
        }
        if (data.returned !== undefined) changes.returned = nextReturned;
        if (!Object.keys(changes).length) throw new BadRequestError("No se enviaron campos para actualizar");
        changes.updatedAt = new Date();

        try {
            const updated = await this.loansRepository.update(loanId, changes, !nextReturned);
            if (!updated) throw new NotFoundError("Loan not found");
            return updated;
        } catch (error) {
            if (nextReturned !== current.returned) {
                await this.booksRepository.setAvailability(current.bookId, current.returned);
            }
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        const loanId = this.toObjectId(id, "id");
        const loan = await this.loansRepository.findById(loanId);
        if (!loan) throw new NotFoundError("Loan not found");
        if (loan.returned) {
            await this.loansRepository.delete(loanId);
            return;
        }
        if (!(await this.booksRepository.setAvailability(loan.bookId, true))) {
            throw new BadRequestError("Could not release the book associated with this loan");
        }
        try {
            if (!(await this.loansRepository.delete(loanId))) throw new NotFoundError("Loan not found");
        } catch (error) {
            await this.booksRepository.setAvailability(loan.bookId, false);
            throw error;
        }
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || !value.trim()) {
            throw new BadRequestError(`Field '${field}' is required and must be a non-empty string`);
        }
        return value.trim();
    }

    private toObjectId(value: unknown, field: string): ObjectId {
        if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) {
            throw new BadRequestError(`Field '${field}' must be a valid ObjectId`);
        }
        return new ObjectId(value);
    }

    private parseDate(value: unknown, field: string, required: boolean): Date {
        if (value === undefined && !required) return undefined as unknown as Date;
        const date = value instanceof Date ? value : new Date(value as string);
        if (typeof value !== "string" && !(value instanceof Date) || Number.isNaN(date.getTime())) {
            throw new BadRequestError(`Field '${field}' must be a valid date`);
        }
        return date;
    }
}