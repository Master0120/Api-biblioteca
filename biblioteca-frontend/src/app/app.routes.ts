import { Routes } from '@angular/router';
import { BooksPage } from './features/books/books-page/books-page';
import { AuthorsPage } from './features/authors/authors-page/authors-page';
import { LoansPage } from './features/loans/loans-page/loans-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'books' },
  { path: 'books', component: BooksPage, title: 'Libros | Biblioteca' },
  { path: 'authors', component: AuthorsPage, title: 'Autores | Biblioteca' },
  { path: 'loans', component: LoansPage, title: 'Préstamos | Biblioteca' },
  { path: '**', redirectTo: 'books' },
];
