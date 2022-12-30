import EventBus from "@/utils/event";
import { fillRect, strokeRect, isPointInArea } from "@/utils/canvas";
import type { FakeEvent } from "./Canvas";

interface Config extends Record<string, any> {
  x: number;
  y: number;
  w: number;
  h: number;
}

const cursorMap = {
  0: "nwse-resize",
  1: "nesw-resize",
  2: "nwse-resize",
  3: "nesw-resize",
};

class BaseModel {
  ctx: CanvasRenderingContext2D;
  config: Config;
  zIndex = 0;
  // 开始拖拽时 鼠标初始点
  mouseStartPoint = [0, 0];
  // 开始拖拽时 图形配置
  dragConfig: Config = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  };
  selected = false;
  dragingArea = false;
  dragingEdge: number | false = false;

  constructor(ctx: CanvasRenderingContext2D, config: Config) {
    this.ctx = ctx;
    this.config = config;
  }

  // 网格吸附
  private numFormatter(evt: FakeEvent, num: number) {
    if (evt.altKey) {
      return Math.max(num, 0);
    }

    const rest = num % 10;
    return Math.max(num - rest, 0);
  }

  // 点是否在图形内部
  private isPointInside(pointX: number, pointY: number) {
    const { x, y, w, h } = this.config;
    return isPointInArea(pointX, pointY, x, y, w, h);
  }

  // 点是否在 4 个边缘点内
  private isPointInEdge(pointX: number, pointY: number) {
    const { x, y, w, h } = this.config;
    if (isPointInArea(pointX, pointY, x - 5, y - 5, 10, 10)) {
      return 0;
    } else if (isPointInArea(pointX, pointY, x + w - 5, y - 5, 10, 10)) {
      return 1;
    } else if (isPointInArea(pointX, pointY, x + w - 5, y + h - 5, 10, 10)) {
      return 2;
    } else if (isPointInArea(pointX, pointY, x - 5, y + h - 5, 10, 10)) {
      return 3;
    }

    return false;
  }

  // 鼠标按下
  onMouseDown(evt: FakeEvent) {
    const { x, y } = evt;
    if (this.selected) {
      const edgePointNum = this.isPointInEdge(x, y);
      if (edgePointNum !== false) {
        this.dragingEdge = edgePointNum;
        this.mouseStartPoint = [x, y];
        this.dragConfig = { ...this.config };
        return true;
      }
    }

    if (this.isPointInside(x, y)) {
      EventBus.emit("set-selected", this);
      this.selected = true;
      this.dragingArea = true;
      this.mouseStartPoint = [x, y];
      this.dragConfig = { ...this.config };
      EventBus.emit("redraw");
      return true;
    } else if (this.selected) {
      this.selected = false;
      EventBus.emit("set-selected", null);
    }
  }

  // 鼠标移动
  onMouseMove(evt: FakeEvent) {
    const { x, y } = evt;

    // 拖拽图形
    if (this.dragingArea) {
      const offsetX = x - this.mouseStartPoint[0];
      const offsetY = y - this.mouseStartPoint[1];
      this.config.x = this.numFormatter(evt, this.dragConfig.x + offsetX);
      this.config.y = this.numFormatter(evt, this.dragConfig.y + offsetY);
      if (this.config.x + this.config.w > 1280) {
        this.config.x = 1280 - this.config.w;
      }
      if (this.config.y + this.config.h > 720) {
        this.config.y = 720 - this.config.h;
      }
      EventBus.emit("redraw");
      return true;
    }

    // 拖拽 4 个边缘点
    if (typeof this.dragingEdge === "number") {
      const offsetX = x - this.mouseStartPoint[0];
      const offsetY = y - this.mouseStartPoint[1];
      if (this.dragingEdge === 0) {
        // 左上角
        Object.assign(this.config, {
          x: this.dragConfig.x + offsetX,
          y: this.dragConfig.y + offsetY,
          w: Math.max(this.dragConfig.w - offsetX, 40),
          h: Math.max(this.dragConfig.h - offsetY, 40),
        });
        // 越界处理
        if (this.config.x < 0) {
          this.config.x = 0;
          this.config.w = this.dragConfig.w + this.dragConfig.x;
        }
        if (this.config.y < 0) {
          this.config.y = 0;
          this.config.h = this.dragConfig.h + this.dragConfig.y;
        }
        if (this.config.w === 40) {
          this.config.x = this.dragConfig.x + this.dragConfig.w - 40;
        }
        if (this.config.h === 40) {
          this.config.y = this.dragConfig.y + this.dragConfig.h - 40;
        }
      } else if (this.dragingEdge === 1) {
        // 右上角
        Object.assign(this.config, {
          y: this.dragConfig.y + offsetY,
          w: Math.max(this.dragConfig.w + offsetX, 40),
          h: Math.max(this.dragConfig.h - offsetY, 40),
        });
        // 越界处理
        if (this.config.x + this.config.w > 1280) {
          this.config.w = 1280 - this.config.x;
        }
        if (this.config.y < 0) {
          this.config.y = 0;
          this.config.h = this.dragConfig.h + this.dragConfig.y;
        }
        if (this.config.h === 40) {
          this.config.y = this.dragConfig.y + this.dragConfig.h - 40;
        }
      } else if (this.dragingEdge === 2) {
        // 右下角
        Object.assign(this.config, {
          w: Math.max(this.dragConfig.w + offsetX, 40),
          h: Math.max(this.dragConfig.h + offsetY, 40),
        });
        // 越界处理
        if (this.config.x + this.config.w > 1280) {
          this.config.w = 1280 - this.config.x;
        }
        if (this.config.y + this.config.h > 720) {
          this.config.h = 720 - this.dragConfig.y;
        }
      } else {
        // 左下角
        Object.assign(this.config, {
          x: this.dragConfig.x + offsetX,
          w: Math.max(this.dragConfig.w - offsetX, 40),
          h: Math.max(this.dragConfig.h + offsetY, 40),
        });
        // 越界处理
        if (this.config.x < 0) {
          this.config.x = 0;
          this.config.w = this.dragConfig.w + this.dragConfig.x;
        }
        if (this.config.w === 40) {
          this.config.x = this.dragConfig.x + this.dragConfig.w - 40;
        }
        if (this.config.y + this.config.h > 720) {
          this.config.h = 720 - this.dragConfig.y;
        }
      }

      EventBus.emit("redraw");
      return true;
    }

    if (this.selected) {
      const edgePointNum = this.isPointInEdge(x, y);
      if (edgePointNum !== false) {
        EventBus.emit("set-cursor", cursorMap[edgePointNum]);
        return true;
      }
      if (this.isPointInside(x, y)) {
        EventBus.emit("set-cursor", "move");
        return true;
      } else {
        EventBus.emit("set-cursor", "default");
      }
    } else if (this.isPointInside(x, y)) {
      EventBus.emit("set-cursor", "move");
      return true;
    } else {
      EventBus.emit("set-cursor", "default");
    }
  }

  onMouseUp(evt: FakeEvent) {
    if (this.dragingArea) {
      EventBus.emit("save-data");
      this.dragingArea = false;
    }
    if (typeof this.dragingEdge === "number") {
      EventBus.emit("save-data");
      this.dragingEdge = false;
    }
    EventBus.emit("redraw");
  }

  draw() {
    if (this.selected) {
      const { w, h, x, y } = this.config;
      this.ctx.setLineDash([5, 5]);
      strokeRect(this.ctx, x, y, w, h, "#0066ff");
      this.ctx.setLineDash([]);
      fillRect(this.ctx, x - 5, y - 5, 10, 10, "#0066ff", 5);
      fillRect(this.ctx, x + w - 5, y - 5, 10, 10, "#0066ff", 5);
      fillRect(this.ctx, x + w - 5, y + h - 5, 10, 10, "#0066ff", 5);
      fillRect(this.ctx, x - 5, y + h - 5, 10, 10, "#0066ff", 5);

      if (this.dragingArea) {
        strokeRect(
          this.ctx,
          x + w / 2 - 40,
          y + h + 10,
          80,
          24,
          "#aaa",
          4,
          `${x}, ${y}`,
          12
        );
      } else if (this.dragingEdge !== false) {
        strokeRect(
          this.ctx,
          x + w / 2 - 40,
          y + h + 10,
          80,
          24,
          "#aaa",
          4,
          `${w} x ${h}`,
          12
        );
      }
    }
  }
}

export default BaseModel;
