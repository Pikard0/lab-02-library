import { Book } from '../../models/Book';
import { createId } from '../../utils/idGenerator';
import { Validation } from '../../utils/validators';
import { buildForm } from './FormBuilder';

interface BookFormData extends Record<string, string> {
  title: string;
  author: string;
  year: string;
}

export function renderBookForm(container: HTMLElement, onSubmit: (book: Book) => void): void {
  const form = buildForm<BookFormData>({
    fields: [
      { name: 'title', label: 'Назва книги', type: 'text' },
      { name: 'author', label: 'Автор', type: 'text' },
      { name: 'year', label: 'Рік видання', type: 'text' }
    ],
    submitLabel: 'Додати книгу',
    validate: (data) => Validation.validateBook(data.title, data.author, data.year),
    onValid: (data) => onSubmit(new Book(createId('book'), data.title, data.author, Number(data.year)))
  });

  container.append(form);
}
