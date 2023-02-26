import { fabric } from "fabric";
import { Toast } from "@/components";
import { canvasRef } from "@/store";
import { BaseModel } from "@/models";

interface Config {
  imageUrl: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  angle?: number;
}

const defaultConfig = {
  x: 100,
  y: 100,
  radius: 0,
  angle: 0,
};

class ImageModel extends BaseModel {
  config: Required<Config>;
  instance: fabric.Image;

  constructor(
    instance: fabric.Image,
    config: Required<Config> & { originWidth: number; originHeight: number }
  ) {
    super(instance, config);

    this.instance = instance;
    this.config = config;

    this.replaceImage = this.replaceImage.bind(this);
    this.setRadius = this.setRadius.bind(this);

    if (config.radius > 0) {
      this.setRadius(config.radius);
    }

    console.log("ImageModel", this);
  }

  static create(_config: Config) {
    return new Promise<ImageModel>((resolve) => {
      const img = document.createElement("img");
      img.src = _config.imageUrl;
      img.onload = () => {
        const { width, height } = img;
        const config = Object.assign(
          {},
          defaultConfig,
          { width, height },
          _config
        );
        // 使用图片原尺寸生成 fabric 实例
        const imageConfig = {
          width,
          height,
          left: config.x,
          top: config.y,
          angle: config.angle,
        };
        fabric.Image.fromURL(
          _config.imageUrl,
          (instance) => {
            instance.lockScalingFlip = true;
            const model = new ImageModel(instance, {
              imageUrl: config.imageUrl,
              x: config.x,
              y: config.y,
              width: config.width,
              height: config.height,
              radius: config.radius,
              angle: config.angle,
              originWidth: width,
              originHeight: height,
            });
            resolve(model);
          },
          imageConfig
        );
      };
      img.onerror = (err) => {
        Toast.show("图片加载失败");
        console.log("img onerror:", err);
      };
    });
  }

  // 获取表单项
  getFormObject() {
    const baseItems = this.getBaseFormItems();

    return {
      id: this.id,
      name: "图片",
      items: [
        {
          id: `${this.id}-replaceImage`,
          type: "upload-image",
          name: "替换图片",
          value: "",
          handler: this.replaceImage,
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
    debugger;

    radius = radius >> 0;
    this.config.radius = radius;

    const radiusPercent = radius / 200;

    this.instance.set(
      "clipPath",
      new fabric.Rect({
        width: this.originWidth,
        height: this.originHeight,
        rx: this.originWidth * radiusPercent,
        ry: this.originHeight * radiusPercent,
        left: -this.originWidth / 2,
        top: -this.originHeight / 2,
      })
    );
    canvas.render();
  }

  // 替换图片
  replaceImage(imageUrl: string) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    return new Promise<void>((resolve) => {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.onload = () => {
        const { width, height } = img;
        this.instance.setSrc(imageUrl, () => {
          this.originWidth = width;
          this.originHeight = height;
          this.setScale(this.config.width, this.config.height);
          this.setRadius(this.config.radius);
          resolve();
        });
      };
      img.onerror = (err) => {
        Toast.show("图片加载失败");
        console.log("img onerror:", err);
      };
    });
  }

  // 获取组件数据
  getData() {
    return {
      type: "image",
      originWidth: this.originWidth,
      originHeight: this.originHeight,
      zIndex: this.zIndex,
      config: this.config,
    };
  }
}

export default ImageModel;
