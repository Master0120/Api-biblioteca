import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: unknown; error?: unknown } | null;
    if (typeof body?.message === 'string') return body.message;
    if (typeof body?.error === 'string') return body.error;
    if (error.status === 0) return 'No se pudo conectar con la API. Revisa que el servidor esté activo.';
  }

  return fallback;
}
