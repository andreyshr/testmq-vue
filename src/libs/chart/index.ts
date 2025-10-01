import * as OPTIONS from "./constants";
import type { DataPoint, DomPoint, AxesExtremes } from "./types";

export class Chart {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private data: DataPoint[] = [];
  private points: DomPoint[] = [];
  private extremes!: AxesExtremes;
  private width!: number;
  private height!: number;
  private usableWidth!: number;
  private usableHeight!: number;
  private dpr: number;
  private marginLeft = OPTIONS.MARGIN_LEFT;
  private marginRight = OPTIONS.MARGIN_RIGHT;
  private marginTop = OPTIONS.MARGIN_TOP;
  private marginBottom = OPTIONS.MARGIN_BOTTOM;

  constructor(
    container: HTMLElement,
    width: number,
    height: number,
    data: DataPoint[] = []
  ) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.dpr = window.devicePixelRatio || OPTIONS.BASE_DPR;

    this.setSize(width, height);
    this.setUsableSize();
    this.setData(data);
    this.setExtremes();
    this.setPoints();
    this.render();

    container.appendChild(this.canvas);
  }

  updateSize(width: number, height: number) {
    this.setSize(width, height);
    this.setUsableSize();
    this.setExtremes();
    this.setPoints();
    this.render();
  }

  updateData(data: DataPoint[]) {
    this.setData(data);
    this.setExtremes();
    this.setPoints();
    this.render();
  }

  private setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.scale(this.dpr, this.dpr);
  }

  private setData(data: DataPoint[]) {
    this.data = data;
  }

  private setExtremes() {
    this.extremes = { x: this.xAxisExtremes(), y: this.yAxisExtremes() };
  }

  private setUsableSize() {
    this.usableWidth = this.width - this.marginLeft - this.marginRight;
    this.usableHeight = this.height - this.marginTop - this.marginBottom;
  }

  private setPoints() {
    this.points = this.data.map((item, i) => ({
      x: this.toDomXCoord(i),
      y: this.toDomYCoord(item.v),
    }));
  }

  private render() {
    console.log("render");
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderAxes();
    this.renderYAxisLabels();
    this.renderXAxisLabels();

    if (!this.points[0]) return;

    this.context.strokeStyle = OPTIONS.BASE_CHART_COLOR;
    this.context.lineWidth = OPTIONS.BASE_LINE_WIDTH;

    this.context.beginPath();
    this.context.moveTo(this.points[0].x, this.points[0].y);
    this.points.slice(1).forEach((p) => this.context.lineTo(p.x, p.y));
    this.context.stroke();
  }

  private renderAxes() {
    this.context.beginPath();
    this.context.strokeStyle = OPTIONS.BASE_AXIS_COLOR;
    this.context.lineWidth = OPTIONS.BASE_LINE_WIDTH;

    // Y ось
    this.context.moveTo(this.marginLeft, this.marginTop);
    this.context.lineTo(this.marginLeft, this.height - this.marginBottom);

    // X ось
    this.context.moveTo(this.marginLeft, this.height - this.marginBottom);
    this.context.lineTo(
      this.width - this.marginRight,
      this.height - this.marginBottom
    );

    this.context.stroke();
  }

  private renderXAxisLabels() {
    const count = this.data.length;
    const step = Math.ceil(count / 5);
    const offset = this.height - this.marginBottom;

    this.context.fillStyle = OPTIONS.BASE_AXIS_LABEL_COLOR;
    this.context.textAlign = OPTIONS.TEXT_ALIGN.CENTER;
    this.context.textBaseline = OPTIONS.TEXT_BASELINE.TOP;
    this.context.font = OPTIONS.BASE_FONT_STYLE;

    if (count > 0) {
      const x0 = this.toDomXCoord(0);
      const value = this.data[0]?.t;

      if (value) {
        this.context.fillText(value, x0, offset + OPTIONS.AXIS_LABEL_OFFSET);
        this.context.beginPath();
        this.context.moveTo(x0, offset);
        this.context.lineTo(x0, offset + OPTIONS.AXIS_MARK_SIZE);
        this.context.stroke();
      }
    }

    for (let i = step; i < count - 1; i += step) {
      const x = this.toDomXCoord(i);
      const value = this.data[i]?.t;

      if (value) {
        this.context.fillText(value, x, offset + OPTIONS.AXIS_LABEL_OFFSET);
        this.context.beginPath();
        this.context.moveTo(x, offset);
        this.context.lineTo(x, offset + OPTIONS.AXIS_MARK_SIZE);
        this.context.stroke();
      }
    }

    if (count > 1) {
      const xEnd = this.toDomXCoord(count - 1);
      const value = this.data[count - 1]?.t;

      if (value) {
        this.context.fillText(value, xEnd, offset + OPTIONS.AXIS_LABEL_OFFSET);
        this.context.beginPath();
        this.context.moveTo(xEnd, offset);
        this.context.lineTo(xEnd, offset + OPTIONS.AXIS_MARK_SIZE);
        this.context.stroke();
      }
    }
  }

  private renderYAxisLabels() {
    const { min, max } = this.extremes.y;
    const steps = 5;
    const usableHeight = this.height - this.marginTop - this.marginBottom;

    this.context.fillStyle = OPTIONS.BASE_AXIS_LABEL_COLOR;
    this.context.textAlign = OPTIONS.TEXT_ALIGN.RIGHT;
    this.context.textBaseline = OPTIONS.TEXT_BASELINE.MIDDLE;
    this.context.font = OPTIONS.BASE_FONT_STYLE;

    for (let i = 0; i <= steps; i++) {
      const value = min + ((max - min) / steps) * i;
      const y =
        this.marginTop + (1 - (value - min) / (max - min)) * usableHeight;
      this.context.fillText(
        value.toFixed(1),
        this.marginLeft - OPTIONS.AXIS_LABEL_OFFSET,
        y
      );
      this.context.beginPath();
      this.context.moveTo(this.marginLeft - OPTIONS.AXIS_MARK_SIZE, y);
      this.context.lineTo(this.marginLeft, y);
      this.context.stroke();
    }
  }

  private toDomXCoord(index: number) {
    if (this.data.length === 1)
      return (
        this.marginLeft + (this.width - this.marginLeft - this.marginRight) / 2
      );
    return (
      this.marginLeft + (index / (this.data.length - 1)) * this.usableWidth
    );
  }

  private toDomYCoord(value: number) {
    const { min, max } = this.extremes.y;
    if (min === max) return this.marginTop + this.usableHeight / 2;
    return (
      this.marginTop + (1 - (value - min) / (max - min)) * this.usableHeight
    );
  }

  private xAxisExtremes() {
    const xs = this.data.map((_, i) => i);
    return { min: Math.min(...xs), max: Math.max(...xs) };
  }

  private yAxisExtremes() {
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < this.data.length; i++) {
      const value = this.data[i]?.v;
      if (!value) continue;
      if (value < min) min = value;
      if (value > max) max = value;
    }

    return { min, max };
  }
}
