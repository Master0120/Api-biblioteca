import { ObjectId } from "mongodb";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";
import { Genres, GenreDTO } from "./categories.model";
import { CategoriesRepository } from "./categories.repository";

export class CategoriesService {
    private readonly categoriesRepository = new CategoriesRepository();

    async create(data: GenreDTO): Promise<Genres> {
        const name = this.requireString(data?.name, "name");
        const description = this.optionalString(data?.description, "description");
        const now = new Date();
        return this.categoriesRepository.create({
            name,
            ...(description !== undefined ? { description } : {}),
            createdAt: now,
            updatedAt: now,
        });
    }

    async findAll(): Promise<Genres[]> {
        return this.categoriesRepository.findAll();
    }

    async findById(id: string): Promise<Genres> {
        const category = await this.categoriesRepository.findById(this.toObjectId(id));
        if (!category) throw new NotFoundError("Category not found");
        return category;
    }

    async update(id: string, data: GenreDTO): Promise<Genres> {
        const objectId = this.toObjectId(id);
        const changes: Partial<Genres> = {};
        if (data.name !== undefined) changes.name = this.requireString(data.name, "name");
        if (data.description !== undefined) changes.description = this.optionalString(data.description, "description");
        if (!Object.keys(changes).length) throw new BadRequestError("No fields were provided for update");
        changes.updatedAt = new Date();
        const category = await this.categoriesRepository.update(objectId, changes);
        if (!category) throw new NotFoundError("Category not found");
        return category;
    }

    async delete(id: string): Promise<void> {
        const objectId = this.toObjectId(id);
        if (!(await this.categoriesRepository.findById(objectId))) throw new NotFoundError("Category not found");
        await this.categoriesRepository.delete(objectId);
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || !value.trim()) {
            throw new BadRequestError(`Field '${field}' is required and must be a non-empty string`);
        }
        return value.trim();
    }

    private optionalString(value: unknown, field: string): string | undefined {
        if (value === undefined) return undefined;
        if (typeof value !== "string") {
            throw new BadRequestError(`Field '${field}' must be a string`);
        }
        return value.trim();
    }

    private toObjectId(id: string): ObjectId {
        if (!/^[a-f\d]{24}$/i.test(id)) throw new BadRequestError("Invalid category ID");
        return new ObjectId(id);
    }
}