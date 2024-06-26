import styles from "./Collection.module.scss";
import { canvasRef } from "@/store";
import { ImageModel, TextModel } from "@/models";
import EventBus from "@/utils/event";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, Input, ScrollText, Dropdown } from "@/components";
import type { DragEvent } from "react";
// import type { IconType } from "@/components/Icon/Icon";

interface Props {
  type: "template" | "material" | "text" | "custom";
  noLimit?: boolean;
  showDropdown?: boolean;
  showSearch?: boolean;
  items?: ShowItem[];
  onDropdownItemClick?: (dropItem: any, item: Item) => void;
  dropdownListGenerator?: (item: Item) => any[];
  onLoading?: (isDone: boolean) => void;
}

interface Item {
  id: string;
  type: "template" | "material";
  name: string;
  internal: boolean;
  tag: string;
  image: string;
  isFav: boolean;
  isShared: boolean;
  data: any;
}

interface ShowItem {
  title: string;
  hasMore: boolean;
  items: Item[];
}

const textItem: ShowItem = {
  title: "艺术字",
  hasMore: false,
  items: [
    {
      id: "0",
      type: "material",
      name: "",
      internal: true,
      tag: "",
      image: "./fonts/CangErShuYuanTi.png",
      isFav: false,
      isShared: false,
      data: {
        text: "仓耳舒圆体",
        fontFamily: "CangErShuYuanTi",
        color: "rgba(255, 255, 255, 1)",
        strokeColor: "#A63D13",
        width: 200,
        height: 45,
      },
    },
    {
      id: "1",
      type: "material",
      name: "",
      internal: true,
      tag: "",
      image: "./fonts/AlimamaShuHeiTi.png",
      isFav: false,
      isShared: false,
      data: {
        text: "阿里妈妈数黑体",
        fontFamily: "AlimamaShuHeiTi",
        width: 280,
        height: 45,
      },
    },
    {
      id: "2",
      type: "material",
      name: "",
      internal: true,
      tag: "",
      image: "./fonts/HongLeiZhuoShu.png",
      isFav: false,
      isShared: false,
      data: {
        text: "鸿雷拙书简体",
        fontFamily: "HongLeiZhuoShu",
        fontWeight: "bold",
        width: 191,
        height: 45,
      },
    },
    {
      id: "3",
      type: "material",
      name: "",
      internal: true,
      tag: "",
      image: "./fonts/YunFengHanChanTi.png",
      isFav: false,
      isShared: false,
      data: {
        text: "云峰寒蝉体",
        fontFamily: "YunFengHanChanTi",
        width: 195,
        height: 45,
      },
    },
  ],
};

