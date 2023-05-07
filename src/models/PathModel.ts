import { fabric } from "fabric";
import { BaseModel } from "@/models";

interface Config {
  path: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  strokeWidth: number;
  color: string;
  shadow: null | {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  angle?: number;
  zIndex?: number;
}

const defaultConfig = {
  x: 0,
  y: 0,
  angle: 0,
  zIndex: 4,
};

class PathModel extends BaseModel {
  config: Required<Config>;
  instance: fabric.Path;

  constructor(
    instance: fabric.Path,
    config: Required<Config> & { originWidth: number; originHeight: number }
  ) {
    super(instance, config);

    this.instance = instance;
    this.config = config;
    this.zIndex = config.zIndex;

    console.log("PathModel", this);
  }

  static async create(_config: Config) {
    const config = Object.assign({}, defaultConfig, _config);

    return await new Promise<PathModel>((resolve) => {
      const instance = new fabric.Path(config.path, {
        // @ts-ignore
        fill: null,
        stroke: config.color,
        strokeWidth: config.strokeWidth,
        left: config.x,
        top: config.y,
        angle: config.angle,
        shadow: config.shadow
          ? new fabric.Shadow({
              blur: config.shadow.blur,
              offsetX: config.shadow.offsetX,
              offsetY: config.shadow.offsetY,
              affectStroke: true,
              color: config.shadow.color,
            })
          : undefined,
        strokeLineCap: "round",
        strokeLineJoin: "round",
        strokeMiterLimit: 10,
      });

      resolve(
        new PathModel(instance, {
          path: config.path,
          x: config.x,
          y: config.y,
          width: config.width,
          height: config.height,
          strokeWidth: config.strokeWidth,
          color: config.color,
          angle: config.angle,
          shadow: config.shadow,
          originWidth: config.width,
          originHeight: config.height,
          zIndex: config.zIndex || 4,
        })
      );
    });
  }

  // 获取表单项
  getFormObject() {
    const baseItems = this.getBaseFormItems();

    return {
      id: this.id,
      name: "绘线",
      items: baseItems.filter((item) => item.name !== "重置大小"),
    };
  }

  // 获取组件数据
  getData() {
    return {
      type: "path",
      zIndex: this.zIndex,
      config: this.config,
    };
  }
}

export default PathModel;
