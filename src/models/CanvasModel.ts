import { fabric } from "fabric";
import { Toast } from "@/components";
import EventBus from "@/utils/event";

interface Config {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  backgroundImage?: string;
}

export interface FormObject {
  id: number;
  name: string;
  items: {
    id: string;
    type: string;
    name: string;
    value: any;
    handler: (...args: any[]) => void;
    [key: string]: any;
  }[];
}

interface Child {
  id: number;
  zIndex: number;
  instance: fabric.Object;
  config: Record<string, any>;
  getData(): Record<string, any>;
  getFormObject(): FormObject;
}

class CanvasModel {
  private instance: fabric.Canvas;
  private children: Child[];
  private width: number;
  private height: number;
  private backgroundImage: string;

  constructor(config: Config) {
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerStyle = "circle";
    fabric.Object.prototype.cornerStrokeColor = "#0066ff";
    fabric.Object.prototype.cornerColor = "#0066ff";
    fabric.Object.prototype.borderDashArray = [5, 5];
    fabric.Object.prototype.borderColor = "#0066ff";

    this.width = config.width;
    this.height = config.height;
    this.backgroundImage = config.backgroundImage || "";
    this.instance = new fabric.Canvas(config.canvas, {
      width: config.width,
      height: config.height,
    });
    this.instance.setWidth(config.width);
    this.children = [];
    this.drawGrid();

    this.resize = this.resize.bind(this);
    this.replaceBackgroundImage = this.replaceBackgroundImage.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.instance.on("selection:created", this.onSelect);
    this.instance.on("selection:updated", this.onSelect);
    this.instance.on("selection:cleared", this.onSelect);

    // 触发一次选中
    setTimeout(this.onSelect);

    console.log("CanvasModel", this);
  }

  // 生成不重复的 id
  private generateId() {
    let id = (Math.random() * 100000000) >> 0;
    while (this.children.some((item) => item.id === id)) {
      id = (Math.random() * 100000000) >> 0;
    }

    return id;
  }

  // 在额外 canvas 上画网格
  private drawGrid() {
    const grid = document.getElementById("grid") as HTMLCanvasElement;
    grid.width = this.width;
    grid.height = this.height;

    const dpr = window.devicePixelRatio || 1;

    const ctx = grid.getContext("2d")!;
    ctx.clearRect(0, 0, this.width, this.height);
    const gridWidth = 10;
    // vertical
    for (let x = 0; x <= this.width; x += gridWidth) {
      ctx.beginPath();
      ctx.moveTo(x - dpr / 2, 0);
      ctx.lineTo(x - dpr / 2, this.height);
      ctx.closePath();
      if (x % (gridWidth * 4) === 0) {
        ctx.strokeStyle = "#ccc";
      } else {
        ctx.strokeStyle = "#eee";
      }
      ctx.stroke();
    }

    // horizon
    for (let y = 0; y <= this.height; y += gridWidth) {
      ctx.beginPath();
      ctx.moveTo(0, y - dpr / 2);
      ctx.lineTo(this.width, y - dpr / 2);
      ctx.closePath();
      if (y % (gridWidth * 4) === 0) {
        ctx.strokeStyle = "#ccc";
      } else {
        ctx.strokeStyle = "#eee";
      }
      ctx.stroke();
    }
  }

  // 选中时某组件时
  private onSelect() {
    EventBus.emit("selection-change");
  }

  // 二分查找给定 zIndex 应插入的位置
  private binarySearch(zIndex: number) {
    const lastItem = this.children[this.children.length - 1];
    if (this.children.length === 0 || zIndex >= lastItem.zIndex) {
      return this.children.length;
    }

    let left = 0;
    let right = this.children.length - 1;
    while (left <= right) {
      const mid = (left + right) >> 1;
      const item = this.children[mid];
      if (item.zIndex === zIndex) {
        return mid;
      }

      if (item.zIndex > zIndex) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return left;
  }

  // 获取表单项
  getFormObject(): ReturnType<Child["getFormObject"]> {
    return {
      id: 42,
      name: "画布",
      items: [
        {
          id: "replaceBackgroundImage",
          type: "upload-image",
          name: "替换背景图片",
          value: "",
          handler: this.replaceBackgroundImage,
        },
        {
          id: "size",
          type: "double-input",
          label: ["宽", "高"],
          name: "大小",
          value: [this.width, this.height],
          handler: this.resize,
        },
      ],
    };
  }

  // 设置宽高
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.instance.setWidth(width);
    this.instance.setHeight(height);
    this.drawGrid();
    if (this.instance.backgroundImage) {
      (this.instance.backgroundImage as fabric.Image).dispose();
      this.replaceBackgroundImage(this.backgroundImage);
    } else {
      this.render();
    }
  }

  // 设置背景图片
  replaceBackgroundImage(imageUrl: string) {
    this.instance.setBackgroundImage(imageUrl, () => {
      this.backgroundImage = imageUrl;
      const image = this.instance.backgroundImage as fabric.Image;
      const { width = 1, height = 1 } = image;
      image.scaleX = this.width / width;
      image.scaleY = this.height / height;
      this.render();
    });
  }

  // 获取选中的组件
  getSelected() {
    const objs = this.instance.getActiveObjects();
    const selectedChildren = this.children.filter(
      (child) => objs.indexOf(child.instance) >= 0
    );

    return selectedChildren;
  }

  // 添加组件
  add(item: Child) {
    item.id = this.generateId();
    const index = this.binarySearch(item.zIndex);
    this.children.splice(index, 0, item);
    this.instance.add(item.instance);
    item.instance.moveTo(index);
  }

  // 改变某个组件的层级
  changeZIndex(item: Child) {
    const itemIndex = this.children.indexOf(item);
    if (itemIndex >= 0) {
      this.children.splice(itemIndex, 1);
      const targetIndex = this.binarySearch(item.zIndex);
      this.children.splice(targetIndex, 0, item);
      item.instance.moveTo(targetIndex);
    }
  }

  // 删除所有选中组件
  del() {
    const objs = this.instance.getActiveObjects();
    this.children = this.children.filter(
      (child) => objs.indexOf(child.instance) === -1
    );
    this.instance.remove(...objs);
    this.instance.discardActiveObject();
    this.render();
    this.onSelect();
  }

  // 撤销
  undo() {
    Toast.show("Todo: 撤销");
  }

  // 重做
  redo() {
    Toast.show("Todo: 重做");
  }

  // 保存为图片
  toImage() {
    const base64String = this.instance.toDataURL();
    const a = document.createElement("a");
    a.href = base64String;
    a.download = `image-${Date.now()}.png`;
    a.click();
  }

  // 保存为 json
  toJson(local = false) {
    const data = {
      type: "canvas",
      width: this.width,
      height: this.height,
      backgroundImage: this.backgroundImage,
      chidren: this.children.map((child) => child.getData()),
    };
    console.log("data", data);

    if (local) {
      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    return data;
  }

  render() {
    this.instance.renderAll();
  }

  destroy() {
    this.children = [];
    this.instance.dispose();
  }
}

export default CanvasModel;