function Collection({
  type,
  noLimit = false,
  showSearch = true,
  showDropdown = true,
  items = [],
  onLoading,
  onDropdownItemClick,
  dropdownListGenerator,
}: Props) {
  const fullItemsRef = useRef<ShowItem[]>(type === "text" ? [textItem] : items);
  const disabledRef = useRef(false);
  const [showItems, setShowItems] = useState<ShowItem[]>(
    type === "text" ? [textItem] : items
  );
  const [isShowMore, setIsShowMore] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  const handleItemClick = useCallback(
    async (item: Item, pos?: Record<"x" | "y", number>) => {
      const canvas = canvasRef.current;
      if (!canvas || disabledRef.current) {
        return;
      }
      disabledRef.current = true;

      onLoading && onLoading(false);
      if (type === "text") {
        const config = {
          ...item.data,
          x: pos ? pos.x : 0,
          y: pos ? pos.y : 0,
        };
        delete config.width;
        delete config.height;
        const model = await TextModel.create(config);
        disabledRef.current = false;
        canvas.add(model);
      } else if (item.type === "template") {
        location.replace(`${location.origin}?id=${item.id}`);
      } else if (item.type === "material") {
        if (item.tag === "背景") {
          canvas.replaceBackgroundImage(item.image);
        } else {
          for (let i = 0; i < item.data.children.length; ++i) {
            const child = item.data.children[i];
            let model = null;
            if (child.type === "image") {
              child.config.zIndex = child.zIndex || 0;
              model = await ImageModel.create({
                ...child.config,
                x: child.config.x + (pos ? pos.x : 0),
                y: child.config.y + (pos ? pos.y : 0),
              });
            } else if (child.type === "text") {
              child.config.zIndex = child.zIndex || 5;
              model = await TextModel.create({
                ...child.config,
                x: child.config.x + (pos ? pos.x : 0),
                y: child.config.y + (pos ? pos.y : 0),
              });
            }
            model && canvas.add(model);
          }
        }
      }

      onLoading && onLoading(true);
      disabledRef.current = false;
    },
    [type]
  );

  const handleShowMore = (item: ShowItem) => {
    setShowItems([item]);
    setIsShowMore(true);
  };

  const handleBack = () => {
    setShowItems(fullItemsRef.current);
    setIsShowMore(false);
  };

  const handleDropdownClick = async (dropItem: any, item: Item) => {
    onDropdownItemClick && onDropdownItemClick(dropItem, item);
  };

  const handleSearch = (value: string) => {
    if (value === "") {
      setShowItems(fullItemsRef.current);
    } else {
      const nextItems: ShowItem[] = [];
      fullItemsRef.current.forEach((item) => {
        if (item.title.indexOf(value) >= 0) {
          nextItems.push(item);
        } else {
          const filterChildren = item.items.filter(
            (v) => v.name.indexOf(value) >= 0
          );
          if (filterChildren.length > 0) {
            nextItems.push({
              title: item.title,
              hasMore: false,
              items: filterChildren,
            });
          }
        }
      });
      setShowItems(nextItems);
    }

    setIsSearch(value !== "");
  };

  const handleDragStart = (evt: DragEvent, item: Item) => {
    evt.dataTransfer.setData("text/plain", JSON.stringify(item));
  };

  useEffect(() => {
    if (type === "custom") {
      fullItemsRef.current = items;
      setShowItems(items);
    }
  }, [items]);

  useEffect(() => {
    const handler = (position: any, item: any) => {
      handleItemClick(item, {
        x: position.x - item.data.width / 2,
        y: position.y - item.data.height / 2,
      });
    };
    EventBus.on("drop-into-canvas", handler);
    return () => {
      EventBus.off("drop-into-canvas", handler);
    };
  }, [handleItemClick]);

  return (
    <div className={styles["collection-wrapper"]}>
      {!isShowMore && showSearch && (
        <Input
          type="search"
          onSearch={handleSearch}
          placeholder="输入搜索内容"
        />
      )}
      {showItems.length === 0 && <div className="no-data">暂无数据</div>}
      {showItems.map((showItem, index) => {
        const items =
          noLimit || isShowMore || isSearch
            ? showItem.items
            : showItem.items.slice(0, 4);

        return (
          <div className="collection" key={index}>
            {isShowMore && !isSearch && (
              <div className="collection-back" onClick={handleBack}>
                <Icon type="icon-arrow-left" />
                {showItem.title}
              </div>
            )}
            {!isShowMore && (
              <div className="collection-header">
                {showItem.title && (
                  <div className="collection-title">{showItem.title}</div>
                )}
                {showItem.hasMore && (
                  <div
                    className="collection-more"
                    onClick={() => handleShowMore(showItem)}
                  >
                    更多 <Icon type="icon-arrow-right" />
                  </div>
                )}
              </div>
            )}
            <div className="collection-items">
              {items.map((item) => (
                <div
                  className="collection-item"
                  key={item.id}
                  onClick={(evt) => {
                    if ((evt.target as HTMLElement).nodeName === "svg") {
                      return;
                    }
                    if (
                      (evt.target as HTMLElement).classList.contains(
                        "collection-dropdown"
                      )
                    ) {
                      return;
                    }

                    handleItemClick(item);
                  }}
                >
                  {showDropdown && (
                    <Dropdown
                      className="collection-dropdown"
                      list={
                        dropdownListGenerator
                          ? dropdownListGenerator(item)
                          : [
                              {
                                icon: "icon-heart-fill",
                                text: "收藏",
                                checked: item.isFav,
                              },
                            ]
                      }
                      onItemClick={(dItem) => handleDropdownClick(dItem, item)}
                    />
                  )}
                  <div className="collection-size">
                    {item.data.width}x{item.data.height}
                  </div>
                  <img
                    className="collection-image"
                    src={item.image}
                    onDragStart={(evt) => handleDragStart(evt, item)}
                  />
                  {item.name && (
                    <ScrollText className="collection-name">
                      {item.name}
                    </ScrollText>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Collection;
