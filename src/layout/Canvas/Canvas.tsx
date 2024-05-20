import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import { CanvasDataContext } from "@/App";
import { CanvasModel } from "@/models";
import EventBus from "@/utils/event";
import { canvasRef as storeCanvasRef } from "@/store";
import styles from "./Canvas.module.scss";
import type { MouseEvent as ReactMouseEvent } from "react";

function Canvas() {
  const canvasData = useContext(CanvasDataContext);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const handleClick = () => {
    const canvas = storeCanvasRef.current;
    if (canvas) {
      canvas.instance.discardActiveObject();
      canvas.render();
      EventBus.emit("selection-change");
    }
  };

  const handleMouseDown = (evt: ReactMouseEvent, type: string) => {
    const el = previewRef.current;
    const canvas = storeCanvasRef.current;
    if (!el || !canvas) {
      return;
    }
    evt.preventDefault();

    const size = canvas.getSize();
    const initPos = { x: evt.pageX, y: evt.pageY };
    const allowX = type.indexOf("r") >= 0;
    const allowY = type.indexOf("b") >= 0;

    const onMouseMove = (evt: MouseEvent) => {
      const width = allowX
        ? Math.max(0, size.width + evt.pageX - initPos.x)
        : size.width;
      const height = allowY
        ? Math.max(0, size.height + evt.pageY - initPos.y)
        : size.height;
      el.style.setProperty("width", `${width}px`);
      el.style.setProperty("height", `${height}px`);
    };
    const onMouseUp = (evt: MouseEvent) => {
      const width = allowX
        ? Math.max(0, size.width + evt.pageX - initPos.x)
        : size.width;
      const height = allowY
        ? Math.max(0, size.height + evt.pageY - initPos.y)
        : size.height;
      canvas.resize(width, height);

      el.style.setProperty("display", "none");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    el.style.setProperty("display", "block");
    el.style.setProperty("width", `${size.width}px`);
    el.style.setProperty("height", `${size.height}px`);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
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

      if (evt.ctrlKey || evt.metaKey) {
        if (key === "Z") {
          canvas.undo();
        } else if (key === "Y") {
          canvas.redo();
        }
      }
    };

    const stopPropagation = (evt: MouseEvent) => {
      document.body.click();
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
      <div id="grid" className="gap">
        <div ref={previewRef} className={styles["resize-preview"]} />
        <div
          className={styles["block-r"]}
          onMouseDown={(evt) => handleMouseDown(evt, "r")}
        />
        <div
          className={styles["block-b"]}
          onMouseDown={(evt) => handleMouseDown(evt, "b")}
        />
        <div
          className={styles["block-br"]}
          onMouseDown={(evt) => handleMouseDown(evt, "br")}
        />
      </div>
      <canvas className="gap" ref={canvasRef} />
    </div>
  );
}

export default Canvas;
