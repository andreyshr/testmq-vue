import type { ItemData } from "../../types";

export type DataPoint = ItemData;

export interface DomPoint {
  x: number;
  y: number;
}

export interface AxesExtremes {
  x: Extremes;
  y: Extremes;
}

export interface Extremes {
  min: number;
  max: number;
}
