import { useEffect, useState } from "react";
import classNames from "classnames";
import { canvasRef } from "@/store";
import EventBus from "@/utils/event";
import Icon from "../Icon/Icon";
import styles from "./Sidebar.module.scss";
import Attr from "./Attr";
import Material from "./Material";
import Text from "./Text";
import My from "./My";

const tabs = [
  {
    id: "material",
    iconType: "icon-material",
    text: "素材",
  },
  {
    id: "text",
    iconType: "icon-text",
    text: "文本",
  },
  {
    id: "attr",
    iconType: "icon-attr",
    text: "属性",
  },
  {
    id: "my",
    iconType: "icon-my",
    text: "我的",
  },
];

function Sidebar() {
  const [currentTab, setCurrentTab] = useState("material");

  const handleTabClick = (tabItem: typeof tabs[number]) => {
    setCurrentTab(tabItem.id);
  };

  useEffect(() => {
    const onChange = () => {
      if (!canvasRef.current) {
        return;
      }
      const selectedItem = canvasRef.current.getSelected();
      // 选中画布 忽略
      if (selectedItem.length === 0) {
        return;
      }

      setCurrentTab("attr");
    };

    EventBus.on("selection-change", onChange);
    return () => {
      EventBus.off("selection-change", onChange);
    };
  }, []);

  return (
    <div className={styles.sidebar}>
      <div className={styles.tabs}>
        {tabs.map((item) => (
          <div
            key={item.id}
            className={classNames(
              "tab",
              currentTab === item.id && "tab-active"
            )}
            onClick={() => handleTabClick(item)}
          >
            <Icon className="tab-icon" type={item.iconType as any} />
            <div className="tab-text">{item.text}</div>
          </div>
        ))}
      </div>
      <div className={styles.main}>
        {currentTab === "material" && <Material />}
        {currentTab === "text" && <Text />}
        {currentTab === "attr" && <Attr />}
        {currentTab === "my" && <My />}
      </div>
    </div>
  );
}

export default Sidebar;
