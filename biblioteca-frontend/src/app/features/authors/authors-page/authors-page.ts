import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthorService } from '../services/author.service';
import { Author, AuthorDTO } from '../models/author.model';
import { getApiErrorMessage } from '../../../shared/utils/api-error';

@Component({
  selector: 'app-authors-page',
  imports: [FormsModule],
  templateUrl: './authors-page.html',
  styleUrl: './authors-page.scss',
})
export class AuthorsPage implements OnInit {
  private readonly authorService = inject(AuthorService);

  authors: Author[] = [];
  selectedAuthor: Author | null = null;
  loading = true;
  saving = false;
  modalOpen = false;
  editingId: string | null = null;
  search = '';
  errorMessage = '';
  successMessage = '';
  form = { name: '', nationality: '', birthYear: null as number | null };

  ngOnInit(): void {
    this.loadAuthors();
  }

  get filteredAuthors(): Author[] {
    const query = this.search.trim().toLocaleLowerCase();
    return this.authors.filter((author) =>
      `${author.name} ${author.nationality}`.toLocaleLowerCase().includes(query),
    );
  }

  loadAuthors(): void {
    this.loading = true;
    this.errorMessage = '';
    this.authorService.getAll().subscribe({
      next: (authors) => {
        this.authors = authors;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible cargar los autores.');
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form = { name: '', nationality: '', birthYear: null };
    this.errorMessage = '';
    this.modalOpen = true;
  }

  openEdit(author: Author): void {
    this.editingId = author._id;
    this.form = {
      name: author.name,
      nationality: author.nationality,
      birthYear: author.birthYear ?? null,
    };
    this.errorMessage = '';
    this.modalOpen = true;
  }

  showDetails(author: Author): void {
    this.errorMessage = '';
    this.authorService.getById(author._id).subscribe({
      next: (details) => (this.selectedAuthor = details),
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible consultar el autor.');
      },
    });
  }

  save(): void {
    this.saving = true;
    this.errorMessage = '';
    const payload: AuthorDTO = {
      name: this.form.name.trim(),
      nationality: this.form.nationality.trim(),
      ...(this.form.birthYear !== null ? { birthYear: this.form.birthYear } : {}),
    };
    const request = this.editingId
      ? this.authorService.update(this.editingId, payload)
      : this.authorService.create(payload);

    request.subscribe({
      next: () => {
        this.successMessage = this.editingId ? 'Autor actualizado.' : 'Autor creado.';
        this.modalOpen = false;
        this.saving = false;
        this.loadAuthors();
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible guardar el autor.');
        this.saving = false;
      },
    });
  }

  delete(author: Author): void {
    if (!window.confirm(`¿Eliminar al autor "${author.name}"?`)) return;
    this.errorMessage = '';
    this.authorService.delete(author._id).subscribe({
      next: () => {
        this.successMessage = 'Autor eliminado.';
        if (this.selectedAuthor?._id === author._id) this.selectedAuthor = null;
        this.loadAuthors();
      },
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error, 'No fue posible eliminar el autor.');
      },
    });
  }
}
