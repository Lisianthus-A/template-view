import { useLayoutEffect, useState } from "react";
import styles from "./index.module.scss";
import { canvasRef } from "@/store";
import EventBus from "@/utils/event";
import { Button } from "@/components";
import DoubleInput from "./DoubleInput";
import UploadImage from "./UploadImage";
import Range from "./Range";
import TextArea from "./TextArea";
import Color from "./Color";
import IconBar from "./IconBar";
import Select from "./Select";
import type { FormObject } from "@/models/CanvasModel";

function Attr() {
  const [formObject, setFormObject] = useState<FormObject | null>(null);

  useLayoutEffect(() => {
    const onChange = () => {
      if (!canvasRef.current) {
        return;
      }

      const selectedItems = canvasRef.current.getSelected();
      // 多选
      if (selectedItems.length >= 2) {
        setFormObject(null);
        return;
      }

      const selectedItem = selectedItems[0] || canvasRef.current;
      const nextFormObject = selectedItem.getFormObject();
      setFormObject(nextFormObject);
    };

    onChange();
    EventBus.on("selection-change", onChange);
    EventBus.on("update-config", onChange);
    return () => {
      EventBus.off("selection-change", onChange);
      EventBus.off("update-config", onChange);
    };
  }, []);

  return (
    <div className={styles.attr}>
      <div className="title">{formObject ? formObject.name : "组合"}</div>
      <div className="divider" />
      {formObject === null && <div className="empty">组合暂不支持编辑</div>}
      {formObject &&
        formObject.items.map((item) => {
          if (item.type === "double-input") {
            return <DoubleInput key={item.id} item={item} />;
          }
          if (item.type === "upload-image") {
            return <UploadImage key={item.id} item={item} />;
          }
          if (item.type === "range") {
            return <Range key={item.id} item={item} />;
          }
          if (item.type === "textarea") {
            return <TextArea key={item.id} item={item} />;
          }
          if (item.type === "icon-bar") {
            return <IconBar key={item.id} item={item} />;
          }
          if (item.type === "color") {
            return <Color key={item.id} item={item} />;
          }
          if (item.type === "button") {
            return (
              <Button
                key={item.id}
                style={{ width: 263, margin: "16px 0 0 16px" }}
                onClick={item.handler}
              >
                {item.name}
              </Button>
            );
          }
          if (item.type === "select") {
            return <Select key={item.id} item={item} />;
          }

          return null;
        })}
    </div>
  );
}

export default Attr;
