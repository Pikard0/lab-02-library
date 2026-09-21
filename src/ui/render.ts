import { Book, User } from '../models';
import { AppState, ModalState } from '../types';

interface RenderOptions {
  root: HTMLElement;
  books: Book[];
  users: User[];
  state: AppState;
  onAddBook: (data: { title: string; author: string; year: string }) => void;
  onAddUser: (data: { id: string; name: string; email: string }) => void;
  onBorrow: (bookId: string, userId: string) => void;
  onReturn: (bookId: string) => void;
  onDeleteBook: (bookId: string) => void;
  onDeleteUser: (userId: string) => void;
  onSearch: (value: string) => void;
  onBookPageChange: (page: number) => void;
  onUserPageChange: (page: number) => void;
  onModalClose: () => void;
}

const ITEMS_PER_PAGE = 5;

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text = ''
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function createInput(placeholder: string, name: string, type = 'text'): HTMLInputElement {
  const input = createElement('input', 'form-control') as HTMLInputElement;
  input.placeholder = placeholder;
  input.name = name;
  input.type = type;
  return input;
}

function createButton(label: string, className: string): HTMLButtonElement {
  const button = createElement('button', `btn ${className}`) as HTMLButtonElement;
  button.type = 'button';
  button.textContent = label;
  return button;
}

function renderErrors(errors: string[]): HTMLElement {
  const wrapper = createElement('div', 'validation-errors');

  errors.forEach((error) => {
    wrapper.append(createElement('p', 'text-danger mb-1', error));
  });

  return wrapper;
}

function renderFormSection(
  title: string,
  fields: HTMLInputElement[],
  buttonLabel: string,
  onSubmit: () => void
): HTMLElement {
  const section = createElement('section', 'panel');
  const heading = createElement('h2', 'panel-title', title);
  const form = createElement('form', 'stack') as HTMLFormElement;
  const button = createButton(buttonLabel, 'btn-success action-button');

  fields.forEach((field) => form.append(field));
  form.append(button);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit();
  });
  button.addEventListener('click', onSubmit);

  section.append(heading, form);
  return section;
}

function renderPagination(currentPage: number, totalItems: number, onChange: (page: number) => void): HTMLElement {
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const wrapper = createElement('div', 'pagination-row');
  const previous = createButton('Назад', 'btn-outline-secondary btn-sm');
  const next = createButton('Вперед', 'btn-outline-secondary btn-sm');
  const label = createElement('span', 'page-label', `${currentPage} / ${totalPages}`);

  previous.disabled = currentPage <= 1;
  next.disabled = currentPage >= totalPages;
  previous.addEventListener('click', () => onChange(currentPage - 1));
  next.addEventListener('click', () => onChange(currentPage + 1));

  wrapper.append(previous, label, next);
  return wrapper;
}

function paginate<T>(items: T[], page: number): T[] {
  const start = (page - 1) * ITEMS_PER_PAGE;
  return items.slice(start, start + ITEMS_PER_PAGE);
}

