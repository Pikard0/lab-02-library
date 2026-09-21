import { expect } from 'chai';
import { Validation } from '../src/utils/validators';

describe('Validation', () => {
  it('checks required values', () => {
    expect(Validation.required('', 'Назва книги')).to.equal("Назва книги є обов'язковим полем");
    expect(Validation.required('Clean Code', 'Назва книги')).to.equal(null);
  });

  it('checks numeric user id', () => {
    expect(Validation.numeric('12345', 'ID користувача')).to.equal(null);
    expect(Validation.numeric('12a45', 'ID користувача')).to.equal(
      'ID користувача має містити тільки цифри'
    );
  });

  it('checks publication year format', () => {
    expect(Validation.publicationYear('2008')).to.equal(null);
    expect(Validation.publicationYear('abc')).to.equal('Рік видання має бути коректним роком');
  });

  it('validates a correct book form', () => {
    const result = Validation.validateBook('Code Complete', 'Steve McConnell', '2004');

    expect(result.isValid).to.equal(true);
    expect(result.errors).to.deep.equal([]);
  });

  it('returns errors for an invalid user form', () => {
    const result = Validation.validateUser('12a', '', 'broken-email');

    expect(result.isValid).to.equal(false);
    expect(result.errors).to.include('ID користувача має містити тільки цифри');
    expect(result.errors).to.include("Ім'я є обов'язковим полем");
    expect(result.errors).to.include('Email має бути коректним');
  });
});
