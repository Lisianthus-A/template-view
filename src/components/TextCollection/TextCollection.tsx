import styles from "./TextCollection.module.scss";
import { canvasRef } from "@/store";
import { TextModel } from "@/models";
import EventBus from "@/utils/event";
import { useCallback, useEffect, useRef } from "react";
import type { DragEvent } from "react";

interface Props {
  onLoading?: (isDone: boolean) => void;
}

interface Item {
  id: string;
  type: "template" | "material";
  image: string;
  data: any;
}

const items: Item[] = [
  {
    id: "0",
    type: "material",
    image: "./fonts/CangErShuYuanTi.png",
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
    image: "./fonts/AlimamaShuHeiTi.png",
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
    image: "./fonts/HongLeiZhuoShu.png",
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
    image: "./fonts/YunFengHanChanTi.png",
    data: {
      text: "云峰寒蝉体",
      fontFamily: "YunFengHanChanTi",
      width: 195,
      height: 45,
    },
  },
];

function Collection({ onLoading }: Props) {
  const disabledRef = useRef(false);

  const handleItemClick = useCallback(
    async (item: Item, pos?: Record<"x" | "y", number>) => {
      const canvas = canvasRef.current;
      if (!canvas || disabledRef.current) {
        return;
      }
      disabledRef.current = true;

      onLoading && onLoading(false);
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

      onLoading && onLoading(true);
      disabledRef.current = false;
    },
    []
  );

  const handleDragStart = (evt: DragEvent, item: Item) => {
    evt.dataTransfer.setData("text/plain", JSON.stringify(item));
  };

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
      <div className="collection">
        <div className="collection-title">艺术字</div>
        <div className="collection-items">
          {items.map((item) => (
            <div
              className="collection-item"
              key={item.id}
              onClick={(evt) => {
                if ((evt.target as HTMLElement).nodeName === "svg") {
                  return;
                }

                handleItemClick(item);
              }}
            >
              <div className="collection-size">
                {item.data.width}x{item.data.height}
              </div>
              <img
                className="collection-image"
                src={item.image}
                onDragStart={(evt) => handleDragStart(evt, item)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Collection;