function renderBookList(options: RenderOptions): HTMLElement {
  const section = createElement('section', 'panel');
  const header = createElement('div', 'list-header');
  const title = createElement('h2', 'panel-title mb-0', 'Список Книг');
  const search = createInput('Пошук за назвою або автором', 'search');
  search.value = options.state.searchTerm;
  search.addEventListener('input', () => options.onSearch(search.value));
  header.append(title, search);

  const normalizedSearch = options.state.searchTerm.trim().toLowerCase();
  const filteredBooks = options.books.filter((book) => {
    return (
      book.title.toLowerCase().includes(normalizedSearch) ||
      book.author.toLowerCase().includes(normalizedSearch)
    );
  });

  const list = createElement('div', 'list');
  paginate(filteredBooks, options.state.bookPage).forEach((book) => {
    const row = createElement('div', 'list-row');
    const details = createElement(
      'span',
      'list-main',
      `${book.title} by ${book.author} (${book.year})`
    );
    const controls = createElement('div', 'row-controls');

    if (book.isBorrowed()) {
      const user = options.users.find((candidate) => candidate.id === book.borrowedByUserId);
      details.append(createElement('span', 'badge text-bg-warning ms-2', user ? user.name : 'Позичено'));
      const returnButton = createButton('Повернути', 'btn-warning btn-sm');
      returnButton.addEventListener('click', () => options.onReturn(book.id));
      controls.append(returnButton);
    } else {
      const select = createElement('select', 'form-select form-select-sm user-select') as HTMLSelectElement;
      options.users.forEach((user) => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.id} ${user.name}`;
        select.append(option);
      });
      const borrowButton = createButton('Позичити', 'btn-primary btn-sm');
      borrowButton.disabled = options.users.length === 0;
      borrowButton.addEventListener('click', () => options.onBorrow(book.id, select.value));
      controls.append(select, borrowButton);
    }

    const deleteButton = createButton('Видалити', 'btn-outline-danger btn-sm');
    deleteButton.addEventListener('click', () => options.onDeleteBook(book.id));
    controls.append(deleteButton);
    row.append(details, controls);
    list.append(row);
  });

  if (filteredBooks.length === 0) {
    list.append(createElement('p', 'empty-state', 'Книг поки немає'));
  }

  section.append(
    header,
    list,
    renderPagination(options.state.bookPage, filteredBooks.length, options.onBookPageChange)
  );
  return section;
}

function renderUserList(options: RenderOptions): HTMLElement {
  const section = createElement('section', 'panel');
  section.append(createElement('h2', 'panel-title', 'Список Користувачів'));

  const list = createElement('div', 'list');
  paginate(options.users, options.state.userPage).forEach((user) => {
    const row = createElement('div', 'list-row');
    const details = createElement(
      'span',
      'list-main',
      `${user.id} ${user.name} (${user.email}) - позичено: ${user.borrowedBookIds.length}/3`
    );
    const deleteButton = createButton('Видалити', 'btn-outline-danger btn-sm');
    deleteButton.addEventListener('click', () => options.onDeleteUser(user.id));
    row.append(details, deleteButton);
    list.append(row);
  });

  if (options.users.length === 0) {
    list.append(createElement('p', 'empty-state', 'Користувачів поки немає'));
  }

  section.append(list, renderPagination(options.state.userPage, options.users.length, options.onUserPageChange));
  return section;
}

function renderModal(modal: ModalState, onClose: () => void): HTMLElement {
  const backdrop = createElement('div', 'modal-backdrop-custom');
  const dialog = createElement('div', 'modal-card');
  const title = createElement('h3', 'modal-title', modal.title);
  const message = createElement('p', 'modal-message', modal.message);
  const controls = createElement('div', 'modal-actions');
  const closeButton = createButton('Закрити', 'btn-secondary');

  closeButton.addEventListener('click', onClose);
  controls.append(closeButton);

  if (modal.onConfirm) {
    const confirmButton = createButton(modal.actionLabel ?? 'Підтвердити', 'btn-primary');
    confirmButton.addEventListener('click', modal.onConfirm);
    controls.append(confirmButton);
  }

  dialog.append(title, message, controls);
  backdrop.append(dialog);
  return backdrop;
}

export function renderApp(options: RenderOptions): void {
  const bookTitle = createInput('Назва книги', 'title');
  const bookAuthor = createInput('Автор', 'author');
  const bookYear = createInput('Рік видання', 'year');
  const userId = createInput('ID користувача', 'id');
  const userName = createInput("Ім'я", 'name');
  const userEmail = createInput('Email', 'email', 'email');

  const app = createElement('main', 'app-shell');
  app.append(createElement('h1', 'app-title', 'Система Управління Бібліотекою'));
  app.append(
    renderFormSection('Додати Книгу', [bookTitle, bookAuthor, bookYear], 'Додати Книгу', () =>
      options.onAddBook({ title: bookTitle.value, author: bookAuthor.value, year: bookYear.value })
    )
  );
  app.append(
    renderFormSection('Додати Користувача', [userId, userName, userEmail], 'Додати Користувача', () =>
      options.onAddUser({ id: userId.value, name: userName.value, email: userEmail.value })
    )
  );
  app.append(renderBookList(options));
  app.append(renderUserList(options));

  if (options.state.modal?.title === 'Помилки валідації') {
    app.append(renderErrors(options.state.modal.message.split('\n')));
  }

  options.root.replaceChildren(app);

  if (options.state.modal) {
    options.root.append(renderModal(options.state.modal, options.onModalClose));
  }
}
