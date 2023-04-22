import styles from "./Range.module.scss";
import { useEffect, useState, useCallback, useRef } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import type { FormObject } from "@/models/CanvasModel";

type FormItem = FormObject["items"][number];

interface Props {
  item: FormItem;
}

function Range({ item }: Props) {
  const { name, value, min = 0, max = 100, handler } = item;
  const [inputValue, setInputValue] = useState<number>(value);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const progress = progressRef.current;
    if (!progress) {
      return;
    }

    const { value } = evt.target;
    if (value === "") {
      setInputValue(min);
      handler(min);
      progress.style.setProperty("--rail-width", "0%");
      return;
    }

    if (/[^\d]/.test(value)) {
      return;
    }

    let num = Number(value);
    // 越界处理
    if (num > max) {
      num = max;
    } else if (num < min) {
      num = min;
    }

    setInputValue(num);
    handler(num);
    const percent = (num - min) / max;
    progress.style.setProperty("--rail-width", `${percent * 100}%`);
  };

  const handleMouseMove = useCallback((evt: globalThis.MouseEvent) => {
    const progress = progressRef.current;
    if (!progress) {
      return;
    }

    const { clientWidth, offsetLeft } = progress;
    let percent = (evt.clientX - offsetLeft) / clientWidth;
    // 越界处理
    if (percent > 1) {
      percent = 1;
    } else if (percent < 0) {
      percent = 0;
    }

    progress.style.setProperty("--rail-width", `${percent * 100}%`);
    const nextValue = (percent * max) >> 0;
    setInputValue(nextValue);
    handler(nextValue);
  }, []);

  const handleMouseUp = useCallback(() => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleMouseDown = (evt: MouseEvent) => {
    // 非主键
    if (evt.button !== 0) {
      return;
    }

    const progress = progressRef.current;
    if (!progress) {
      return;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    const { clientWidth, offsetLeft } = progress;
    let percent = (evt.clientX - offsetLeft) / clientWidth;
    // 越界处理
    if (percent > 1) {
      percent = 1;
    } else if (percent < 0) {
      percent = 0;
    }

    progress.style.setProperty("--rail-width", `${percent * 100}%`);
    const nextValue = (percent * max) >> 0;
    setInputValue(nextValue);
    handler(nextValue);
  };

  useEffect(() => {
    const progress = progressRef.current;
    if (!progress) {
      return;
    }
    setInputValue(value);
    const percent = (value - min) / max;
    progress.style.setProperty("--rail-width", `${percent * 100}%`);
  }, [value]);

  return (
    <div className={styles.range}>
      <div className="header-wrapper">
        <div>{name}</div>
        <input
          className="range-input"
          value={inputValue}
          onChange={handleChange}
        />
      </div>
      <div className="progress" onMouseDown={handleMouseDown} ref={progressRef}>
        <div className="rail">
          <div className="handle" />
        </div>
      </div>
    </div>
  );
}

export default Range;
