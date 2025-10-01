import type { DBConfig, DBStore } from "./types";

export class DBClient {
  private db: IDBDatabase | null = null;
  private readonly name: string;
  private readonly version: number;

  constructor(config: DBConfig) {
    this.name = config?.name;
    this.version = config?.version ?? 1;
  }

  async init(stores: DBStore[]): Promise<void> {
    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.name, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        for (const store of stores) {
          if (!db.objectStoreNames.contains(store.name)) {
            db.createObjectStore(store.name, store.params);
          }
        }
      };

      request.onsuccess = (event) =>
        resolve((event.target as IDBOpenDBRequest).result);

      request.onerror = (event) =>
        reject((event.target as IDBOpenDBRequest).error);
    });
  }

  async addData<T extends object>(
    storeName: string,
    data: T | T[]
  ): Promise<void> {
    if (!this.db) throw new Error("DB not initialized");

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);

      if (Array.isArray(data)) {
        data.forEach((item) => store.put(item));
      } else {
        store.put(data);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async getByRange<T>(
    storeName: string,
    from: string,
    to: string
  ): Promise<T[]> {
    if (!this.db) throw new Error("DB not initialized");

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);

      const range = IDBKeyRange.bound(from, to);
      const request = store.openCursor(range);

      const result: T[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          result.push(cursor.value as T);
          cursor.continue();
        } else {
          resolve(result);
        }
      };

      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }
}
