import { openDb } from "../libs/db";
import type { DataType, ItemData } from "../types";
import { getData } from "../utils";

export class ClimateDataRepository {
  private dbConnection = openDb({ name: "climateDB" }, [
    { name: "temperature", params: { keyPath: "t" } },
    { name: "precipitation", params: { keyPath: "t" } },
  ]);
  private currentRequestId = 0;

  async getByTypeAndRange(
    type: DataType,
    from: string,
    to: string
  ): Promise<ItemData[]> {
    const requestId = ++this.currentRequestId;

    const db = await this.dbConnection;
    let result = await db.getByRange<ItemData>(type, from, to);

    if (!result.length && requestId === this.currentRequestId) {
      const data = await getData<ItemData>(`../data/${type}.json`);
      await db.addData(type, data);
      result = await db.getByRange(type, from, to);
    }

    return result;
  }
}
