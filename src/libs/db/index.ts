import { DBClient } from "./db";

let dbInstance = new DBClient();
let initPromise: Promise<DBClient> | null = null;

const stores = [
  { name: "temperature", params: { keyPath: "t" } },
  { name: "precipitation", params: { keyPath: "t" } },
];

export function useDb(): Promise<DBClient> {
  initPromise = dbInstance.init(stores).then(() => dbInstance);
  return initPromise!;
}
