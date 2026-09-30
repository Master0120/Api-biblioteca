import { ObjectId } from "mongodb";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";
import { AutoresRepository } from "../autores/autores.repository";
import { Libro, LibroDTO } from "./libros.model";
import { LibrosRepository } from "./libros.repository";

export class LibrosService {
    private readonly librosRepository = new LibrosRepository();
    private readonly autoresRepository = new AutoresRepository();

    async create(data: LibroDTO): Promise<Libro> {
        const title = this.requireString(data?.title, "title");
        const isbn = this.requireString(data?.isbn, "isbn");
        const authorId = this.toObjectId(data?.authorId);
        await this.ensureAuthorExists(authorId);
        await this.ensureIsbnAvailable(isbn);
        const year = this.validateYear(data?.year);
        const now = new Date();
        try {
            return await this.librosRepository.create({
                title,
                isbn,
                authorId,
                ...(year !== undefined ? { year } : {}),
                available: true,
                createdAt: now,
                updatedAt: now,
            });
        } catch (error) {
            if (this.isDuplicateKeyError(error)) throw new BadRequestError("Ya existe un libro con ese ISBN");
            throw error;
        }
    }

    async findAll(): Promise<Libro[]> {
        return this.librosRepository.findAll();
    }

    async findById(id: string): Promise<Libro> {
        const book = await this.librosRepository.findById(this.toObjectId(id));
        if (!book) throw new NotFoundError("Libro no encontrado");
        return book;
    }

    async update(id: string, data: LibroDTO): Promise<Libro> {
        const objectId = this.toObjectId(id);
        const changes: Partial<Libro> = {};
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
        if (!Object.keys(changes).length) throw new BadRequestError("No se enviaron campos para actualizar");
        changes.updatedAt = new Date();
        let book: Libro | null;
        try {
            book = await this.librosRepository.update(objectId, changes);
        } catch (error) {
            if (this.isDuplicateKeyError(error)) throw new BadRequestError("Ya existe un libro con ese ISBN");
            throw error;
        }
        if (!book) throw new NotFoundError("Libro no encontrado");
        return book;
    }

    async delete(id: string): Promise<void> {
        const objectId = this.toObjectId(id);
        if (!(await this.librosRepository.findById(objectId))) throw new NotFoundError("Libro no encontrado");
        if (await this.librosRepository.hasLoans(objectId)) {
            throw new BadRequestError("No se puede eliminar un libro que tiene préstamos asociados");
        }
        await this.librosRepository.delete(objectId);
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || !value.trim()) {
            throw new BadRequestError(`El campo '${field}' es obligatorio y debe ser un texto no vacío`);
        }
        return value.trim();
    }

    private toObjectId(value: unknown): ObjectId {
        if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) {
            throw new BadRequestError("El campo 'authorId' debe ser un ObjectId válido");
        }
        return new ObjectId(value);
    }

    private async ensureAuthorExists(id: ObjectId): Promise<void> {
        if (!(await this.autoresRepository.findById(id))) throw new NotFoundError("El autor indicado no existe");
    }

    private async ensureIsbnAvailable(isbn: string, excludeId?: ObjectId): Promise<void> {
        const existing = await this.librosRepository.findByIsbn(isbn);
        if (existing && (!excludeId || !existing._id?.equals(excludeId))) {
            throw new BadRequestError("Ya existe un libro con ese ISBN");
        }
    }

    private isDuplicateKeyError(error: unknown): boolean {
        return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
    }

    private validateYear(value: unknown): number | undefined {
        if (value === undefined) return undefined;
        if (typeof value !== "number" || !Number.isInteger(value)) {
            throw new BadRequestError("El campo 'year' debe ser un número entero");
        }
        return value;
    }
}