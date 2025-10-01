import { useDb } from "../libs/db";
import type { DataRepository, ItemData } from "../types";
import { getData } from "../utils";

export class PrecipitationRepository implements DataRepository {
  private dbPromise = useDb();
  private currentRequestId = 0;

  async getByRange(from: string, to: string) {
    const requestId = ++this.currentRequestId;

    const db = await this.dbPromise;
    let result = await db.getByRange<ItemData>("precipitation", from, to);
    if (requestId !== this.currentRequestId) return;

    if (!result.length) {
      const data = await getData<ItemData>(`../data/precipitation.json`);
      await db.addData("precipitation", data);
      result = await db.getByRange("precipitation", from, to);
    }

    return result;
  }
}
