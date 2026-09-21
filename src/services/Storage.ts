export class Storage {
  public constructor(private readonly storage: globalThis.Storage = window.localStorage) {}

  public save<T>(key: string, value: T): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  public load<T>(key: string, fallback: T): T {
    const rawValue = this.storage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return fallback;
    }
  }

  public remove(key: string): void {
    this.storage.removeItem(key);
  }

  public clear(): void {
    this.storage.clear();
  }
}
