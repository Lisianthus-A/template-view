import { useEffect, useState } from "react";
import styles from "./DoubleInput.module.scss";
import type { ChangeEvent } from "react";
import type { FormObject } from "@/models/CanvasModel";

type FormItem = FormObject["items"][number];

interface Props {
  item: FormItem;
}

function DoubleInput({ item }: Props) {
  const { name, value, label, handler } = item;
  const [inputValue, setInputValue] = useState<string[]>(value.map(String));

  const handleChange = (evt: ChangeEvent<HTMLInputElement>, index: number) => {
    let { value } = evt.target;
    if (value === "") {
      const newValue = inputValue.slice();
      newValue[index] = "";
      setInputValue(newValue);
      return;
    }

    // 非数字
    if (/[^\d]/.test(value)) {
      return;
    }

    if (Number(value) >= 10000) {
      value = "10000";
    }

    const newValue = inputValue.slice();
    newValue[index] = value;
    setInputValue(newValue);
    handler(...newValue.map(Number));
  };

  useEffect(() => {
    setInputValue(value.map(String));
  }, [value]);

  return (
    <div className={styles["double-input"]}>
      <div className="name">{name}</div>
      <div className="wrapper">
        <input
          className="controlled-input"
          value={inputValue[0]}
          onChange={(evt) => handleChange(evt, 0)}
        />
        <input
          className="controlled-input"
          value={inputValue[1]}
          onChange={(evt) => handleChange(evt, 1)}
        />
        <div className="label-first">{label[0]}</div>
        <div className="label-second">{label[1]}</div>
      </div>
    </div>
  );
}

export default DoubleInput;
