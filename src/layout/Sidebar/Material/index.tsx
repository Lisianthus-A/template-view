import { useEffect, useState } from "react";
import { Button, Switch, Toast } from "@/components";
import { RectModel, ImageModel } from "@/models";
import { canvasRef } from "@/store";
import { fabric } from "fabric";
import Color from "../Attr/Color";
import Range from "../Attr/Range";
import DoubleInput from "../Attr/DoubleInput";
import styles from "./index.module.scss";
import type { ChangeEvent } from "react";

function Material() {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [color, setColor] = useState("rgba(255,192,203,1)");
  const [width, setWidth] = useState(1);
  const [showShadow, setShowShadow] = useState(false);
  const [shadowColor, setShadowColor] = useState("rgba(56,209,236,1)");
  const [offset, setOffset] = useState([10, 10]);
  const [blur, setBlur] = useState(10);

  const handleFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const canvas = canvasRef.current;
    const file = evt.target.files && evt.target.files[0];
    if (!file || !canvas) {
      return;
    }
    evt.target.value = "";

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (evt) => {
      const base64String = evt.target!.result as string;
      const model = await ImageModel.create({
        imageUrl: base64String,
      });
      canvas.add(model);
    };
  };

  const handleAddRect = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const model = await RectModel.create({});
    canvas.add(model);
  };

  // 画笔模式开关改变
  const handleModeChange = (checked: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    if (checked) {
      Toast.show("按住 Shift 键可画出直线哦~");
    }
    canvas.instance.isDrawingMode = checked;
    canvas.instance.freeDrawingBrush.color = color;
    setIsDrawingMode(checked);
  };

  // 画笔宽度改变
  const handleWidthChange = (width: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.instance.freeDrawingBrush.width = width;
    setWidth(width);
  };

  // 画笔颜色改变
  const handleColorChange = (color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.instance.freeDrawingBrush.color = color;
    setColor(color);
  };

  // 阴影颜色改变
  const handleShadowColorChange = (color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // @ts-ignore
    canvas.instance.freeDrawingBrush.shadow.color = color;
    setShadowColor(color);
  };

  // 是否显示阴影改变
  const handleShowShadowChange = (checked: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    setShowShadow(checked);
    if (checked) {
      canvas.instance.freeDrawingBrush.shadow = new fabric.Shadow({
        blur,
        offsetX: offset[0],
        offsetY: offset[1],
        affectStroke: true,
        color: shadowColor,
      });
    } else {
      // @ts-ignore
      canvas.instance.freeDrawingBrush.shadow = null;
    }
  };

  // 阴影偏移改变
  const handleOffsetChange = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // @ts-ignore
    canvas.instance.freeDrawingBrush.shadow.offsetX = x;
    // @ts-ignore
    canvas.instance.freeDrawingBrush.shadow.offsetY = y;
    setOffset([x, y]);
  };

  // 阴影模糊度改变
  const handleBlurChange = (blur: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // @ts-ignore
    canvas.instance.freeDrawingBrush.shadow.blur = blur;
    setBlur(blur);
  };

  const items = [
    {
      id: "width",
      type: "range",
      name: "画笔宽度",
      value: width,
      max: 40,
      handler: handleWidthChange,
    },
    {
      id: "color",
      type: "color",
      name: "画笔颜色",
      value: color,
      handler: handleColorChange,
    },
    {
      id: "shadowColor",
      type: "color",
      name: "阴影颜色",
      value: shadowColor,
      handler: handleShadowColorChange,
    },
    {
      id: "offset",
      type: "double-input",
      name: "阴影偏移",
      label: ["X", "Y"],
      value: offset,
      handler: handleOffsetChange,
    },
    {
      id: "blur",
      type: "range",
      name: "阴影模糊度",
      value: blur,
      max: 80,
      handler: handleBlurChange,
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    setColor(canvas.instance.freeDrawingBrush.color);
    setWidth(canvas.instance.freeDrawingBrush.width);
    const isShowShadow = Boolean(canvas.instance.freeDrawingBrush.shadow);
    setShowShadow(isShowShadow);
    if (isShowShadow) {
      // @ts-ignore
      setShadowColor(canvas.instance.freeDrawingBrush.shadow.color);
      setOffset([
        // @ts-ignore
        canvas.instance.freeDrawingBrush.shadow.offsetX,
        // @ts-ignore
        canvas.instance.freeDrawingBrush.shadow.offsetY,
      ]);
      // @ts-ignore
      setBlur(canvas.instance.freeDrawingBrush.shadow.blur);
    }

    return () => {
      canvas.instance.isDrawingMode = false;
    };
  }, []);

  return (
    <div className={styles.material}>
      <Button style={{ margin: "0 16px" }}>
        添加本地图片
        <input
          className="hide-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button>
      <Button style={{ margin: "0 16px" }} onClick={handleAddRect}>
        添加矩形
      </Button>
      <div className="divider" style={{ margin: "16px" }} />
      <div className="switch-wrapper">
        自由绘画模式
        <Switch checked={isDrawingMode} onChange={handleModeChange} />
      </div>
      {isDrawingMode && (
        <div>
          <Range item={items[0]} />
          <Color item={items[1]} />
          <div className="divider" style={{ margin: "16px" }} />
          <div className="switch-wrapper">
            阴影开关
            <Switch checked={showShadow} onChange={handleShowShadowChange} />
          </div>
          {showShadow && (
            <div>
              <Color item={items[2]} />
              <DoubleInput item={items[3]} />
              <Range item={items[4]} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Material;
