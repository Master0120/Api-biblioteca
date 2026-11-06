import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BookService } from '../../books/services/book.service';
import { Book } from '../../books/models/book.model';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { Loan, LoanDTO } from '../models/loan.model';
import { LoanService } from '../services/loan.service';

@Component({
  selector: 'app-loans-page',
  imports: [DatePipe, FormsModule],
  templateUrl: './loans-page.html',
  styleUrl: './loans-page.scss',
})
export class LoansPage implements OnInit {
  private readonly loanService = inject(LoanService);
  private readonly bookService = inject(BookService);

  loans: Loan[] = [];
  books: Book[] = [];
  selectedLoan: Loan | null = null;
  loading = true;
  saving = false;
  modalOpen = false;
  editingId: string | null = null;
  search = '';
  errorMessage = '';
  successMessage = '';
  form = { bookId: '', userName: '', loanDate: new Date().toISOString().slice(0, 10) };

  ngOnInit(): void {
    this.loadLoans();
  }

  get filteredLoans(): Loan[] {
    const query = this.search.trim().toLocaleLowerCase();
    return this.loans.filter((loan) =>
      `${loan.userName} ${this.bookTitle(loan.bookId)}`.toLocaleLowerCase().includes(query),
    );
  }

  get activeCount(): number {
    return this.loans.filter((loan) => !loan.returned).length;
  }

  get availableBooks(): Book[] {
    return this.books.filter((book) => book.available);
  }

  bookTitle(bookId: string): string {
    return this.books.find((book) => book._id === bookId)?.title ?? 'Libro no encontrado';
  }

  loadLoans(): void {
    this.loading = true;
    this.errorMessage = '';
    forkJoin({
      loans: this.loanService.getAll(),
      books: this.bookService.getAll(),
    }).subscribe({
      next: ({ loans, books }) => {
        this.loans = loans;
        this.books = books;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible cargar los préstamos y libros.');
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form = {
      bookId: '',
      userName: '',
      loanDate: new Date().toISOString().slice(0, 10),
    };
    this.errorMessage = '';
    this.modalOpen = true;
  }

  openEdit(loan: Loan): void {
    this.editingId = loan._id;
    this.form = {
      bookId: loan.bookId,
      userName: loan.userName,
      loanDate: loan.loanDate.slice(0, 10),
    };
    this.errorMessage = '';
    this.modalOpen = true;
  }

  showDetails(loan: Loan): void {
    this.errorMessage = '';
    this.loanService.getById(loan._id).subscribe({
      next: (details) => (this.selectedLoan = details),
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible consultar el préstamo.');
      },
    });
  }

  save(): void {
    this.saving = true;
    this.errorMessage = '';
    const payload: LoanDTO = {
      bookId: this.form.bookId,
      userName: this.form.userName.trim(),
      loanDate: new Date(`${this.form.loanDate}T12:00:00`).toISOString(),
    };
    const request = this.editingId
      ? this.loanService.update(this.editingId, { userName: payload.userName, loanDate: payload.loanDate })
      : this.loanService.create(payload);

    request.subscribe({
      next: () => {
        this.successMessage = this.editingId ? 'Préstamo actualizado.' : 'Préstamo registrado.';
        this.modalOpen = false;
        this.saving = false;
        this.loadLoans();
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible guardar el préstamo.');
        this.saving = false;
      },
    });
  }

  returnLoan(loan: Loan): void {
    if (!window.confirm(`¿Registrar la devolución de "${this.bookTitle(loan.bookId)}"?`)) return;
    this.errorMessage = '';
    this.loanService.update(loan._id, { returned: true }).subscribe({
      next: () => {
        this.successMessage = 'Devolución registrada; el libro vuelve a estar disponible.';
        this.loadLoans();
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible registrar la devolución.');
      },
    });
  }

  delete(loan: Loan): void {
    if (!window.confirm(`¿Eliminar el préstamo de "${loan.userName}"?`)) return;
    this.errorMessage = '';
    this.loanService.delete(loan._id).subscribe({
      next: () => {
        this.successMessage = 'Préstamo eliminado.';
        if (this.selectedLoan?._id === loan._id) this.selectedLoan = null;
        this.loadLoans();
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible eliminar el préstamo.');
      },
    });
  }
}
