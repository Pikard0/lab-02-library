import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './styles/main.scss';

import { Book, IBook, IUser, User } from './models';
import { Library, Storage } from './services';
import { AppState, ModalState } from './types';
import { createId } from './utils/idGenerator';
import { Validation } from './utils/validators';
import { renderApp } from './ui/render';

class App {
  private readonly bookLibrary = new Library<Book>();
  private readonly userLibrary = new Library<User>();
  private readonly storage = new Storage();
  private readonly state: AppState = {
    bookPage: 1,
    userPage: 1,
    searchTerm: '',
    modal: null
  };

  public constructor(private readonly root: HTMLElement) {
    this.restore();
    this.render();
  }

  private restore(): void {
    const books = this.storage.load<IBook[]>('books', []);
    const users = this.storage.load<IUser[]>('users', []);

    this.bookLibrary.replace(
      books.map((book) => new Book(book.id, book.title, book.author, book.year, book.borrowedByUserId))
    );
    this.userLibrary.replace(
      users.map((user) => new User(user.id, user.name, user.email, user.borrowedBookIds))
    );
  }

  private persist(): void {
    this.storage.save('books', this.bookLibrary.getAll());
    this.storage.save('users', this.userLibrary.getAll());
  }

  private showModal(modal: ModalState): void {
    this.state.modal = modal;
    this.render();
  }

  private showValidation(errors: string[]): void {
    this.showModal({
      title: 'Помилки валідації',
      message: errors.join('\n')
    });
  }

  private addBook(data: { title: string; author: string; year: string }): void {
    const validation = Validation.validateBook(data.title, data.author, data.year);

    if (!validation.isValid) {
      this.showValidation(validation.errors);
      return;
    }

    this.bookLibrary.add(
      new Book(createId('book'), data.title.trim(), data.author.trim(), Number(data.year.trim()))
    );
    this.persist();
    this.render();
  }

  private addUser(data: { id: string; name: string; email: string }): void {
    const validation = Validation.validateUser(data.id, data.name, data.email);

    if (!validation.isValid) {
      this.showValidation(validation.errors);
      return;
    }

    try {
      this.userLibrary.add(new User(data.id.trim(), data.name.trim(), data.email.trim()));
    } catch {
      this.showModal({
        title: 'Користувач вже існує',
        message: `Користувач з ID ${data.id.trim()} вже доданий до бібліотеки.`
      });
      return;
    }

    this.persist();
    this.render();
  }

  private borrowBook(bookId: string, userId: string): void {
    const book = this.bookLibrary.findById(bookId);
    const user = this.userLibrary.findById(userId);

    if (!book || !user) {
      this.showModal({
        title: 'Позичання неможливе',
        message: 'Оберіть наявну книгу та користувача.'
      });
      return;
    }

    if (!user.canBorrow()) {
      this.showModal({
        title: 'Ліміт позичань',
        message: `${user.name} вже має 3 книги. Поверніть одну з них перед новим позичанням.`
      });
      return;
    }

    this.showModal({
      title: 'Підтвердити позичання',
      message: `Позичити "${book.title}" користувачу ${user.name}?`,
      actionLabel: 'Позичити',
      onConfirm: () => {
        book.borrow(user.id);
        user.borrowBook(book.id);
        this.state.modal = {
          title: 'Книгу позичено',
          message: `${user.name} успішно позичив(ла) "${book.title}".`
        };
        this.persist();
        this.render();
      }
    });
  }

  private returnBook(bookId: string): void {
    const book = this.bookLibrary.findById(bookId);

    if (!book || !book.borrowedByUserId) {
      return;
    }

    const user = this.userLibrary.findById(book.borrowedByUserId);
    user?.returnBook(book.id);
    book.returnBook();
    this.persist();
    this.showModal({
      title: 'Книгу повернуто',
      message: `"${book.title}" знову доступна для позичання.`
    });
  }

  private deleteBook(bookId: string): void {
    const book = this.bookLibrary.findById(bookId);
    const user = book?.borrowedByUserId ? this.userLibrary.findById(book.borrowedByUserId) : undefined;

    user?.returnBook(bookId);
    this.bookLibrary.remove(bookId);
    this.persist();
    this.render();
  }

  private deleteUser(userId: string): void {
    this.bookLibrary
      .find((book) => book.borrowedByUserId === userId)
      .forEach((book) => book.returnBook());
    this.userLibrary.remove(userId);
    this.persist();
    this.render();
  }

  private render(): void {
    renderApp({
      root: this.root,
      books: this.bookLibrary.getAll(),
      users: this.userLibrary.getAll(),
      state: this.state,
      onAddBook: (data) => this.addBook(data),
      onAddUser: (data) => this.addUser(data),
      onBorrow: (bookId, userId) => this.borrowBook(bookId, userId),
      onReturn: (bookId) => this.returnBook(bookId),
      onDeleteBook: (bookId) => this.deleteBook(bookId),
      onDeleteUser: (userId) => this.deleteUser(userId),
      onSearch: (value) => {
        this.state.searchTerm = value;
        this.state.bookPage = 1;
        this.render();
      },
      onBookPageChange: (page) => {
        this.state.bookPage = page;
        this.render();
      },
      onUserPageChange: (page) => {
        this.state.userPage = page;
        this.render();
      },
      onModalClose: () => {
        this.state.modal = null;
        this.render();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector<HTMLElement>('#app');

  if (root) {
    new App(root);
  }
});
