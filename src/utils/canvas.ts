/**
 * 获取设备像素比
 */
export const getPixelRatio = () => window.devicePixelRatio || 1;

/**
 * 获取绘制时的像素
 * @param position 坐标值
 * @param thickness 厚度
 */
export const getShapePixel = (position: number, thickness = 1) => {
  if (thickness % 2 === 0) {
    return position;
  }

  const pixelRatio = getPixelRatio();
  return position - pixelRatio / 2;
};

/**
 * 画网格
 * @param ctx Canvas 2d context
 * @param w 宽度
 * @param h 高度
 */
export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) => {
  ctx.clearRect(0, 0, w, h);
  const gridWidth = 10;
  // vertical
  for (let x = 0; x <= w; x += gridWidth) {
    ctx.beginPath();
    ctx.moveTo(getShapePixel(x), getShapePixel(0));
    ctx.lineTo(getShapePixel(x), h);
    ctx.closePath();
    if (x % (gridWidth * 4) === 0) {
      ctx.strokeStyle = "#ccc";
    } else {
      ctx.strokeStyle = "#eee";
    }
    ctx.stroke();
  }

  // horizon
  for (let y = 0; y <= h; y += gridWidth) {
    ctx.beginPath();
    ctx.moveTo(getShapePixel(0), getShapePixel(y));
    ctx.lineTo(w, getShapePixel(y));
    ctx.closePath();
    if (y % (gridWidth * 4) === 0) {
      ctx.strokeStyle = "#ccc";
    } else {
      ctx.strokeStyle = "#eee";
    }
    ctx.stroke();
  }
};

const drawRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  _radius?: number[] | number
) => {
  const halfWH = Math.min(w, h) / 2;
  const radius = (function () {
    if (typeof _radius === "undefined") {
      return [0, 0, 0, 0];
    } else if (typeof _radius === "number") {
      return [_radius, _radius, _radius, _radius];
    } else {
      return _radius.map((v) => {
        return Math.min(v, halfWH);
      });
    }
  })();

  ctx.beginPath();
  ctx.moveTo(getShapePixel(x), getShapePixel(y + radius[0]));
  ctx.arcTo(
    getShapePixel(x),
    getShapePixel(y),
    getShapePixel(x + radius[0]),
    getShapePixel(y),
    radius[0]
  );
  ctx.lineTo(getShapePixel(x + w - radius[1]), getShapePixel(y));
  ctx.arcTo(
    getShapePixel(x + w),
    getShapePixel(y),
    getShapePixel(x + w),
    getShapePixel(y + radius[1]),
    radius[1]
  );
  ctx.lineTo(getShapePixel(x + w), getShapePixel(y + h - radius[2]));
  ctx.arcTo(
    getShapePixel(x + w),
    getShapePixel(y + h),
    getShapePixel(x + w - radius[2]),
    getShapePixel(y + h),
    radius[2]
  );
  ctx.lineTo(getShapePixel(x + radius[3]), getShapePixel(y + h));
  ctx.arcTo(
    getShapePixel(x),
    getShapePixel(y + h),
    getShapePixel(x),
    getShapePixel(y + h - radius[3]),
    radius[3]
  );
  ctx.lineTo(getShapePixel(x), getShapePixel(y + radius[0]));
  ctx.closePath();
};

const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fontSize = 20
) => {
  ctx.font = `${fontSize}px sans-serif`;
  const { width: textWidth } = ctx.measureText(text);
  ctx.fillStyle = "#000";
  ctx.fillText(
    text,
    getShapePixel(x + w / 2 - textWidth / 2),
    getShapePixel(y + h / 2 + 5)
  );
};

/**
 * 描绘矩形边框
 * @param ctx canvas context
 * @param x x 坐标值
 * @param y y 坐标值
 * @param w 宽度
 * @param h 高度
 * @param color 颜色
 * @param radius 圆角值
 * @param text 矩形内文字
 */
export const strokeRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  radius?: number[] | number,
  text?: string,
  fontSize?: number
) => {
  drawRectPath(ctx, x, y, w, h, radius);
  ctx.strokeStyle = color;
  ctx.stroke();

  if (text) {
    drawText(ctx, text, x, y, w, h, fontSize);
  }
};

/**
 * 填充矩形边框
 * @param ctx canvas context
 * @param x x 坐标值
 * @param y y 坐标值
 * @param w 宽度
 * @param h 高度
 * @param color 颜色
 * @param radius 圆角值
 * @param text 矩形内文字
 */
export const fillRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  radius?: number[] | number,
  text?: string,
  fontSize?: number
) => {
  drawRectPath(ctx, x, y, w, h, radius);
  ctx.fillStyle = color;
  ctx.fill();

  if (text) {
    drawText(ctx, text, x, y, w, h, fontSize);
  }
};

/**
 * 判断点是否在区域内
 * @param pointX 点 x 坐标值
 * @param pointY 点 y 坐标值
 * @param x 区域 x 坐标值
 * @param y 区域 y 坐标值
 * @param w 区域宽度
 * @param h 区域高度
 */
export const isPointInArea = (
  pointX: number,
  pointY: number,
  x: number,
  y: number,
  w: number,
  h: number
) => {
  if (pointX < x || pointX > x + w) {
    return false;
  }

  if (pointY < y || pointY >= y + h) {
    return false;
  }

  return true;
};
