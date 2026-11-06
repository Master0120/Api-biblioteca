export interface Loan {
  _id: string;
  bookId: string;
  userName: string;
  loanDate: string;
  returnDate?: string;
  returned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoanDTO {
  bookId: string;
  userName: string;
  loanDate: string;
  returned?: boolean;
}
