import { Router } from "express";
import authorRoutes from "../../modules/authors/authors.routes";
import bookRoutes from "../../modules/books/books.routes";
import categoryRoutes from "../../modules/categories/categories.routes";
import loanRoutes from "../../modules/loans/loans.routes";

const router = Router();

router.use("/authors", authorRoutes);
router.use("/books", bookRoutes);
router.use("/categories", categoryRoutes);
router.use("/loans", loanRoutes);

export default router;
// npm run dev
//npm run build
//node build/server.js

//  git push origin main   / subir a git todo

// acomdar las carpetas

//npm --prefix .\Api-biblioteca-main run dev
