import { useEffect, useRef, useState } from "react";
import { Tabs, Collection } from "@/components";
import styles from "./index.module.scss";
import classNames from "classnames";

const tabs = [
  {
    id: "created",
    text: "文件库",
  },
  {
    id: "favorite",
    text: "收藏",
  },
  {
    id: "shared",
    text: "分享",
  },
];

const types = [
  {
    id: "material",
    text: "素材",
  },
  {
    id: "template",
    text: "模板",
  },
];

function My() {
  const dataRef = useRef<Record<string, any[]>>({
    created: [],
    shared: [],
    favorite: [],
  });
  const [items, setItems] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState("created");
  const [currentType, setCurrentType] = useState("material");

  const handleTabChange = (tab: Record<"id" | "text", string>) => {
    setCurrentTab(tab.id);
  };

  const handleTypeChange = (type: string) => {
    setCurrentType(type);
  };

  const handleDropdownItemClick = (dItem: any, item: any) => {
    if (dItem.text === "编辑") {
      doEdit(item);
    } else if (dItem.text === "收藏") {
      doFavorite(item);
    } else if (dItem.text === "分享") {
      doShare(item);
    } else if (dItem.text === "删除") {
      doDelete(item);
    }
  };

  const doEdit = (item: any) => {};

  const doFavorite = async (item: any) => {};

  const doShare = async (item: any) => {};

  const doDelete = async (item: any) => {};

  const resolveData = () => {
    const dataList = dataRef.current[currentTab];
    setItems(dataList.filter((item) => item.type === currentType));
  };

  useEffect(resolveData, [currentTab, currentType]);

  return (
    <div className={styles.my}>
      <Tabs tabs={tabs} onChange={handleTabChange} />
      <div className="types">
        {types.map((item) => (
          <div
            className={classNames(
              "type",
              currentType === item.id && "type-selected"
            )}
            key={item.id}
            onClick={() => handleTypeChange(item.id)}
          >
            {item.text}
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <Collection
          type="custom"
          showSearch={false}
          items={[{ title: "", hasMore: false, items: items }]}
          onDropdownItemClick={handleDropdownItemClick}
          dropdownListGenerator={(item) => [
            {
              icon: "icon-edit",
              text: "编辑",
              checked: false,
            },
            {
              icon: "icon-heart-fill",
              text: "收藏",
              checked: item.isFav,
              hide: currentTab === "shared",
            },
            {
              icon: "icon-share",
              text: "分享",
              checked: item.isShared,
              hide: currentTab === "favorite",
            },
            {
              icon: "icon-delete",
              text: "删除",
              checked: false,
              hide: currentTab !== "created",
            },
          ]}
        />
      )}
    </div>
  );
}

export default My;
