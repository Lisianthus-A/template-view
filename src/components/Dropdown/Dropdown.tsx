import styles from "./Dropdown.module.scss";
import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import classNames from "classnames";
import { Icon, Portal } from "@/components";
import type { IconType } from "@/components/Icon/Icon";
import type { CSSProperties, MouseEvent } from "react";

interface Item {
  text: string;
  checked: boolean;
  icon: IconType;
  hide?: boolean;
}

interface Props {
  className?: string;
  style?: CSSProperties;
  list: Item[];
  onItemClick?: (item: Item) => void;
}

function Dropdown({ className, style, list, onItemClick }: Props) {
  const elemRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [visible, setVisible] = useState(false);

  const closeFunc = useCallback(() => {
    setVisible(false);
    window.removeEventListener("click", closeFunc);
  }, []);

  const handleWrapperClick = (evt: MouseEvent) => {
    if (visible) {
      closeFunc();
    } else {
      updatePosition();
      setVisible(true);
      setTimeout(() => {
        window.addEventListener("click", closeFunc);
      });
    }
  };

  const handleOptionClick = (evt: MouseEvent, item: Item) => {
    evt.stopPropagation();
    onItemClick && onItemClick(item);
    closeFunc();
  };

  const updatePosition = useCallback(() => {
    const elem = elemRef.current;
    if (!elem) {
      return;
    }

    const { x, y } = elem.getBoundingClientRect();
    setPosition({
      left: x + 32,
      top: y,
    });
  }, []);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  const showList = list.filter((item) => item.hide !== true);

  return (
    <div
      className={classNames(styles["dropdown-wrapper"], className)}
      style={style}
      ref={elemRef}
      onClick={handleWrapperClick}
    >
      <Icon type="icon-more" />

      {visible && (
        <Portal>
          <div
            className={styles.dropdown}
            style={{ left: position.left, top: position.top }}
          >
            {showList.map((item, index) => (
              <div
                className={styles.option}
                key={index}
                onClick={(evt) => handleOptionClick(evt, item)}
              >
                <Icon type={item.icon} className={styles.icon} />
                <div className={styles.text}>{item.text}</div>
                {item.checked && (
                  <Icon type="icon-check" className={styles.checked} />
                )}
              </div>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
}

export default Dropdown;
