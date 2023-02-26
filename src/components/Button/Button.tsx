import styles from "./Button.module.scss";
import { useState } from "react";
import classNames from "classnames";
import { Icon } from "@/components";
import type { ReactNode, MouseEvent, CSSProperties } from "react";

interface Props {
  className?: string;
  style?: CSSProperties;
  type?: "primary" | "default";
  loading?: boolean;
  children?: ReactNode;
  onClick?: (evt: MouseEvent<HTMLDivElement>) => any;
}

function Button({
  className: propsClassName,
  style,
  type: propsType,
  loading: propsLoading,
  children,
  onClick,
}: Props) {
  const [loading, setLoading] = useState(false);
  const isLoading = propsLoading === true || loading;

  const type = propsType || "default";
  const className = classNames(
    styles.button,
    styles[`button-${type}`],
    isLoading && styles["button-loading"],
    propsClassName
  );

  const handleClick = (evt: MouseEvent<HTMLDivElement>) => {
    if (isLoading || onClick === undefined) {
      return;
    }

    const res = onClick(evt);
    if (res instanceof Promise) {
      setLoading(true);
      res.finally(() => {
        setLoading(false);
      });
    }
  };

  return (
    <div className={className} onClick={handleClick} style={style}>
      {isLoading && <Icon type="icon-loading" className={styles.loading} />}
      {children}
    </div>
  );
}

export default Button;
