interface ClimateDBConfig {
  dbName?: string;
  version?: number;
}

interface ClimateRecord {
  t: string;
  v: number;
}

type StoreName = "temperature" | "precipitation";

export class ClimateDB {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(config: ClimateDBConfig = {}) {
    this.dbName = config.dbName ?? "climateDB";
    this.version = config.version ?? 1;
  }

  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("temperature")) {
          db.createObjectStore("temperature", { keyPath: "t" });
        }
        if (!db.objectStoreNames.contains("precipitation")) {
          db.createObjectStore("precipitation", { keyPath: "t" });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) =>
        reject((event.target as IDBOpenDBRequest).error);
    });
  }

  async addData(
    storeName: StoreName,
    data: ClimateRecord | ClimateRecord[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("DB not initialized"));

      const tx = this.db.transaction(storeName, "readwrite");
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

  async getByRange(
    storeName: StoreName,
    from: string,
    to: string
  ): Promise<ClimateRecord[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("DB not initialized"));

      const tx = this.db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);

      const range = IDBKeyRange.bound(from, to, false, false);
      const request = store.openCursor(range);

      const result: ClimateRecord[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          result.push(cursor.value as ClimateRecord);
          cursor.continue();
        } else {
          resolve(result);
        }
      };

      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }
}
