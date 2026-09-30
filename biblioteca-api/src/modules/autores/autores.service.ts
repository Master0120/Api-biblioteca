import { ObjectId } from "mongodb";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";
import { LibrosRepository } from "../libros/libros.repository";
import { Autor, AutorDTO } from "./autores.model";
import { AutoresRepository } from "./autores.repository";

export class AutoresService {
    private readonly autoresRepository = new AutoresRepository();
    private readonly librosRepository = new LibrosRepository();

    async create(data: AutorDTO): Promise<Autor> {
        const name = this.requireString(data?.name, "name");
        const nationality = this.requireString(data?.nationality, "nationality");
        const birthYear = this.validateBirthYear(data?.birthYear);
        const now = new Date();
        return this.autoresRepository.create({
            name,
            nationality,
            ...(birthYear !== undefined ? { birthYear } : {}),
            createdAt: now,
            updatedAt: now,
        });
    }

    async findAll(): Promise<Autor[]> {
        return this.autoresRepository.findAll();
    }

    async findById(id: string): Promise<Autor> {
        const author = await this.autoresRepository.findById(this.toObjectId(id));
        if (!author) throw new NotFoundError("Autor no encontrado");
        return author;
    }

    async update(id: string, data: AutorDTO): Promise<Autor> {
        const objectId = this.toObjectId(id);
        const changes: Partial<Autor> = {};
        if (data.name !== undefined) changes.name = this.requireString(data.name, "name");
        if (data.nationality !== undefined) changes.nationality = this.requireString(data.nationality, "nationality");
        if (data.birthYear !== undefined) changes.birthYear = this.validateBirthYear(data.birthYear);
        if (!Object.keys(changes).length) throw new BadRequestError("No se enviaron campos para actualizar");
        changes.updatedAt = new Date();
        const author = await this.autoresRepository.update(objectId, changes);
        if (!author) throw new NotFoundError("Autor no encontrado");
        return author;
    }

    async delete(id: string): Promise<void> {
        const objectId = this.toObjectId(id);
        if (!(await this.autoresRepository.findById(objectId))) throw new NotFoundError("Autor no encontrado");
        if (await this.librosRepository.hasBooksByAuthor(objectId)) {
            throw new BadRequestError("No se puede eliminar un autor que tiene libros asociados");
        }
        await this.autoresRepository.delete(objectId);
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || !value.trim()) {
            throw new BadRequestError(`El campo '${field}' es obligatorio y debe ser un texto no vacío`);
        }
        return value.trim();
    }

    private validateBirthYear(value: unknown): number | undefined {
        if (value === undefined) return undefined;
        if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
            throw new BadRequestError("El campo 'birthYear' debe ser un entero positivo");
        }
        return value;
    }

    private toObjectId(id: string): ObjectId {
        if (!/^[a-f\d]{24}$/i.test(id)) throw new BadRequestError("Identificador de autor inválido");
        return new ObjectId(id);
    }
}