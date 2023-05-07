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
  zIndex?: number;
  filter?: string;
}

const defaultConfig = {
  x: 0,
  y: 0,
  radius: 0,
  angle: 0,
  zIndex: 1,
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
    this.zIndex = config.zIndex;

    this.replaceImage = this.replaceImage.bind(this);
    this.setRadius = this.setRadius.bind(this);
    this.changeFilter = this.changeFilter.bind(this);

    if (config.radius > 0) {
      this.setRadius(config.radius);
    }

    console.log("ImageModel", this);
  }

  static async create(_config: Config & { imageData?: ImageData }) {
    if (_config.imageUrl === "" && _config.imageData) {
      const canvas = document.createElement("canvas");
      canvas.width = _config.imageData.width;
      canvas.height = _config.imageData.height;
      const ctx = canvas.getContext("2d")!;
      ctx.putImageData(_config.imageData, 0, 0);
      _config.imageUrl = canvas.toDataURL();
    }
    const img = document.createElement("img");
    img.src = _config.imageUrl;
    img.crossOrigin = "anonymous";
    img.onerror = (err) => {
      Toast.show("图片加载失败");
      console.log("img onerror:", err);
    };
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const { width, height } = img;
    const config = Object.assign({}, defaultConfig, { width, height }, _config);
    // 使用图片原尺寸生成 fabric 实例
    const imageConfig = {
      width,
      height,
      left: config.x,
      top: config.y,
      angle: config.angle,
      crossOrigin: "anonymous",
    };
    return await new Promise<ImageModel>((resolve) => {
      const instance = new fabric.Image(img, imageConfig);
      resolve(
        new ImageModel(instance, {
          imageUrl: config.imageUrl,
          x: config.x,
          y: config.y,
          width: config.width,
          height: config.height,
          radius: config.radius,
          angle: config.angle,
          filter: config.filter || "",
          originWidth: width,
          originHeight: height,
          zIndex: config.zIndex || 0,
        })
      );
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
          id: `${this.id}-filter`,
          type: "select",
          name: "滤镜",
          options: [
            { value: "", text: "原图" },
            { value: "Grayscale", text: "灰度" },
            { value: "Invert", text: "反色" },
            { value: "Sepia", text: "复古" },
            { value: "Vintage", text: "怀旧" },
            { value: "Kodachrome", text: "彩色" },
            { value: "Pixelate", text: "像素化" },
            { value: "Polaroid", text: "宝丽来" },
          ],
          value: this.config.filter,
          handler: this.changeFilter,
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

  changeFilter(filter: string) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    this.config.filter = filter || "";
    this.instance.applyFilters(
      // @ts-ignore
      this.config.filter ? [new fabric.Image.filters[this.config.filter]()] : []
    );

    canvas.render();
    canvas.emitUpdateConfig();
    canvas.saveToStack();
  }

  // 设置圆角
  setRadius(radius: number) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

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
    canvas.saveToStack();
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
        this.config.imageUrl = imageUrl;
        this.instance.setSrc(imageUrl, () => {
          this.originWidth = width;
          this.originHeight = height;
          this.setScale(this.config.width, this.config.height);
          this.setRadius(this.config.radius);
          if (this.config.filter) {
            this.changeFilter(this.config.filter);
          }
          canvas.saveToStack();
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
      zIndex: this.zIndex,
      config: this.config,
    };
  }
}

export default ImageModel;
