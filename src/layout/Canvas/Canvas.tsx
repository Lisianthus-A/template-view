import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import { CanvasDataContext } from "@/App";
import { CanvasModel } from "@/models";
import EventBus from "@/utils/event";
import { canvasRef as storeCanvasRef } from "@/store";
import styles from "./Canvas.module.scss";

function Canvas() {
  const canvasData = useContext(CanvasDataContext);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleClick = () => {
    const canvas = storeCanvasRef.current;
    if (canvas) {
      canvas.instance.discardActiveObject();
      canvas.render();
      EventBus.emit("selection-change");
    }
  };

  useLayoutEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    if (canvasData.id !== "") {
      CanvasModel.createByJson(canvasRef.current, canvasData.data as any);
    } else {
      new CanvasModel({
        width: 1280,
        height: 720,
        canvas: canvasRef.current,
      });
    }
    return () => {
      storeCanvasRef.current && storeCanvasRef.current.destroy();
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

      const key = evt.key.toUpperCase();

      if (key === "DELETE") {
        canvas.del();
        return;
      }

      if (evt.ctrlKey) {
        if (key === "Z") {
          canvas.undo();
        } else if (key === "Y") {
          canvas.redo();
        }
      }
    };

    const stopPropagation = (evt: MouseEvent) => {
      evt.stopPropagation();
    };

    const preventDefault = (evt: DragEvent) => {
      evt.preventDefault();
    };

    const onDrop = (evt: DragEvent) => {
      evt.preventDefault();
      if (evt.dataTransfer) {
        const item = JSON.parse(evt.dataTransfer.getData("text"));
        EventBus.emit(
          "drop-into-canvas",
          { x: evt.offsetX, y: evt.offsetY },
          item
        );
      }
    };

    upperCanvas.addEventListener("click", stopPropagation);
    upperCanvas.addEventListener("keydown", onKeyDown);
    upperCanvas.addEventListener("dragenter", preventDefault);
    upperCanvas.addEventListener("dragover", preventDefault);
    upperCanvas.addEventListener("drop", onDrop);
    return () => {
      upperCanvas.removeEventListener("click", stopPropagation);
      upperCanvas.removeEventListener("keydown", onKeyDown);
      upperCanvas.removeEventListener("dragenter", preventDefault);
      upperCanvas.removeEventListener("dragover", preventDefault);
      upperCanvas.removeEventListener("drop", onDrop);
    };
  }, []);

  return (
    <div className={styles.canvas} onClick={handleClick}>
      <div id="grid" className="gap" />
      <canvas className="gap" ref={canvasRef} />
    </div>
  );
}

export default Canvas;
