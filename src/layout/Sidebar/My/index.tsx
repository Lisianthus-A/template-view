import { useContext, useEffect, useRef, useState } from "react";
import { Tabs, Toast, Collection } from "@/components";
import { CanvasDataContext } from "@/App";
import {
  getMyItems,
  addFavorite,
  addShared,
  deleteFavorite,
  deleteItem,
  deleteShared,
} from "@/utils/api";
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
  const canvasData = useContext(CanvasDataContext);
  const [items, setItems] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState("created");
  const [currentType, setCurrentType] = useState("material");

  const handleTabChange = (tab: Record<"id" | "text", string>) => {
    setCurrentTab(tab.id);
  };

  const handleTypeChange = (type: string) => {
    setCurrentType(type);
  };

  const getData = async () => {
    const res = await getMyItems();
    dataRef.current = res.data;
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

  const doEdit = (item: any) => {
    location.replace(`${location.origin}?id=${item.id}`);
  };

  const doFavorite = async (item: any) => {
    let res;
    if (item.isFav) {
      res = await deleteFavorite(item.id);
    } else {
      res = await addFavorite(item.id);
    }

    await getData();
    resolveData();
    if (res.code === 0) {
      Toast.show(item.isFav ? "取消收藏成功" : "收藏成功");
    } else {
      Toast.show(res.text);
    }
  };

  const doShare = async (item: any) => {
    let res;
    if (item.isShared) {
      res = await deleteShared(item.id);
    } else {
      res = await addShared(item.id);
    }

    await getData();
    resolveData();
    if (res.code === 0) {
      Toast.show(item.isShared ? "取消分享成功" : "分享成功");
    } else {
      Toast.show(res.text);
    }
  };

  const doDelete = async (item: any) => {
    const res = await deleteItem(item.id);

    await getData();
    resolveData();
    if (res.code === 0) {
      Toast.show("删除成功");
    } else {
      Toast.show(res.text);
    }

    if (canvasData.id === item.id) {
      setTimeout(() => {
        location.replace(location.origin);
      }, 1000);
    }
  };

  const resolveData = () => {
    const dataList = dataRef.current[currentTab];
    setItems(dataList.filter((item) => item.type === currentType));
  };

  useEffect(() => {
    const init = async () => {
      await getData();
      resolveData();
    };
    init();
  }, []);

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
