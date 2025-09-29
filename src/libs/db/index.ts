import { ClimateDB } from "./climate-db";

let dbInstance = new ClimateDB();
let initPromise: Promise<ClimateDB> | null = null;

export function useClimateDB(): Promise<ClimateDB> {
  initPromise = dbInstance.init().then(() => dbInstance!);
  return initPromise!;
}
