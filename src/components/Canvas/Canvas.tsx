import { useEffect, useRef, useState } from "react";
import { CanvasModel, ImageModel } from "@/components/Canvas/models";
import { drawGrid } from "@/utils/canvas";
import EventBus from "@/utils/event";
import styles from "./Canvas.module.scss";

function Canvas() {
  const [cursor, setCursor] = useState("default");
  const [radius, setRadius] = useState("20 20 20 20");
  const gridRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<CanvasModel | null>(null);

  useEffect(() => {
    if (!gridRef.current || !canvasRef.current) {
      return;
    }
    // 网格
    drawGrid(gridRef.current.getContext("2d")!, 1280, 720);

    // 画布
    const ctx = canvasRef.current.getContext("2d")!;
    modelRef.current = new CanvasModel(ctx, {
      w: 1280,
      h: 720,
    });

    EventBus.on("set-cursor", setCursor);
    return () => {
      EventBus.off("set-cursor", setCursor);
      modelRef.current!.destroy();
    };
  }, []);

  const handleAdd = () => {
    const model = modelRef.current;
    const canvas = canvasRef.current;
    if (!model || !canvas) {
      return;
    }
    const _radius = radius.split(" ").map(Number);

    const image = new ImageModel(canvas.getContext("2d")!, {
      name: `组件`,
      x: 100,
      y: 100,
      radius: _radius,
    });
    model.addChild(image);
  };

  const copy = () => {
    const model = modelRef.current;
    if (!model) {
      return;
    }
    model.copySelected();
  };

  const paste = () => {
    const model = modelRef.current;
    if (!model) {
      return;
    }
    model.paste();
  };

  const del = () => {
    const model = modelRef.current;
    if (!model) {
      return;
    }
    model.deleteSelected();
  };

  const undo = () => {
    const model = modelRef.current;
    if (!model) {
      return;
    }

    model.undo();
  };

  const redo = () => {
    const model = modelRef.current;
    if (!model) {
      return;
    }

    model.redo();
  };

  const exportData = () => {
    const model = modelRef.current;
    if (!model) {
      return;
    }
    const data = model.getData();
    console.log("data", data);
  };

  return (
    <div className={styles.canvas} style={{ cursor }}>
      <div className="btns">
        <label>
          圆角值：
          <input
            onChange={(evt) => setRadius(evt.target.value)}
            value={radius}
          />
        </label>
        <button onClick={handleAdd}>添加组件</button>
        <button onClick={copy}>复制(ctrl+c)</button>
        <button onClick={paste}>粘贴(ctrl+v)</button>
        <button onClick={del}>删除(delete)</button>
        <button onClick={undo}>撤销(ctrl+z)</button>
        <button onClick={redo}>恢复(ctrl+y)</button>
        <button onClick={exportData}>导出数据</button>
      </div>
      <canvas ref={gridRef} width="1280" height="720"></canvas>
      <canvas ref={canvasRef} width="1280" height="720" tabIndex={0}></canvas>
    </div>
  );
}

export default Canvas;
