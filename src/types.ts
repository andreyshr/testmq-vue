/** one element in data */
export type ItemData = {
  /** time */
  t: string;
  /** value */
  v: number;
};

export interface DataRepository {
  getByRange(from: string, to: string): Promise<ItemData[] | undefined>;
}

export type DataType = "temperature" | "precipitation";
