import { ObjectId } from "mongodb";
import { BadRequestError, NotFoundError } from "../../shared/errors/AppError";
import { LibrosRepository } from "../libros/libros.repository";
import { Prestamo, PrestamoDTO } from "./prestamos.model";
import { PrestamosRepository } from "./prestamos.repository";

export class PrestamosService {
    private readonly prestamosRepository = new PrestamosRepository();
    private readonly librosRepository = new LibrosRepository();

    async create(data: PrestamoDTO): Promise<Prestamo> {
        const bookId = this.toObjectId(data?.bookId, "bookId");
        const book = await this.librosRepository.findById(bookId);
        if (!book) throw new NotFoundError("El libro indicado no existe");
        const userName = this.requireString(data?.userName, "userName");
        const loanDate = this.parseDate(data?.loanDate, "loanDate", true);
        if (!(await this.librosRepository.setAvailability(bookId, false))) {
            throw new BadRequestError("El libro no está disponible para préstamo");
        }
        const now = new Date();
        try {
            return await this.prestamosRepository.create({
                bookId, userName, loanDate, returned: false, createdAt: now, updatedAt: now,
            });
        } catch (error) {
            await this.librosRepository.setAvailability(bookId, true);
            throw error;
        }
    }

    async findAll(): Promise<Prestamo[]> {
        return this.prestamosRepository.findAll();
    }

    async findById(id: string): Promise<Prestamo> {
        const loan = await this.prestamosRepository.findById(this.toObjectId(id, "id"));
        if (!loan) throw new NotFoundError("Préstamo no encontrado");
        return loan;
    }

    async update(id: string, data: PrestamoDTO): Promise<Prestamo> {
        const loanId = this.toObjectId(id, "id");
        const current = await this.prestamosRepository.findById(loanId);
        if (!current) throw new NotFoundError("Préstamo no encontrado");

        const changes: Partial<Prestamo> = {};
        if (data.userName !== undefined) changes.userName = this.requireString(data.userName, "userName");
        if (data.loanDate !== undefined) changes.loanDate = this.parseDate(data.loanDate, "loanDate", true);
        const nextReturned = data.returned ?? current.returned;
        if (data.returned !== undefined && typeof data.returned !== "boolean") {
            throw new BadRequestError("El campo 'returned' debe ser booleano");
        }
        if (data.bookId !== undefined) {
            const requestedBookId = this.toObjectId(data.bookId, "bookId");
            if (!requestedBookId.equals(current.bookId)) {
                throw new BadRequestError("No se puede cambiar el libro asociado a un préstamo");
            }
        }
        if (data.returnDate !== undefined && !nextReturned) {
            throw new BadRequestError("returnDate solo puede establecerse al devolver el préstamo");
        }
        if (nextReturned && !current.returned) {
            const returnDate = data.returnDate === undefined
                ? new Date()
                : this.parseDate(data.returnDate, "returnDate", true);
            if (!(await this.librosRepository.setAvailability(current.bookId, true))) {
                throw new BadRequestError("No se pudo marcar el libro como disponible");
            }
            changes.returned = true;
            changes.returnDate = returnDate;
        } else if (!nextReturned && current.returned) {
            const book = await this.librosRepository.findById(current.bookId);
            if (!book) throw new NotFoundError("El libro asociado ya no existe");
            if (!(await this.librosRepository.setAvailability(current.bookId, false))) {
                throw new BadRequestError("El libro no está disponible para reactivar el préstamo");
            }
            changes.returned = false;
        } else if (nextReturned && data.returnDate !== undefined) {
            changes.returnDate = this.parseDate(data.returnDate, "returnDate", true);
        }
        if (data.returned !== undefined) changes.returned = nextReturned;
        if (!Object.keys(changes).length) throw new BadRequestError("No se enviaron campos para actualizar");
        changes.updatedAt = new Date();

        try {
            const updated = await this.prestamosRepository.update(loanId, changes, !nextReturned);
            if (!updated) throw new NotFoundError("Préstamo no encontrado");
            return updated;
        } catch (error) {
            if (nextReturned !== current.returned) {
                await this.librosRepository.setAvailability(current.bookId, current.returned);
            }
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        const loanId = this.toObjectId(id, "id");
        const loan = await this.prestamosRepository.findById(loanId);
        if (!loan) throw new NotFoundError("Préstamo no encontrado");
        if (loan.returned) {
            await this.prestamosRepository.delete(loanId);
            return;
        }
        if (!(await this.librosRepository.setAvailability(loan.bookId, true))) {
            throw new BadRequestError("No se pudo liberar el libro asociado al préstamo");
        }
        try {
            if (!(await this.prestamosRepository.delete(loanId))) throw new NotFoundError("Préstamo no encontrado");
        } catch (error) {
            await this.librosRepository.setAvailability(loan.bookId, false);
            throw error;
        }
    }

    private requireString(value: unknown, field: string): string {
        if (typeof value !== "string" || !value.trim()) {
            throw new BadRequestError(`El campo '${field}' es obligatorio y debe ser un texto no vacío`);
        }
        return value.trim();
    }

    private toObjectId(value: unknown, field: string): ObjectId {
        if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) {
            throw new BadRequestError(`El campo '${field}' debe ser un ObjectId válido`);
        }
        return new ObjectId(value);
    }

    private parseDate(value: unknown, field: string, required: boolean): Date {
        if (value === undefined && !required) return undefined as unknown as Date;
        const date = value instanceof Date ? value : new Date(value as string);
        if (typeof value !== "string" && !(value instanceof Date) || Number.isNaN(date.getTime())) {
            throw new BadRequestError(`El campo '${field}' debe ser una fecha válida`);
        }
        return date;
    }
}