import { useEffect, useState } from "react";
import styles from "./Select.module.scss";
import { Select as ComSelect } from "@/components";
import type { FormObject } from "@/models/CanvasModel";

type FormItem = FormObject["items"][number];

interface Props {
  item: FormItem;
}

function Select({ item }: Props) {
  const { name, value, handler, options } = item;

  const [selectValue, setSelectValue] = useState(value);

  const handleChange = (value: string) => {
    handler && handler(value);
  };

  useEffect(() => {
    setSelectValue(value);
  }, [value]);

  return (
    <div className={styles.select}>
      <div className="name">{name}</div>
      <div className="com-select">
        <ComSelect
          options={options}
          onChange={handleChange}
          value={selectValue}
        />
      </div>
    </div>
  );
}

export default Select;
