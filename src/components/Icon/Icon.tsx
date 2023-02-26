import styles from "./Icon.module.scss";
import classNames from "classnames";
import type { CSSProperties } from "react";

type IconType =
  | "icon-undo"
  | "icon-redo"
  | "icon-loading"
  | "icon-text"
  | "icon-attr"
  | "icon-material";

interface Props {
  type: IconType;
  className?: string;
  style?: CSSProperties;
}

function Icon({ type, className: propsClassName, style }: Props) {
  const className = classNames(styles.icon, propsClassName);

  return (
    <svg className={className} style={style}>
      <use xlinkHref={`#${type}`} />
    </svg>
  );
}

export default Icon;
