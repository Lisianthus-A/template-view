import styles from "./Header.module.scss";
import { useState, useContext, useEffect } from "react";
import Psd from "@webtoon/psd";
import { canvasRef } from "@/store";
import { Button, Icon, Tooltip, Toast } from "@/components";
import { CanvasDataContext } from "@/App";
import { ImageModel } from "@/models";
import { shouldToast } from "@/utils";
import EventBus from "@/utils/event";
import type { ChangeEvent } from "react";
import { Group, Layer } from "@webtoon/psd";

function Header() {
  const canvasData = useContext(CanvasDataContext);

  const [stackStatus, setStackStatus] = useState({
    undo: false,
    redo: false,
  });

  const handleSaveImage = async () => {
    if (!canvasRef.current) {
      return;
    }

    const base64String = await canvasRef.current.toImage();
    const a = document.createElement("a");
    a.href = base64String;
    a.download = `image-${Date.now()}.png`;
    a.click();
  };

  const handleSaveData = async () => {
    if (!canvasRef.current) {
      return;
    }

    canvasRef.current.toJson(true);
  };

  const handleNew = () => {
    location.replace(location.origin);
  };

  const handleFileChange = async (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files && evt.target.files[0];
    if (file === null) {
      return;
    }
    evt.target.value = "";

    if (!file.name.endsWith(".psd")) {
      return Toast.show("请选择正确的文件类型");
    }

    // item.layerFrame.layerProperties.textProperties
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = Psd.parse(arrayBuffer);
      // renderByLayers(result);
      renderByGroups(result);
    } catch (err) {
      Toast.show("psd 解析失败");
      console.log("catch psd error", err);
    }
  };

  const shouldSkipLayer = (layer: Layer) => {
    let shouldSkip = false;
    if (layer.isHidden) {
      shouldSkip = true;
    }
    if (layer.width > 3600 || layer.height > 3600) {
      shouldSkip = true;
    }

    shouldSkip && console.log(`skip layer ${layer.name}`);

    return shouldSkip;
  };

  // const renderByLayers = async (result: Psd) => {
  //   if (!canvasRef.current) {
  //     return;
  //   }

  //   const models = [];
  //   for (let i = result.layers.length - 1; i >= 0; --i) {
  //     const layer = result.layers[i];
  //     const u8Array = await layer.composite(true, true);
  //     const imageData = new ImageData(u8Array, layer.width, layer.height);
  //     const model = await ImageModel.create({
  //       imageUrl: "",
  //       imageData,
  //       x: layer.left,
  //       y: layer.top,
  //     });
  //     models.push(model);
  //   }
  //   canvasRef.current.resize(result.width, result.height);
  //   models.forEach((model) => {
  //     canvasRef.current!.add(model);
  //   });
  // };

  // psd 按组渲染
  const renderByGroups = async (result: Psd) => {
    if (!canvasRef.current) {
      return;
    }

    const nodes = result.children;

    const bfs = (group: Group) => {
      const layers: Layer[] = [];
      const groups: Group[] = [];

      for (let i = group.children.length - 1; i >= 0; --i) {
        const item = group.children[i];
        if (item.type === "Layer") {
          !shouldSkipLayer(item) && layers.push(item);
        } else if (item.type === "Group") {
          groups.push(item);
        }
      }

      groups.forEach((item) => {
        layers.push(...bfs(item));
      });

      return layers;
    };

    const layersList: Layer[][] = [];
    for (let i = nodes.length - 1; i >= 0; --i) {
      const node = nodes[i];
      // @ts-ignore
      if (node?.layerFrame?.layerProperties?.hidden) {
        continue;
      }

      if (node.type === "Group") {
        layersList.push(bfs(node));
      } else if (node.type === "Layer") {
        !shouldSkipLayer(node) && layersList.push([node]);
      }
    }

    const models = [];
    for (let i = 0; i < layersList.length; ++i) {
      const layers = layersList[i];
      if (layers.length === 0) {
        continue;
      }

      let minX = layers[0].left,
        minY = layers[0].top;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = result.width;
      canvas.height = result.height;
      const canvas2 = document.createElement("canvas");
      const ctx2 = canvas2.getContext("2d")!;

      for (let j = 0; j < layers.length; ++j) {
        const layer = layers[j];
        const u8Array = await layer.composite(true, true);
        const imageData = new ImageData(u8Array, layer.width, layer.height);
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        canvas2.width = layer.width;
        canvas2.height = layer.height;
        ctx2.putImageData(imageData, 0, 0);
        ctx.drawImage(canvas2, layer.left, layer.top);
        minX = Math.min(minX, layer.left);
        minY = Math.min(minY, layer.top);
      }

      ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
      canvas2.width = result.width - minX;
      canvas2.height = result.height - minY;
      ctx2.drawImage(
        canvas,
        minX,
        minY,
        canvas2.width,
        canvas2.height,
        0,
        0,
        canvas2.width,
        canvas2.height
      );

      const model = await ImageModel.create({
        imageUrl: canvas2.toDataURL(),
        x: minX,
        y: minY,
      });
      models.push(model);
    }

    canvasRef.current.resize(result.width, result.height);
    models.forEach((model) => {
      canvasRef.current!.add(model);
    });
  };

  const handleFileChange2 = async (evt: ChangeEvent<HTMLInputElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const file = evt.target.files && evt.target.files[0];
    if (file === null) {
      return;
    }
    evt.target.value = "";

    if (!file.name.endsWith(".json")) {
      return Toast.show("请选择正确的文件类型");
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      canvas.loadFromJson(json);
    } catch (err) {
      Toast.show("导入失败");
      console.log("catch import error", err);
    }
  };

  const handleUndo = () => {
    if (!canvasRef.current || !stackStatus.undo) {
      return;
    }

    if (shouldToast("undo")) {
      Toast.show("使用快捷键 Ctrl + Z 更方便哦~");
    }

    canvasRef.current.undo();
  };

  const handleRedo = () => {
    if (!canvasRef.current || !stackStatus.redo) {
      return;
    }
    if (shouldToast("redo")) {
      Toast.show("使用快捷键 Ctrl + Y 更方便哦~");
    }
    canvasRef.current.redo();
  };

  useEffect(() => {
    EventBus.on("stack-status", setStackStatus);
    return () => {
      EventBus.off("stack-status", setStackStatus);
    };
  }, []);

  return (
    <div className={styles.header}>
      <div className="header-left">
        <div className="title">{canvasData.name}</div>

        <div className="divider" />

        <Tooltip
          className="icon-wrapper"
          text="撤销"
          style={stackStatus.undo ? undefined : { color: "#999" }}
          position="bottom"
          onClick={handleUndo}
        >
          <Icon type="icon-undo" />
        </Tooltip>
        <Tooltip
          className="icon-wrapper"
          style={stackStatus.redo ? undefined : { color: "#999" }}
          text="重做"
          position="bottom"
          onClick={handleRedo}
        >
          <Icon type="icon-redo" />
        </Tooltip>
        {canvasData.id !== "" && (
          <Button style={{ marginRight: 8 }} onClick={handleNew}>
            新建画布
          </Button>
        )}
      </div>
      <div className="header-right">
        <Button style={{ marginRight: 8 }}>
          从设计图导入
          <input
            className="hide-input"
            type="file"
            accept=".psd"
            onChange={handleFileChange}
          />
        </Button>
        <Button style={{ marginRight: 8 }}>
          导入
          <input
            className="hide-input"
            type="file"
            accept=".json"
            onChange={handleFileChange2}
          />
        </Button>

        <Button style={{ marginRight: 8 }} onClick={handleSaveImage}>
          导出图片
        </Button>

        <Button type="primary" onClick={handleSaveData}>
          保存
        </Button>
      </div>
    </div>
  );
}

export default Header;
