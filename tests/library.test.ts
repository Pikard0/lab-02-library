import { expect } from 'chai';
import { Library } from '../src/services/Library';

interface TestItem {
  id: string;
  title: string;
}

describe('Library', () => {
  it('adds an item to the collection', () => {
    const library = new Library<TestItem>();

    library.add({ id: '1', title: 'Clean Code' });

    expect(library.getAll()).to.deep.equal([{ id: '1', title: 'Clean Code' }]);
  });

  it('does not allow duplicate ids', () => {
    const library = new Library<TestItem>([{ id: '1', title: 'Clean Code' }]);

    expect(() => library.add({ id: '1', title: 'Code Complete' })).to.throw(
      'Item with id 1 already exists'
    );
  });

  it('removes an item by id', () => {
    const library = new Library<TestItem>([
      { id: '1', title: 'Clean Code' },
      { id: '2', title: 'Code Complete' }
    ]);

    const removed = library.remove('1');

    expect(removed).to.equal(true);
    expect(library.getAll()).to.deep.equal([{ id: '2', title: 'Code Complete' }]);
  });

  it('finds an item by id and by predicate', () => {
    const library = new Library<TestItem>([
      { id: '1', title: 'Clean Code' },
      { id: '2', title: 'Code Complete' }
    ]);

    expect(library.findById('2')).to.deep.equal({ id: '2', title: 'Code Complete' });
    expect(library.find((item) => item.title.includes('Clean'))).to.deep.equal([
      { id: '1', title: 'Clean Code' }
    ]);
  });
});
