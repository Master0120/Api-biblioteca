import { Router } from "express";
import authorRoutes from "../../modules/autores/autores.routes";
import bookRoutes from "../../modules/libros/libros.routes";
import loanRoutes from "../../modules/prestamos/prestamos.routes";

const router = Router();

router.use("/autor", authorRoutes);
router.use("/libro", bookRoutes);
router.use("/prestamo", loanRoutes);

export default router;
// npm run dev
