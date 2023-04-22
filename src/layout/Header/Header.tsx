import styles from "./Header.module.scss";
import { useState, useContext, useEffect } from "react";
import Psd from "@webtoon/psd";
import { canvasRef } from "@/store";
import { Button, Icon, Tooltip, Toast } from "@/components";
import { CanvasDataContext } from "@/App";
import { ImageModel } from "@/models";
import EventBus from "@/utils/event";
import type { ChangeEvent } from "react";

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
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const file = evt.target.files && evt.target.files[0];
    if (file === null) {
      return;
    }
    evt.target.value = "";

    if (!file.name.endsWith(".psd")) {
      return Toast.show("请选择正确的文件类型");
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = Psd.parse(arrayBuffer);
      const models = [];
      for (let i = result.layers.length - 1; i >= 0; --i) {
        const layer = result.layers[i];
        if (layer.isHidden) {
          console.log(`layer ${layer.name} isHidden`);
          continue;
        }
        if (layer.width > 5000 || layer.height > 5000) {
          Toast.show(`layer ${layer.name} 尺寸过大，已跳过`);
          console.log(`skip layer ${layer.name}`);
          continue;
        }
        const u8Array = await layer.composite(true, true);
        const imageData = new ImageData(u8Array, layer.width, layer.height);
        const model = await ImageModel.create({
          imageData,
          imageUrl: "",
          x: layer.left,
          y: layer.top,
        });
        models.push(model);
      }
      canvas.resize(result.width, result.height);
      models.forEach((model) => {
        canvas.add(model);
      });
    } catch (err) {
      Toast.show("psd 解析失败");
      console.log("catch psd error", err);
    }
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
    Toast.show("使用快捷键 Ctrl + Z 更方便哦~");

    canvasRef.current.undo();
  };

  const handleRedo = () => {
    if (!canvasRef.current || !stackStatus.redo) {
      return;
    }

    Toast.show("使用快捷键 Ctrl + Y 更方便哦~");
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
