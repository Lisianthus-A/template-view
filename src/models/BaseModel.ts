import { fabric } from "fabric";
import { canvasRef } from "@/store";
import EventBus from "@/utils/event";

interface Config {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  angle?: number;
}

class BaseModel {
  originWidth: number;
  originHeight: number;
  id = 0;
  zIndex = 0;
  config: Required<Config>;
  instance: fabric.Object;

  constructor(
    instance: fabric.Object,
    config: Required<Config> & { originWidth: number; originHeight: number }
  ) {
    this.originWidth = config.originWidth;
    this.originHeight = config.originHeight;
    // @ts-ignore
    delete config.originWidth;
    // @ts-ignore
    delete config.originHeight;

    this.instance = instance;
    this.config = config;

    this.updateConfig = this.updateConfig.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.setScale = this.setScale.bind(this);
    this.setAngle = this.setAngle.bind(this);
    this.setZIndex = this.setZIndex.bind(this);
    this.instance.on("moving", this.updateConfig);
    this.instance.on("scaling", this.updateConfig);
    this.instance.on("rotating", this.updateConfig);

    setTimeout(() => {
      this.setScale(config.width, config.height);
    });
  }

  // 移动、缩放、旋转组件时更新配置
  updateConfig() {
    const {
      left = 0,
      top = 0,
      scaleX = 1,
      scaleY = 1,
      angle = 0,
    } = this.instance;

    this.config.x = left;
    this.config.y = top;
    this.config.width = this.originWidth * scaleX;
    this.config.height = this.originHeight * scaleY;
    this.config.angle = angle;
    EventBus.emit("update-config");
  }

  protected getBaseFormItems() {
    const { x, y, width, height } = this.config;
    return [
      {
        id: `${this.id}-position`,
        type: "double-input",
        label: ["X", "Y"],
        name: "位置",
        value: [x >> 0, y >> 0],
        handler: this.setPosition,
      },
      {
        id: `${this.id}-scale`,
        type: "double-input",
        label: ["宽", "高"],
        name: "大小",
        value: [width >> 0, height >> 0],
        handler: this.setScale,
      },
      {
        id: `${this.id}-angle`,
        type: "range",
        name: "旋转角度",
        max: 360,
        value: this.config.angle >> 0,
        handler: this.setAngle,
      },
      {
        id: `${this.id}-zIndex`,
        type: "range",
        name: "层级",
        max: 40,
        value: this.zIndex,
        handler: this.setZIndex,
      },
    ];
  }

  // 设置位置
  setPosition(x: number, y: number) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    this.config.x = x;
    this.config.y = y;
    this.instance.set("left", x);
    this.instance.set("top", y);
    canvas.render();
  }

  // 设置大小
  setScale(width: number, height: number) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    this.config.width = width;
    this.config.height = height;
    const scaleX = width / this.originWidth;
    const scaleY = height / this.originHeight;
    this.instance.set("scaleX", scaleX);
    this.instance.set("scaleY", scaleY);
    this.instance.setCoords();

    canvas.render();
  }

  // 设置旋转角度
  setAngle(angle: number) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    angle = angle >> 0;
    this.config.angle = angle;
    this.instance.set("angle", angle);

    canvas.render();
  }

  // 设置层级
  setZIndex(zIndex: number) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    zIndex = zIndex >> 0;
    this.zIndex = zIndex;
    canvas.changeZIndex(this as any);
    canvas.render();
  }
}

export default BaseModel;
