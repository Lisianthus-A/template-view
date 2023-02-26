import { useEffect, useState } from "react";
import styles from "./TextArea.module.scss";
import type { ChangeEvent } from "react";
import type { FormObject } from "@/models/CanvasModel";

type FormItem = FormObject["items"][number];

interface Props {
  item: FormItem;
}

function TextArea({ item }: Props) {
  const { name, value, handler } = item;
  const [inputValue, setInputValue] = useState<string>(value);

  const handleChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(evt.target.value);
    handler(evt.target.value);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={styles.textarea}>
      <div className="name">{name}</div>
      <textarea
        className="input-area"
        onChange={handleChange}
        value={inputValue}
      />
    </div>
  );
}

export default TextArea;
