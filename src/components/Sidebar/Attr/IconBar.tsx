import styles from "./IconBar.module.scss";
import classNames from "classnames";
import { Icon, Tooltip } from "@/components";

import type { FormObject } from "@/models/CanvasModel";

type FormItem = FormObject["items"][number];

interface Props {
  item: FormItem;
}

function IconBar({ item }: Props) {
  const { name, value, iconTypes, labels, handler } = item;

  const handleClick = (iconType: string) => {
    handler(iconType);
  };

  return (
    <div className={styles["icon-bar"]}>
      <div className="name">{name}</div>
      <div className="icon-list">
        {iconTypes.map((type: any, index: number) => (
          <div
            key={type}
            className={classNames(
              "icon-wrapper",
              value[index] && "icon-active"
            )}
            onClick={() => handleClick(type)}
          >
            <Tooltip text={labels[index]}>
              <Icon type={type} />
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IconBar;
