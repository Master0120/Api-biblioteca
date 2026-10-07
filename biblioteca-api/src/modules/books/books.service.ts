import { ObjectId } from "mongodb";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";
import { AuthorsRepository } from "../authors/authors.repository";
import { Book, BookDTO } from "./books.model";
import { BooksRepository } from "./books.repository";

export class BooksService {
    private readonly booksRepository = new BooksRepository();
    private readonly authorsRepository = new AuthorsRepository();

    async create(data: BookDTO): Promise<Book> {
        const title = this.requireString(data?.title, "title");
        const isbn = this.requireString(data?.isbn, "isbn");
        const authorId = this.toObjectId(data?.authorId);
        await this.ensureAuthorExists(authorId);
        await this.ensureIsbnAvailable(isbn);
        const year = this.validateYear(data?.year);
        const now = new Date();
        try {
            return await this.booksRepository.create({
                title,
                isbn,
                authorId,
                ...(year !== undefined ? { year } : {}),
                available: true,
                createdAt: now,
                updatedAt: now,
            });
        } catch (error) {
            if (this.isDuplicateKeyError(error)) throw new BadRequestError("A book with this ISBN already exists");
            throw error;
        }
    }

    async findAll(): Promise<Book[]> {
        return this.booksRepository.findAll();
    }

    async findById(id: string): Promise<Book> {
        const book = await this.booksRepository.findById(this.toObjectId(id));
        if (!book) throw new NotFoundError("Book not found");
        return book;
    }

    async update(id: string, data: BookDTO): Promise<Book> {
        const objectId = this.toObjectId(id);
        const changes: Partial<Book> = {};
        if (data.title !== undefined) changes.title = this.requireString(data.title, "title");
        if (data.isbn !== undefined) {
            changes.isbn = this.requireString(data.isbn, "isbn");
            await this.ensureIsbnAvailable(changes.isbn, objectId);
        }
        if (data.authorId !== undefined) {
            changes.authorId = this.toObjectId(data.authorId);
            await this.ensureAuthorExists(changes.authorId);
        }
        if (data.year !== undefined) changes.year = this.validateYear(data.year);
        if (!Object.keys(changes).length) throw new BadRequestError("No fields were provided for update");
        changes.updatedAt = new Date();
        let book: Book | null;
        try {
            book = await this.booksRepository.update(objectId, changes);
        } catch (error) {
            if (this.isDuplicateKeyError(error)) throw new BadRequestError("A book with this ISBN already exists");
            throw error;
        }
        if (!book) throw new NotFoundError("Book not found");
        return book;
    }

    async delete(id: string): Promise<void> {
        const objectId = this.toObjectId(id);
        if (!(await this.booksRepository.findById(objectId))) throw new NotFoundError("Book not found");
        if (await this.booksRepository.hasLoans(objectId)) {
            throw new BadRequestError("Cannot delete a book with associated loans");
        }
        await this.booksRepository.delete(objectId);
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || !value.trim()) {
            throw new BadRequestError(`Field '${field}' is required and must be a non-empty string`);
        }
        return value.trim();
    }

    private toObjectId(value: unknown): ObjectId {
        if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) {
            throw new BadRequestError("Field 'authorId' must be a valid ObjectId");
        }
        return new ObjectId(value);
    }

    private async ensureAuthorExists(id: ObjectId): Promise<void> {
        if (!(await this.authorsRepository.findById(id))) throw new NotFoundError("The specified author does not exist");
    }

    private async ensureIsbnAvailable(isbn: string, excludeId?: ObjectId): Promise<void> {
        const existing = await this.booksRepository.findByIsbn(isbn);
        if (existing && (!excludeId || !existing._id?.equals(excludeId))) {
            throw new BadRequestError("A book with this ISBN already exists");
        }
    }

    private isDuplicateKeyError(error: unknown): boolean {
        return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
    }

    private validateYear(value: unknown): number | undefined {
        if (value === undefined) return undefined;
        if (typeof value !== "number" || !Number.isInteger(value)) {
            throw new BadRequestError("Field 'year' must be an integer");
        }
        return value;
    }
}