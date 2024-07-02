import { fabric } from "fabric";
import EventBus from "@/utils/event";
import { ImageModel, TextModel, RectModel, PathModel } from "@/models";
import { canvasRef } from "@/store";
import { debounce, deepClone, deepCompare } from "@/utils";

interface Config {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  backgroundImage?: string;
  backgroundColor?: string;
  bgFilter?: string;
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
  updateConfig(): void;
}

class CanvasModel {
  instance: fabric.Canvas;
  private mapIdToChild: Map<number, Child>;
  private mapInstanceToChild: Map<Child["instance"], Child>;
  private children: Child[];
  private width: number;
  private height: number;
  private backgroundImage: string;
  private backgroundColor: string;
  private bgFilter: string;
  private disableSave: boolean = true;
  private operateStack: Record<string, any>[] = [];
  private operateStack2: Record<string, any>[] = [];
  private timer: number = 0;
  static OPERATE_STACK_MAX_LENGTH = 30;
  private defaultJson: any = {
    type: "canvas",
    width: 1280,
    height: 720,
    backgroundImage: "",
    backgroundColor: "",
    children: [],
    bgFilter: "",
  };

  constructor(config: Config) {
    canvasRef.current = this;
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerStyle = "circle";
    fabric.Object.prototype.cornerStrokeColor = "#0066ff";
    fabric.Object.prototype.cornerColor = "#0066ff";
    fabric.Object.prototype.borderDashArray = [5, 5];
    fabric.Object.prototype.borderColor = "#0066ff";
    fabric.Object.prototype.lockScalingFlip = true;
    fabric.Object.prototype.minScaleLimit = 0.2;
    fabric.Image.prototype.lockScalingFlip = true;

    this.mapIdToChild = new Map();
    this.mapInstanceToChild = new Map();

    this.width = config.width;
    this.height = config.height;
    this.backgroundImage = config.backgroundImage || "";
    this.backgroundColor = config.backgroundColor || "";
    this.bgFilter = config.bgFilter || "";
    this.instance = new fabric.Canvas(config.canvas, {
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor,
      preserveObjectStacking: true,
    });
    this.instance.freeDrawingBrush.color = "rgba(255,192,203,1)";
    this.instance.freeDrawingBrush.width = 10;
    this.children = [];
    this.disableSave = false;

    this.loadFromJson = this.loadFromJson.bind(this);
    this.getSize = this.getSize.bind(this);
    this.resize = this.resize.bind(this);
    this.replaceBackgroundImage = this.replaceBackgroundImage.bind(this);
    this.removeBackgroundImage = this.removeBackgroundImage.bind(this);
    this.setBackgroundColor = this.setBackgroundColor.bind(this);
    this.changeBgFilter = this.changeBgFilter.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.saveToStack = this.saveToStack.bind(this);
    this.emitUpdateConfig = debounce(this.emitUpdateConfig.bind(this), 0);
    this.emitStackStatus = this.emitStackStatus.bind(this);
    this.instance.on("mouse:down", () => {
      this.disableSave = true;
    });
    this.instance.on("mouse:up", () => {
      this.disableSave = false;
      this.children.forEach((child) => {
        child.updateConfig();
      });
    });
    this.instance.on("selection:created", this.onSelect);
    this.instance.on("selection:updated", this.onSelect);
    this.instance.on("selection:cleared", this.onSelect);
    this.instance.on("path:created", async (evt: any) => {
      const pathString = evt.path.path.reduce(
        (acc: any, cur: any) => acc + cur.join(" "),
        ""
      );
      const child = await PathModel.create({
        path: pathString,
        x: evt.path.left,
        y: evt.path.top,
        width: evt.path.width,
        height: evt.path.height,
        strokeWidth: evt.path.strokeWidth,
        color: evt.path.stroke,
        shadow: evt.path.shadow,
      });
      this.instance.remove(evt.path);
      this.add(child);
    });

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

  // 选中时某组件时
  private onSelect() {
    EventBus.emit("selection-change");
  }

  emitUpdateConfig() {
    EventBus.emit("update-config");
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

  // 操作数据保存
  saveToStack() {
    if (this.disableSave) {
      return;
    }

    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      const data = this.toJson();
      const lastData = this.operateStack.pop();
      if (deepCompare(lastData, data)) {
        return;
      }
      const clonedData = deepClone(data);
      lastData && this.operateStack.push(lastData);
      this.operateStack.push(clonedData);
      if (this.operateStack.length > CanvasModel.OPERATE_STACK_MAX_LENGTH) {
        console.info("operate stack is full, discard first element.");
        this.operateStack.shift();
      }
      this.operateStack2.length = 0;
      this.emitStackStatus();
    }, 0);
  }

