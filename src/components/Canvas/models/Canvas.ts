import EventBus from "@/utils/event";
import { debounce } from "@/utils";

interface Config {
  w: number;
  h: number;
}

interface Child extends Record<string, any> {
  config: any;
  zIndex: number;
  selected: boolean;
  draw(): void;
  getData(): Record<string, any>;
}

export interface FakeEvent {
  x: number;
  y: number;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  // timeStamp: number;
}

interface OperateStackItem {
  config: any;
  zIndex: number;
  ctor: { new (ctx: CanvasRenderingContext2D, config: any): Child };
}

class CanvasModel {
  ctx: CanvasRenderingContext2D;
  config: Config;
  private offsetLeft = 0;
  private offsetTop = 0;
  private selectedChild: Child | null = null;
  private copiedChild: Child | null = null;
  private children: Child[] = [];
  private operateStack: OperateStackItem[][] = [];
  private operateStack2: OperateStackItem[][] = [];
  // private STACK_MAX_LENGTH = 30;

  constructor(ctx: CanvasRenderingContext2D, config: Config) {
    this.ctx = ctx;
    this.config = config;
    const { left, top } = ctx.canvas.getBoundingClientRect();
    this.offsetLeft = left;
    this.offsetTop = top;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    ctx.canvas.addEventListener("mousedown", this.onMouseDown);
    ctx.canvas.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);

    // 添加监听 - 重绘
    this.draw = debounce(this.draw.bind(this), 0);
    EventBus.on("redraw", this.draw);

    // 添加监听 - 选中
    this.setSelected = this.setSelected.bind(this);
    EventBus.on("set-selected", this.setSelected);

    // 添加监听 - 保存
    this.saveData = this.saveData.bind(this);
    EventBus.on("save-data", this.saveData);
  }

  // 二分查找 - 返回符合 zIndex 的最后一个元素下标
  private binarySearch(zIndex: number) {
    const { children } = this;
    if (!children.length || zIndex === children[children.length - 1].zIndex) {
      return children.length;
    }

    let left = 0;
    let right = children.length - 1;
    while (left <= right) {
      const mid = (left + right) >> 1;
      const val = children[mid].zIndex;
      if (val === zIndex) {
        left = mid;
        break;
      }

      if (val < zIndex) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    while (children[left + 1] && children[left + 1].zIndex === zIndex) {
      left += 1;
    }

    return left;
  }

  // 触发 children 事件
  private triggerChildrenEvent(handlerName: string, evt: MouseEvent) {
    // 监听 window 时需要处理 x y
    const isMouseDown = handlerName === "onMouseDown";
    const fakeEvent: FakeEvent = {
      x: isMouseDown ? evt.offsetX : evt.pageX - this.offsetLeft,
      y: isMouseDown ? evt.offsetY : evt.pageY - this.offsetTop,
      altKey: evt.altKey,
      ctrlKey: evt.ctrlKey,
      shiftKey: evt.shiftKey,
      // timeStamp: Date.now(),
    };

    // 后序遍历 - 优先处理 selected 和 z-index 高的
    for (let i = this.children.length - 1; i >= 0; --i) {
      const child = this.children[i];
      const value = child[handlerName](fakeEvent);
      if (value) {
        break;
      }
    }
  }

  // 鼠标按下
  private onMouseDown(evt: MouseEvent) {
    // 非主要键位
    if (evt.button !== 0) {
      return;
    }

    this.triggerChildrenEvent("onMouseDown", evt);
  }

  // 鼠标移动
  private onMouseMove(evt: MouseEvent) {
    this.triggerChildrenEvent("onMouseMove", evt);
  }

  // 鼠标抬起
  private onMouseUp(evt: MouseEvent) {
    this.triggerChildrenEvent("onMouseUp", evt);
  }

  // 按下某键
  private onKeyDown(evt: KeyboardEvent) {
    // console.log('evt', evt);
    const key = evt.key.toLowerCase();
    if (key === "delete") {
      return this.deleteSelected();
    }

    if (evt.ctrlKey) {
      if (key === "c") {
        return this.copySelected();
      }

      if (key === "v") {
        return this.paste();
      }

      if (key === "z") {
        return this.undo();
      }

      if (key === "y") {
        return this.redo();
      }
    }
  }

  // 选中某一个 child
  private setSelected(child: Child | null) {
    if (this.selectedChild) {
      this.children.pop();
      const index = this.binarySearch(this.selectedChild.zIndex);
      this.children.splice(index, 0, this.selectedChild);
    }

    if (child) {
      const index = this.children.indexOf(child);
      this.children.splice(index, 1);
      this.children.push(child);
    }
    this.selectedChild = child;
  }

  // 将当前数据快照入栈
  private saveData() {
    if (this.children.length > 0) {
      const data = this.children.map((child) => ({
        config: JSON.parse(JSON.stringify(child.config)),
        zIndex: child.zIndex,
        ctor: child.constructor as any,
      }));
      this.operateStack.push(data);
      // if (this.operateStack.length > this.STACK_MAX_LENGTH) {
      //   this.operateStack.shift();
      // }
      this.operateStack2.length = 0;
    }
  }

  // 添加 child
  addChild(child: Child, zIndex = 0) {
    if (this.selectedChild) {
      this.selectedChild.selected = false;
      this.children.pop();
      const index = this.binarySearch(this.selectedChild.zIndex);
      this.children.splice(index, 0, this.selectedChild);
    }

    child.zIndex = zIndex;
    child.selected = true;
    this.selectedChild = child;
    this.children.push(child);
    this.draw();
    this.saveData();
  }

  // 复制选中 child
  copySelected() {
    this.copiedChild = this.selectedChild;
  }

  // 粘贴已复制的 child
  paste() {
    if (this.copiedChild) {
      // @ts-ignore
      const instance = new this.copiedChild.constructor(this.ctx, {
        ...this.copiedChild.config,
        x: this.copiedChild.config.x + 10,
        y: this.copiedChild.config.y + 10,
      });
      this.copiedChild = instance;
      this.addChild(instance);
    }
  }

  // 删除选中 child
  deleteSelected() {
    if (this.selectedChild !== null) {
      this.selectedChild = null;
      this.children.pop();
      this.draw();
      this.saveData();
      EventBus.emit("set-cursor", "default");
    }
  }

  // 撤销
  undo() {
    if (this.operateStack.length === 0) {
      return;
    }

    this.selectedChild = null;
    this.operateStack2.push(this.operateStack.pop()!);
    const storeData = this.operateStack.slice(-1)[0] || [];
    this.children = storeData.map((item) => {
      const child = new item.ctor(this.ctx, item.config);
      child.zIndex = item.zIndex;
      return child;
    });
    this.draw();
    EventBus.emit("set-cursor", "default");
  }

  // 恢复
  redo() {
    if (this.operateStack2.length === 0) {
      return;
    }
    const storeData = this.operateStack2.pop()!;
    this.operateStack.push(storeData);
    this.children = storeData.map((item) => {
      const child = new item.ctor(this.ctx, item.config);
      child.zIndex = item.zIndex;
      return child;
    });
    this.draw();
  }

  clear() {
    const { w, h } = this.config;
    this.ctx.clearRect(0, 0, w, h);
  }

  draw() {
    this.clear();
    this.children.forEach((child) => child.draw());
  }

  getData() {
    return this.children.map((child) => child.getData());
  }

  destroy() {
    this.clear();
    this.children = [];
    this.ctx.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.ctx.canvas.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    EventBus.off("redraw", this.draw);
    EventBus.off("set-selected", this.setSelected);
  }
}

export default CanvasModel;
