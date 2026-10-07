import { Request, Response } from "express";
import { BooksService } from "./books.service";

export class BooksController {
    private readonly service = new BooksService();

    create = async (req: Request, res: Response): Promise<void> => {
        res.status(201).json(await this.service.create(req.body));
    };

    findAll = async (_req: Request, res: Response): Promise<void> => {
        res.status(200).json(await this.service.findAll());
    };

    findById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        res.status(200).json(await this.service.findById(req.params.id));
    };

    update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        res.status(200).json(await this.service.update(req.params.id, req.body));
    };

    delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        await this.service.delete(req.params.id);
        res.status(204).send();
    };
}