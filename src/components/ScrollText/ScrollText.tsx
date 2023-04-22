import { useState, useEffect, useRef } from "react";
import styles from "./ScrollText.module.scss";
import classNames from "classnames";

interface Props {
  className?: string;
  children?: any;
}

function ScrollText({ className, children }: Props) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [needScroll, setNeedScroll] = useState(false);

  useEffect(() => {
    const elem = textRef.current;
    if (!elem) {
      return;
    }

    const determinant = async () => {
      const parentWidth = elem.parentElement!.getBoundingClientRect().width;
      const childWidth = elem.getBoundingClientRect().width;
      if (childWidth > parentWidth) {
        setNeedScroll(true);
      }
    };

    determinant();
  }, []);

  return (
    <div className={className} style={{ overflow: "hidden" }}>
      <span
        className={classNames(styles.inline, needScroll && styles.animate)}
        ref={textRef}
      >
        {children}
      </span>
    </div>
  );
}

export default ScrollText;
