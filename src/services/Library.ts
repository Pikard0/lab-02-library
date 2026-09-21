export interface Entity {
  id: string;
}

export class Library<T extends Entity> {
  private readonly items: T[];

  public constructor(initialItems: T[] = []) {
    this.items = [...initialItems];
  }

  public add(item: T): void {
    if (this.findById(item.id)) {
      throw new Error(`Item with id ${item.id} already exists`);
    }

    this.items.push(item);
  }

  public remove(id: string): boolean {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    return true;
  }

  public findById(id: string): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  public find(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }

  public getAll(): T[] {
    return [...this.items];
  }

  public replace(items: T[]): void {
    this.items.splice(0, this.items.length, ...items);
  }
}