  // 通知 undo redo 状态
  private emitStackStatus() {
    EventBus.emit("stack-status", {
      undo: this.operateStack.length > 0,
      redo: this.operateStack2.length > 0,
    });
  }

  // 导入数据
  static async createByJson(
    canvas: HTMLCanvasElement,
    data: ReturnType<CanvasModel["toJson"]>
  ) {
    const canvasModel = new CanvasModel({
      canvas,
      width: data.width,
      height: data.height,
      bgFilter: "",
    });

    await canvasModel.loadFromJson(data, false);
    return canvasModel;
  }

  async loadFromJson(
    data: ReturnType<CanvasModel["toJson"]>,
    notDefault = true
  ) {
    this.disableSave = true;
    this.backgroundColor = "";
    this.backgroundImage = "";
    this.width = 1280;
    this.height = 720;
    this.instance.clear();
    this.children = [];
    this.mapIdToChild.clear();
    this.mapInstanceToChild.clear();
    if (!notDefault) {
      this.defaultJson = JSON.parse(JSON.stringify(data));
    }

    this.resize(data.width, data.height);
    await this.replaceBackgroundImage(data.backgroundImage);
    await this.setBackgroundColor(data.backgroundColor);
    this.changeBgFilter(data.bgFilter);

    for (let i = 0; i < data.children.length; ++i) {
      const item = data.children[i];
      let model = null;
      if (item.type === "image") {
        item.config.zIndex = item.zIndex || 0;
        model = await ImageModel.create(item.config);
      } else if (item.type === "text") {
        item.config.zIndex = item.zIndex || 5;
        model = await TextModel.create(item.config);
      } else if (item.type === "rect") {
        item.config.zIndex = item.zIndex || 2;
        model = await RectModel.create(item.config);
      } else if (item.type === "path") {
        item.config.zIndex = item.zIndex || 4;
        model = await PathModel.create(item.config);
      }
      model && this.add(model);
    }
    setTimeout(() => {
      this.disableSave = false;
    });
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
          id: "removeBackgroundImage",
          type: "button",
          name: "去除背景图片",
          value: "",
          handler: this.removeBackgroundImage,
        },
        {
          id: "setBackgroundColor",
          type: "color",
          name: "设置背景颜色",
          value: this.backgroundColor,
          handler: this.setBackgroundColor,
        },
        {
          id: "bgFilter",
          type: "select",
          name: "背景图滤镜",
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
          value: this.bgFilter || "",
          handler: this.changeBgFilter,
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

  // 获取当前宽高
  getSize() {
    return {
      width: this.width,
      height: this.height,
    };
  }

  // 设置宽高
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.instance.setWidth(width);
    this.instance.setHeight(height);
    const grid = document.getElementById("grid")!;
    grid.style.width = `${width}px`;
    grid.style.height = `${height}px`;
    if (this.instance.backgroundImage) {
      (this.instance.backgroundImage as fabric.Image).dispose();
      this.replaceBackgroundImage(this.backgroundImage);
    } else {
      this.render();
    }
    this.saveToStack();
  }

  // 设置背景颜色
  setBackgroundColor(color: string) {
    return new Promise<void>((resolve) => {
      this.instance.setBackgroundColor(color, () => {
        this.backgroundColor = color;
        this.render();
        this.emitUpdateConfig();
        this.saveToStack();
        resolve();
      });
    });
  }

