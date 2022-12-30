import { BaseModel } from "@/components/Canvas/models";
import { fillRect, strokeRect } from "@/utils/canvas";

interface Config {
  name?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  radius?: number[];
}

const defaultConfig = {
  name: "图片",
  w: 100,
  h: 100,
  radius: [0, 0, 0, 0],
};

class ImageModel extends BaseModel {
  ctx: CanvasRenderingContext2D;
  config: Required<Config>;

  constructor(ctx: CanvasRenderingContext2D, _config: Config) {
    const config = Object.assign({}, defaultConfig, _config);
    super(ctx, config);
    this.ctx = ctx;
    this.config = config;
  }

  draw() {
    const { w, h, x, y, radius, name } = this.config;
    strokeRect(this.ctx, x, y, w, h, "#333", radius);
    fillRect(this.ctx, x, y, w, h, "#ddd", radius, name);
    super.draw();
  }

  getData() {
    return {
      type: "image",
      ...this.config,
      radius: [...this.config.radius],
      zIndex: this.zIndex,
    };
  }
}

export default ImageModel;
