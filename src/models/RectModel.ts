import { fabric } from "fabric";
import { canvasRef } from "@/store";
import { BaseModel } from "@/models";

interface Config {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  angle?: number;
  zIndex?: number;
}

const defaultConfig = {
  x: 0,
  y: 0,
  width: 200,
  height: 200,
  fill: "rgba(153, 153, 153, 1)",
  stroke: "",
  strokeWidth: 0,
  radius: 0,
  angle: 0,
  zIndex: 2,
};

class RectModel extends BaseModel {
  config: Required<Config>;
  instance: fabric.Rect;

  constructor(
    instance: fabric.Rect,
    config: Required<Config> & { originWidth: number; originHeight: number }
  ) {
    super(instance, config);

    this.instance = instance;
    this.config = config;
    this.zIndex = config.zIndex;

    this.setFill = this.setFill.bind(this);
    this.setStrokeWidth = this.setStrokeWidth.bind(this);
    this.setStroke = this.setStroke.bind(this);
    this.setRadius = this.setRadius.bind(this);

    console.log("RectModel", this);
  }

  static async create(_config: Config) {
    const config = Object.assign({}, defaultConfig, _config);

    return await new Promise<RectModel>((resolve) => {
      const instance = new fabric.Rect({
        left: config.x,
        top: config.y,
        width: 200,
        height: 200,
        fill: config.fill,
        stroke: config.stroke,
        strokeWidth: config.strokeWidth,
        rx: config.radius,
        ry: config.radius,
        strokeUniform: true,
      });

      resolve(
        new RectModel(instance, {
          x: config.x,
          y: config.y,
          width: config.width,
          height: config.height,
          fill: config.fill,
          stroke: config.stroke,
          strokeWidth: config.strokeWidth,
          angle: config.angle,
          radius: config.radius,
          originWidth: 200,
          originHeight: 200,
          zIndex: config.zIndex || 0,
        })
      );
    });
  }

  // 获取表单项
  getFormObject() {
    const baseItems = this.getBaseFormItems().filter(
      (item) => item.name !== "重置大小"
    );

    return {
      id: this.id,
      name: "矩形",
      items: [
        {
          id: `${this.id}-fill`,
          type: "color",
          name: "填充颜色",
          value: this.config.fill,
          handler: this.setFill,
        },
        {
          id: `${this.id}-stroke`,
          type: "color",
          name: "描边颜色",
          value: this.config.stroke,
          handler: this.setStroke,
        },
        {
          id: `${this.id}-strokeWidth`,
          type: "range",
          name: "描边宽度",
          value: this.config.strokeWidth,
          handler: this.setStrokeWidth,
        },
        {
          id: `${this.id}-radius`,
          type: "range",
          name: "圆角",
          value: this.config.radius,
          handler: this.setRadius,
        },
        ...baseItems,
      ],
    };
  }

  // 设置圆角
  setRadius(radius: number) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    radius = radius >> 0;
    this.config.radius = radius;

    this.instance.set("rx", radius);
    this.instance.set("ry", radius);
    canvas.saveToStack();
    canvas.emitUpdateConfig();
    canvas.render();
  }

  // 填充颜色
  setFill(color: string) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    this.config.fill = color;

    this.instance.set("fill", color);
    canvas.saveToStack();
    canvas.emitUpdateConfig();
    canvas.render();
  }

  // 描边宽度
  setStrokeWidth(width: number) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    this.config.strokeWidth = width;
    this.instance.set("strokeWidth", width);

    canvas.saveToStack();
    canvas.emitUpdateConfig();
    canvas.render();
  }

  // 描边颜色
  setStroke(color: string) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    this.config.stroke = color;
    this.instance.set("stroke", color);
    canvas.emitUpdateConfig();
    canvas.saveToStack();
    canvas.render();
  }

  // 获取组件数据
  getData() {
    return {
      type: "rect",
      zIndex: this.zIndex,
      config: this.config,
    };
  }
}

export default RectModel;
