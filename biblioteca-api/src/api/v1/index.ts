import { Router } from "express";
import authorRoutes from "../../modules/authors/authors.routes";
import bookRoutes from "../../modules/books/books.routes";
import loanRoutes from "../../modules/loans/loans.routes";

const router = Router();

router.use("/authors", authorRoutes);
router.use("/books", bookRoutes);
router.use("/loans", loanRoutes);

export default router;
// npm run dev
//npm run build
//node build/server.js

// acomdar las carpetas

