import styles from "./Icon.module.scss";
import classNames from "classnames";
import type { CSSProperties, MouseEvent } from "react";

export type IconType =
  | "icon-edit"
  | "icon-more"
  | "icon-heart"
  | "icon-heart-fill"
  | "icon-delete"
  | "icon-share"
  | "icon-check"
  | "icon-undo"
  | "icon-redo"
  | "icon-loading"
  | "icon-search"
  | "icon-text"
  | "icon-attr"
  | "icon-material"
  | "icon-arrow-left"
  | "icon-arrow-down"
  | "icon-arrow-right"
  | "icon-template"
  | "icon-my"
  | "icon-linethrough"
  | "icon-underline"
  | "icon-italic"
  | "icon-bold"
  | "icon-close";

interface Props {
  type: IconType;
  className?: string;
  style?: CSSProperties;
  onClick?: (evt: MouseEvent<SVGSVGElement>) => any;
}

function Icon({ type, className: propsClassName, style, onClick }: Props) {
  const className = classNames(styles.icon, propsClassName);

  return (
    <svg className={className} style={style} onClick={onClick}>
      <use xlinkHref={`#${type}`} />
    </svg>
  );
}

export default Icon;
