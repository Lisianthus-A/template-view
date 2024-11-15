import styles from "./Color.module.scss";
import { useEffect, useState } from "react";
import { SketchPicker } from "react-color";
import { canvasRef } from "@/store";
import type { ColorResult } from "react-color";
import type { FormObject } from "@/models/CanvasModel";

type FormItem = FormObject["items"][number];

interface Props {
  item: FormItem;
}

function Color({ item }: Props) {
  const { name, value, handler } = item;

  const [color, setColor] = useState(value);
  const [visible, setVisible] = useState(false);

  const handleMouseDown = () => {
    if (canvasRef.current) {
      canvasRef.current.disableSave = true;
    }
  };

  const handleMouseUp = () => {
    if (canvasRef.current) {
      canvasRef.current.disableSave = false;
      debugger;
      handler(color);
    }
  };

  const handleChange = (color: ColorResult) => {
    const { r, g, b, a } = color.rgb;
    const rgba = `rgba(${r}, ${g}, ${b}, ${a})`;
    setTimeout(() => {
      handler(rgba);
    }, 0);
  };

  const toggleVisible = () => {
    if (!visible) {
      const bodyClick = () => {
        setVisible(false);
        window.removeEventListener("click", bodyClick);
      };
      setTimeout(() => {
        window.addEventListener("click", bodyClick);
      });
    }

    setVisible(!visible);
  };

  useEffect(() => {
    setColor(value);
  }, [value]);

  return (
    <div className={styles.color}>
      <div className="name">{name}</div>
      <div className="color-bar-wrapper" onClick={toggleVisible}>
        <div className="color-bar" style={{ backgroundColor: color }} />
      </div>
      <div
        className="picker-wrapper"
        onClick={(evt) => evt.stopPropagation()}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
      >
        {visible && <SketchPicker onChange={handleChange} color={color} />}
      </div>
    </div>
  );
}

export default Color;
