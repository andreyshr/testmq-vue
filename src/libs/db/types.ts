export interface DBConfig {
  name: string;
  version?: number;
}

export interface DBStore {
  name: string;
  params: IDBObjectStoreParameters;
}
