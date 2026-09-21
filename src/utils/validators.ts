export namespace Validation {
  export interface ValidationResult {
    isValid: boolean;
    errors: string[];
  }

  export function required(value: string, fieldName: string): string | null {
    return value.trim() ? null : `${fieldName} є обов'язковим полем`;
  }

  export function numeric(value: string, fieldName: string): string | null {
    return /^\d+$/.test(value.trim()) ? null : `${fieldName} має містити тільки цифри`;
  }

  export function publicationYear(value: string): string | null {
    const trimmedValue = value.trim();
    const currentYear = new Date().getFullYear();

    if (!/^(1[5-9]\d{2}|20\d{2})$/.test(trimmedValue)) {
      return 'Рік видання має бути коректним роком';
    }

    return Number(trimmedValue) <= currentYear ? null : 'Рік видання не може бути у майбутньому';
  }

  export function email(value: string): string | null {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : 'Email має бути коректним';
  }

  export function validateBook(title: string, author: string, year: string): ValidationResult {
    const errors = [
      required(title, 'Назва книги'),
      required(author, 'Автор'),
      required(year, 'Рік видання'),
      numeric(year, 'Рік видання'),
      publicationYear(year)
    ].filter((error): error is string => error !== null);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  export function validateUser(id: string, name: string, emailValue: string): ValidationResult {
    const errors = [
      required(id, 'ID користувача'),
      numeric(id, 'ID користувача'),
      required(name, "Ім'я"),
      required(emailValue, 'Email'),
      email(emailValue)
    ].filter((error): error is string => error !== null);

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
