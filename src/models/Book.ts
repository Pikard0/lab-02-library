import { IBook } from './interfaces/IBook';

export class Book implements IBook {
  public borrowedByUserId: string | null;

  public constructor(
    public id: string,
    public title: string,
    public author: string,
    public year: number,
    borrowedByUserId: string | null = null
  ) {
    this.borrowedByUserId = borrowedByUserId;
  }

  public getTitle(): string {
    return this.title;
  }

  public getAuthor(): string {
    return this.author;
  }

  public getYear(): number {
    return this.year;
  }

  public isBorrowed(): boolean {
    return this.borrowedByUserId !== null;
  }

  public borrow(userId: string): void {
    this.borrowedByUserId = userId;
  }

  public returnBook(): void {
    this.borrowedByUserId = null;
  }
}
