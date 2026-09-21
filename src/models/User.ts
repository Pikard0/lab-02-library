import { IUser } from './interfaces/IUser';

export class User implements IUser {
  public constructor(
    public id: string,
    public name: string,
    public email: string,
    public borrowedBookIds: string[] = []
  ) {}

  public getName(): string {
    return this.name;
  }

  public getEmail(): string {
    return this.email;
  }

  public canBorrow(limit = 3): boolean {
    return this.borrowedBookIds.length < limit;
  }

  public borrowBook(bookId: string): void {
    if (!this.borrowedBookIds.includes(bookId)) {
      this.borrowedBookIds.push(bookId);
    }
  }

  public returnBook(bookId: string): void {
    this.borrowedBookIds = this.borrowedBookIds.filter((id) => id !== bookId);
  }
}