  // 设置背景图片
  replaceBackgroundImage(imageUrl: string) {
    if (imageUrl === "") {
      return this.removeBackgroundImage();
    }

    return new Promise<void>((resolve) => {
      this.instance.setBackgroundImage(
        imageUrl,
        () => {
          this.backgroundImage = imageUrl;
          const image = this.instance.backgroundImage as fabric.Image;
          const { width = 1, height = 1 } = image;
          image.scaleX = this.width / width;
          image.scaleY = this.height / height;
          if (this.bgFilter) {
            this.changeBgFilter(this.bgFilter);
          }
          this.saveToStack();
          resolve();
          this.render();
        },
        { crossOrigin: "anonymous" }
      );
    });
  }

  // 移除背景图片
  removeBackgroundImage() {
    this.instance.setBackgroundImage(null as any, () => {
      this.backgroundImage = "";
      this.saveToStack();
      this.render();
    });
  }

  // 改变背景滤镜
  changeBgFilter(filter: string) {
    this.bgFilter = filter || "";
    if (!this.backgroundImage) {
      this.emitUpdateConfig();
      return;
    }
    const bg = this.instance.backgroundImage as fabric.Image;
    bg.applyFilters(
      // @ts-ignore
      this.bgFilter ? [new fabric.Image.filters[this.bgFilter]()] : []
    );

    this.render();
    this.emitUpdateConfig();
    this.saveToStack();
  }

  // 获取选中的组件
  getSelected() {
    const objs = this.instance.getActiveObjects();
    const selectedChildren: Child[] = [];
    objs.forEach((obj) => {
      const child = this.mapInstanceToChild.get(obj);
      if (child) {
        selectedChildren.push(child);
      }
    });
    return selectedChildren;
  }

  // 添加组件
  add(child: Child) {
    child.id = this.generateId();
    const index = this.binarySearch(child.zIndex);
    this.children.splice(index, 0, child);
    this.instance.add(child.instance);
    if (this.bgFilter) {
      this.changeBgFilter(this.bgFilter);
    }
    child.instance.moveTo(index);
    this.mapIdToChild.set(child.id, child);
    this.mapInstanceToChild.set(child.instance, child);
    this.saveToStack();
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
    const selectedChildren = this.getSelected();
    this.children = this.children.filter((child) => {
      if (selectedChildren.indexOf(child) >= 0) {
        this.instance.remove(child.instance);
        this.mapIdToChild.delete(child.id);
        this.mapInstanceToChild.delete(child.instance);
        return false;
      }
      return true;
    });
    this.instance.discardActiveObject();
    this.render();
    this.onSelect();
    this.saveToStack();
  }

  // 撤销
  async undo() {
    if (this.operateStack.length === 0) {
      return;
    }

    this.operateStack2.push(this.operateStack.pop()!);
    const data = this.operateStack.slice(-1)[0] || this.defaultJson;
    this.emitStackStatus();

    await this.loadFromJson(data as any);
    this.emitUpdateConfig();
  }

  // 重做
  async redo() {
    if (this.operateStack2.length === 0) {
      return;
    }

    const data = this.operateStack2.pop()!;
    this.operateStack.push(data);
    this.emitStackStatus();

    await this.loadFromJson(data as any);
    this.emitUpdateConfig();
  }

  // 保存为图片
  async toImage(smallSize?: boolean) {
    const base64String = this.instance.toDataURL();
    if (smallSize) {
      const canvas = document.createElement("canvas");
      canvas.width = this.width / 4;
      canvas.height = this.height / 4;
      const ctx = canvas.getContext("2d")!;
      const image = new Image();
      image.src = base64String;
      await new Promise<any>((resolve) => {
        image.onload = resolve;
      });
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/png");
    }

    return base64String;
  }

  // 保存为 json
  toJson(local?: boolean) {
    const data = {
      type: "canvas",
      width: this.width,
      height: this.height,
      backgroundImage: this.backgroundImage,
      backgroundColor: this.backgroundColor,
      bgFilter: this.bgFilter,
      children: this.children.map((child) => child.getData()),
    };

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
    this.mapIdToChild.clear();
    this.mapInstanceToChild.clear();
    this.instance.dispose();
  }
}

export default CanvasModel;
