import { useLayoutEffect, useRef } from "react";
import styles from "./Loading.module.scss";

interface Props {
  size?: number;
}

function Loading(props: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const size = props.size || 96;
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    const itemSize = size / 3;
    wrapper.style.setProperty("--size", `${size}px`);
    wrapper.style.setProperty("--item-size", `${itemSize}px`);
  }, []);

  return (
    <div ref={wrapperRef} className={styles["loading-wrapper"]}>
      <div className={styles["loading"]} />
      <div style={{ marginTop: 8 }}>加载中</div>
    </div>
  );
}

export default Loading;
