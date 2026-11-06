import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthorService } from '../../authors/services/author.service';
import { Author } from '../../authors/models/author.model';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { Book, BookDTO } from '../models/book.model';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-books-page',
  imports: [FormsModule],
  templateUrl: './books-page.html',
  styleUrl: './books-page.scss',
})
export class BooksPage implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly authorService = inject(AuthorService);

  books: Book[] = [];
  authors: Author[] = [];
  selectedBook: Book | null = null;
  loading = true;
  saving = false;
  modalOpen = false;
  editingId: string | null = null;
  search = '';
  errorMessage = '';
  successMessage = '';
  form = { title: '', isbn: '', authorId: '', year: null as number | null };

  ngOnInit(): void {
    this.loadBooks();
  }

  get filteredBooks(): Book[] {
    const query = this.search.trim().toLocaleLowerCase();
    return this.books.filter((book) =>
      `${book.title} ${book.isbn} ${this.authorName(book.authorId)}`.toLocaleLowerCase().includes(query),
    );
  }

  get availableCount(): number {
    return this.books.filter((book) => book.available).length;
  }

  authorName(authorId: string): string {
    return this.authors.find((author) => author._id === authorId)?.name ?? 'Autor no encontrado';
  }

  loadBooks(): void {
    this.loading = true;
    this.errorMessage = '';
    forkJoin({
      books: this.bookService.getAll(),
      authors: this.authorService.getAll(),
    }).subscribe({
      next: ({ books, authors }) => {
        this.books = books;
        this.authors = authors;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible cargar los libros y autores.');
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form = { title: '', isbn: '', authorId: '', year: null };
    this.errorMessage = '';
    this.modalOpen = true;
  }

  openEdit(book: Book): void {
    this.editingId = book._id;
    this.form = {
      title: book.title,
      isbn: book.isbn,
      authorId: book.authorId,
      year: book.year ?? null,
    };
    this.errorMessage = '';
    this.modalOpen = true;
  }

  showDetails(book: Book): void {
    this.errorMessage = '';
    this.bookService.getById(book._id).subscribe({
      next: (details) => (this.selectedBook = details),
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible consultar el libro.');
      },
    });
  }

  save(): void {
    this.saving = true;
    this.errorMessage = '';
    const payload: BookDTO = {
      title: this.form.title.trim(),
      isbn: this.form.isbn.trim(),
      authorId: this.form.authorId,
      ...(this.form.year !== null ? { year: this.form.year } : {}),
    };
    const request = this.editingId
      ? this.bookService.update(this.editingId, payload)
      : this.bookService.create(payload);

    request.subscribe({
      next: () => {
        this.successMessage = this.editingId ? 'Libro actualizado.' : 'Libro creado.';
        this.modalOpen = false;
        this.saving = false;
        this.loadBooks();
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible guardar el libro.');
        this.saving = false;
      },
    });
  }

  delete(book: Book): void {
    if (!window.confirm(`¿Eliminar el libro "${book.title}"?`)) return;
    this.errorMessage = '';
    this.bookService.delete(book._id).subscribe({
      next: () => {
        this.successMessage = 'Libro eliminado.';
        if (this.selectedBook?._id === book._id) this.selectedBook = null;
        this.loadBooks();
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible eliminar el libro.');
      },
    });
  }
}
