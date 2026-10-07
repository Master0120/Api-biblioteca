import { ObjectId } from "mongodb";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";
import { BooksRepository } from "../books/books.repository";
import { Author, AuthorDTO } from "./authors.model";
import { AuthorsRepository } from "./authors.repository";

export class AuthorsService {
    private readonly authorsRepository = new AuthorsRepository();
    private readonly booksRepository = new BooksRepository();

    async create(data: AuthorDTO): Promise<Author> {
        const name = this.requireString(data?.name, "name");
        const nationality = this.requireString(data?.nationality, "nationality");
        const birthYear = this.validateBirthYear(data?.birthYear);
        const now = new Date();
        return this.authorsRepository.create({
            name,
            nationality,
            ...(birthYear !== undefined ? { birthYear } : {}),
            createdAt: now,
            updatedAt: now,
        });
    }

    async findAll(): Promise<Author[]> {
        return this.authorsRepository.findAll();
    }

    async findById(id: string): Promise<Author> {
        const author = await this.authorsRepository.findById(this.toObjectId(id));
        if (!author) throw new NotFoundError("Author not found");
        return author;
    }

    async update(id: string, data: AuthorDTO): Promise<Author> {
        const objectId = this.toObjectId(id);
        const changes: Partial<Author> = {};
        if (data.name !== undefined) changes.name = this.requireString(data.name, "name");
        if (data.nationality !== undefined) changes.nationality = this.requireString(data.nationality, "nationality");
        if (data.birthYear !== undefined) changes.birthYear = this.validateBirthYear(data.birthYear);
        if (!Object.keys(changes).length) throw new BadRequestError("No fields were provided for update");
        changes.updatedAt = new Date();
        const author = await this.authorsRepository.update(objectId, changes);
        if (!author) throw new NotFoundError("Author not found");
        return author;
    }

    async delete(id: string): Promise<void> {
        const objectId = this.toObjectId(id);
        if (!(await this.authorsRepository.findById(objectId))) throw new NotFoundError("Author not found");
        if (await this.booksRepository.hasBooksByAuthor(objectId)) {
            throw new BadRequestError("Cannot delete an author with associated books");
        }
        await this.authorsRepository.delete(objectId);
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || !value.trim()) {
            throw new BadRequestError(`Field '${field}' is required and must be a non-empty string`);
        }
        return value.trim();
    }

    private validateBirthYear(value: unknown): number | undefined {
        if (value === undefined) return undefined;
        if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
            throw new BadRequestError("Field 'birthYear' must be a positive integer");
        }
        return value;
    }

    private toObjectId(id: string): ObjectId {
        if (!/^[a-f\d]{24}$/i.test(id)) throw new BadRequestError("Invalid author ID");
        return new ObjectId(id);
    }
}