import { useEffect, useLayoutEffect, useRef } from "react";
import { CanvasModel } from "@/models";
import { canvasRef as storeCanvasRef } from "@/store";
import styles from "./Canvas.module.scss";

function Canvas() {
  const gridRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    if (!gridRef.current || !canvasRef.current) {
      return;
    }

    const model = new CanvasModel({
      width: 1280,
      height: 720,
      canvas: canvasRef.current,
    });
    storeCanvasRef.current = model;

    return () => {
      model.destroy();
    };
  }, []);

  useEffect(() => {
    const upperCanvas = document.getElementsByClassName(
      "upper-canvas"
    )[0] as HTMLDivElement;
    if (!upperCanvas) {
      return;
    }
    upperCanvas.style.outline = "0";
    upperCanvas.tabIndex = 0;

    const onKeyDown = (evt: KeyboardEvent) => {
      const canvas = storeCanvasRef.current;
      if (!canvas) {
        return;
      }

      console.log("keyboard", evt);

      if (evt.code === "Delete") {
        canvas.del();
      }
    };

    upperCanvas.addEventListener("keydown", onKeyDown);
    return () => {
      upperCanvas.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className={styles.canvas}>
      <canvas ref={gridRef} id="grid" className="gap" />
      <canvas className="gap" ref={canvasRef} />
    </div>
  );
}

export default Canvas;
