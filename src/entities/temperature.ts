import { useDb } from "../libs/db";
import type { DataRepository, ItemData } from "../types";
import { getData } from "../utils";

export class TemperatureRepository implements DataRepository {
  private dbPromise = useDb();
  private currentRequestId = 0;

  async getByRange(from: string, to: string) {
    const requestId = ++this.currentRequestId;

    const db = await this.dbPromise;
    let result = await db.getByRange<ItemData>("temperature", from, to);
    if (requestId !== this.currentRequestId) return;

    if (!result.length) {
      const data = await getData<ItemData>(`../data/temperature.json`);
      await db.addData("temperature", data);
      result = await db.getByRange("temperature", from, to);
    }

    return result;
  }
}
