import { Router } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { PrestamosController } from "./prestamos.controller";

const router = Router();
const controller = new PrestamosController();

router.post("/", asyncHandler(controller.create));
router.get("/", asyncHandler(controller.findAll));
router.get("/:id", asyncHandler(controller.findById));
router.put("/:id", asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.delete));

export default router;