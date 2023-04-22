import { useEffect, useRef, useState } from "react";
import styles from "./Tabs.module.scss";

interface Tab {
  id: string;
  text: string;
}

interface Props {
  tabs: Tab[];
  onChange?: (tab: Tab) => void;
}

function Tabs({ tabs, onChange }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleClick = (index: number) => {
    if (activeIndex === index) {
      return;
    }

    const el = elRef.current;
    if (!el) {
      return;
    }

    el.style.setProperty("--tab-offset", `${offsetRef.current[index]}px`);
    setActiveIndex(index);
    onChange && onChange(tabs[index]);
  };

  useEffect(() => {
    const el = elRef.current;
    if (!el) {
      return;
    }

    const offset = [];
    const children = el.getElementsByClassName(styles.tab);
    for (let i = 0; i < children.length; ++i) {
      const child = children[i] as HTMLDivElement;
      offset.push(child.offsetLeft);
    }
    offsetRef.current = offset;
  }, []);

  return (
    <div className={styles.tabs} ref={elRef}>
      <div className={styles["tab-slider"]} />
      {tabs.map((item, index) => (
        <div
          className={styles.tab}
          key={item.id}
          onClick={() => handleClick(index)}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}

export default Tabs;
