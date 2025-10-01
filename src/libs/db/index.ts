import { DBClient } from "./db";
import type { DBConfig, DBStore } from "./types";

let dbInstances: Map<string, Promise<DBClient>> = new Map();

export function openDb(config: DBConfig, stores: DBStore[]): Promise<DBClient> {
  if (!dbInstances.has(config.name)) {
    const instance = new DBClient(config);
    dbInstances.set(
      config.name,
      instance.init(stores).then(() => instance)
    );
  }
  return dbInstances.get(config.name)!;
}
